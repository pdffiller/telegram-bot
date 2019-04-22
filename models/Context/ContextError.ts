
interface ContextErrorParams {
  telegramId?: number;
}

export default class ContextError extends Error {

  constructor(data: ContextErrorParams) {
    super('context build failed');

    Object.assign(this, data);
  }
}