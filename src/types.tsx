export interface Choice {
    text: string;
    nextNodeLevel: number;
    nextNodeIndex: number;
}

export interface StoryNode {
    level: number;
    index: number;
    text: string;
    imageUrl?: string;
    choices?: Choice[];
}