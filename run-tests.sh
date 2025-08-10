#!/bin/bash
echo "Running Ayrshaer CMS Tests..."
echo "=============================="

# Run subscription tests
echo "Testing subscription functionality..."
npx jest --config tests/jest.config.js tests/subscription.test.ts

# Run Ayrshaer API tests
echo "Testing Ayrshaer API integration..."
npx jest --config tests/jest.config.js tests/ayrshaer-api.test.ts

echo "Tests completed!"