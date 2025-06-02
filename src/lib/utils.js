
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Generate consistent colors for data visualization
export function getColorByIndex(index, opacity = 1) {
  const colors = [
    `rgba(8, 145, 178, ${opacity})`,
    `rgba(14, 165, 233, ${opacity})`,
    `rgba(79, 70, 229, ${opacity})`,
    `rgba(192, 132, 252, ${opacity})`,
    `rgba(249, 115, 22, ${opacity})`,
    `rgba(234, 88, 12, ${opacity})`,
    `rgba(16, 185, 129, ${opacity})`,
    `rgba(101, 163, 13, ${opacity})`,
    `rgba(234, 179, 8, ${opacity})`,
    `rgba(239, 68, 68, ${opacity})`,
  ];
  
  return colors[index % colors.length];
}

// Create database SQL export
export const generateSQLDump = () => {
  const sqlContent = `
-- Digital Vote Verse Database Schema
-- Created on ${new Date().toISOString().split('T')[0]}

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'admin', 'voter') NOT NULL DEFAULT 'voter',
  status ENUM('Active', 'Inactive', 'Pending') NOT NULL DEFAULT 'Pending',
  photo_url VARCHAR(255),
  voter_id VARCHAR(50) UNIQUE,
  phone VARCHAR(20),
  constituency_id INT,
  booth_id INT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Constituencies Table
CREATE TABLE IF NOT EXISTS constituencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  total_voters INT DEFAULT 0,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Booths Table
CREATE TABLE IF NOT EXISTS booths (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  constituency_id INT NOT NULL,
  officer_id VARCHAR(36),
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (constituency_id) REFERENCES constituencies(id) ON DELETE CASCADE,
  FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Elections Table
CREATE TABLE IF NOT EXISTS elections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('Upcoming', 'Active', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Upcoming',
  description TEXT,
  constituency_id INT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (constituency_id) REFERENCES constituencies(id) ON DELETE SET NULL
);

-- Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  party VARCHAR(100) NOT NULL,
  symbol_url VARCHAR(255),
  photo_url VARCHAR(255),
  bio TEXT,
  election_id INT NOT NULL,
  constituency_id INT,
  status ENUM('Active', 'Inactive', 'Pending', 'Rejected') NOT NULL DEFAULT 'Pending',
  document_url VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  FOREIGN KEY (constituency_id) REFERENCES constituencies(id) ON DELETE SET NULL
);

-- Votes Table
CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  election_id INT NOT NULL,
  voter_id VARCHAR(36) NOT NULL,
  candidate_id INT NOT NULL,
  booth_id INT NOT NULL,
  voted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  FOREIGN KEY (voter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (booth_id) REFERENCES booths(id) ON DELETE CASCADE,
  UNIQUE KEY (election_id, voter_id)
);

-- Results Table
CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  election_id INT NOT NULL,
  constituency_id INT,
  total_votes INT NOT NULL DEFAULT 0,
  voter_turnout DECIMAL(5,2) DEFAULT 0,
  completed_date DATETIME,
  published BOOLEAN DEFAULT false,
  published_date DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  FOREIGN KEY (constituency_id) REFERENCES constituencies(id) ON DELETE SET NULL
);

-- Candidate Results Table
CREATE TABLE IF NOT EXISTS candidate_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  result_id INT NOT NULL,
  candidate_id INT NOT NULL,
  votes INT NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  FOREIGN KEY (result_id) REFERENCES results(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- Sample superadmin user (password: admin123)
INSERT INTO users (id, name, email, password, role, status) VALUES 
('1', 'Super Admin', 'superadmin@example.com', '$2a$10$F3igo1zKH.d5O6v8PX69/.fEFJZPhkDgdmP9NJIoQjJ9DsNPPMUmu', 'superadmin', 'Active');

-- Sample admin user (password: admin123)
INSERT INTO users (id, name, email, password, role, status) VALUES 
('2', 'Admin User', 'admin@example.com', '$2a$10$F3igo1zKH.d5O6v8PX69/.fEFJZPhkDgdmP9NJIoQjJ9DsNPPMUmu', 'admin', 'Active');

-- Sample voter user (password: voter123)
INSERT INTO users (id, name, email, password, role, status, voter_id) VALUES 
('3', 'Voter User', 'voter@example.com', '$2a$10$YgU9QVXq52iRjO1bIGfGdOoFVZbPA.enDkKOBXHxuwQk3YJplI27O', 'voter', 'Active', 'VOT123456');

-- Sample constituencies
INSERT INTO constituencies (name, state, district) VALUES
('Mumbai North', 'Maharashtra', 'Mumbai'),
('Mumbai South', 'Maharashtra', 'Mumbai'),
('Pune', 'Maharashtra', 'Pune');

-- Sample booths
INSERT INTO booths (name, address, constituency_id) VALUES
('Booth 1', '123 Main St, Mumbai', 1),
('Booth 2', '456 Oak St, Mumbai', 1),
('Booth 3', '789 Pine St, Mumbai', 2);

-- Sample election
INSERT INTO elections (name, type, start_date, end_date, status, description) VALUES
('Lok Sabha Elections 2023', 'Lok Sabha', '2023-05-01', '2023-05-15', 'Completed', 'General Elections for Lok Sabha 2023');

-- Sample candidates
INSERT INTO candidates (name, party, election_id, constituency_id, status) VALUES
('Candidate 1', 'Party A', 1, 1, 'Active'),
('Candidate 2', 'Party B', 1, 1, 'Active'),
('Candidate 3', 'Party C', 1, 1, 'Active');

-- Sample results
INSERT INTO results (election_id, constituency_id, total_votes, voter_turnout, completed_date, published, published_date) VALUES
(1, 1, 1500, 75.5, '2023-05-15 18:00:00', true, '2023-05-16 12:00:00');

-- Sample candidate results
INSERT INTO candidate_results (result_id, candidate_id, votes, percentage) VALUES
(1, 1, 750, 50),
(1, 2, 500, 33.33),
(1, 3, 250, 16.67);
`;
  
  return sqlContent;
};
