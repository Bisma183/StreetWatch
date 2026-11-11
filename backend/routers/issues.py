"""Hazard reporting and issue retrieval. Protected by existing JWT auth."""
from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_dbsession
from auth import get_current_user
from models import Issue, Report, User
from utils import is_duplicate
from push import send_status_push

router = APIRouter(prefix="/issues", tags=["issues"])
PHOTO_DIR = Path(__file__).resolve().parent.parent / "uploads"
PHOTO_DIR.mkdir(exist_ok=True)
CATEGORIES = {"Pothole", "Open Manhole", "Broken Streetlight", "Garbage", "Other"}
STAGES = ["Reported", "Verified", "In Progress", "Resolved"]
MAX_IMAGE_SIZE = 8 * 1024 * 1024

def serialize_issue(issue, db):
    reports = db.query(Report).filter(Report.issue_id == issue.id).order_by(Report.created_at.desc()).all()
    return {"id": issue.id, "category": issue.category, "latitude": issue.latitude,
            "longitude": issue.longitude, "status": issue.status,
            "upvote_count": issue.upvote_count, "created_at": issue.created_at.isoformat(),
            "reports": [{"id":r.id, "user_id":r.user_id, "note":r.note,
                         "photo_url":f"/issues/photos/{r.id}", "created_at":r.created_at.isoformat()} for r in reports]}

@router.get("")
def list_issues(category: str | None = None, status: str | None = None, db: Session = Depends(get_dbsession)):
    q = db.query(Issue)
    if category: q = q.filter(Issue.category == category)
    if status: q = q.filter(Issue.status == status)
    return [serialize_issue(item, db) for item in q.order_by(Issue.created_at.desc()).all()]

@router.get("/photos/{report_id}")
def photo(report_id: int, db: Session = Depends(get_dbsession)):
    report = db.get(Report, report_id)
    if not report: raise HTTPException(404, "Photo not found")
    path = PHOTO_DIR / Path(report.photo_path).name
    if not path.is_file(): raise HTTPException(404, "Photo not found")
    return FileResponse(path)

@router.get("/{issue_id}")
def issue_detail(issue_id: int, db: Session = Depends(get_dbsession)):
    issue = db.get(Issue, issue_id)
    if not issue: raise HTTPException(404, "Issue not found")
    return serialize_issue(issue, db)


@router.post("", status_code=201)
async def create_issue(category: str = Form(...), latitude: float = Form(...),
    longitude: float = Form(...), note: str = Form(""), photo: UploadFile = File(...),
    db: Session = Depends(get_dbsession), user: User = Depends(get_current_user)):
    if category not in CATEGORIES: raise HTTPException(422, "Invalid category")
    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        raise HTTPException(422, "Invalid GPS coordinates")
    if len(note) > 500: raise HTTPException(422, "Note must be 500 characters or fewer")
    data = await photo.read(MAX_IMAGE_SIZE + 1)
    if not data or len(data) > MAX_IMAGE_SIZE: raise HTTPException(422, "Photo must be 1-8 MB")
    # Check actual file signature, not user-controlled extension/content-type alone.
    if data.startswith(b"\xff\xd8\xff"): ext = ".jpg"
    elif data.startswith(b"\x89PNG\r\n\x1a\n"): ext = ".png"
    elif data[:4] == b"RIFF" and data[8:12] == b"WEBP": ext = ".webp"
    else: raise HTTPException(422, "Only JPEG, PNG or WebP photos are accepted")
    filename = f"{uuid4().hex}{ext}"
    path = PHOTO_DIR / filename
    path.write_bytes(data)
    try:
        # Avoid considering resolved issues; same category + <=30 m is duplicate.
        matching = next((i for i in db.query(Issue).filter(Issue.category == category,
                        Issue.status != "Resolved").all()
                        if is_duplicate(i, latitude, longitude, category)), None)
        if matching:
            issue = matching
            issue.upvote_count += 1
        else:
            issue = Issue(category=category, latitude=latitude, longitude=longitude,
                          status="Reported", upvote_count=1)
            db.add(issue)
            db.flush()
        report = Report(issue_id=issue.id, user_id=user.id, photo_path=filename,
                        note=note.strip() or None)
        db.add(report)
        db.commit()
        db.refresh(issue)
        return {"merged": matching is not None, "issue": serialize_issue(issue, db)}
    except Exception:
        db.rollback()
        path.unlink(missing_ok=True)
        raise

@router.post("/{issue_id}/upvote")
def upvote(issue_id: int, db: Session = Depends(get_dbsession), user: User = Depends(get_current_user)):
    issue = db.get(Issue, issue_id)
    if not issue: raise HTTPException(404, "Issue not found")
    if issue.status == "Resolved": raise HTTPException(400, "Resolved issues cannot be upvoted")
    issue.upvote_count += 1
    db.commit()
    db.refresh(issue)
    return serialize_issue(issue, db)

@router.patch("/{issue_id}/status")
def change_status(issue_id: int, background_tasks: BackgroundTasks, status: str = Form(...), db: Session = Depends(get_dbsession),
                  user: User = Depends(get_current_user)):
    if not user.is_admin: raise HTTPException(403, "Admin access required")
    issue = db.get(Issue, issue_id)
    if not issue: raise HTTPException(404, "Issue not found")
    if status not in STAGES or STAGES.index(status) != STAGES.index(issue.status) + 1:
        raise HTTPException(422, "Status must move to the next stage")
    issue.status = status
    db.commit()
    reporter_ids=[row[0] for row in db.query(Report.user_id).filter(Report.issue_id==issue_id).distinct().all()]
    tokens=[row[0] for row in db.query(User.push_token).filter(User.id.in_(reporter_ids)).all()] if reporter_ids else []
    background_tasks.add_task(send_status_push,tokens,issue.id,issue.category,status)
    return serialize_issue(issue, db)

@router.delete("/{issue_id}", status_code=204)
def delete_spam(issue_id: int, db: Session = Depends(get_dbsession), user: User = Depends(get_current_user)):
    if not user.is_admin: raise HTTPException(403, "Admin access required")
    issue = db.get(Issue, issue_id)
    if not issue: raise HTTPException(404, "Issue not found")
    for report in db.query(Report).filter(Report.issue_id == issue_id).all():
        (PHOTO_DIR / Path(report.photo_path).name).unlink(missing_ok=True)
        db.delete(report)
    db.delete(issue)
    db.commit()
