export interface ChatMessage {
    sender: string;
    message: string;
    timestamp: string;
}

export interface ChatRoom {
    id: string;
    participants: string[];
    messages: ChatMessage[];
}

export interface ChatRoomHeader {
    id: string;
    recentMessage: ChatMessage;
}

export interface Persona  {
    id: string;
    name: string;
    role: string;
    color: string;
  };
