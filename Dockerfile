FROM node:14-alpine

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY ./ ./

RUN yarn build

EXPOSE 8080
CMD ["yarn", "start:prod"]