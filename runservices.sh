#!/bin/bash

# Check if the .env.development file exists
if [ ! -f .env.development ]; then
  echo ".env.development file not found!"
  exit 1
fi

# Check if the docker-compose.dev.yml file exists
if [ ! -f docker-compose.dev.yml ]; then
  echo "docker-compose.dev.yml file not found!"
  exit 1
fi

# Start the server with Docker Compose
echo "Starting server using Docker Compose..."
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build server client