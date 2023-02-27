FROM 10.254.144.152/library/nginx-static-web:1.23.2-alpine
COPY /dist/demo-windy /usr/share/nginx/html
EXPOSE 80