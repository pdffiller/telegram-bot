

import IDbMessageHandler from "../IDbMessageHandler";
import { Message } from "telegram-typings";
import Context from "../../../models/Context";
import CodedError, { CODE } from "../../../models/CodedError";

export default class Finish implements IDbMessageHandler {
  async handle(message: Message, context: Context) {
    const { quest } = context

    if (quest && !quest.isEnabled) throw new CodedError(CODE.QUEST_DISABLED);

    return null;
  }
}