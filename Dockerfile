FROM nginx:1.21.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY /dist/demo-windy /usr/share/nginx/html
EXPOSE 80