FROM node

ENV MONGO_DB_USERNAME=muskan \
    MONGO_DB_PWD=password

RUN mkdir -p docker/nodeapp

COPY . /docker/nodeapp

CMD ["node","/docker/nodeapp/server.js"]