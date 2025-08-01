FROM node:22-alpine

# Install netcat for connection testing
RUN apk add --no-cache netcat-openbsd

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for seeding scripts)
RUN npm ci

# Copy application code
COPY . .

# Copy and set permissions for entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create uploads directory
RUN mkdir -p uploads

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Use entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]

# Default command
CMD ["npm", "start"]