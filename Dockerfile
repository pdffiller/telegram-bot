FROM node:8


RUN mkdir -p /src/chat-bot
WORKDIR /src/chat-bot

VOLUME /var/log/nodejs

RUN npm i -g pm2

ARG BUILD_ID
ENV BUILD_ID ${BUILD_ID:-0}

COPY package.json package.json
RUN npm i

COPY . .
COPY scripts/wait /usr/bin/wait

CMD ["wait", "config/local.js", "pm2-docker", "start", "config/pm2.config.js"]
