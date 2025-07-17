-- Initialize the feedback_board database
CREATE DATABASE IF NOT EXISTS feedback_board;
USE feedback_board;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  isAdmin BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default users (password: 12 - hashed with bcrypt)
-- Hash for password "12": $2b$10$arh0wKnln6ZVvUy3aiP8y.QZCR5JE4zpOLdIsrKjHglw8RzA75h7u
INSERT INTO users (username, password, isAdmin) VALUES 
('admin1', '$2b$10$arh0wKnln6ZVvUy3aiP8y.QZCR5JE4zpOLdIsrKjHglw8RzA75h7u', TRUE),
('admin2', '$2b$10$arh0wKnln6ZVvUy3aiP8y.QZCR5JE4zpOLdIsrKjHglw8RzA75h7u', TRUE),
('user1', '$2b$10$arh0wKnln6ZVvUy3aiP8y.QZCR5JE4zpOLdIsrKjHglw8RzA75h7u', FALSE),
('user2', '$2b$10$arh0wKnln6ZVvUy3aiP8y.QZCR5JE4zpOLdIsrKjHglw8RzA75h7u', FALSE),
('user3', '$2b$10$arh0wKnln6ZVvUy3aiP8y.QZCR5JE4zpOLdIsrKjHglw8RzA75h7u', FALSE)
ON DUPLICATE KEY UPDATE username=username;

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NULL,
  isInappropriate BOOLEAN DEFAULT FALSE,
  expiresAt DATETIME NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  userId INT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_feedback_created_at ON feedback(createdAt);
CREATE INDEX idx_feedback_category ON feedback(category);
CREATE INDEX idx_users_username ON users(username);
