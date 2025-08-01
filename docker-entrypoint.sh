#!/bin/sh

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
while ! nc -z mongo 27017; do
  sleep 1
done

echo "MongoDB is ready!"

# Execute the command passed to the container
exec "$@"