import { User as TGUser } from 'telegram-typings'
import _ from 'lodash'
import User from '../../db/models/User'
import Answer from '../../db/models/Answer'
import Quest from '../../db/models/Quest'
import Question from '../../db/models/Question'

export default class Context {

  constructor(
    public user: User,
    public quest: Quest | null,
    public questions: Question[] | null,
    public answers: Answer[] | null,    
  ) {}

  static async build (tgUser: TGUser) {
    const defaults = _.pick(tgUser, ['first_name', 'last_name', 'username']); 
    const telegramId = tgUser.id;
    const [user] = await User.findOrCreate({ where: { telegramId }, defaults});
    if (user.questionId) {
      const question: Question | null = await Question.findOne({ where: { id: user.questionId }, attributes: ['questId']})

      if (question !== null) {
        const { questId } = question;
        const [quest, questions, answers] = await Promise.all([
          Quest.findOne({ where: { id: questId }}),
          Question.findAll({ where: { questId }}),
          Answer.findAll({ where: { questId, userId: user.id }})
        ]);
        return new Context(user, quest, questions, answers);
      }
    }

    return new Context(user, null, null, null);
  }

  get currentQuestion(): Question | null {
    const { questions, user } = this;
    if (questions && user.questionId) {
      return questions.find(q => q.id === user.questionId) || null;
    }
    return null;
  }
}
