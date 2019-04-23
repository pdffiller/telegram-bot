module.exports = {
  apps: [
    {
      name: 'telegram-bot-service',
      script: 'build/bot.js',
      max_memory_restart: '128M',
    }
  ]
};
