const api = require('./api');
const ctx = {
  questions: []
};

describe('Create demo quest', () => {

  it('create quest definition', async () => {
    ctx.quest = (await api.post('/quests', {
      name: 'Test quest',
      startText: 'start text',
      endText:	'end text',
      helpText: 	'help text',
      retryText: 'retry text',
      errorText: 'error text',
      isDefault: true,
    })).data;
  });

  it('create text question', async () => {
    ctx.questions.push((await api.post(`/questions/${ctx.quest.id}`, {
      name: 'Text question',
      order: 1,
      text: 'any text',
      type: 'text',
    })).data);
  });

  it('create select question', async () => {
    const selQ = (await api.post(`/questions/${ctx.quest.id}`, {
      name: 'Select question',
      order: 2,
      text: 'select option',
      type: 'select',
    })).data;

    ctx.questions.push(selQ);
    ctx.selectQuestion = selQ;
  });

  it('create select options', async () => {
    const qId = ctx.selectQuestion.id;
    const createOp = (text, isCorrect = false) => api.post(`/options/${qId}`, {
      text,
      isCorrect
    });

    await Promise.all([
      createOp('option 1'),
      createOp('option 2'),
      createOp('option 3 (correct)', true),
    ])
  });

  it('create question set', async () => {
    const selQ = (await api.post(`/questions/${ctx.quest.id}`, {
      name: 'question Set',
      order: 3,
      text: 'qs text',
      type: 'group',
      limit: 3,
      timeLimit: 2 * 60 * 1000,
    })).data;

    ctx.questions.push(selQ);

    const setQuestion = (name) => api.post(`/questions/${ctx.quest.id}`, {
      text: name + ' text',
      type: 'text',
      parentId: selQ.id,
    });

    await Promise.all([
      setQuestion('set question 1'),
      setQuestion('set question 2'),
      setQuestion('set question 3'),
      setQuestion('set question 4'),
      setQuestion('set question 5'),
    ])
  });

  it('create texts', async () => {
    const createText = (name, text) => api.post(`/texts`, { name, text, lang: 'en' });

    await Promise.all([
      createText('general_help', 'push /start'),
      createText('error_no_questions', 'no questions were found in this quest'),
    ])
  });

});