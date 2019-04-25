import Telegraf from 'telegraf'
import config from 'config';
import MessageController from './controllers/MessageController'
import { Message } from 'telegram-typings';
import db from './db';

const messageController = new MessageController;

const bot = new Telegraf(config.botId) // TODO: move to config

// bot.start((ctx) => ctx.reply('Welcome!'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.on('message', (ctx) => {
  if (ctx.message) {
    messageController.handle(ctx.message as Message, ctx.telegram);
  }
})
bot.hears('hi', (ctx) => ctx.reply('Hey there'))


db.sync().then(() => {
  bot.launch();
}).catch((err) => {
  console.log(err);
})
