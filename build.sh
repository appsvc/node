#!/usr/bin/env bash
set -x -e

buildnumber=${4-$(date -u +"%y%m%d%H%M")}

docker build -t "$1"/node:4.4.7_"$buildnumber" 4.4.7
docker build -t "$1"/node:4.5.0_"$buildnumber" 4.5.0
docker build -t "$1"/node:4.8.3_"$buildnumber" 4.8.3
docker build -t "$1"/node:6.2.2_"$buildnumber" 6.2.2
docker build -t "$1"/node:6.6.0_"$buildnumber" 6.6.0
docker build -t "$1"/node:6.9.3_"$buildnumber" 6.9.3
docker build -t "$1"/node:6.10.3_"$buildnumber" 6.10.3
docker build -t "$1"/node:6.11.0_"$buildnumber" -t "$1"/node:lts_"$buildnumber" 6.11.0
docker build -t "$1"/node:8.0.0_"$buildnumber" 8.0.0
docker build -t "$1"/node:8.1.2_"$buildnumber" -t "$1"/node:latest_"$buildnumber" 8.1.2

docker login -u "$2" -p "$3"

docker push "$1"/node:4.4.7_"$buildnumber"
docker push "$1"/node:4.5.0_"$buildnumber"
docker push "$1"/node:4.8.3_"$buildnumber"
docker push "$1"/node:6.2.2_"$buildnumber"
docker push "$1"/node:6.6.0_"$buildnumber"
docker push "$1"/node:6.9.3_"$buildnumber"
docker push "$1"/node:6.10.3_"$buildnumber"
docker push "$1"/node:lts_"$buildnumber"
docker push "$1"/node:6.11.0_"$buildnumber"
docker push "$1"/node:8.0.0_"$buildnumber"
docker push "$1"/node:latest_"$buildnumber"
docker push "$1"/node:8.1.2_"$buildnumber"

docker logout
