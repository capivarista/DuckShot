CREATE DATABASE IF NOT EXISTS duckshot;
USE duckshot;

CREATE TABLE IF NOT EXISTS players (
                                       id INT AUTO_INCREMENT PRIMARY KEY,
                                       name VARCHAR(16) UNIQUE NOT NULL,
    score INT DEFAULT 0
    );
