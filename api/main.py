# main.py (계속)
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Body
from models import Persona, AvatarType, ChatRoom, ChatRoomHeader, ChatMessage, AddMessage, MessageBody
from data import personas, chatrooms
from typing import List, Dict

from datetime import datetime
from service import *
import asyncio
from ws import manager
import uuid

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/chatrooms/{chatroom_id}")
async def api_websocket_endpoint(websocket: WebSocket, chatroom_id: str):
    await manager.connect(chatroom_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = {"sender": "You", "message": data, "timestamp": datetime.utcnow().isoformat()}
            await manager.send_message(chatroom_id, message)
    except WebSocketDisconnect:
        manager.disconnect(chatroom_id, websocket)


@app.get("/personas", response_model=List[Persona])
async def api_fetch_personas():
    return await get_personas()


@app.get("/personas/{id}", response_model=Persona)
async def api_get_persona_by_id(id: str):
    persona = await get_persona_by_id(id)
    if persona:
        return persona
    raise HTTPException(status_code=404, detail="Persona not found")


@app.get("/chatrooms", response_model=List[ChatRoomHeader])
async def api_fetch_chatroom_headers():
    headers = []
    chatrooms = await get_chatrooms()
    for chatroom in chatrooms:
        recent_message = chatroom.messages[-1] if chatroom.messages else None
        headers.append(ChatRoomHeader(id=chatroom.id, recentMessage=recent_message))
    return headers


@app.post('/chatrooms/{id}/send')
async def api_send_message(id: str, body: AddMessage):
    chatroom = await get_chatroom_by_id(id)
    if chatroom:
        await send(chatroom, body.message)
        return {"message": "Message sent"}
    raise HTTPException(status_code=404, detail="Chat room not found")


@app.post("/chatrooms/{id}/retrieve")
async def api_retrieve(id: str):
    chatroom = await get_chatroom_by_id(id)
    if chatroom:
        await retrieve(chatroom)
        return {"message": "Message added"}
    raise HTTPException(status_code=404, detail="Chat room not found")


@app.post("/chatrooms/{id}/debate")
async def api_continue_debate(id: str):
    chatroom = await get_chatroom_by_id(id)
    if chatroom:
        await debate(chatroom)
        return {"message": "Debate Continuing"}
    raise HTTPException(status_code=404, detail="Chat room not found")


@app.post("/chatrooms/{id}/cancel")
async def api_cancel_chat(id: str):
    chatroom = await get_chatroom_by_id(id)
    if chatroom:
        await cancel_debate(chatroom)
        return {"message": "Debate cancelled"}
    raise HTTPException(status_code=404, detail="Chat room not found")


@app.post("/chatrooms/{id}/reset")
async def api_reset_chat(id: str):
    chatroom = await get_chatroom_by_id(id)
    if chatroom:
        await reset_debate(chatroom)
        return {"message": "Debate reset"}
    raise HTTPException(status_code=404, detail="Chat room not found")


@app.get("/chatrooms/{id}", response_model=ChatRoom)
async def api_fetch_chatroom(id: str):
    chatroom = await get_chatroom_by_id(id)
    if chatroom:
        return chatroom
    raise HTTPException(status_code=404, detail="Chat room not found")


@app.post("/chatrooms", response_model=ChatRoom)
async def api_add_chatroom():
    return await add_chatroom()


@app.put("/chatrooms/{id}/participants")
async def api_modify_participants(id: str, participants: List[str]):
    chatroom = await get_chatroom_by_id(id)
    if chatroom:
        chatroom.participants = participants
        return {"message": "Participants updated"}
    raise HTTPException(status_code=404, detail="Chat room not found")


@app.post("/chatrooms/{id}/recommend")
async def api_recommend_participants(id: str, body: MessageBody):
    chatroom = await get_chatroom_by_id(id)
    if chatroom:
        recommended_personas = await recommend_participants(chatroom, body.message)
        return {"participants": recommended_personas}
    raise HTTPException(status_code=404, detail="Chat room not found")
# deprecated
# @app.post("/personas", response_model=Persona)
# async def api_add_persona(name: str, role: str, avatar: AvatarType):
#     new_persona = Persona(
#         id=str(len(personas) + 1),
#         name=name,
#         role=role,
#         avatar=avatar,
#         color="#fff",
#     )
#     personas.append(new_persona)
#     return new_persona
