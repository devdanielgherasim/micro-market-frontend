FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

RUN mkdir -p /tmp/next-app
RUN cp package.json /tmp/next-app/
RUN cp -R .next /tmp/next-app/
RUN cp -R node_modules /tmp/next-app/
RUN if [ -d "public" ]; then cp -R public /tmp/next-app/; fi
RUN if [ -d ".next/standalone" ]; then cp -R .next/standalone/. /tmp/next-app/; fi

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /tmp/next-app .

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "if [ -f \"server.js\" ]; then node server.js; else npm start; fi"]