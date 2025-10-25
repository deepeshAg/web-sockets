from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_session
from app.schemas import UserLikeCreate, UserLikeResponse, UserProfileResponse
from app.crud import create_user_like, get_user_likes_count, get_user_profile, get_user_likes_given, delete_user_like
from app.websocket_manager import manager

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/like", response_model=UserLikeResponse)
async def like_user(
    user_like: UserLikeCreate,
    db: Session = Depends(get_session)
):
    """Like a user"""
    db_like = create_user_like(db, user_like)
    if not db_like:
        raise HTTPException(status_code=400, detail="Already liked this user or cannot like yourself")
    
    # Get updated likes count for the liked user
    likes_count = get_user_likes_count(db, user_like.liked_username)
    
    # Broadcast user like update to all connected clients
    await manager.broadcast_user_like_update(user_like.liked_username, likes_count)
    
    # Broadcast like toggle update for the specific poll if poll_id is provided
    if user_like.poll_id:
        await manager.broadcast_like_toggle_update(user_like.poll_id, user_like.liker_username, user_like.liked_username, True)
    
    return UserLikeResponse(
        success=True,
        message=f"You liked {user_like.liked_username}!",
        likes_count=likes_count
    )

@router.delete("/like", response_model=UserLikeResponse)
async def unlike_user(
    user_like: UserLikeCreate,
    db: Session = Depends(get_session)
):
    """Unlike a user"""
    success = delete_user_like(db, user_like.liker_username, user_like.liked_username)
    if not success:
        raise HTTPException(status_code=400, detail="Like doesn't exist")
    
    # Get updated likes count for the liked user
    likes_count = get_user_likes_count(db, user_like.liked_username)
    
    # Broadcast user like update to all connected clients
    await manager.broadcast_user_like_update(user_like.liked_username, likes_count)
    
    # Broadcast like toggle update for the specific poll if poll_id is provided
    if user_like.poll_id:
        await manager.broadcast_like_toggle_update(user_like.poll_id, user_like.liker_username, user_like.liked_username, False)
    
    return UserLikeResponse(
        success=True,
        message=f"You unliked {user_like.liked_username}!",
        likes_count=likes_count
    )

@router.get("/{username}/profile", response_model=UserProfileResponse)
def get_user_profile_endpoint(
    username: str,
    db: Session = Depends(get_session)
):
    """Get user profile with stats"""
    profile = get_user_profile(db, username)
    return UserProfileResponse(**profile)

@router.get("/{username}/likes")
def get_user_likes_endpoint(
    username: str,
    db: Session = Depends(get_session)
):
    """Get likes count for a user"""
    likes_count = get_user_likes_count(db, username)
    return {"username": username, "likes_count": likes_count}

@router.get("/{username}/likes-given")
def get_user_likes_given_endpoint(
    username: str,
    db: Session = Depends(get_session)
):
    """Get the list of users that this user has liked"""
    liked_users = get_user_likes_given(db, username)
    return {"username": username, "liked_users": liked_users}
