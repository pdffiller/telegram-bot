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
import SpreadSheetModel from "../../../models/SpreadSheetModel";
import Quest from "../../../db/models/Quest";
import CodedError, { CODE } from "../../../models/CodedError";
import constants from "../../../models/constants";


export default class Results implements IDbMessageHandler {

  constructor(protected spreadSheetModel: SpreadSheetModel) {}

  async handle(message: Message, context: Context) {

    if (this.hasResultsCommand(message)) {
       return this.resultsToGoogleSheet(message, context);
    }

    return null;
  }

  async resultsToGoogleSheet(message: Message, context: Context) {
    const questId = this.getResultsQuestId(message);

      if (questId) {
        const quest = await Quest.findOne({ where: { id: questId }});
        const questions = await Question.findAll({ where: { questId, parentId: null}, order: [['order', 'ASC']]})

        if (!quest) throw new CodedError(CODE.QUEST_NOT_FOUND);
        if (!quest.spreadsheetId || !quest.spreadsheetRange) throw new CodedError(CODE.SPREADSHEET_MISSING);

        const groupedAnswers = (await this.getAllAnswers(questId))
          .map(collection => collection.map(answer => {
            if (answer.text) return answer.text;
            if (answer.optionId) {
              return answer.option.isCorrect ? constants.ANSWER_CORRECT : constants.ANSWER_INCORRECT;
            }

            return '';
          }));
          const questionNames = _.flatten(questions.map(q => q.limit ? _.fill(Array(q.limit), q.name) : q.name));
          groupedAnswers.unshift(questionNames);

          try {
            await this.spreadSheetModel.addRowsToTable(quest.spreadsheetId, quest.spreadsheetRange, groupedAnswers);
          } catch (err) {
            return new ReplyCollection(true, [new ReplyMessage(context.user.telegramId, err.message)]);
          }

        return new ReplyCollection(true, [new ReplyMessage(context.user.telegramId, 'темное дело сделано')]);
      }

      return null;
  }

  async resultsToFile(message: Message, context: Context) {
    const questId = this.getResultsQuestId(message);

      if (questId) {
        const groupedAnswers = await this.getAllAnswers(questId);

        fs.writeFileSync('./data-ts.json', JSON.stringify(groupedAnswers));

        return new ReplyCollection(true, [new ReplyMessage(context.user.telegramId, 'темное дело сделано')]);
      }

      return null;
  }

  protected async getAllAnswers(questId: number) {
    const answers = await Answer.findAll({
      where: { questId },
      include: [{
        model: Option,
        attributes: ['isCorrect', 'text']
      },{
        model: Question,
        attributes: ['name']
      }]
    });

    const groupedAnswers = Object.values(_.groupBy(answers, 'userId'))
          .map(answerCollection => {
            return _.sortBy(answerCollection, 'createdAt');
          });

    return groupedAnswers;
  }

  protected hasResultsCommand(message: Message) {
    const { text, entities } = message;
    if (entities !== undefined && text !== undefined) {
      console.log(entities);
      
      return entities.some(
        ({ offset, length }) => text.slice(offset, offset + length) === '/results'
      );
    }

    return false;
  }

  protected getResultsQuestId(message: Message) {
    const { text } = message;
    if (text) {
      const match = text.match(/\/results\s+(\d+)/) || [];
      if (match && match[1]) return +match[1] || null
    }

    return null;
  }
}