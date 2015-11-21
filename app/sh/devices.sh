#!/bin/bash
set -eo pipefail

cd /root/iot_apps/meshblu-compose
docker-compose run --rm iotutil dump -s
