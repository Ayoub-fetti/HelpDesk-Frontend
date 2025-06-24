FROM node:22.14-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the Vue.js SPA
RUN npm run build

# Install serve to serve the built SPA
RUN npm install -g serve

EXPOSE 3000

# Serve the built SPA
CMD ["serve", "-s", "dist", "-l", "3000"]