from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Request schemas
class PollCreate(BaseModel):
    title: str
    description: Optional[str] = None
    option1: str
    option2: str
    option3: Optional[str] = None
    option4: Optional[str] = None
    creator_username: Optional[str] = None

class VoteCreate(BaseModel):
    option: int  # 1, 2, 3, or 4
    voter_username: Optional[str] = None

class UserLikeCreate(BaseModel):
    liker_username: str
    liked_username: str
    poll_id: Optional[int] = None  # Add poll_id for WebSocket broadcasting

# Response schemas
class VoteStats(BaseModel):
    option1: int = 0
    option2: int = 0
    option3: int = 0
    option4: int = 0

class PollResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    option1: str
    option2: str
    option3: Optional[str]
    option4: Optional[str]
    creator_username: Optional[str]
    votes: VoteStats
    created_at: datetime
    updated_at: datetime

class PollListResponse(BaseModel):
    polls: List[PollResponse]

class VoteResponse(BaseModel):
    success: bool
    message: str
    votes: VoteStats

class UserLikeResponse(BaseModel):
    success: bool
    message: str
    likes_count: int

class UserProfileResponse(BaseModel):
    username: str
    likes_received: int
    polls_created: int
    total_votes: int

class VoterInfo(BaseModel):
    username: Optional[str]
    voted_at: datetime

class PollVotersResponse(BaseModel):
    poll_id: int
    option1_voters: List[VoterInfo]
    option2_voters: List[VoterInfo]
    option3_voters: List[VoterInfo]
    option4_voters: List[VoterInfo]

# WebSocket message schemas
class WebSocketMessage(BaseModel):
    type: str  # "vote_update", "like_update", "poll_created"
    poll_id: int
    data: dict
