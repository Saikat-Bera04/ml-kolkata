FROM node:18-slim

# Install Python and ffmpeg (required for yt-dlp)
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install yt-dlp binary for Linux
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Work directory
WORKDIR /app

# Copy package files ensuring we are at the root or server directory context
# We'll assume the context is the project root, so we copy server files specifically
COPY package.json ./
# If there's a package-lock, copy it too (optional but recommended)
# COPY package-lock.json ./

# Install only production dependencies
RUN npm install

# Copy the server code
COPY server/ ./server/

# Environment variables
ENV PORT=3001
ENV YTDLP_PATH=/usr/local/bin/yt-dlp

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server/audio_server.cjs"]
