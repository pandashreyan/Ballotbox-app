import { NextResponse } from 'next/server';
import clientPromise, { dbName } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ candidateId: string }> }) {
  const { candidateId } = await params;

  if (!candidateId) {
    return NextResponse.json({ message: 'Candidate ID is required.' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const candidatesCollection = db.collection('candidates');

    const candidate = await candidatesCollection.findOne({ uid: candidateId });

    if (!candidate) {
      return NextResponse.json({ message: 'Candidate not found.' }, { status: 404 });
    }

    return NextResponse.json({
      uid: candidate.uid,
      email: candidate.email,
      fullName: candidate.fullName,
      dob: candidate.dob,
      nationalId: candidate.nationalId,
      party: candidate.party,
      manifesto: candidate.manifesto,
      imageUrl: candidate.imageUrl,
      isApproved: candidate.isApproved,
      isVerified: candidate.isVerified,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to fetch candidate profile:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
