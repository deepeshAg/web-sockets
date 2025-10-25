from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime
from sqlalchemy import UniqueConstraint

class Poll(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: Optional[str] = None
    option1: str
    option2: str
    option3: Optional[str] = None
    option4: Optional[str] = None
    creator_username: Optional[str] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    votes: List["Vote"] = Relationship(back_populates="poll")

class Vote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    poll_id: int = Field(foreign_key="poll.id")
    option: int = Field(description="1, 2, 3, or 4")
    voter_ip: str = Field(index=True)
    voter_username: Optional[str] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    poll: Poll = Relationship(back_populates="votes")

class UserLike(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    liker_username: str = Field(index=True)
    liked_username: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Ensure one user can only like another user once
    __table_args__ = (
        UniqueConstraint('liker_username', 'liked_username', name='unique_user_like'),
    )
