import { Message } from "telegram-typings";
import config from "config";
import Start from "./Command/Start";
import SaveAnswer from "./Question/SaveAnswer";
import AskNext from "./Question/AskNext";
import ReplyMessage from "../../models/ReplyMessage";
import Context from "../../models/Context";
import IDbMessageHandler from "./IDbMessageHandler";
import ErrorReplies from "../../models/ErrorReplies";
import CodedError from "../../models/CodedError";
import Idle from "./Flow/Idle";
import Enabled from "./Flow/Enabled";
import Results from "./Command/Results";
import SpreadSheetModel from "../../models/SpreadSheetModel";
import FinishToSpreadSheet from "./Flow/FinishToSpreadSheet";

const spreadSheetModel = new SpreadSheetModel(config.spreadSheets.credentialsPath, config.spreadSheets.tokenPath);

export default class MessageHandler {

  protected HANDLERS_LIST: IDbMessageHandler[] = [

    /**
     * Show help message if message is without commands 
     */
    new Idle(),

    new Enabled(),

    /**
    * COMMAND HANDLERS - collection of all message handlers for text messages.
    * These handle /start, /help, etc.
    */
    new Start(),
    new Results(spreadSheetModel),

    /**
    * QUESTION HANDLERS - collection of all message handlers for text messages.
    * These handle answers to poll questions with keyboard or text answers
    */
    new SaveAnswer(),

    /**
    * QUESTION HANDLERS - collection of all reply handlers for text messages.
    * These figure out, what to do next, after message from user was handled
    */
    new AskNext(),

    new FinishToSpreadSheet(spreadSheetModel),
  ];

  async handle(message: Message, context: Context): Promise<ReplyMessage[]> {
    let replies: ReplyMessage[] = [];
    for (let i = 0; i < this.HANDLERS_LIST.length; i++) {
      const h: IDbMessageHandler = this.HANDLERS_LIST[i];

      try {
        const replyCollection = await h.handle(message, context);
        if (replyCollection !== null) {
          replies = replies.concat(...replyCollection.replyMessages);
          if (replyCollection.isFinal) return replies;
        }
      } catch (err) {
        if (err instanceof CodedError) return this.replyForCodedError(context, err.code);
        else throw err;
      }
    }

    return replies;
  }

  async replyForCodedError(context: Context, code: number) {
    const message = await ErrorReplies.get(context, code);

    if (message) {
      return [new ReplyMessage(context.user.telegramId, message)];
    }

    return [];
  }
};
