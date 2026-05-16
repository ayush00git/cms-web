#!/bin/bash

# Ensure Go is in PATH
export PATH=$PATH:/usr/local/go/bin

# Set environment variables for testing
export JWT_SECRET=testsecret
export DB_USER=test
export DB_NAME=test
export DB_PASS=test
echo "--------------------------------------"

# Run tests
go test ./tests -v

if [ $? -eq 0 ]; then
    echo "--------------------------------------"
    echo "SUCCESS: All features are working correctly."
else
    echo "--------------------------------------"
    echo "FAILURE: Some features failed the functionality check."
    exit 1
fi
