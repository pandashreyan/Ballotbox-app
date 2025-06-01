
export interface Candidate {
  id: string;
  name: string;
  electionId: string;
  platform: string;
  party: string;
  imageUrl?: string;
  voteCount: number; // Changed from optional to required, initialized to 0
}

export interface Election {
  id: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  description: string;
  candidates: Candidate[];
}

export interface ElectionResults {
  electionId: string;
  electionName: string;
  results: Array<{
    candidateId: string;
    candidateName: string;
    voteCount: number;
  }>;
}
