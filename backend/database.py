#connects FastAPI to SQLite.

# This app needs to save information in a notebook called streetwatch.db
# But its not safe for the mobile app to directly interact with the db (notebook). It needs helpers to open it, write safely, and close it properly.
# we have 3 helpers : 
# enginer : made once, then the whole app uses it
# SessionLocal : a worker-making machine which upon every api request makes a worker (just think like that) who writes in the notebook - A session is a short working period with the database.
# Base : the rulebook for tables
# SQLAlchemy describes a session as the app’s “conversation” with the database, and sessionmaker as the factory that creates those sessions.
"""
models.py says:

class User(Base):
    
That means: “User is a table described using SQLAlchemy.”

Base is the shared parent that lets SQLAlchemy understand all your model classes—User, Issue, and Report—and later create their tables in SQLite. SQLAlchemy’s ORM connects Python classes to database tables and Python objects to table rows.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
SQLALCHEMY_DATABASE_URL="sqlite:///./streetwatch.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread":False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
Base=declarative_base()

#it creates one session per request and closes it afterward, even if the request fails.
def get_dbsession():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
