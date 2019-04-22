import Context from "../models/Context";
import Question from "../db/models/Question";
import Option from "../db/models/Option";

class QuestionHelper {
  getGrouped(parentQuestion: Question, context: Context) {
    const { questions } = context;
    if (questions) {
      return questions.filter(q => q.parentId === parentQuestion.id);
    }

    return [];
  }


  getAnswered(questionsFromSet: Question[], context: Context) {
    const { answers } = context;
    if (answers) {
      return questionsFromSet.filter(q => answers.some(a => a.questionId === q.id));
    }

    return [];
  }

  getNotAnswered(questionsFromSet: Question[], context: Context) {
    const { answers } = context;
    if (answers) {
      const answeredQuestions = this.getAnswered(questionsFromSet, context);
      return questionsFromSet.filter(q => !answeredQuestions.includes(q));
    }

    return [];
  }

  getParent(question: Question, context: Context) {
    const { questions } = context;
    if (questions) {
      return questions.find(q => q.id === question.parentId) || null;
    }

    return null;
  }

  getOptions(question: Question) {
    return Option.findAll({ where: { questionId: question.id }});
  }

  getRequiredAnswersCount(context: Context) {
    const { questions } = context;

    if (!questions) return null;

    let requiredAnswers = 0;
    questions.forEach(q => {
      if (q.type === Question.TYPE.GROUP) requiredAnswers += q.limit;
      else if (!q.parentId) requiredAnswers += 1;
    })

    return requiredAnswers;
  }
}

export default new QuestionHelper;