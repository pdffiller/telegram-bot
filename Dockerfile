FROM node:8


RUN mkdir -p /src/chat-bot
WORKDIR /src/chat-bot

VOLUME /var/log/nodejs

COPY dockerfiles/jsfiller3/pm2-start.sh /usr/bin/pm2-start
COPY consul-template /usr/bin/consul-template

RUN npm i -g pm2

ARG BUILD_ID
ENV BUILD_ID ${BUILD_ID:-0}

COPY package.json package.json
RUN npm i

COPY . .
COPY scripts/wait /usr/bin/wait

CMD ["pm2-start", "config/pm2.config.js"]
