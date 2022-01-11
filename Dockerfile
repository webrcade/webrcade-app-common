FROM node:13-buster

WORKDIR /app

RUN mkdir /app/out/

COPY package.json ./

RUN apt-get update
RUN npm install

COPY . .
ENTRYPOINT ["bash", "scripts/build-webrcade-app-common.sh"]
