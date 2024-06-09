FROM node:20.14
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000
ENV PORT 4000
CMD ["npm", "run", "dev"]