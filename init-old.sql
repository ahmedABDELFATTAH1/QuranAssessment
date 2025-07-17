-- Initialize the feedback_board database
CREATE DATABASE IF NOT EXISTS feedback_board;
USE feedback_board;

-- Create admin user
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  isAdmin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, isAdmin) VALUES 
('admin', '$2b$10$rXzCxM7P8P8P8P8P8P8P8O7P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8', TRUE)
ON DUPLICATE KEY UPDATE username=username;

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_feedback_created_at ON feedback(created_at);
CREATE INDEX idx_feedback_category ON feedback(category);
