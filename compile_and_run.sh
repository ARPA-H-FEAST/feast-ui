#!/bin/bash

docker stop ui-test
docker rm ui-test

docker rmi feast-prototype-ui

npm run build

if [[ $? != 0 ]]; then
    echo NPM build failed, exiting...
    exit 0
fi

chmod -R 744 build

docker build -t feast-prototype-ui .

docker run -d --rm --name ui-test -p 127.0.0.1:4242:80 feast-prototype-ui

