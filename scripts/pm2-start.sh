#!/usr/bin/env bash

echo "waiting for config to be ready..."
consul-template -config=./config.hcl -once;

echo "starting pm2 services"
pm2-docker start $1