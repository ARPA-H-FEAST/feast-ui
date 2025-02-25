FROM nginx:1.21.0-alpine as production

ENV NODE_ENV production

RUN mkdir -p /data/shared/feast

COPY ./build /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
