import { Message } from "telegram-typings";
import Context from "../../models/Context";
import ReplyCollection from "../../models/ReplyCollection";

export default interface IDbMessageHandler {
  handle(message: Message, context: Context): Promise<ReplyCollection | null>;
}