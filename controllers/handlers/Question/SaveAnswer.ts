import { Message } from 'telegram-typings'
import Context from '../../../models/Context'
import IDbMessageHandler from '../IDbMessageHandler';
import Question from '../../../db/models/Question';
import questionHelper from "../../../helpers/QuestionHelper";
import Answer from '../../../db/models/Answer';
import CodedError, { CODE } from '../../../models/CodedError';
import Option from '../../../db/models/Option';

export default class SaveAnswer implements IDbMessageHandler {
  async handle(message: Message, context: Context) {
    const { currentQuestion } = context;

    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case Question.TYPE.SELECT:
        await this.handleSelectQuestion(currentQuestion, message, context);
        break;

      case Question.TYPE.EMAIL:
        await this.handleEmailQuestion(currentQuestion, message, context);
        break;

      case Question.TYPE.NAME:
      case Question.TYPE.TEXT:
        await this.handleTextQuestion(currentQuestion, message, context);
        break;


      case Question.TYPE.CONTACT:
        await this.handleContactQuestion(currentQuestion, message, context);
        break;
    }

    return null;
  }

  async saveAnswer(question: Question, textOrOption: string | Option, context: Context) {
    const answerData = {
      questId: question.questId,
      questionId: question.id,
      userId: context.user.id,
      text: textOrOption instanceof String ? textOrOption : null,
      optionId: textOrOption instanceof Option ? textOrOption.id : null,
    };

    const answer = await Answer.create(answerData);

    if (context.options && textOrOption instanceof Option) {
      context.options.push(textOrOption);
    }

    if (context.answers) context.answers.push(answer)
  }


  async handleSelectQuestion(question: Question, message: Message, context: Context) {
    const options = await questionHelper.getOptions(question);
    const { text } = message;

    if (!text) return null;

    const matchingOption = options.find(option => text === option.text);

    if (!matchingOption) throw new CodedError(CODE.OPTION_NOT_VALID);

    return this.saveAnswer(question, matchingOption, context);
  }

  handleEmailQuestion(question: Question, message: Message, context: Context) {
    const { entities } = message
    const emailEntity = entities && entities.find(e => e.type === 'email');

    if (!emailEntity || !message.text) throw new CodedError(CODE.EMAIL_MISSING);
    const text = message.text.substr(emailEntity.offset, emailEntity.length);

    return this.saveAnswer(question, text, context);
  }

  handleTextQuestion(question: Question, message: Message, context: Context) {
    if (!message.text) throw new CodedError(CODE.TEXT_MISSING);

    return this.saveAnswer(question, message.text, context);
  }

  handleContactQuestion(question: Question, message: Message, context: Context) {
    if (!message.contact) throw new CodedError(CODE.CONTACT_MISSING);

    return this.saveAnswer(question, message.contact.phone_number, context);
  }
}
