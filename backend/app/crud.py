from sqlmodel import Session, select
from typing import List, Optional
from app.models import Poll, Vote, UserLike
from app.schemas import PollCreate, VoteCreate, UserLikeCreate, VoteStats, PollResponse
from datetime import datetime

def create_poll(db: Session, poll: PollCreate) -> Poll:
    """Create a new poll"""
    db_poll = Poll(
        title=poll.title,
        description=poll.description,
        option1=poll.option1,
        option2=poll.option2,
        option3=poll.option3,
        option4=poll.option4,
        creator_username=poll.creator_username
    )
    db.add(db_poll)
    db.commit()
    db.refresh(db_poll)
    return db_poll

def get_polls(db: Session, skip: int = 0, limit: int = 100) -> List[Poll]:
    """Get all polls with pagination"""
    statement = select(Poll).offset(skip).limit(limit).order_by(Poll.created_at.desc())
    return db.exec(statement).all()

def get_poll(db: Session, poll_id: int) -> Optional[Poll]:
    """Get a specific poll by ID"""
    return db.get(Poll, poll_id)

def get_vote_stats(db: Session, poll_id: int) -> VoteStats:
    """Get vote statistics for a poll"""
    votes = db.exec(select(Vote).where(Vote.poll_id == poll_id)).all()
    
    stats = VoteStats()
    for vote in votes:
        if vote.option == 1:
            stats.option1 += 1
        elif vote.option == 2:
            stats.option2 += 1
        elif vote.option == 3:
            stats.option3 += 1
        elif vote.option == 4:
            stats.option4 += 1
    
    return stats

def get_likes_count(db: Session, poll_id: int) -> int:
    """Get total likes count for a poll"""
    statement = select(Like).where(Like.poll_id == poll_id)
    likes = db.exec(statement).all()
    return len(likes)

def create_vote(db: Session, poll_id: int, vote: VoteCreate, voter_ip: str) -> Optional[Vote]:
    """Create or update a vote (allow vote switching)"""
    # Check if user already voted on this poll
    existing_vote = db.exec(
        select(Vote).where(Vote.poll_id == poll_id, Vote.voter_ip == voter_ip)
    ).first()
    
    # Validate option
    poll = get_poll(db, poll_id)
    if not poll:
        return None
    
    # Check if option exists and is valid
    options = [poll.option1, poll.option2, poll.option3, poll.option4]
    available_options = len([opt for opt in options if opt])
    if vote.option < 1 or vote.option > available_options:
        return None
    
    if existing_vote:
        # Update existing vote (vote switching)
        existing_vote.option = vote.option
        existing_vote.voter_username = vote.voter_username
        db.add(existing_vote)
        db.commit()
        db.refresh(existing_vote)
        return existing_vote
    else:
        # Create new vote
        db_vote = Vote(
            poll_id=poll_id,
            option=vote.option,
            voter_ip=voter_ip,
            voter_username=vote.voter_username
        )
        db.add(db_vote)
        db.commit()
        db.refresh(db_vote)
        return db_vote

def delete_poll(db: Session, poll_id: int) -> bool:
    """Delete a poll and all its associated votes"""
    poll = get_poll(db, poll_id)
    if not poll:
        return False
    
    # Delete all votes for this poll
    votes = db.exec(select(Vote).where(Vote.poll_id == poll_id)).all()
    for vote in votes:
        db.delete(vote)
    
    # Delete the poll
    db.delete(poll)
    db.commit()
    return True

def poll_to_response(db: Session, poll: Poll) -> PollResponse:
    """Convert Poll model to PollResponse"""
    votes = get_vote_stats(db, poll.id)
    
    return PollResponse(
        id=poll.id,
        title=poll.title,
        description=poll.description,
        option1=poll.option1,
        option2=poll.option2,
        option3=poll.option3,
        option4=poll.option4,
        creator_username=poll.creator_username,
        votes=votes,
        created_at=poll.created_at,
        updated_at=poll.updated_at
    )

def create_user_like(db: Session, user_like: UserLikeCreate) -> Optional[UserLike]:
    """Create a user like (user likes another user)"""
    # Check if user already liked this user
    existing_like = db.exec(
        select(UserLike).where(
            UserLike.liker_username == user_like.liker_username,
            UserLike.liked_username == user_like.liked_username
        )
    ).first()
    
    if existing_like:
        return None  # User already liked this user
    
    # Don't allow users to like themselves
    if user_like.liker_username == user_like.liked_username:
        return None
    
    db_like = UserLike(
        liker_username=user_like.liker_username,
        liked_username=user_like.liked_username
    )
    db.add(db_like)
    db.commit()
    db.refresh(db_like)
    return db_like

def get_user_likes_count(db: Session, username: str) -> int:
    """Get total likes received by a user"""
    statement = select(UserLike).where(UserLike.liked_username == username)
    likes = db.exec(statement).all()
    return len(likes)

def get_poll_voters(db: Session, poll_id: int) -> dict:
    """Get all voters for a poll grouped by option"""
    votes = db.exec(select(Vote).where(Vote.poll_id == poll_id)).all()
    
    option1_voters = []
    option2_voters = []
    option3_voters = []
    option4_voters = []
    
    for vote in votes:
        voter_info = {
            "username": vote.voter_username,
            "voted_at": vote.created_at
        }
        
        if vote.option == 1:
            option1_voters.append(voter_info)
        elif vote.option == 2:
            option2_voters.append(voter_info)
        elif vote.option == 3:
            option3_voters.append(voter_info)
        elif vote.option == 4:
            option4_voters.append(voter_info)
    
    return {
        "poll_id": poll_id,
        "option1_voters": option1_voters,
        "option2_voters": option2_voters,
        "option3_voters": option3_voters,
        "option4_voters": option4_voters
    }

def get_user_likes_given(db: Session, username: str) -> List[str]:
    """Get list of usernames that this user has liked"""
    user_likes = db.exec(
        select(UserLike).where(UserLike.liker_username == username)
    ).all()
    return [like.liked_username for like in user_likes]

def delete_user_like(db: Session, liker_username: str, liked_username: str) -> bool:
    """Unlike a user (delete the like)"""
    user_like = db.exec(
        select(UserLike).where(
            UserLike.liker_username == liker_username,
            UserLike.liked_username == liked_username
        )
    ).first()
    
    if not user_like:
        return False  # Like doesn't exist
    
    db.delete(user_like)
    db.commit()
    return True

def get_user_profile(db: Session, username: str) -> dict:
    """Get user profile statistics"""
    # Count polls created by this user
    polls_created = db.exec(
        select(Poll).where(Poll.creator_username == username)
    ).all()
    polls_count = len(polls_created)
    
    # Count total votes by this user
    user_votes = db.exec(
        select(Vote).where(Vote.voter_username == username)
    ).all()
    total_votes = len(user_votes)
    
    # Count likes received by this user
    likes_received = get_user_likes_count(db, username)
    
    return {
        "username": username,
        "likes_received": likes_received,
        "polls_created": polls_count,
        "total_votes": total_votes
    }
