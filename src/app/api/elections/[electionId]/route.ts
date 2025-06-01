
import { NextResponse } from 'next/server';
import clientPromise, { dbName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Election as AppElectionType, Candidate as AppCandidateType } from '@/lib/types';

// Define MongoDB specific types for clarity
interface CandidateInDB extends Omit<AppCandidateType, 'electionId' | 'voteCount' | 'id'> {
  id: string;       // Candidate's custom string ID
  voteCount: number; // voteCount is a number in DB
  electionId: string; // Stored with candidate for reference, though parent electionId is primary
  party: string; // Ensure party is included
}

interface ElectionInDB {
  _id: ObjectId;
  name: string;
  description: string;
  startDate: Date; // Stored as ISODate in MongoDB
  endDate: Date;   // Stored as ISODate in MongoDB
  candidates: CandidateInDB[];
}

export const dynamic = 'force-dynamic'; // Ensures fresh data on every request

export async function GET(request: Request, { params }: { params: { electionId: string } }) {
  const { electionId } = params;

  if (!ObjectId.isValid(electionId)) {
    return NextResponse.json({ message: 'Invalid election ID format.' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const electionsCollection = db.collection<ElectionInDB>('elections');

    const electionDoc = await electionsCollection.findOne({ _id: new ObjectId(electionId) });

    if (!electionDoc) {
      return NextResponse.json({ message: 'Election not found.' }, { status: 404 });
    }

    const { _id, ...rest } = electionDoc;
    const electionIdString = _id.toString();

    const election: AppElectionType = {
      id: electionIdString,
      name: rest.name,
      description: rest.description,
      startDate: new Date(rest.startDate).toISOString(),
      endDate: new Date(rest.endDate).toISOString(),
      candidates: rest.candidates.map((dbCandidate: CandidateInDB) => {
        if (typeof dbCandidate.id !== 'string') {
            console.error(`Data integrity issue: Candidate in election ${electionIdString} is missing a string 'id'. Candidate data:`, dbCandidate);
        }
        if (typeof dbCandidate.voteCount !== 'number') {
            console.error(`Data integrity issue: Candidate in election ${electionIdString} has non-number 'voteCount'. Candidate data:`, dbCandidate);
        }
        return {
          id: dbCandidate.id, // Should be a string
          name: dbCandidate.name,
          platform: dbCandidate.platform,
          party: dbCandidate.party,
          imageUrl: dbCandidate.imageUrl,
          voteCount: dbCandidate.voteCount, // Should be a number
          electionId: electionIdString, // Use parent electionId for consistency
        };
      }),
    };

    return NextResponse.json(election, { status: 200 });
  } catch (e: any) {
    console.error('Failed to fetch election by ID:', e);
    return NextResponse.json({ message: `Failed to fetch election data: ${e.message}` }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { electionId: string } }) {
  const { electionId } = params;

  // In a real app, add authentication here to ensure only admins can delete
  // For now, client-side UI controls this, but API should be secured.

  if (!ObjectId.isValid(electionId)) {
    return NextResponse.json({ message: 'Invalid election ID format.' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const electionsCollection = db.collection('elections');

    const result = await electionsCollection.deleteOne({ _id: new ObjectId(electionId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Election not found or already deleted.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Election deleted successfully.' }, { status: 200 });
  } catch (e: any) {
    console.error('Failed to delete election:', e);
    return NextResponse.json({ message: `Failed to delete election: ${e.message}` }, { status: 500 });
  }
}
