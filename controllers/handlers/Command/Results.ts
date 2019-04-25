import { Message } from "telegram-typings";
import fs from "fs";
import _ from "lodash";
import Context from "../../../models/Context";
import ReplyMessage from "../../../models/ReplyMessage";
import IDbMessageHandler from "../IDbMessageHandler";
import Answer from "../../../db/models/Answer";
import Option from "../../../db/models/Option";
import ReplyCollection from "../../../models/ReplyCollection";
import Question from "../../../db/models/Question";

export default class Results implements IDbMessageHandler {

  async handle(message: Message, context: Context) {

    if (this.hasResultsCommand(message)) {
      const questId = this.getResultsQuestId(message);

      if (questId) {
        const answers = await Answer.findAll({
          where: { questId },
          include: [{
            model: Option,
            attributes: ['isCorrect', 'text']
          },{
            model: Question,
            attributes: ['text']
          }]
        });

        const groupedAnswers = Object.values(_.groupBy(answers, 'userId'))
          .map(answerCollection => {
            return _.sortBy(answerCollection, 'id');
          });
        fs.writeFileSync('./data-ts.json', JSON.stringify(groupedAnswers));

        return new ReplyCollection(true, [new ReplyMessage(context.user.telegramId, 'темное дело сделано')])
      }

    }

    return null;
  }

  hasResultsCommand(message: Message) {
    const { text, entities } = message;
    if (entities !== undefined && text !== undefined) {
      console.log(entities);
      
      return entities.some(
        ({ offset, length }) => text.slice(offset, offset + length) === '/results'
      );
    }

    return false;
  }

  getResultsQuestId(message: Message) {
    const { text } = message;
    if (text) {
      const match = text.match(/\/results\s+(\d+)/) || [];
      if (match && match[1]) return +match[1] || null
    }

    return null;
  }
}