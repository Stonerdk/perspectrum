from models import ChatRoom, Persona, ChatMessage
from data import personas, chatrooms
from datetime import datetime
import uuid
import asyncio
import random
from ws import manager
from graphrag_chatbot import bot

active_dialogues = {}

async def recommend_participants(chatroom: ChatRoom, message: str, union=True):
    recommended_topics = bot.recommend_topics(message)
    personas = bot.recommend_personas(message, recommended_topics) # role
    personas = list(map(get_persona_by_role, personas))
    ids = set([p.id for p in personas])
    if union:
        chatroom.participants = list(set(chatroom.participants) | ids) # UNION
    else:
        chatroom.participants = ids
    return personas


async def get_personas():
    return personas


async def get_persona_by_id(id: str):
    return next((p for p in personas if p.id == id), None)


async def get_id_by_role(role: str):
    return next((p.id for p in personas if p.role == role), None)


def get_persona_by_role(role: str):
    return next((p for p in personas if p.role == role), None)


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


async def send_message(chatroom: ChatRoom, sender: str, message: str):
    new_message = ChatMessage(id=str(uuid.uuid4()), sender=sender, message=message, timestamp=datetime.utcnow().isoformat())
    chatroom.messages.append(new_message)
    await manager.send_message(chatroom.id, new_message.model_dump())


async def start_debate(chatroom: ChatRoom, sender: str, message: str):
    if chatroom.id in active_dialogues:
        return False
    await send_message(chatroom, sender, message)

    gen = bot.query(message, chatroom.participants)
    async def run():
        try:
            async for persona, response in gen:
                await send_message(chatroom, persona, response)
        except asyncio.CancelledError:
            await manager.send_system(chatroom.id, "cancel")
        except Exception as e:
            await manager.send_system(chatroom.id, "error", str(e))
        finally:
            active_dialogues.pop(chatroom.id, None)
            await manager.send_system(chatroom.id, "continue")
    active_dialogues[chatroom.id] = asyncio.create_task(run())


async def continue_debate(chatroom: ChatRoom):
    if chatroom.id in active_dialogues:
        return False
    gen = bot.debate()
    async def run():
        try:
            async for persona, response in gen:
                await send_message(chatroom, persona, response)
        except asyncio.CancelledError:
            await manager.send_system(chatroom.id, "error")
        except Exception as e:
            await manager.send_system(chatroom.id, "An error occurred", str(e))
        finally:
            active_dialogues.pop(chatroom.id, None)
            if bot.is_debating():
                await manager.send_system(chatroom.id, "continue")
            else:
                await manager.send_system(chatroom.id, "end")
    active_dialogues[chatroom.id] = asyncio.create_task(run())


async def cancel_debate(chatroom: ChatRoom):
    if chatroom.id not in active_dialogues:
        return False
    active_dialogues.pop(chatroom.id, None)
    active_dialogues[chatroom.id].cancel()
    return True


async def reset_debate(chatroom: ChatRoom):
    if chatroom.id in active_dialogues:
        active_dialogues[chatroom.id].cancel()
    await bot.reset()
    return True

async def query_to_persona(persona: Persona, message: str):
    topic = ["economics", "science", "social", "politics"][int(persona.id) - 1]
    answers = bot.answer_question(message, [topic])
    if answers:
        return answers[topic]
    return "An error occured"

async def add_chat(chatroom: ChatRoom, sender: str, message: str):
    await send_message(chatroom, sender, message)

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
            message="...",
            timestamp=datetime.utcnow().isoformat()
        )
        chatroom.messages.append(pending_message)
        await manager.send_message(chatroom.id, pending_message.model_dump())
        pending_message.message = await query_to_persona(persona, user_message)
        await manager.send_message(chatroom.id, pending_message.model_dump())