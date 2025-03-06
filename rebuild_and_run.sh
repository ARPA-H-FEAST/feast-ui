#!/bin/bash

docker stop ui-test
docker rm ui-test

docker rmi feast-prototype-ui

docker build -t feast-prototype-ui .

docker run -d --restart always --name ui-test -p 127.0.0.1:4242:80 feast-prototype-ui

