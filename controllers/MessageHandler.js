const _ = require('lodash');

const COMMAND = {
  START: '/start'
};

const QUESTION_TYPE = {
  SELECT: 'select',
  TEXT: 'text',
  CONTACT: 'contact',
  NAME: 'name',
  EMAIL: 'email',
};

module.exports = ({ telegramModel, dbModel, contextHelper }) => {

  const { render, canAskQuestions, canAskOptionalQuestions, getCurrentQuestion, getNextRequiredQuestion } = contextHelper;

  async function handleUpdate(message) {
    console.time('handleUpdate');
    const { from, text, entities, contact } = message;
    const user_id = from.id;

    if (!text && !contact) return;

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

      if (canAskQuestions(context)) {
        await askNextQuestion(context);
      } else {
        await finalizeQuest(context);
      }
    } else {
      telegramModel.sendMessage(user_id, render(quest.help_text, context));
    }

    console.timeEnd('handleUpdate');
  }

  async function askNextQuestion(context) {
    if (canAskOptionalQuestions(context)) {
      await askOptionalQuestion(context);
    } else {
      await askNextRequiredQuestion(context);
    }
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

  async function handleAnswer({ text, chat, contact, entities = [] }, context) {
    const { current_question_id, current_quest_id } = context.userData;
    const { user_id } = context.userData;

    const currentQuestion = getCurrentQuestion(context);

    switch (currentQuestion.type) {
      case QUESTION_TYPE.SELECT:
        const options = await dbModel.getQuestionOptions(current_question_id);
        const matchingOption = options.find(option => text === option.text);

        if (matchingOption) {

          currentQuestion.option_id = matchingOption.id;
          currentQuestion.is_correct = matchingOption.is_correct;

          return dbModel.addQuestionAnswer({
            user_id,
            quest_id: current_quest_id,
            question_id: current_question_id,
            option_id: matchingOption.id
          });
        } else {
          await telegramModel.sendMessage(user_id, render(context.quest.error_text, context));
          return askQuestionAgain(context) && false;
        }

      case QUESTION_TYPE.EMAIL:
        const emailEntity = _.find(entities, { type: 'email' });
        if (!emailEntity) {
          await telegramModel.sendMessage(user_id, render(context.quest.error_text, context));
          return askQuestionAgain(context) && false;
        }
        text = text.substr(emailEntity.offset, emailEntity.length);

      case QUESTION_TYPE.NAME:
      case QUESTION_TYPE.TEXT:
        currentQuestion.text_answer = text;

        return dbModel.addQuestionAnswer({
          user_id: chat.id,
          quest_id: current_quest_id,
          question_id: current_question_id,
          text_answer: text
        });

      case QUESTION_TYPE.CONTACT:
        if (!contact) {
          await telegramModel.sendMessage(user_id, context.quest.error_text);
          return true;
        }
        currentQuestion.text_answer = contact.phone_number;

        return dbModel.addQuestionAnswer({
          user_id: chat.id,
          quest_id: current_quest_id,
          question_id: current_question_id,
          text_answer: contact.phone_number
        });
    }
  }

  async function askNextRequiredQuestion(context) {
    const { user_id } = context.userData;

    const nextQuestion = getNextRequiredQuestion(context);

    await dbModel.setUserData({
      current_question_id: nextQuestion.id,
      user_id: user_id
    });

    context.userData.current_question_id = nextQuestion.id;

    return askQuestion(user_id, nextQuestion, context);
  }

  async function askQuestionAgain(context) {
    const { userData } = context;
    const { current_question_id, user_id } = userData;
    if (current_question_id) {
      const currentQuestion = getCurrentQuestion(context);
      if (currentQuestion) {
        return askQuestion(user_id, currentQuestion, context);
      }
    }
  }

  async function askOptionalQuestion(context) {

    const currentQuestion = getCurrentQuestion(context);

    if (currentQuestion && !currentQuestion.option_id) return askQuestionAgain(context);

    const randomQuestions = context.progress.filter(question => {
      return !question.is_required && !question.option_id && !question.text_answer
    });
    const randomQuestionIndex = Math.floor(Math.random() * randomQuestions.length);

    const question = randomQuestions[randomQuestionIndex];
    const { user_id } = context.userData;

    context.userData.current_quest_id = question.quest_id;
    context.userData.current_question_id = question.id;

    await dbModel.setUserData(context.userData);

    return askQuestion(user_id, question, context)
  }

  async function finalizeQuest(context) {
    const { userData, quest } = context;
    const { user_id} = userData;
    const { end_text } = quest;

    userData.current_question_id = 0;
    userData.current_quest_id = 0;
    await dbModel.setUserData(userData);

    return telegramModel.sendMessage(user_id, render(end_text, context));
  }

  async function startQuest({ chat, from }, context) {
    const { userData, quest, progress } = context;

    if (contextHelper.hasProgress(context)) {
      await telegramModel.sendMessage(userData.user_id, render(quest.retry_text, context));

      if (canAskQuestions(context)) {
        await askNextQuestion(context)
      }
      return;
    }

    const question = progress[0];

    userData.current_quest_id = quest.id;
    userData.current_question_id = question.id;

    await Promise.all([
      telegramModel.sendMessage(userData.user_id, render(quest.start_text, context), telegramModel.contactRequestKeyboard()),
      dbModel.setUserData(userData),
    ]);

    return askQuestion(userData.user_id, question, context);
  }

  async function askQuestion(user_id, question, context) {
    let keyboard;
    switch (question.type) {
      case QUESTION_TYPE.SELECT:
        const options = await dbModel.getQuestionOptions(question.id);
        keyboard = telegramModel.keyboardFromOptions(options);
        break;

      case QUESTION_TYPE.CONTACT:
        keyboard = telegramModel.contactRequestKeyboard();
        break;

      case QUESTION_TYPE.NAME:
        const { first_name, last_name } = context.userData;
        keyboard = JSON.stringify({ keyboard: [[{ text: `${last_name} ${first_name}`}]]});
        break;
    }

    return telegramModel.sendMessage(user_id, render(question.question_text, context), keyboard);
  }

  return {
    handleUpdate
  };
};