from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
from app.database import get_session
from app.schemas import VoteCreate, VoteResponse
from app.crud import create_vote, get_vote_stats, get_poll
from app.models import Vote
from app.websocket_manager import manager

router = APIRouter(prefix="/polls", tags=["votes"])

@router.post("/{poll_id}/vote", response_model=VoteResponse)
async def vote_on_poll(
    poll_id: int,
    vote: VoteCreate,
    request: Request,
    db: Session = Depends(get_session)
):
    """Vote on a poll"""
    # Get client IP and User-Agent for better tracking
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "")
    
    # Always use User-Agent + username for better differentiation
    import hashlib
    user_agent_hash = hashlib.md5(user_agent.encode()).hexdigest()[:8]
    
    # Create unique ID: IP + User-Agent hash + username
    voter_id = f"{client_ip}_{user_agent_hash}"
    
    # Add username if provided for additional uniqueness
    if vote.voter_username:
        voter_id = f"{voter_id}_{vote.voter_username}"
    
    print(f"Vote request - IP: {client_ip}, User-Agent: {user_agent[:50]}..., Username: {vote.voter_username}, Voter ID: {voter_id}")
    
    # Check if poll exists
    poll = get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Create vote (or update existing vote)
    db_vote = create_vote(db, poll_id, vote, voter_id)
    if not db_vote:
        raise HTTPException(status_code=400, detail="Invalid vote option")
    
    # Get updated vote stats
    votes = get_vote_stats(db, poll_id)
    
    # Broadcast update to all connected clients
    print(f"Broadcasting vote update for poll {poll_id}: {votes.model_dump()}")
    await manager.broadcast_vote_update(poll_id, votes.model_dump())
    
    return VoteResponse(
        success=True,
        message="Vote recorded successfully",
        votes=votes
    )

@router.post("/{poll_id}/reset-votes")
async def reset_poll_votes(
    poll_id: int,
    db: Session = Depends(get_session)
):
    """Reset all votes for a poll (development only)"""
    # Check if poll exists
    poll = get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Delete all votes for this poll
    votes = db.exec(select(Vote).where(Vote.poll_id == poll_id)).all()
    for vote in votes:
        db.delete(vote)
    
    db.commit()
    
    # Get updated vote stats
    votes = get_vote_stats(db, poll_id)
    
    # Broadcast update to all connected clients
    await manager.broadcast_vote_update(poll_id, votes.model_dump())
    
    return {"message": "Votes reset successfully", "votes": votes.model_dump()}
