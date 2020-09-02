#!/usr/bin/env bash

docker build -t local-firebase:1.0 .

docker rm --force local-firebase

docker run --rm -d --name local-firebase -p 4000:4000 -p 9090:9090 local-firebase:1.0

