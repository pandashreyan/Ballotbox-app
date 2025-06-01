
export interface Candidate {
  id: string;
  name: string;
  electionId: string;
  platform: string;
  party: string; // Now mandatory
  imageUrl?: string;
  voteCount: number;
}

export interface Election {
  id:string;
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

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string; // ISO date string
  imageUrl?: string; // Optional image for announcement
}
