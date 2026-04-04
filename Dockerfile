# Step 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies based on package manager files
COPY package*.json ./
RUN npm install

# Copy all files and build the production bundle
COPY . .
RUN npm run build

# Step 2: Serve the application using Nginx
FROM nginx:alpine

# Copy custom nginx configuration to handle React Router properly
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
