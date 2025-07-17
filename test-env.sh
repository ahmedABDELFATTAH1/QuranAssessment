#!/bin/bash

echo "Testing environment variable loading..."

# Load environment variables
set -a  # Export all variables
source .env
set +a

echo "=== Backend Environment Test ==="
echo "NODE_ENV: $NODE_ENV"
echo "DB_HOST: $DB_HOST"  
echo "DB_PORT: $DB_PORT"
echo "DB_USERNAME: $DB_USERNAME"
echo "DB_NAME: $DB_NAME"
echo "JWT_SECRET: ${JWT_SECRET:0:10}..." # Only show first 10 chars for security
echo "BACKEND_PORT: $BACKEND_PORT"
echo "PORT: $PORT"

echo ""
echo "=== Frontend Environment Test ==="
echo "NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
echo "NEXT_PUBLIC_WEBSOCKET_URL: $NEXT_PUBLIC_WEBSOCKET_URL"
echo "FRONTEND_PORT: $FRONTEND_PORT"

echo ""
echo "Environment test complete!"
