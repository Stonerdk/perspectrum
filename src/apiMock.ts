import { ChatRoom, Persona, ChatRoomHeader, AvatarType } from "./types";
import __personas from '../public/mocked/personas.json';
import __chatrooms from '../public/mocked/chatrooms.json';

const personas: Persona[] = [...__personas];
const chatrooms: ChatRoom[] = [...__chatrooms];

export const fetchMockedPersonas = async (): Promise<Persona[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(personas);
      }, 1); // Simulate a delay
    });
};

export const getPersonaById = async (id: string): Promise<Persona | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(personas.find((persona) => persona.id === id));
        }, 1);
    });
};

export const fetchMockedChatRoom = async (id: string): Promise<ChatRoom | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 1));
    const chatroom = chatrooms.find((chatroom) => chatroom.id === id);
    if (chatroom) {
        return chatroom;
    } else {
        throw new Error("Chat room not found"); // 실패 처리
    }
};

export const fetchMockedChatRoomHeaders = async () : Promise<ChatRoomHeader[]> => {
    await new Promise((resolve) => setTimeout(resolve, 1));

    return chatrooms.map((chatroom) => ({
        id: chatroom.id,
        recentMessage: chatroom.messages?.[chatroom.messages.length - 1] ?? {
            sender: "0", message: "" }
    }));
}

export const addChatRoom = async (): Promise<ChatRoom> => {
    await new Promise((resolve) => setTimeout(resolve, 1));
    const newChatRoom: ChatRoom = {
        id: (chatrooms.length + 1).toString(),
        participants: [],
        messages: [],
    };
    chatrooms.push(newChatRoom);
    return newChatRoom;
};

export const modifyParticipants = async (roomId: string, participants: string[]): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1));
    const chatRoom = chatrooms.find((chatroom) => chatroom.id === roomId);
    if (chatRoom) {
        chatRoom.participants = participants;
    }
}

export const addPersona = async (name: string, role: string, avatar: AvatarType): Promise<Persona> => {
    await new Promise((resolve) => setTimeout(resolve, 1));
    const newPersona: Persona = {
        id: (personas.length + 1).toString(),
        name,
        role,
        avatar,
        color: "#fff",
    };
    personas.push(newPersona);
    return newPersona;
};

export const addChat = async (roomId: string, sender: string, message: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1));
    const chatRoom = chatrooms.find((chatroom) => chatroom.id === roomId);
    if (chatRoom) {
        chatRoom.messages.push({ sender, message, timestamp: new Date().toISOString() });
    }
}