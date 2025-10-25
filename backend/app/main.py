from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from app.database import create_db_and_tables, get_session
from app.routes import polls, votes, users
from app.websocket_manager import manager
from app.crud import poll_to_response
import json

# Create FastAPI app
app = FastAPI(
    title="Real-time Polling API",
    description="A real-time polling application with WebSocket support",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(polls.router)
app.include_router(votes.router)
app.include_router(users.router)

@app.on_event("startup")
def on_startup():
    """Initialize database on startup"""
    create_db_and_tables()

@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "Real-time Polling API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle any incoming messages
            data = await websocket.receive_text()
            # For now, we don't need to handle incoming messages from clients
            # But we could add features like chat or comments here
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
