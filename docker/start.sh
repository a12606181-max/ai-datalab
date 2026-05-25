#!/bin/sh
set -eu

mkdir -p /app/data

db_path="${DATABASE_URL#file:}"
should_seed=0

if [ ! -f "$db_path" ]; then
  should_seed=1
fi

npx prisma db push

if [ "$should_seed" = "1" ]; then
  npm run db:seed
fi

exec "$@"
