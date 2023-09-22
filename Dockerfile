FROM node:lts-alpine
LABEL authors="Admin"

WORKDIR /app

COPY package.json ./
RUN npm i

COPY . .

EXPOSE 8080
CMD [ "npm", "run", "dev" ]