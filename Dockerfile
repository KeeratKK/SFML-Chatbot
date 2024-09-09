FROM node:20 AS base
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

FROM base AS builder
WORKDIR /app
COPY . .
RUN npm run build


FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
RUN npm ci

RUN addgroup -g 1001 -S chatbot
RUN adduser -S chatuser -u 1001
USER chatuser


COPY --from=builder --chown=chatuser:chatbot /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

CMD npm start

FROM base AS dev
ENV NODE_ENV=development
RUN npm install
COPY . .
CMD npm run dev