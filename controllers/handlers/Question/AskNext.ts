import IDbMessageHandler from "../IDbMessageHandler";
import { Message } from "telegram-typings";
import Context from "../../../models/Context";
import Question from "../../../db/models/Question";
import ReplyCollection from "../../../models/ReplyCollection";
import ReplyMessage from "../../../models/ReplyMessage";
import questionHelper from "../../../helpers/QuestionHelper";
import telegramHelper from "../../../helpers/TelegramHelper";

export default class AskRequired implements IDbMessageHandler {
  async handle(message: Message, context: Context) {
    const { questions } = context;

    if (this.shouldAskFirstQuestion(context) && questions) {
      return this.askQuestion(context, questions[0]);
    }

    if (this.isNotInQuestionSet(context)) {
      const question = this.getNextQuestion(context);

      if (question) return this.askQuestion(context, question);
    }

    if (this.isInQuestionSet(context)) {
      const { currentQuestion } = context;
      if (currentQuestion) {
        const parentQuestion = questionHelper.getParent(currentQuestion, context) as Question;
        const question = await this.getNextGroupedQuestion(context, parentQuestion);

        if (question) return this.askQuestion(context, question);
      }
    }

    return null;
  }

  async startGroupedQuestion(context: Context, parentQuestion: Question) {
    const { user } = context;
    const randomQuestion = await this.getNextGroupedQuestion(context, parentQuestion);
    const reply = await this.askQuestion(context, randomQuestion);

    if (parentQuestion.text) reply.replyMessages.unshift(new ReplyMessage(user.telegramId, parentQuestion.text));

    return reply;
  }

  async getNextGroupedQuestion(context: Context, parentQuestion: Question) {
    const questionsFromSet = questionHelper.getGrouped(parentQuestion, context);
    const notAnsweredQuestions = questionHelper.getNotAnswered(questionsFromSet, context);

    return notAnsweredQuestions[Math.floor(Math.random() * notAnsweredQuestions.length)];
  }

  async askQuestion(context: Context, question: Question): Promise<ReplyCollection> {
    const { user } = context;

    if (question.type === Question.TYPE.GROUP) return this.startGroupedQuestion(context, question);

    await user.update({
      questionId: question.id
    })

    const message = new ReplyMessage(user.telegramId, question.text);
    switch (question.type) {
      case Question.TYPE.GOTO:
      case Question.TYPE.SELECT:
        const options = await questionHelper.getOptions(question);
        message.extra = telegramHelper.markupFromOptions(options);
        break;

      case Question.TYPE.CONTACT:
        message.extra = telegramHelper.contactRequestKeyboard();
        break;

      case Question.TYPE.NAME:
        message.extra = telegramHelper.nameKeyboard(context.user);
        break;
    }

    return new ReplyCollection(true, [message]);
  }

  getNextQuestion(context: Context): Question | null {
    const { questions, currentQuestion } = context;

    if (questions && currentQuestion) {
      // if last question in set, should get its parent
      const question = currentQuestion.parentId ? questionHelper.getParent(currentQuestion, context) : currentQuestion;

      // get next question after current
      return questions.filter(q => !q.parentId).find((q, i, arr) => (i > 0 && arr[i - 1] === question)) || null;
    }

    return null;
  }

  /**
   * @method notInQuestionSet checks if currently question set isn't in progress
   */
  isNotInQuestionSet(context: Context) {
    const { currentQuestion, answers, questions } = context;

    if (currentQuestion && questions) {
      const isQuestionFromSet = currentQuestion.parentId !== null;

      if (isQuestionFromSet && answers) {
        const parentQuestion = questionHelper.getParent(currentQuestion, context) as Question;
        const questionsFromSet = questionHelper.getGrouped(parentQuestion, context);
        const answeredQuestions = questionHelper.getAnswered(questionsFromSet, context);
        return answeredQuestions.length >= parentQuestion.limit;
      }

      return true;
    }

    return true;
  }

  isInQuestionSet(context: Context) {
    const { currentQuestion, questions } = context;

    if (!currentQuestion || !currentQuestion.parentId || !questions) return false;

    const parentQuestion = questionHelper.getParent(currentQuestion, context) as Question;
    const questionsFromSet = questionHelper.getGrouped(parentQuestion, context);
    const answeredQuestions = questionHelper.getAnswered(questionsFromSet, context);

    return answeredQuestions.length < parentQuestion.limit;
  }

  shouldAskFirstQuestion(context: Context) {
    const { quest, questions, answers, user } = context;

    return quest && questions && answers && !answers.length && !user.questionId;
  }
}