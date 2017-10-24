const _ = require('lodash');

const COMMAND = {
  START: '/start'
};

const QUESTION_TYPE = {
  SELECT: 'select',
  TEXT: 'text',
};

module.exports = ({ telegramModel, dbModel, contextHelper }) => {
  
  async function handleUpdate(message) {
    console.time('handleUpdate');
    const { from, text, entities } = message;
    const user_id = from.id;

    if (!text) return;

    let userData = await dbModel.getUserData(user_id);

    if (!userData) {
      userData = telegramModel.toUserData({ from });
      await dbModel.addUser(userData);
    }

    const quest = await dbModel.getQuest();
    const progress = await dbModel.getQuestProgress(user_id, quest.id);

    const context = {
      userData,
      quest,
      progress,
    };

    if (entities) {
      const consumed = entities
        .map(({ offset, length }) => text.slice(offset, offset+length))
        .every(_.curry(runCommand)(message, context));

      if (consumed) return;
    }

    if (userData.current_question_id) {
      const questionAnswered = await handleAnswer(message, context);

      if (!questionAnswered) return;

      if (contextHelper.canAskQuestions(context)) {
        if (contextHelper.canAskOptionalQuestions(context)) await askOptionalQuestion(context)
        else await askNextRequiredQuestion(context);
      } else {
        await finalizeQuest(context);
      }
    } else {
      telegramModel.sendMessage(user_id, quest.help_text);
    }

    console.timeEnd('handleUpdate');
  }

  function runCommand(message, context, command) {
    switch (command) {
      case COMMAND.START:
        startQuest(message, context);
        return true;

      default:
        return false;
    }
  }

  async function handleAnswer({ text, chat }, context) {
    const { current_question_id, current_quest_id, question_type } = context.userData;
    const { user_id } = context.userData;

    const currentQuestion = contextHelper.getCurrentQuestion(context);

    if (question_type === QUESTION_TYPE.SELECT) {
      const options = await dbModel.getQuestionOptions(current_question_id);
      const correctOption = options.find(option => text === option.text);

      if (correctOption) {
        currentQuestion.option_id = correctOption.id;

        return dbModel.addQuestionAnswer({
          user_id,
          quest_id: current_quest_id,
          question_id: current_question_id,
          option_id: correctOption.id
        });
      } else {
        const optionsKeyboard = telegramModel.createKeyboard(options, 'text');
        telegramModel.sendMessage(user_id, context.quest.error_text, optionsKeyboard);
        return false;
      }
    }

    if (question_type === QUESTION_TYPE.TEXT) {
      currentQuestion.text_answer = text;

      return dbModel.addQuestionAnswer({
        user_id: chat.id,
        quest_id: current_quest_id,
        question_id: current_question_id,
        text_answer: text
      });
    }
  }

  async function askNextRequiredQuestion(context) {
    const { user_id } = context.userData;

    const nextQuestion = contextHelper.getNextQuestion(context);

    const options = await dbModel.getQuestionOptions(nextQuestion.id);

    await dbModel.setUserData({
      current_question_id: nextQuestion.id,
      user_id: user_id
    });

    context.userData.current_question_id = nextQuestion.id;

    return askQuestion(user_id, nextQuestion, options);
  }

  async function askQuestionAgain(context) {
    const { userData } = context;
    const { current_question_id, user_id } = userData;
    if (current_question_id) {
      const currentQuestion = contextHelper.getCurrentQuestion(context);
      if (currentQuestion) {
        const options = await dbModel.getQuestionOptions(currentQuestion.id);

        askQuestion(user_id, currentQuestion, options);
      }
    }
  }

  async function askOptionalQuestion(context) {
    const randomQuestions = context.progress.filter(question => {
      return !question.is_required && !question.option_id && !question.text_answer
    });
    const randomQuestionIndex = Math.floor(Math.random() * randomQuestions.length);

    const question = randomQuestions[randomQuestionIndex];
    const options = await dbModel.getQuestionOptions(question.id);
    const { user_id } = context.userData;

    context.userData.current_quest_id = question.quest_id;
    context.userData.current_question_id = question.id;

    await dbModel.setUserData(context.userData);

    return askQuestion(user_id, question, options)
  }

  async function finalizeQuest({ userData, quest }) {
    const { user_id} = userData;
    const { end_text } = quest;

    userData.current_question_id = 0;
    userData.current_quest_id = 0;
    await dbModel.setUserData(userData);

    return telegramModel.sendMessage(user_id, end_text);
  }

  async function startQuest({ chat, from }, context) {
    const { userData, quest, progress } = context;

    const question = progress[0];

    userData.current_quest_id = quest.id;
    userData.current_question_id = question.id;

    if (contextHelper.hasProgress(context)) {
      await telegramModel.sendMessage(userData.user_id, quest.retry_text);
      if (contextHelper.canAskQuestions(context)) {
        await Promise.all([
          askQuestionAgain(context),
          dbModel.setUserData(userData),
        ])
      }
      return;
    }

    const [ options ] = await Promise.all([
      dbModel.getQuestionOptions(question.id),
      telegramModel.sendMessage(userData.user_id, quest.start_text),
      dbModel.setUserData(userData),
    ]);

    return askQuestion(userData.user_id, question, options);
  }

  function askQuestion(user_id, question, options) {
    const optionsKeyboard = telegramModel.createKeyboard(options, 'text');
    return telegramModel.sendMessage(user_id, question.question_text, optionsKeyboard);
  }

  return {
    handleUpdate
  };
};