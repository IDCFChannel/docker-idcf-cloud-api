FROM node:5
MAINTAINER Masato Shimizu <ma6ato@gmail.com>

RUN mkdir -p /app /dist/keys /dist/node_modules && \
    ln -s /dist/node_modules /app/node_modules

WORKDIR /app

COPY package.json /app/
RUN npm install -g npm-check-updates
RUN npm install

COPY . /app
CMD ["npm","start"]
