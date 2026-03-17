FROM nginx:alpine

# nginx:alpine includes the stream module by default
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
EXPOSE 50051
EXPOSE 50052
EXPOSE 50053
EXPOSE 50054

CMD ["nginx", "-g", "daemon off;"]
