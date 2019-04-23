import { Message } from 'telegram-typings';
import { Telegram } from 'telegraf';
import ejs from 'ejs';
import MessageHandler from './handlers';
import Context from '../models/Context';
import ReplyMessage from '../models/ReplyMessage';

export default class MessageController {

  public messageHandler: MessageHandler;

  constructor() {
    this.messageHandler = new MessageHandler;
  }

  async handle(message: Message, telegram: Telegram): Promise<void> {
    const { from } = message;
    if (from) {
      const dbContext: Context = await Context.build(from);
      const replies: ReplyMessage[] = await this.messageHandler.handle(message, dbContext);

      for (let i = 0; i < replies.length; i++) {
        const r = replies[i];
        let text = r.text;
        try {
          text = ejs.render(r.text, dbContext);
        } catch (e) {
          console.error(e);
        }
        await telegram.sendMessage(r.chat_id, text, r.extra)
      }
    } else {
      throw new Error('message has no .from value');
    }
  }
}