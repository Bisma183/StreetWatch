"""Locally promote one EXISTING registered user; never expose this as a public API."""
import sys
from database import SessionLocal
from models import User

def main():
    if len(sys.argv)!=2:
        print("Usage: python make_admin.py your-email@example.com");return 2
    email=sys.argv[1].strip().lower()
    with SessionLocal() as db:
        user=db.query(User).filter(User.email==email).first()
        if user is None:
            print("Account not found. Register in app first.");return 1
        user.is_admin=True
        db.commit()
        print(f"Admin enabled for {email}. Log out and log back in on phone.")
    return 0
if __name__=="__main__":raise SystemExit(main())
