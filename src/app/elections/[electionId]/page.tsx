
import clientPromise, { dbName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Election as ElectionType, Candidate as CandidateType } from '@/lib/types';
import { ElectionDetailClient } from './client';
import { notFound } from 'next/navigation';

interface CandidateDoc extends Omit<CandidateType, 'id' | 'electionId'> {
  _id?: ObjectId | string;
  id?: ObjectId | string;
  name: string;
  platform: string;
  party?: string;
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
      startDate: new Date(rest.startDate).toISOString(),
      endDate: new Date(rest.endDate).toISOString(),
      candidates: rest.candidates.map(dbCandidate => {
        let candidateIdString: string;

        if (dbCandidate.id && typeof dbCandidate.id === 'string') {
          candidateIdString = dbCandidate.id;
        } else if (dbCandidate.id instanceof ObjectId) {
          candidateIdString = dbCandidate.id.toString();
        } else if (dbCandidate._id instanceof ObjectId) {
          candidateIdString = dbCandidate._id.toString();
        } else if (dbCandidate._id && typeof dbCandidate._id === 'string') {
            candidateIdString = dbCandidate._id;
        }
         else {
          console.warn(`Candidate in election ${electionIdString} is missing a valid 'id' or '_id'. Assigning a temporary UUID.`);
          candidateIdString = crypto.randomUUID();
        }

        return {
          id: candidateIdString,
          name: dbCandidate.name,
          platform: dbCandidate.platform,
          party: dbCandidate.party || undefined,
          imageUrl: dbCandidate.imageUrl,
          voteCount: typeof dbCandidate.voteCount === 'number' ? dbCandidate.voteCount : 0,
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
