
'use server';

import { NextResponse } from 'next/server';
import clientPromise, { dbName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import * as z from 'zod';

const voteSchema = z.object({
  candidateId: z.string().min(1, { message: "Candidate ID is required." }),
});

export async function POST(req: Request, { params }: { params: { electionId: string } }) {
  const { electionId } = params;

  if (!ObjectId.isValid(electionId)) {
    return NextResponse.json({ message: 'Invalid election ID format.' }, { status: 400 });
  }

  try {
    const rawData = await req.json();
    const validationResult = voteSchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid vote data provided.', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const { candidateId } = validationResult.data;
    
    // In a real app, you'd also validate candidateId format if it's expected to be an ObjectId.
    // Here we assume it's a string ID as generated.

    const client = await clientPromise;
    const db = client.db(dbName);
    const electionsCollection = db.collection('elections');
    const electionObjectId = new ObjectId(electionId);

    const election = await electionsCollection.findOne({ _id: electionObjectId });

    if (!election) {
      return NextResponse.json({ message: 'Election not found.' }, { status: 404 });
    }

    // Check if the election is ongoing
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    endDate.setHours(23, 59, 59, 999); // Ensure election runs till end of day

    if (now < startDate) {
      return NextResponse.json({ message: 'This election has not started yet.' }, { status: 403 });
    }
    if (now > endDate) {
      return NextResponse.json({ message: 'This election has concluded. Voting is closed.' }, { status: 403 });
    }
    
    // Ensure the candidate exists in this election
    const candidateExists = election.candidates.some((c: any) => c.id === candidateId);
    if (!candidateExists) {
        return NextResponse.json({ message: 'Candidate not found in this election.' }, { status: 404 });
    }

    const result = await electionsCollection.updateOne(
      { _id: electionObjectId, "candidates.id": candidateId },
      { $inc: { "candidates.$.voteCount": 1 } }
    );

    if (result.modifiedCount === 0) {
      // This could happen if the candidateId didn't match, or _id didn't match (less likely if election was found).
      return NextResponse.json({ message: 'Failed to record vote. Candidate or election may not match.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Vote recorded successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to record vote:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred while recording the vote.' }, { status: 500 });
  }
}
