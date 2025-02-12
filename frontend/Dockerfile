FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm install


CMD [ "sh", "-c", "npm run dev -- --port 3000 --host" ]
