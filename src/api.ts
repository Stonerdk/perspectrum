import axios from "axios";
import { ChatRoom, Persona, ChatRoomHeader, AvatarType } from "./types";

const API_BASE_URL = "http://localhost:8000";
const fetchUrl = (s: string) => `${API_BASE_URL}/${s}`;


export const fetchMockedPersonas = async (): Promise<Persona[]> => {
    const response = await axios.get(fetchUrl("personas"));
    return response.data;
};

export const getPersonaById = async (id: string): Promise<Persona | undefined> => {
    try {
        const response = await axios.get(fetchUrl(`personas/${id}`));
        return response.data;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const addPersona = async (name: string, role: string, avatar: AvatarType): Promise<Persona> => {
    const response = await axios.post(fetchUrl("personas"), { name, role, avatar });
    return response.data;
};

export const fetchMockedChatRoom = async (id: string): Promise<ChatRoom | undefined> => {
    try {
        const response = await axios.get(fetchUrl(`chatrooms/${id}`));
        return response.data;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};
export const fetchMockedChatRoomHeaders = async(): Promise<ChatRoomHeader[]> => {
    const response = await axios.get(fetchUrl("chatrooms"));
    return response.data;
};

export const addChatRoom = async (): Promise<ChatRoom> => {
    const response = await axios.post(fetchUrl("chatrooms"));
    return response.data;
};

export const modifyParticipants = async (roomId: string, participants: string[]): Promise<void> => {
    await axios.put(fetchUrl(`chatrooms/${roomId}/participants`), participants);
};

export const addChat = async (roomId: string, sender: string, message: string): Promise<void> => {
    await axios.post(fetchUrl(`chatrooms/${roomId}/message`), { sender, message });
};

export const retrieveRecommendedPersona = async (roomId: string, message: string): Promise<Persona[]> => {
    const response = await axios.post(fetchUrl(`chatrooms/${roomId}/recommend`), { message });
    return response.data.participants;
}

