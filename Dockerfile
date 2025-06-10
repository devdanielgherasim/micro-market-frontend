FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all project files
COPY . .

# Set Next.js to output standalone mode
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application - skip linting
RUN npm run build -- --no-lint

# Copy required files to a clean directory structure
RUN mkdir -p /tmp/next-app
RUN cp package.json /tmp/next-app/
RUN cp -R .next /tmp/next-app/
RUN cp -R node_modules /tmp/next-app/
# Copy public if it exists
RUN if [ -d "public" ]; then cp -R public /tmp/next-app/; fi
# Copy standalone output if it exists
RUN if [ -d ".next/standalone" ]; then cp -R .next/standalone/. /tmp/next-app/; fi

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy pre-processed app from builder stage
COPY --from=builder /tmp/next-app .

# Set the correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Use JSON format for CMD to properly handle signals
CMD ["sh", "-c", "if [ -f \"server.js\" ]; then node server.js; else npm start; fi"]