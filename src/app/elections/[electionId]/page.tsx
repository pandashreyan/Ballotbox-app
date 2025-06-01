
import clientPromise, { dbName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Election as ElectionType, Candidate as CandidateType } from '@/lib/types';
import { ElectionDetailClient } from './client';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react'; // For a loading state, though notFound is primary

// Type for documents coming from MongoDB before transformation
interface ElectionDoc extends Omit<ElectionType, 'id' | 'candidates' | 'startDate' | 'endDate'> {
  _id: ObjectId;
  startDate: Date | string; // MongoDB might store as ISODate or string from API
  endDate: Date | string;   // MongoDB might store as ISODate or string from API
  candidates: Array<Omit<CandidateType, 'id'> & { _id?: ObjectId | string, id?: ObjectId | string }>;
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
    return {
      id: _id.toString(),
      name: rest.name,
      description: rest.description,
      startDate: new Date(rest.startDate).toISOString(), // Ensure ISO string format
      endDate: new Date(rest.endDate).toISOString(),     // Ensure ISO string format
      candidates: rest.candidates.map(candidate => {
        let candidateIdString: string;
        // Prioritize existing string 'id', then '_id', then generate if necessary
        if (candidate.id && typeof candidate.id === 'string') {
          candidateIdString = candidate.id;
        } else if (candidate._id) {
          candidateIdString = candidate._id.toString();
        } else if (candidate.id) { // Could be ObjectId if not string
           candidateIdString = candidate.id.toString();
        }
        else {
          console.warn(`Candidate in election ${_id.toString()} is missing a valid 'id' or '_id'. Assigning a temporary UUID.`);
          candidateIdString = crypto.randomUUID();
        }
        
        return {
          ...candidate,
          name: candidate.name, // ensure name is present
          platform: candidate.platform, // ensure platform is present
          electionId: _id.toString(), // ensure electionId is set
          id: candidateIdString,
          voteCount: typeof candidate.voteCount === 'number' ? candidate.voteCount : 0,
        };
      }),
    };
  } catch (e) {
    console.error('Failed to fetch election:', e);
    return null;
  }
}

export default async function ElectionDetailPage({ params }: { params: { electionId: string } }) {
  const election = await getElectionById(params.electionId);

  if (!election) {
    notFound();
  }

  return <ElectionDetailClient initialElection={election} />;
}
