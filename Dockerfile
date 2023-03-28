FROM node:18.13-alpine3.17
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000
ENV PORT 4000
CMD ["npm", "run", "dev"]