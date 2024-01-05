#!/bin/bash

# what a mess. We have this loop to wait until the database is up...
RETRIES=5

while !</dev/tcp/postgres/5432 && ! [ $RETRIES -eq 0 ]
do
    sleep 1
    echo "waiting for database, retries: $RETRIES"
    RETRIES=$(( $RETRIES - 1))
done

# ...and this timeout because the combo of Jest and PostgreSQL has the
# tendency to get stuck on open handles.
echo $RETRIES
if ! [ $RETRIES -eq 0 ]
then
    timeout 16s npx jest --runInBand=true --color=true
else
    echo "could not connect to database"
    exit 1
fi
