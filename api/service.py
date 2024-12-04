from models import ChatRoom, Persona, ChatMessage
from data import personas, chatrooms
from datetime import datetime
import uuid
import asyncio
import random
from ws import manager


async def recommend_participants(chatroom: ChatRoom, message: str):
    # TODO
    return ["1", "2", "3"]

async def query_to_persona(persona: Persona, message: str):
    # TODO
    await asyncio.sleep(random.random() * 3)
    return "Response from " + persona.name

async def get_personas():
    return personas

async def get_persona_by_id(id: str):
    return next((p for p in personas if p.id == id), None)

async def get_chatrooms():
    return chatrooms

async def get_chatroom_by_id(id: str):
    return next((c for c in chatrooms if c.id == id), None)

async def add_chatroom():
    chatrooms = await get_chatrooms()
    new_chatroom = ChatRoom(
        id=str(len(chatrooms) + 1),
        participants=[],
        messages=[],
    )
    chatrooms.append(new_chatroom)
    return new_chatroom

async def add_chat(chatroom: ChatRoom, sender: str, message: str):
    new_message = ChatMessage(id=str(uuid.uuid4()), sender=sender, message=message, timestamp=datetime.utcnow().isoformat())
    chatroom.messages.append(new_message)

    if len(chatroom.messages) == 0 and len(chatroom.participants) == 0:
        chatroom.participants = await recommend_participants(chatroom, message)

    for p_id in chatroom.participants:
        asyncio.create_task(handle_persona_response(chatroom, p_id, message))


async def handle_persona_response(chatroom, persona_id, user_message):
    persona = await get_persona_by_id(persona_id)
    if persona:
        pending_message = ChatMessage(
            id=str(uuid.uuid4()),
            sender=persona_id,
            message="...",  # 또는 처리 중을 나타내는 특별한 표시
            timestamp=datetime.utcnow().isoformat()
        )
        chatroom.messages.append(pending_message)
        await manager.send_message(chatroom.id, pending_message.dict())
        response = await query_to_persona(persona, user_message)
        pending_message.message = response
        await manager.send_message(chatroom.id, pending_message.dict())