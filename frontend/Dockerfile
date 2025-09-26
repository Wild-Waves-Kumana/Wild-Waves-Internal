# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy SSL certs into container
COPY certs/selfsigned.crt /etc/ssl/certs/selfsigned.crt
COPY certs/selfsigned.key /etc/ssl/private/selfsigned.key

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
