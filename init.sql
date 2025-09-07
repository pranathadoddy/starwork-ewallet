-- Initialize the ewallet database
-- This script runs when the MySQL container starts for the first time

-- Create the database if it doesn't exist (though it's already created by MYSQL_DATABASE)
-- CREATE DATABASE IF NOT EXISTS ewallet_db;

-- Use the ewallet_db database
USE ewallet_db;

-- Set SQL mode for better compatibility
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- The tables will be created automatically by TypeORM when the application starts
-- This file is here for any additional database setup if needed

-- You can add any additional initialization scripts here
