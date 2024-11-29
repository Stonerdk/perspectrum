import { ChatRoom, Persona, ChatRoomHeader } from "./types";
import __personas from '../public/mocked/personas.json';
import __chatrooms from '../public/mocked/chatrooms.json';

const personas: Persona[] = [...__personas];
const chatrooms: ChatRoom[] = [...__chatrooms];

export const fetchMockedPersonas = async () => {
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

export const addChatRoom = async (chatRoom: ChatRoom): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1));
    chatrooms.push(chatRoom);
};

export const addPersona = async (persona: Persona): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1));
    personas.push(persona);
};

export const addChat = async (roomId: string, sender: string, message: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1));
    const chatRoom = chatrooms.find((chatroom) => chatroom.id === roomId);
    if (chatRoom) {
        chatRoom.messages.push({ sender, message, timestamp: new Date().toISOString() });
    }
}