import { CODE } from './CodedError'
import Context from './Context';

let ERROR_REPLIES:{[index:number]: string} = {
  [CODE.QUEST_DISABLED]: 'час вікторини сплинув',
  [CODE.QUEST_HAS_NO_QUESTIONS]: 'у вікторині немає питань',
  [CODE.QUEST_IN_PROGRESS]: 'краще спершу закінчити те, що ти вже роспочав',
  [CODE.QUEST_NOT_FOUND]: 'ой, я нічого не знайшов',
  [CODE.QUEST_VISITED]: 'здаеться ти вже приймав участь. Вдруге не вийде',
  [CODE.OPTION_NOT_VALID]: 'цього варіанту тут немає',
  [CODE.EMAIL_MISSING]: 'це не схоже на пошту!',
  [CODE.TEXT_MISSING]: 'це не відповідь!',
  [CODE.CONTACT_MISSING]: 'ти не відправив контакт (треба натиснути кнопку)',
  [CODE.NOTHING_IN_PROGRESS]: 'Спробуй /start',
  [CODE.SPREADSHEET_MISSING]: 'ты не прікріпив таблицю',
}

class ErrorReply {
  async get(context: Context, code: number): Promise<string | null> {
    return ERROR_REPLIES[code] || null;
  }
}

export default new ErrorReply;