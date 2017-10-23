FROM node:8.7

RUN mkdir -p /src/chat-bot
WORKDIR /src/chat-bot

EXPOSE 3000

VOLUME /var/log/nodejs

COPY scripts/pm2-start.sh /usr/bin/pm2-start
COPY consul-template /usr/bin/consul-template

RUN chmod -R a+x /usr/bin

RUN npm i -g pm2

ARG BUILD_ID
ENV BUILD_ID ${BUILD_ID:-0}

COPY package.json package.json
RUN npm i

COPY . .

CMD ["pm2-start", "config/pm2.config.js"]
