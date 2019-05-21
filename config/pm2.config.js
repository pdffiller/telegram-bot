module.exports = {
  apps: [
    {
      name: 'telegram-bot',
      script: 'build/bot.js',
      watch: './build',

      node_args: [`--inspect=0.0.0.0:9229`],
      max_memory_restart: '128M',
    }
  ]
};
