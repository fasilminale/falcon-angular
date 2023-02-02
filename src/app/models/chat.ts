import { User } from "./user";

export interface CustomChat {
    chatId?: string;
    fromUser: User;
    toUser: User;
    message: string;
    dateTime: string;
    isTyping?: boolean;
}