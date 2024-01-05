#!/bin/bash

# Wait for the database to be reachable
RETRIES=10

while ! nc -z postgres 5432
do
    if [[ $RETRIES -eq 0 ]]
    then
        echo "Could not connect to the database!"
        exit 1
    else
        echo "Trying to connect to database..."
        RETRIES=$((RETRIES-1))
        sleep 3
    fi
done

echo "Succesfully connected to database! Continuing with tests..."

# Actually start the tests
npm run test-ci
