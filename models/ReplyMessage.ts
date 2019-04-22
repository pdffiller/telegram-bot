import { ExtraEditMessage } from "telegraf/typings/telegram-types";

export default class ReplyMessage {
  constructor(
    public chat_id: number, // 
    public text: string,
    public extra?: ExtraEditMessage
  ) {}
}