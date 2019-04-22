import { CODE } from './CodedError'
import Context from './Context';

let ERROR_REPLIES:{[index:number]: string} = {
  [CODE.QUEST_DISABLED]: 'викторина выключена',
  [CODE.QUEST_HAS_NO_QUESTIONS]: 'в викторине нет вопросов',
  [CODE.QUEST_IN_PROGRESS]: 'кажется ты уже и так на пол пути к успеху',
  [CODE.QUEST_NOT_FOUND]: 'ой, я ничего не нашел',
  [CODE.QUEST_VISITED]: 'кажется, ты тут уже был',
  [CODE.OPTION_NOT_VALID]: 'этого варианта тут нет',
  [CODE.EMAIL_MISSING]: 'это не почта!',
  [CODE.TEXT_MISSING]: 'это не ответ!',
  [CODE.CONTACT_MISSING]: 'ты не отправил контакт'
}

class ErrorReply {
  async get(context: Context, code: number): Promise<string | null> {
    return ERROR_REPLIES[code] || null;
  }
}

export default new ErrorReply;