
import { NextResponse } from 'next/server';
import clientPromise, { dbName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Election as ElectionType, Candidate as CandidateType } from '@/lib/types';

// Type for documents coming from MongoDB before transformation
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

export async function GET(request: Request, { params }: { params: { electionId: string } }) {
  const { electionId } = params;

  if (!ObjectId.isValid(electionId)) {
    return NextResponse.json({ message: 'Invalid election ID format.' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const electionsCollection = db.collection<ElectionDoc>('elections');

    const electionDoc = await electionsCollection.findOne({ _id: new ObjectId(electionId) });

    if (!electionDoc) {
      return NextResponse.json({ message: 'Election not found.' }, { status: 404 });
    }

    const { _id, ...rest } = electionDoc;
    const electionIdString = _id.toString();

    const election: ElectionType = {
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
        } else {
          candidateIdString = new ObjectId().toString();
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

    return NextResponse.json(election, { status: 200 });
  } catch (e: any) {
    console.error('Failed to fetch election by ID:', e);
    return NextResponse.json({ message: `Failed to fetch election data: ${e.message}` }, { status: 500 });
  }
}
