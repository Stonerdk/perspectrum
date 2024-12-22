from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class ChatMessage(BaseModel):
    sender: str
    message: str
    timestamp: str
    id: str

class ChatRoom(BaseModel):
    id: str
    participants: List[str]
    messages: List[ChatMessage]

class ChatRoomHeader(BaseModel):
    id: str
    recentMessage: ChatMessage | None

class AvatarType(BaseModel):
    accessoriesType: str
    backgroundColor: str
    clotheColor: str
    clotheType: str
    eyeType: str
    eyebrowType: str
    hairColor: str
    mouthType: str
    skinColor: str
    topType: str

class Persona(BaseModel):
    id: str
    name: str
    role: str
    color: str
    avatar: AvatarType


class AddMessage(BaseModel):
    sender: str
    message: str

class MessageBody(BaseModel):
    message: str

class PersonaBody(BaseModel):
    name: str
    role: str
    avatar: AvatarType