from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session
from typing import List
from app.database import get_session
from app.models import Poll
from app.schemas import PollCreate, PollResponse, PollListResponse, PollVotersResponse
from app.crud import create_poll, get_polls, get_poll, poll_to_response, delete_poll, get_poll_voters

router = APIRouter(prefix="/polls", tags=["polls"])

@router.post("/", response_model=PollResponse)
def create_poll_endpoint(
    poll: PollCreate,
    request: Request,
    db: Session = Depends(get_session)
):
    """Create a new poll"""
    db_poll = create_poll(db, poll)
    return poll_to_response(db, db_poll)

@router.get("/", response_model=PollListResponse)
def get_polls_endpoint(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_session)
):
    """Get all polls"""
    polls = get_polls(db, skip=skip, limit=limit)
    poll_responses = [poll_to_response(db, poll) for poll in polls]
    return PollListResponse(polls=poll_responses)

@router.get("/{poll_id}", response_model=PollResponse)
def get_poll_endpoint(
    poll_id: int,
    db: Session = Depends(get_session)
):
    """Get a specific poll by ID"""
    poll = get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    return poll_to_response(db, poll)

@router.delete("/{poll_id}")
async def delete_poll_endpoint(
    poll_id: int,
    db: Session = Depends(get_session)
):
    """Delete a poll"""
    success = delete_poll(db, poll_id)
    if not success:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Broadcast poll deletion to all connected clients
    from app.websocket_manager import manager
    await manager.broadcast_poll_update(poll_id, "poll_deleted", {"poll_id": poll_id})
    
    return {"message": "Poll deleted successfully"}

@router.get("/{poll_id}/voters", response_model=PollVotersResponse)
def get_poll_voters_endpoint(
    poll_id: int,
    db: Session = Depends(get_session)
):
    """Get all voters for a poll grouped by option"""
    # Check if poll exists
    poll = get_poll(db, poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    voters_data = get_poll_voters(db, poll_id)
    return PollVotersResponse(**voters_data)
