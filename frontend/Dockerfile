# ---------------------------
# Stage 1: Build React (Vite)
# ---------------------------
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy only package files first (to improve caching)
COPY package.json package-lock.json ./

# Force clean install (VERY IMPORTANT for avoiding outdated deps)
RUN npm ci --include=dev

# Copy the rest of the project
COPY . .

# Ensure production mode
ENV NODE_ENV=production

# Build the app
RUN npm run build


# ---------------------------
# Stage 2: Serve with Nginx
# ---------------------------
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built output
COPY --from=build /app/dist /usr/share/nginx/html

# Copy your nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
