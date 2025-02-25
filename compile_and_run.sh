#!/bin/bash

docker stop ui-test
docker rm ui-test

docker rmi feast-prototype-ui

npm run build

chmod -R 744 build

docker build -t feast-prototype-ui .

docker run -d --rm --name ui-test -p 127.0.0.1:4242:80 feast-prototype-ui

