export interface ChatMessage {
    sender: string;
    message: string;
    timestamp: string;
    id: string;
}

export interface ChatRoom {
    id: string;
    participants: string[];
    messages: ChatMessage[];
}

export interface ChatRoomHeader {
    id: string;
    recentMessage: ChatMessage | null;
}

export interface Persona  {
    id: string;
    name: string;
    role: string;
    color: string;
    avatar: AvatarType;
  };

export interface AvatarType {
    topType: string;
    accessoriesType: string;
    hairColor: string;
    clotheType: string;
    clotheColor: string;
    eyeType: string;
    backgroundColor: string;
    eyebrowType: string;
    mouthType: string;
    skinColor: string;
}