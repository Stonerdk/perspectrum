from models import ChatRoom, Persona, ChatMessage
from data import personas, chatrooms
from datetime import datetime
import uuid
import asyncio
import random
from ws import manager
from graphrag_chatbot import bot
import traceback

active_dialogues = {}


async def get_personas():
    return personas


async def get_persona_by_id(id: str):
    return next((p for p in personas if p.id == id), None)


async def get_id_by_role(role: str):
    return next((p.id for p in personas if p.role == role), None)


async def get_role_by_id(id: str):
    return next((p.role for p in personas if p.id == id), None)


def get_persona_by_role(role: str):
    return next((p for p in personas if p.role == role), None)


async def get_chatrooms():
    return chatrooms


async def get_chatroom_by_id(id: str):
    return next((c for c in chatrooms if c.id == id), None)


async def add_persona(name: str, role: str, avatar: str):
    new_persona = Persona(id=str(len(personas) + 1), name=name, role=role, color="#fff", avatar=avatar)
    personas.append(new_persona)
    return new_persona


async def add_chatroom():
    chatrooms = await get_chatrooms()
    new_chatroom = ChatRoom(
        id=str(len(chatrooms) + 1),
        participants=[],
        messages=[],
    )
    chatrooms.append(new_chatroom)
    return new_chatroom


async def recommend_participants(chatroom: ChatRoom, message: str, union=True):
    recommended_topics = bot.recommend_topics(message)
    recommended_personas = bot.recommend_personas(message, recommended_topics)
    ids = {p.id for p in personas if p.role in recommended_personas}
    if union:
        ids.update(chatroom.participants)
    chatroom.participants = list(ids)
    return [p for p in personas if p.id in chatroom.participants]


async def send_message(chatroom: ChatRoom, sender: str, message: str):
    new_message = ChatMessage(id=str(uuid.uuid4()), sender=sender, message=message, timestamp=datetime.utcnow().isoformat())
    chatroom.messages.append(new_message)
    await manager.send_message(chatroom.id, new_message.model_dump())
    return new_message


async def send(chatroom: ChatRoom, message):
    if chatroom.id in active_dialogues:
        return False
    bot.prev_question = message
    await send_message(chatroom, "0", message)


async def retrieve(chatroom: ChatRoom):
    if chatroom.id in active_dialogues:
        return False


    async def handle_persona(persona):
        try:
            role = await get_role_by_id(persona)
            placeholder_message = await send_message(chatroom, persona, "...")
            response = await bot.retrieve(role)
            placeholder_message.message = response if response else "I don't have an answer for that."
            await manager.send_message(chatroom.id, placeholder_message.model_dump())
        except asyncio.CancelledError:
            await manager.send_system(chatroom.id, "cancel")
        except Exception as e:
            traceback.print_exc()
            await manager.send_system(chatroom.id, "error", str(e))

    async def run():
        try:
            tasks = [handle_persona(persona) for persona in chatroom.participants]
            await asyncio.gather(*tasks)
        finally:
            active_dialogues.pop(chatroom.id, None)
            await manager.send_system(chatroom.id, "continue")

    active_dialogues[chatroom.id] = asyncio.create_task(run())
    return True


async def debate(chatroom: ChatRoom):
    if chatroom.id in active_dialogues:
        return False

    try:
        for persona in chatroom.participants:
            placeholder_message = await send_message(chatroom, persona, "...")
            response = await bot.debate(persona)
            placeholder_message.message = response if response else "I don't have an answer for that."
            await manager.send_message(chatroom.id, placeholder_message.model_dump())
    except asyncio.CancelledError:
        await manager.send_system(chatroom.id, "cancel")
    except Exception as e:
        await manager.send_system(chatroom.id, "error", str(e))
    finally:
        active_dialogues.pop(chatroom.id, None)
        if bot.is_debating():
            await manager.send_system(chatroom.id, "continue")
        else:
            await manager.send_system(chatroom.id, "end")

    return True


async def summary(chatroom: ChatRoom):
    if chatroom.id in active_dialogues:
        return False

    placeholder_message = await send_message(chatroom, "0", "...")
    response = await bot.summary()
    placeholder_message.message = response if response else "I don't have an answer for that."
    await manager.send_message(chatroom.id, placeholder_message.model_dump())
    # active_dialogues.pop(chatroom.id, None)
    # active_dialogues[chatroom.id].cancel()
    return True


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