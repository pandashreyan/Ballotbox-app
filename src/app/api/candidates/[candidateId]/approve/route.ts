import { NextResponse } from 'next/server';
import clientPromise, { dbName } from '@/lib/mongodb';

export async function POST(req: Request, { params }: { params: { candidateId: string } }) {
  const { candidateId } = params;

  if (!candidateId) {
    return NextResponse.json({ message: 'Candidate ID is required.' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const candidatesCollection = db.collection('candidates');

    // Update in MongoDB
    const result = await candidatesCollection.updateOne(
      { uid: candidateId },
      { $set: { isApproved: true, isVerified: true } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Candidate not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: `Candidate ${candidateId} approved successfully.` }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to approve candidate:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
