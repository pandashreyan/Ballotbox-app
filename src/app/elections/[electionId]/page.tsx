
import clientPromise, { dbName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Election as AppElectionType, Candidate as AppCandidateType } from '@/lib/types';
import { ElectionDetailClient } from './client';
import { notFound } from 'next/navigation';

// Define MongoDB specific types for clarity matching the API route
interface CandidateInDB extends Omit<AppCandidateType, 'electionId' | 'voteCount' | 'id'> {
  id: string;
  voteCount: number;
  electionId: string; 
}

interface ElectionInDB {
  _id: ObjectId;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  candidates: CandidateInDB[];
}


async function getElectionById(id: string): Promise<AppElectionType | null> {
  if (!ObjectId.isValid(id)) {
    console.error("Invalid ObjectId format for election ID:", id);
    return null;
  }
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const electionsCollection = db.collection<ElectionInDB>('elections');

    const electionDoc = await electionsCollection.findOne({ _id: new ObjectId(id) });

    if (!electionDoc) {
      return null;
    }

    const { _id, ...rest } = electionDoc;
    const electionIdString = _id.toString();

    return {
      id: electionIdString,
      name: rest.name,
      description: rest.description,
      startDate: new Date(rest.startDate).toISOString(),
      endDate: new Date(rest.endDate).toISOString(),
      candidates: rest.candidates.map((dbCandidate: CandidateInDB) => {
         if (typeof dbCandidate.id !== 'string') {
            console.error(`Data integrity issue on page: Candidate in election ${electionIdString} is missing a string 'id'. Candidate data:`, dbCandidate);
        }
        if (typeof dbCandidate.voteCount !== 'number') {
            console.error(`Data integrity issue on page: Candidate in election ${electionIdString} has non-number 'voteCount'. Candidate data:`, dbCandidate);
        }
        return {
          id: dbCandidate.id,
          name: dbCandidate.name,
          platform: dbCandidate.platform,
          party: dbCandidate.party,
          imageUrl: dbCandidate.imageUrl,
          voteCount: dbCandidate.voteCount,
          electionId: electionIdString,
        };
      }),
    };
  } catch (e) {
    console.error('Failed to fetch election:', e);
    throw new Error(`Failed to fetch election data: ${(e as Error).message}`);
  }
}

export default async function ElectionDetailPage({ params }: { params: { electionId: string } }) {
  const election = await getElectionById(params.electionId);

  if (!election) {
    notFound();
  }

  return <ElectionDetailClient initialElection={election} />;
}
