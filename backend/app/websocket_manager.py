from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_data: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.connection_data[websocket] = {"connected_at": asyncio.get_event_loop().time()}

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.connection_data:
            del self.connection_data[websocket]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except:
            self.disconnect(websocket)

    async def broadcast(self, message: str):
        print(f"Broadcasting to {len(self.active_connections)} connections: {message}")
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
                print(f"Message sent successfully to connection")
            except Exception as e:
                print(f"Failed to send message to connection: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

    async def broadcast_poll_update(self, poll_id: int, update_type: str, data: dict):
        """Broadcast poll updates to all connected clients"""
        message = {
            "type": update_type,
            "poll_id": poll_id,
            "data": data
        }
        await self.broadcast(json.dumps(message))

    async def broadcast_vote_update(self, poll_id: int, votes: dict):
        """Broadcast vote updates"""
        await self.broadcast_poll_update(poll_id, "vote_update", {"votes": votes})

    async def broadcast_like_update(self, poll_id: int, likes_count: int):
        """Broadcast like updates"""
        await self.broadcast_poll_update(poll_id, "like_update", {"likes_count": likes_count})

    async def broadcast_poll_created(self, poll_id: int, poll_data: dict):
        """Broadcast new poll creation"""
        await self.broadcast_poll_update(poll_id, "poll_created", poll_data)

    async def broadcast_user_like_update(self, username: str, likes_count: int):
        """Broadcast user like updates"""
        await self.broadcast_poll_update(0, "user_like_update", {"username": username, "likes_count": likes_count})

    async def broadcast_like_toggle_update(self, poll_id: int, liker_username: str, liked_username: str, is_liked: bool):
        """Broadcast like toggle updates for a specific poll"""
        await self.broadcast_poll_update(poll_id, "like_toggle_update", {
            "liker_username": liker_username,
            "liked_username": liked_username,
            "is_liked": is_liked
        })

manager = ConnectionManager()
