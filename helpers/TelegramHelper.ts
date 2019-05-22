import Option from "../db/models/Option";
import { ExtraEditMessage } from "telegraf/typings/telegram-types";
import User from "../db/models/User";

class TelegramHelper {
  markupFromOptions(options: Option[], one_time_keyboard = true) {
    const keyboard = options.map(({ text }) => [{ text }]);
    const extra: ExtraEditMessage = {};

    extra.reply_markup = { keyboard, one_time_keyboard }

    return extra;
  }

  contactRequestKeyboard(text = 'отправить номер') {
    const keyboard = [[{ text, request_contact: true }]];
    const extra: ExtraEditMessage = {};

    extra.reply_markup = { keyboard, one_time_keyboard: true }

    return extra;
  }

  nameKeyboard(user: User) {
    const { last_name = '', first_name = '' } = user;
    const text = `${last_name} ${first_name}`.trim();
    const keyboard = [[{ text }]];
    const extra: ExtraEditMessage = {};

    if (first_name && last_name) {
      extra.reply_markup = { keyboard, one_time_keyboard: true }
    }

    return extra;
  }
}

export default new TelegramHelper;