# Use an official Node.js runtime as a base image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json instead of yarn.lock
COPY package.json package-lock.json ./

# Install dependencies using npm
RUN npm install --only=production

# Copy source code and build the project
COPY . ./
RUN npm run build

# Use Nginx to serve the React build files
FROM nginx:alpine

# Copy build files from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 3000
EXPOSE 3000

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
