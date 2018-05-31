const _ = require('lodash');
const models = require('../models');

module.exports = ({ telegramModel, dbModel, contextHelper, constants }) => {

  const { render, canAskQuestions, getNextQuestion, getRandomGroupQuestion, getCurrentQuestion, shouldChangeQuest, shouldSendGroupText } = contextHelper;
  const { QUESTION_TYPE, COMMAND, ERROR } = constants;

  async function handleUpdate(message) {
    let context;

    console.log(message);
    
    console.time('handleUpdate');
    try {
      const { text, entities, contact } = message;

      if (!text && !contact) return;

      context = await createContext(message);

      if (entities) {
        const results = await Promise.all(
          entities
            .map(({offset, length}) => text.slice(offset, offset + length))
            .map(_.curry(runCommand)(message, context))
        );

        if (results.some(r => r)) return;
      }

      if (context.user.Question) {
        await handleAnswer(message, context);

        if (shouldChangeQuest(context)) {
          await handleNewQuest(message, context);
        } else if (canAskQuestions(context)) {
          await askNextRequiredQuestion(context);
        } else {
          await finalizeQuest(context);
        }
      } else {
        await sendHelpText(context);
      }
    } catch (e) {
      await handleError(e, context);
    }

    console.timeEnd('handleUpdate');
  }

  async function handleNewQuest(message, context) {
    const questId = +getCurrentQuestion(context).payload;
    const { userData } = context;

    userData.current_quest_id = questId;
    userData.current_question_id = 0;

    await dbModel.setUserData(userData);

    return await startQuest({}, await createContext(message));
  }

  async function createContext(message) {
    const user = await telegramModel.findOrCreateUser(message.from);
    let quest = null;
    let questions = null;
    if (user.Question) {
      quest = user.Question.Quest;
      questions = await models.Question.findAll({ where: { questId: quest.id }, order: [['order', 'ASC']]});
    }

    return {
      user,
      questions,
      quest,
      message,
    };
  }

  function getDefaultQuest() {
    return models.Quest.findOne({ where: { isDefault: true }});
  }

  async function runCommand(message, context, command) {
    switch (command) {
      case COMMAND.START:
        await startQuest(message, context);
        return true;

      default:
        return false;
    }
  }

  async function handleAnswer({ text, chat, contact, entities = [] }, context) {
    const question = context.user.Question;

    const saveAnswer = async ({ optionId, text }) => {
      const answer = await models.Answer.create({
        questId: context.quest.id,
        questionId: question.id,
        userId: context.user.id,
        timing: Date.now() - context.user.timing,
        optionId,
        text,
      });

      context.user.Answers.push(answer);
    };

    switch (question.type) {
      case QUESTION_TYPE.GOTO:
      case QUESTION_TYPE.SELECT:
        const options = await question.getOptions();
        const matchingOption = options.find(option => text === option.text);

        if (matchingOption) {
          return saveAnswer({ optionId: matchingOption.id });
        } else {
          if (context.quest.errorText) {
            return telegramModel.sendMessage(context.user.telegramId, render(context.quest.errorText, context));
          }
        }
        break;

      case QUESTION_TYPE.EMAIL:
        const emailEntity = _.find(entities, { type: 'email' });
        // todo: check email
        if (!emailEntity) {
          if (context.quest.errorText) {
            return telegramModel.sendMessage(context.user.telegramId, render(context.quest.errorText, context));
          }
        }
        text = text.substr(emailEntity.offset, emailEntity.length);

      case QUESTION_TYPE.NAME:
      case QUESTION_TYPE.TEXT:
        return saveAnswer({ text });

      case QUESTION_TYPE.CONTACT:
        if (!contact) {
          return telegramModel.sendMessage(context.user.telegramId, context.quest.errorText);
        }

        return saveAnswer({ text: contact.phone_number });
    }
  }

  async function askNextRequiredQuestion(context) {

    const nextQuestion = getNextQuestion(context);

    return askQuestion(context.user, nextQuestion, context);
  }

  async function askQuestionAgain(context) {
    return await askQuestion(context.user, context.user.Question, context);
  }

  async function finalizeQuest(context) {
    const { user, quest } = context;
    const { telegramId } = user;
    const { endText } = quest;

    user.setQuestion(null);

    if (endText && endText.length) return telegramModel.sendMessage(telegramId, render(endText, context));
  }

  async function startQuest({ chat, from, text }, context) {
    const { user } = context;

    const questId = text.match(`${COMMAND.START}\\s*(\\d*)`)[1];
    const quest = user.Question
      ? user.Question.Quest
      : await models.Quest.findOne(
        questId
          ? { where: { id: questId }}
          : { where: { isDefault: true }}
        );

    if (user.Answers.length) {

      if (user.Question && canAskQuestions(context)) {
        await telegramModel.sendMessage(user.telegramId, render(user.Question.Quest.retryText, context));

        await askQuestionAgain(context);
      } else {
        await telegramModel.sendMessage(user.telegramId, render(quest.errorText, context));
      }

      return;
    }

    if (!quest) throw new Error(ERROR.QUEST_NOT_FOUND);

    context.quest = quest;
    context.questions = await models.Question.findAll({ where: { questId: context.quest.id }, order: [['order', 'ASC']]});

    if (!context.questions.length) throw new Error(ERROR.NO_QUESTIONS_IN_QUEST);

    await !_.isEmpty(quest.startText)
      ? telegramModel.sendMessage(user.telegramId, render(quest.startText, context))
      : Promise.resolve();

    await askQuestion(user, getNextQuestion(context), context)
  }

  async function askQuestion(user, question, context) {
    let keyboard;

    context.user.update({
      timing: Date.now(),
    });

    switch (question.type) {
      case QUESTION_TYPE.GOTO:
      case QUESTION_TYPE.SELECT:
        const options = await question.getOptions();
        keyboard = telegramModel.keyboardFromOptions(options);
        break;

      case QUESTION_TYPE.CONTACT:
        keyboard = telegramModel.contactRequestKeyboard();
        break;

      case QUESTION_TYPE.NAME:
        const { first_name, last_name } = context.message.from;
        keyboard = JSON.stringify({ keyboard: [[{ text: `${last_name} ${first_name}`}]]});
        break;

      case QUESTION_TYPE.GROUP:
        const questionGroup = await question.getQuestionGroup();
        if (question.text && shouldSendGroupText(questionGroup, context)) {
          await telegramModel.sendMessage(context.user.telegramId, render(question.text, context))
        }
        const subQuestion = getRandomGroupQuestion(questionGroup, context);
        return await askQuestion(user, subQuestion, context);
    }

    await telegramModel.sendMessage(user.telegramId, render(question.text, context), keyboard);

    await user.setQuestion(question);
  }

  async function handleError(e, context) {
    switch (e.message) {
      case ERROR.NO_QUESTIONS_IN_QUEST:
        const text = await models.getText('error_no_questions');
        if (text) telegramModel.sendMessage(context.user.telegramId, render(text, context));
        break;
      default: telegramModel.sendMessage(context.user.telegramId, `Error: ${e.toString()}`)
    }
  }

  async function sendHelpText(context) {
    const helpText = context.quest ? context.quest.helpText : await models.getText('general_help');
    if (helpText) {
      telegramModel.sendMessage(context.user.telegramId, render(helpText, context));
    }
  }

  return {
    handleUpdate
  };
};