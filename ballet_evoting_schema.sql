
-- User roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- Users table (for superadmin, admin, and voter)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    dob DATE,
    photo_name VARCHAR(255),
    status VARCHAR(20),
    password VARCHAR(255),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Geography tables
CREATE TABLE states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

CREATE TABLE districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    state_id INT,
    name VARCHAR(100),
    FOREIGN KEY (state_id) REFERENCES states(id)
);

CREATE TABLE loksabha_constituencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    state_id INT,
    name VARCHAR(100),
    FOREIGN KEY (state_id) REFERENCES states(id)
);

CREATE TABLE vidhansabha_constituencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    district_id INT,
    name VARCHAR(100),
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

CREATE TABLE local_bodies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    district_id INT,
    name VARCHAR(100),
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

CREATE TABLE wards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    local_body_id INT,
    name VARCHAR(100),
    FOREIGN KEY (local_body_id) REFERENCES local_bodies(id)
);

CREATE TABLE booths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ward_id INT,
    name VARCHAR(100),
    FOREIGN KEY (ward_id) REFERENCES wards(id)
);

-- Admin assigned to specific constituency
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    state_id INT,
    district_id INT,
    constituency_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (constituency_id) REFERENCES vidhansabha_constituencies(id)
);

-- Voters
CREATE TABLE voters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    voter_id VARCHAR(100) UNIQUE,
    state_id INT,
    district_id INT,
    loksabha_ward_id INT,
    vidhansabha_ward_id INT,
    municipal_corp_id INT,
    municipal_corp_ward_id INT,
    booth_id INT,
    photo VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (loksabha_ward_id) REFERENCES loksabha_constituencies(id),
    FOREIGN KEY (vidhansabha_ward_id) REFERENCES vidhansabha_constituencies(id),
    FOREIGN KEY (municipal_corp_id) REFERENCES local_bodies(id),
    FOREIGN KEY (municipal_corp_ward_id) REFERENCES wards(id),
    FOREIGN KEY (booth_id) REFERENCES booths(id)
);

-- Candidates
CREATE TABLE candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    aadhar VARCHAR(20) UNIQUE,
    phone VARCHAR(20),
    dob DATE,
    district_id INT,
    state_id INT,
    loksabha_id INT,
    vidhansabha_id INT,
    local_body_id INT,
    ward_id INT,
    booth_id INT,
    election_id INT,
    income DECIMAL(15,2),
    income_no VARCHAR(50),
    income_photo VARCHAR(255),
    nationality VARCHAR(100),
    nationality_no VARCHAR(50),
    nationality_photo VARCHAR(255),
    education VARCHAR(100),
    education_photo VARCHAR(255),
    religion VARCHAR(100),
    cast VARCHAR(100),
    cast_no VARCHAR(50),
    cast_photo VARCHAR(255),
    non_crime_no VARCHAR(50),
    non_crime_photo VARCHAR(255),
    party VARCHAR(100),
    party_logo VARCHAR(255),
    photo VARCHAR(255),
    signature VARCHAR(255),
    amount DECIMAL(10,2),
    method VARCHAR(50),
    status VARCHAR(20),
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (loksabha_id) REFERENCES loksabha_constituencies(id),
    FOREIGN KEY (vidhansabha_id) REFERENCES vidhansabha_constituencies(id),
    FOREIGN KEY (local_body_id) REFERENCES local_bodies(id),
    FOREIGN KEY (ward_id) REFERENCES wards(id),
    FOREIGN KEY (booth_id) REFERENCES booths(id)
);

-- Elections
CREATE TABLE elections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    type VARCHAR(50),
    election_date DATE,
    application_start_date DATE,
    application_end_date DATE,
    result_date DATE,
    state_id INT,
    district_id INT,
    loksabha_id INT,
    vidhansabha_id INT,
    local_body_id INT,
    description TEXT,
    status VARCHAR(20),
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (loksabha_id) REFERENCES loksabha_constituencies(id),
    FOREIGN KEY (vidhansabha_id) REFERENCES vidhansabha_constituencies(id),
    FOREIGN KEY (local_body_id) REFERENCES local_bodies(id)
);

-- Votes
CREATE TABLE votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voter_id INT,
    candidate_id INT,
    election_id INT,
    vote_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voter_id) REFERENCES voters(id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    FOREIGN KEY (election_id) REFERENCES elections(id)
);
