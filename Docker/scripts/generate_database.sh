#!/bin/bash
set -e

source ./Docker/scripts/env_functions.sh

if [ "$DOCKER_ENV" != "true" ]; then
    export_env_vars
fi

if [ -z "$DATABASE_PROVIDER" ]; then
    echo "❌ DATABASE_PROVIDER not set."
    exit 1
fi

if [ -z "$DATABASE_CONNECTION_URI" ]; then
    echo "❌ DATABASE_CONNECTION_URI not set."
    exit 1
fi

if [ "$DATABASE_PROVIDER" = "postgresql" ] || [ "$DATABASE_PROVIDER" = "mysql" ]; then
    echo "🔁 Generating Prisma Client for $DATABASE_PROVIDER"
    echo "Database URL: $DATABASE_CONNECTION_URI"

    SCHEMA_FILE="./prisma/${DATABASE_PROVIDER}-schema.prisma"
    if [ ! -f "$SCHEMA_FILE" ]; then
        echo "❌ Schema file not found: $SCHEMA_FILE"
        exit 1
    fi

    npx prisma generate --schema="$SCHEMA_FILE"
    echo "✅ Prisma generate succeeded"
else
    echo "❌ Invalid provider: $DATABASE_PROVIDER"
    exit 1
fi