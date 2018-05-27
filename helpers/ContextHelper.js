const ejs = require('ejs');
const _ = require('lodash');

module.exports = ({ constants }) => {
  const { GROUP, GOTO } = constants.QUESTION_TYPE;

  function ejsContext({ progress }) {
    return {
      answers: {
        correct: _.filter(progress, 'is_correct').length,
        incorrect: _.filter(progress, { is_correct: 0 }).length,
        total: _.filter(progress, 'option_id').length,
      }
    }
  }

  function render(text, context) {
    const fullContext = Object.assign({}, context, ejsContext(context));
    return ejs.render(text, fullContext);
  }

  function canAskQuestions(context) {
    return !!getNextQuestion(context)
  }

  function getNextQuestion(context) {
    const question = context.user.Question;
    const questions = context.questions;
    const answers = context.user.Answers;

    if (question && question.parentId) {
      const parentQuestion = _.first(questions, { id: question.parentId });
      if (!isGroupQuestionAnswered(parentQuestion, context)) return parentQuestion;
    }

    const availableQuestions = questions.filter(q => {
      if (q.parentId || _.some(answers, { questionId: q.id })) return false;

      if (q.type === GROUP) {
        return !isGroupQuestionAnswered(q, context);
      }

      return true;
    });

    return _.first(availableQuestions);
  }

  function isGroupQuestionAnswered(groupQuestion, context) {
    const questions = context.questions;
    const answers = context.user.Answers;

    const groupQuestionIds = _.map(getGroupQuestions(groupQuestion, questions), 'id');
    const readyAnswers = _.filter(answers, a => groupQuestionIds.includes(a.questionId));
    const questionReady = groupQuestion.limit
      ? groupQuestion.limit <= readyAnswers.length
      : groupQuestionIds.length <= readyAnswers.length;

    return questionReady;
  }

  function getGroupQuestions(parentQuestion, allQuestions) {
    return _.filter(allQuestions, { parentId: parentQuestion.id });
  }

  function getCurrentQuestion(context) {
    return context.progress.find(({ id }) => id === context.userData.current_question_id);
  }

  function getRandomGroupQuestion(questionGroup, context) {
    const answeredIds = _.map(context.user.Answers, 'questionId');
    const availableQuestions = questionGroup.filter(q => !answeredIds.includes(q.id));

    if (availableQuestions.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);

    return availableQuestions[randomIndex];
  }

  function shouldSendGroupText(questionGroup, context) {
    const answeredIds = _.map(context.user.Answers, 'questionId');
    return !questionGroup.some(q => answeredIds.includes(q.id));
  }

  function shouldChangeQuest(context) {
    return context.user.Question.type === GOTO;
  }

  return {
    canAskQuestions,
    getCurrentQuestion,
    getNextQuestion,
    getRandomGroupQuestion,
    shouldChangeQuest,
    shouldSendGroupText,
    render,
  }
};