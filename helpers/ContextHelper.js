const ejs = require('ejs');
const _ = require('lodash');

module.exports = () => {

  function canAskOptionalQuestions(context) {
    let questionsAnswered = 0;
    let questionsLeft = context.quest.max_questions;
    let requiredQuestionsLeft = 0;
    let optionalQuestionsLeft = 0;

    context.progress.forEach(({ option_id, text_answer, is_required }) => {
      if (option_id || text_answer) {
        questionsAnswered += 1;
        questionsLeft -= 1;
      } else if (is_required) {
        requiredQuestionsLeft += 1;
      } else {
        optionalQuestionsLeft += 1;
      }
    });

    const currentQuestion = getCurrentQuestion(context);
    const nextQuestion = context.progress.find((question, i, arr) => arr[i-1] && arr[i-1].id === context.userData.current_question_id);
    const nextRequiredQuestion = getNextRequiredQuestion(context);

    const canAskOptionalQuestion = (!nextRequiredQuestion || !nextQuestion || !nextQuestion.is_required || !currentQuestion.is_required)
      && questionsLeft - requiredQuestionsLeft > 0 && optionalQuestionsLeft > 0;

    return canAskOptionalQuestion;
  }

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
    const answeredQuestions = context.progress.filter(({ option_id, text_answer }) => option_id || text_answer).length;
    return answeredQuestions < context.quest.max_questions && answeredQuestions < context.progress.length;
  }

  function getNextRequiredQuestion(context) {
    return context.progress.find(({ option_id, text_answer, is_required }) => is_required && !option_id && !text_answer);
  }

  function getCurrentQuestion(context) {
    return context.progress.find(({ id }) => id === context.userData.current_question_id);
  }

  function hasProgress(context) {
    return context.progress.some(q => q.text_answer || q.option_id);
  }

  return {
    canAskQuestions,
    canAskOptionalQuestions,
    getCurrentQuestion,
    getNextRequiredQuestion,
    hasProgress,
    render,
  }
};