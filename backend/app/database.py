from sqlmodel import SQLModel, create_engine, Session
from typing import Optional
import os

# Database URL - using SQLite for simplicity
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./polls.db")

# Create engine
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    """Create database tables"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Get database session"""
    with Session(engine) as session:
        yield session
