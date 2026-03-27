# Build Stage
FROM node:20-slim AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy project files
COPY . .

# Set environment variables for build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the application
RUN npm run build

# Runner Stage
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy necessary files from builder
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose the frontend port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
