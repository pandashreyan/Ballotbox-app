
import clientPromise, { dbName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Election as ElectionType, Candidate as CandidateType } from '@/lib/types';
import { ElectionDetailClient } from './client';
import { notFound } from 'next/navigation';

// Type for documents coming from MongoDB before transformation
interface CandidateDoc extends Omit<CandidateType, 'id' | 'electionId'> {
  _id?: ObjectId | string; // Can be ObjectId from DB or string if already processed
  id?: ObjectId | string; // Can be ObjectId or string
  name: string;
  platform: string;
  imageUrl?: string;
  voteCount?: number;
}
interface ElectionDoc extends Omit<ElectionType, 'id' | 'candidates' | 'startDate' | 'endDate'> {
  _id: ObjectId;
  startDate: Date | string;
  endDate: Date | string;
  candidates: Array<CandidateDoc>;
}


async function getElectionById(id: string): Promise<ElectionType | null> {
  if (!ObjectId.isValid(id)) {
    console.error("Invalid ObjectId format for election ID:", id);
    return null;
  }
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const electionsCollection = db.collection<ElectionDoc>('elections');
    
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
      startDate: new Date(rest.startDate).toISOString(), // Ensure ISO string format
      endDate: new Date(rest.endDate).toISOString(),     // Ensure ISO string format
      candidates: rest.candidates.map(dbCandidate => {
        let candidateIdString: string;

        // Determine the definitive string ID for the candidate
        if (dbCandidate.id && typeof dbCandidate.id === 'string') {
          candidateIdString = dbCandidate.id;
        } else if (dbCandidate.id) { // Handles ObjectId or other types for 'id'
          candidateIdString = dbCandidate.id.toString();
        } else if (dbCandidate._id) { // Fallback to _id if 'id' is missing or not primary
          candidateIdString = dbCandidate._id.toString();
        } else {
          // This case should ideally not happen if data is inserted correctly
          console.warn(`Candidate in election ${electionIdString} is missing a valid 'id' or '_id'. Assigning a temporary UUID.`);
          candidateIdString = crypto.randomUUID();
        }
        
        // Construct the candidate object explicitly for the client
        // ensuring all fields are serializable and match CandidateType
        return {
          id: candidateIdString,
          name: dbCandidate.name,
          platform: dbCandidate.platform,
          imageUrl: dbCandidate.imageUrl,
          voteCount: typeof dbCandidate.voteCount === 'number' ? dbCandidate.voteCount : 0,
          electionId: electionIdString, // Add parent election ID
        };
      }),
    };
  } catch (e) {
    console.error('Failed to fetch election:', e);
    // Optionally, rethrow or handle more gracefully
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
