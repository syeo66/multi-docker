#!/bin/sh

export GIT_SHA=${1:-$(git rev-parse HEAD)}

docker build -t syeo66/multi-nginx:latest -t syeo66/multi-nginx:$GIT_SHA -f ./nginx/Dockerfile ./nginx
docker build -t syeo66/multi-server:latest -t syeo66/multi-server:$GIT_SHA -f ./server/Dockerfile ./server
docker build -t syeo66/multi-worker:latest -t syeo66/multi-worker:$GIT_SHA -f ./worker/Dockerfile ./worker
docker build -t syeo66/multi-client:latest -t syeo66/multi-client:$GIT_SHA -f ./client/Dockerfile ./client
  # login to docker cli
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_ID" --password-stdin
  # push to docker hub

docker push syeo66/multi-client:$GIT_SHA
docker push syeo66/multi-nginx:$GIT_SHA
docker push syeo66/multi-server:$GIT_SHA
docker push syeo66/multi-worker:$GIT_SHA

docker push syeo66/multi-client:latest
docker push syeo66/multi-nginx:latest
docker push syeo66/multi-server:latest
docker push syeo66/multi-worker:latest

#kubectl apply -f k8s
#kubectl set image deployments/server-deployment server=syeo66/multi-server:$GIT_SHA
#kubectl set image deployments/client-deployment client=syeo66/multi-client:$GIT_SHA
#kubectl set image deployments/worker-deployment worker=syeo66/multi-worker:$GIT_SHA
