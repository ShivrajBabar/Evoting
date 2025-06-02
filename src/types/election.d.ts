
export interface CandidateResult {
  id: number;
  candidate_id: number;
  name: string;
  party: string;
  votes: number;
  photoUrl: string;
  votePercentage: number;
}

export interface ResultData {
  id: number;
  election_id: number;
  election_name: string;
  constituency_name: string;
  winner_id: number;
  winner_name: string;
  winner_party: string;
  winner_photo: string;
  total_votes: number;
  published: boolean;
  candidates: CandidateResult[];
}
