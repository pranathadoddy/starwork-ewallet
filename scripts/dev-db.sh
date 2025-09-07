#!/bin/bash

# Development Database Script
echo "Starting MySQL database with Docker Compose..."

# Start only the database services
docker-compose up -d mysql phpmyadmin

echo "Database services started!"
echo "MySQL: localhost:3307"
echo "phpMyAdmin: http://localhost:8080"
echo ""
echo "phpMyAdmin credentials:"
echo "Username: root"
echo "Password: password"
echo ""
echo "Database credentials:"
echo "Host: localhost"
echo "Port: 3307"
echo "Database: ewallet_db"
echo "Username: root"
echo "Password: password"
echo ""
echo "To stop the database: docker-compose down"
