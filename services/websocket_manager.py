"""
WebSocket Connection Manager
Handles real-time event broadcasting to connected frontend clients.
"""
import json
import asyncio
from datetime import datetime
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        """Broadcast a message to all connected clients."""
        if "timestamp" not in message:
            message["timestamp"] = datetime.now().isoformat()
        payload = json.dumps(message)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

    async def send_personal(self, websocket: WebSocket, message: dict):
        """Send a message to a specific client."""
        if "timestamp" not in message:
            message["timestamp"] = datetime.now().isoformat()
        await websocket.send_text(json.dumps(message))


# Singleton instance
manager = ConnectionManager()
