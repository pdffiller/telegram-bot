import User from "./User";
import Chat from "./Chat";

export default class Message {
  message_id: number;

  from: User;
  chat: Chat;

  date: number;

  text?: string;
}