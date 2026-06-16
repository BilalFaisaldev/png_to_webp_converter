-- SQL Database Schema for PNG-to-WebP Converter Authentication
-- Run these commands in your MySQL Database (e.g. phpMyAdmin, Railway, Aiven, or local MySQL CLI)

-- Create database if it does not exist (optional)
-- CREATE DATABASE IF NOT EXISTS png_to_webp_db;
-- USE png_to_webp_db;

-- Users table definition
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
