
-- Ballet Secure E-voting Database Schema

-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK(role IN ('superadmin', 'admin', 'voter', 'candidate')),
  status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Pending')),
  photo_url VARCHAR(255),
  constituency_id INT,
  voter_id VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Constituencies table
CREATE TABLE constituencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  district VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK(type IN ('Lok Sabha', 'Vidhan Sabha', 'Municipal', 'Panchayat')),
  status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Elections table
CREATE TABLE elections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  election_date DATE NOT NULL,
  nomination_start DATE NOT NULL,
  nomination_end DATE NOT NULL,
  campaign_end DATE NOT NULL,
  voting_start DATETIME NOT NULL,
  voting_end DATETIME NOT NULL,
  type VARCHAR(50) NOT NULL CHECK(type IN ('Lok Sabha', 'Vidhan Sabha', 'Municipal', 'Panchayat')),
  status VARCHAR(50) NOT NULL DEFAULT 'Upcoming' CHECK(status IN ('Upcoming', 'Ongoing', 'Completed', 'Cancelled')),
  result_published BOOLEAN NOT NULL DEFAULT FALSE,
  state VARCHAR(255),
  district VARCHAR(255),
  constituency_id INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (constituency_id) REFERENCES constituencies(id)
);

-- Candidates table
CREATE TABLE candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  election_id INT NOT NULL,
  constituency_id INT NOT NULL,
  party VARCHAR(255) NOT NULL,
  symbol VARCHAR(100) NOT NULL,
  symbol_image VARCHAR(255),
  document_url VARCHAR(255),
  age INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK(status IN ('Approved', 'Pending', 'Rejected')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (election_id) REFERENCES elections(id),
  FOREIGN KEY (constituency_id) REFERENCES constituencies(id)
);

-- Booths table
CREATE TABLE booths (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  constituency_id INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (constituency_id) REFERENCES constituencies(id)
);

-- Votes table
CREATE TABLE votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  election_id INT NOT NULL,
  constituency_id INT NOT NULL,
  candidate_id INT NOT NULL,
  voter_id VARCHAR(36) NOT NULL,
  booth_id INT NOT NULL,
  timestamp DATETIME NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (election_id) REFERENCES elections(id),
  FOREIGN KEY (constituency_id) REFERENCES constituencies(id),
  FOREIGN KEY (candidate_id) REFERENCES candidates(id),
  FOREIGN KEY (voter_id) REFERENCES users(id),
  FOREIGN KEY (booth_id) REFERENCES booths(id)
);

-- Election Results table
CREATE TABLE election_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  election_id INT NOT NULL,
  constituency_id INT NOT NULL,
  winner_id INT NOT NULL,
  total_votes INT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (election_id) REFERENCES elections(id),
  FOREIGN KEY (constituency_id) REFERENCES constituencies(id),
  FOREIGN KEY (winner_id) REFERENCES candidates(id)
);

-- Candidate Results table
CREATE TABLE candidate_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  election_result_id INT NOT NULL,
  candidate_id INT NOT NULL,
  votes INT NOT NULL,
  vote_percentage DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (election_result_id) REFERENCES election_results(id),
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

-- Create indexes for common queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_constituency ON users(constituency_id);
CREATE INDEX idx_candidates_election ON candidates(election_id);
CREATE INDEX idx_candidates_constituency ON candidates(constituency_id);
CREATE INDEX idx_votes_election ON votes(election_id);
CREATE INDEX idx_votes_constituency ON votes(constituency_id);
CREATE INDEX idx_votes_voter ON votes(voter_id);

-- Initial superadmin user (password: admin123)
INSERT INTO users (id, name, email, password, role, status) 
VALUES ('1', 'System Admin', 'admin@balletsecure.com', '$2a$10$HfzIhGCCaxqyaIdGgjWCO.q1gLdZPaYfJHsYoqSF9e0CYJgTKeUmi', 'superadmin', 'Active');
