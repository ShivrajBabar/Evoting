
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Hashed
  role: 'superadmin' | 'admin' | 'voter';
  status: 'Active' | 'Inactive' | 'Pending';
  photoUrl?: string;
  constituency_id?: number;
  voter_id?: string; // For voters
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Constituency {
  id: number;
  name: string;
  state: string;
  district: string;
  type: 'Lok Sabha' | 'Vidhan Sabha' | 'Municipal' | 'Panchayat';
  status: 'Active' | 'Inactive';
  created_at: Date;
  updated_at: Date;
}

export interface Election {
  id: number;
  name: string;
  election_date: Date;
  nomination_start: Date;
  nomination_end: Date;
  campaign_end: Date;
  voting_start: Date;
  voting_end: Date;
  type: 'Lok Sabha' | 'Vidhan Sabha' | 'Municipal' | 'Panchayat';
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  result_published: boolean;
  state?: string;
  district?: string;
  constituency_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Candidate {
  id: number;
  user_id: string; // Reference to User table
  election_id: number; // Reference to Election table
  constituency_id: number; // Reference to Constituency table
  party: string;
  symbol: string;
  symbol_image?: string;
  age: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  created_at: Date;
  updated_at: Date;
}

export interface Vote {
  id: number;
  election_id: number; // Reference to Election table
  constituency_id: number; // Reference to Constituency table
  candidate_id: number; // Reference to Candidate table
  voter_id: string; // Reference to User table but anonymized
  booth_id: number; // Reference to Booth table
  timestamp: Date;
  is_valid: boolean;
  created_at: Date;
}

export interface Booth {
  id: number;
  name: string;
  location: string;
  constituency_id: number; // Reference to Constituency table
  status: 'Active' | 'Inactive';
  created_at: Date;
  updated_at: Date;
}

export interface ElectionResult {
  id: number;
  election_id: number; // Reference to Election table
  constituency_id: number; // Reference to Constituency table
  winner_id: number; // Reference to Candidate table
  total_votes: number;
  published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CandidateResult {
  id: number;
  election_result_id: number; // Reference to ElectionResult table
  candidate_id: number; // Reference to Candidate table
  votes: number;
  vote_percentage: number;
  created_at: Date;
  updated_at: Date;
}

// Extended interfaces for API responses
export interface ElectionResultWithDetails extends ElectionResult {
  election_name: string;
  constituency_name: string;
  winner_name: string;
  winner_party: string;
  winner_photo?: string;
  candidates: CandidateResultWithDetails[];
}

export interface CandidateResultWithDetails extends CandidateResult {
  name: string;
  party: string;
  photoUrl?: string;
  symbol?: string;
  user_id: string;
}

// Add UUID package for user ID generation
export interface UUID {
  v4(): string;
}
