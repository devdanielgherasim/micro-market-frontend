# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set the correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Define the command to run the app
CMD ["node", "server.js"]