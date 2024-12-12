from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List, Dict

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, chatroom_id: str, websocket: WebSocket):
        await websocket.accept()
        if chatroom_id not in self.active_connections:
            self.active_connections[chatroom_id] = []
        self.active_connections[chatroom_id].append(websocket)

    def disconnect(self, chatroom_id: str, websocket: WebSocket):
        self.active_connections[chatroom_id].remove(websocket)
        if not self.active_connections[chatroom_id]:
            del self.active_connections[chatroom_id]

    async def send_message(self, chatroom_id: str, message: dict):
        if chatroom_id in self.active_connections:
            for connection in self.active_connections[chatroom_id]:
                await connection.send_json(message)

    async def send_system(self, chatroom_id: str, message: str, aux: str = ""):
        await self.send_message(chatroom_id, {"system": message, "aux": aux })

manager = ConnectionManager()
