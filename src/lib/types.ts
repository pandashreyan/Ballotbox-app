
export interface Candidate {
  id: string;
  name: string;
  electionId: string;
  platform: string;
  party: string; // Changed from optional to required
  imageUrl?: string;
  voteCount?: number; // Optional, primarily for results display
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
