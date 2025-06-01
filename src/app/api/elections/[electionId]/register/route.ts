
import { NextResponse } from 'next/server';
import clientPromise, { dbName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import * as z from 'zod';

const candidateRegistrationSchema = z.object({
  name: z.string().min(2, { message: "Candidate name must be at least 2 characters." }),
  platform: z.string().min(10, { message: "Platform summary must be at least 10 characters." }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
});

export async function POST(req: Request, { params }: { params: { electionId: string } }) {
  const { electionId } = params;

  if (!ObjectId.isValid(electionId)) {
    return NextResponse.json({ message: 'Invalid election ID format.' }, { status: 400 });
  }

  try {
    const rawData = await req.json();
    const validationResult = candidateRegistrationSchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid candidate data provided.', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const candidateData = validationResult.data;

    const client = await clientPromise;
    const db = client.db(dbName);
    const electionsCollection = db.collection('elections');

    const electionObjectId = new ObjectId(electionId);

    const election = await electionsCollection.findOne({ _id: electionObjectId });

    if (!election) {
      return NextResponse.json({ message: 'Election not found.' }, { status: 404 });
    }
    
    const now = new Date();
    const electionStartDate = new Date(election.startDate);
    // const electionEndDate = new Date(election.endDate);
    // electionEndDate.setHours(23, 59, 59, 999); 

    // Registration is only allowed for upcoming elections
    if (now >= electionStartDate) {
      return NextResponse.json({ message: 'Candidate registration is only open for upcoming elections. This election may have already started or concluded.' }, { status: 403 });
    }

    // // This check is now implicitly covered by the one above, 
    // // but kept for explicitness or if logic changes later.
    // if (now > electionEndDate) {
    //   return NextResponse.json({ message: 'This election has concluded. Registration is closed.' }, { status: 403 });
    // }


    const newCandidate = {
      id: new ObjectId().toString(),
      name: candidateData.name,
      platform: candidateData.platform,
      imageUrl: candidateData.imageUrl || undefined,
      voteCount: 0,
      electionId: electionId, 
    };

    const result = await electionsCollection.updateOne(
      { _id: electionObjectId },
      { $push: { candidates: newCandidate as any } } 
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: 'Failed to register candidate.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Candidate registered successfully!', candidate: newCandidate }, { status: 201 });

  } catch (error: any) {
    console.error('Failed to register candidate:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
