#describes database tables using SQLAlchemy.

from sqlalchemy import String, Integer, Boolean, Column, Float, DateTime, ForeignKey
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id= Column(Integer, primary_key=True)
    name=Column (String, nullable=False)
    email=Column (String, unique=True, nullable=False)
    hashed_password=Column(String, nullable=False)
    is_admin=Column(Boolean, nullable=False, default=False)
    push_token=Column(String, nullable=True)

class Issue(Base):
    __tablename__="issues"

    id=Column(Integer, primary_key=True)
    category=Column(String, nullable=False)
    latitude=Column(Float, nullable=False)
    longitude=Column(Float, nullable=False)
    status=Column(String, nullable=False, default="Reported")
    upvote_count=Column(Integer, nullable=False, default=1)
    created_at=Column(DateTime, nullable=False, default=datetime.utcnow)

class Report(Base):
    __tablename__="reports"

    id=Column(Integer, primary_key=True)
    issue_id=Column(Integer, ForeignKey("issues.id"), nullable=False)
    user_id=Column(Integer, ForeignKey("users.id"), nullable=False)
    photo_path=Column(String, nullable=False)
    note=Column(String, nullable=True)
    created_at=Column(DateTime, nullable=False, default=datetime.utcnow)

