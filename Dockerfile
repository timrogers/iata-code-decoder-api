FROM node:24.4.1
WORKDIR /usr/src/app

# Copy package files first for better Docker layer caching
# This allows Docker to cache dependency installation when source code changes
COPY package*.json ./

RUN npm install

COPY . .

# Fix legacy ENV format and set production environment
EXPOSE 4000
ENV PORT=4000
ENV NODE_ENV=production

RUN npm run build

CMD ["npm", "start"]