# Single-stage build for React frontend development
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean npm cache and remove package-lock.json to avoid sync issues
RUN npm cache clean --force && rm -f package-lock.json

# Install dependencies and regenerate package-lock.json
RUN npm install

# Copy source code
COPY . .

# Expose port 3000 (Updated Vite port)
EXPOSE 3000

# Add health check for development server
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"] 