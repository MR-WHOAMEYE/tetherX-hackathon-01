"""
Real-Time WebSocket Connection Manager
Manages connected clients and broadcasts events to all dashboards.
"""
import json
import asyncio
from fastapi import WebSocket
from datetime import datetime


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
        """Broadcast event to all connected clients."""
        message["timestamp"] = datetime.now().isoformat()
        data = json.dumps(message, default=str)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(data)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

    async def send_personal(self, websocket: WebSocket, message: dict):
        message["timestamp"] = datetime.now().isoformat()
        await websocket.send_text(json.dumps(message, default=str))


# Global singleton
manager = ConnectionManager()
