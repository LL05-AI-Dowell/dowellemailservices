#!/bin/bash

# Stop all running containers
echo "Stopping all running containers..."
docker stop $(docker ps -aq) > /dev/null 2>&1

# Remove all containers
echo "Removing all containers..."
docker rm $(docker ps -aq) > /dev/null 2>&1

# Remove all images
echo "Removing all images..."
docker rmi $(docker images -q) > /dev/null 2>&1

# Remove all volumes
echo "Removing all volumes..."
docker volume rm $(docker volume ls -q) > /dev/null 2>&1

# Optionally remove all networks
# Uncomment the following line if you want to remove all networks as well
# echo "Removing all networks..."
# docker network rm $(docker network ls -q) > /dev/null 2>&1

echo "Cleanup complete."