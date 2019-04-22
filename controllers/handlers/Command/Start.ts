import { Message } from "telegram-typings";
import Context from "../../../models/Context";
import ReplyMessage from "../../../models/ReplyMessage";
import IDbMessageHandler from "../IDbMessageHandler";
import Quest from "../../../db/models/Quest";
import Answer from "../../../db/models/Answer";
import CodedError, { CODE } from "../../../models/CodedError";
import Question from "../../../db/models/Question";
import ReplyCollection from "../../../models/ReplyCollection";

export default class Start implements IDbMessageHandler {

  async handle(message: Message, context: Context){
    if (this.hasStartCommand(message)) {
      return await this.startQuest(context);
    }

    return null;
  }

  hasStartCommand(message: Message) {
    const { text, entities } = message;
    if (entities !== undefined && text !== undefined) {
      return entities.some(
        ({ offset, length }) => text.slice(offset, offset + length) === '/start'
      );
    }

    return false;
  }

  async startQuest(context: Context) {
    const { user } = context;

    if (context.quest !== null) throw new CodedError(CODE.QUEST_IN_PROGRESS)

    const quest = await Quest.findOne({ where: { isDefault: true }});

    if (quest === null) throw new CodedError(CODE.QUEST_NOT_FOUND);
    if (!quest.isEnabled) throw new CodedError(CODE.QUEST_DISABLED);

    const answersCount = await Answer.count({ where: { userId: user.id, questId: quest.id }});
    if (answersCount > 0) throw new CodedError(CODE.QUEST_VISITED)

    const questions = await Question.findAll({ where: { questId: quest.id }, order: [['order', 'ASC']]});
    
    if (!questions || !questions.length) throw new CodedError(CODE.QUEST_HAS_NO_QUESTIONS);

    // todo: move to somewhere else
    context.quest = quest;
    context.questions = questions;
    context.answers = [];

    if (quest.startText && quest.startText.length) {
      return new ReplyCollection(false, [new ReplyMessage(user.telegramId, quest.startText)]);
    }

    return null;
  }

}