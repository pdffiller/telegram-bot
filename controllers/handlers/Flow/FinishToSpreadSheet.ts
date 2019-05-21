import _ from "lodash";
import Finish from "./Finish";
import { Message } from "telegram-typings";
import Context from "../../../models/Context";
import Option from "../../../db/models/Option";
import constants from "../../../models/constants";
import SpreadSheetModel from "../../../models/SpreadSheetModel";


export default class FinishToSpreadSheet extends Finish {

  constructor(protected spreadsheetModel: SpreadSheetModel) {
    super();
  }

  async handle(message: Message, context: Context) {
    const { quest, options, answers } = context;
    if (this.allQuestionsAnswered(context) && quest && quest.spreadsheetId && quest.spreadsheetRange) {
      const textAnswers = _.orderBy(answers, ['createdAt']).map(a => {
        if (a.text) return a.text;
        if (a.optionId) {
          const option = _.find(options, { id: a.optionId }) as Option | null;
          if (!option) return constants.UNKNOWN_OPTION;
          return option.isCorrect ? constants.ANSWER_CORRECT : constants.ANSWER_INCORRECT;
        }

        return constants.ANSWER_EMPTY;
      });

      await this.spreadsheetModel.addRowsToTable(quest.spreadsheetId, quest.spreadsheetRange, [textAnswers]);
    }

    return super.handle(message, context);
  }
}