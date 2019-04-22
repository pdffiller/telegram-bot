import IDbMessageHandler from "../IDbMessageHandler";
import { Message } from "telegram-typings";
import Context from "../../../models/Context";
import questionHelper from "../../../helpers/QuestionHelper";
import ReplyCollection from "../../../models/ReplyCollection";
import ReplyMessage from "../../../models/ReplyMessage";

export default class Finish implements IDbMessageHandler {
  async handle(message: Message, context: Context) {
    const { quest, user } = context
    if (quest && this.allQuestionsAnswered(context)) {

      await user.update({ questionId: null });

      if (quest.endText) {
        return new ReplyCollection(true, [new ReplyMessage(user.telegramId, quest.endText)])
      }
    }

    return null;
  }

  allQuestionsAnswered(context: Context) {
    const { questions, answers } = context;

    if (!questions || !answers) return false;

    const requiredAnswers = questionHelper.getRequiredAnswersCount(context);

    return requiredAnswers === answers.length;
  }
}