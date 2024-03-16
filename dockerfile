FROM node:latest

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install


RUN pnpm run build

EXPOSE 3000 5000

CMD ["pnpm", "start"]