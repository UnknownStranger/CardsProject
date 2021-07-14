FROM node:14-buster

WORKDIR /usr/src/app

RUN chown node: /usr/src/app
USER node

COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

RUN yarn install

WORKDIR /usr/src/app/run
CMD ["nx", "serve"]