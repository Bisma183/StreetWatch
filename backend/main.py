#  FastAPI connects to the database (often using an ORM like SQLAlchemy or Beanie), runs the query, validates the data using Pydantic, packages it into lightweight JSON, and sends it back to the mobile app.
# FastAPI is a Python backend web framework that builds the communication bridge between your database and your mobile app

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from database import Base, engine, get_dbsession
from models import User
from schemas import UserCreate, UserOut, LoginRequest, Token
from security import hash_password, verify_password, create_access_token

from auth import get_current_user

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/")
def home():
    return {"message": "StreetWatch API is running"}


@app.post("/register", response_model=UserOut)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_dbsession)
    
):
    email = user_data.email.lower()
    # 1. Check whether the email already exists
    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # 2. Hash the password
    hashed_password = hash_password(user_data.password)

    # 3. Create the new user
    new_user = User(
        name=user_data.name,
        email=email,
        hashed_password=hashed_password
    )

    # 4. Add the user and save to the database
    db.add(new_user)
    db.commit()

    # 5. Refresh to retrieve generated values, such as the ID
    db.refresh(new_user)

    return new_user

@app.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_dbsession)):
    email = login_data.email.lower()

    user = db.query(User).filter(User.email == email).first()

    if user is None or not verify_password(
        login_data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@app.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
