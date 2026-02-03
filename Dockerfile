FROM node:20-slim

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Railway sets PORT env var, default to 3000
ENV PORT=3000

# Start the app with dynamic port
CMD ["sh", "-c", "npm start -- -p $PORT"]
