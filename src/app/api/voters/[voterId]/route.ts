import { NextResponse } from 'next/server';
import clientPromise, { dbName } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ voterId: string }> }) {
  const { voterId } = await params;

  if (!voterId) {
    return NextResponse.json({ message: 'Voter ID is required.' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const votersCollection = db.collection('voters');

    const voter = await votersCollection.findOne({ uid: voterId });

    if (!voter) {
      return NextResponse.json({ message: 'Voter not found.' }, { status: 404 });
    }

    return NextResponse.json({
      uid: voter.uid,
      email: voter.email,
      isEligible: voter.isEligible,
      isVerified: voter.isVerified,
      registeredAt: voter.registeredAt,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to fetch voter profile:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
