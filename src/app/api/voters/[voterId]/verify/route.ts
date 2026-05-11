import { NextResponse } from 'next/server';
import clientPromise, { dbName } from '@/lib/mongodb';
import * as z from 'zod';

export const dynamic = 'force-dynamic';

const verifySchema = z.object({
  isVerified: z.boolean(),
});

export async function POST(req: Request, { params }: { params: Promise<{ voterId: string }> }) {
  const { voterId } = await params;

  if (!voterId) {
    return NextResponse.json({ message: 'Voter ID is required.' }, { status: 400 });
  }

  try {
    const rawData = await req.json();
    const validationResult = verifySchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid data provided.', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const { isVerified } = validationResult.data;
    const client = await clientPromise;
    const db = client.db(dbName);
    const votersCollection = db.collection('voters');

    // Update in MongoDB
    const result = await votersCollection.updateOne(
      { uid: voterId },
      { $set: { isVerified: isVerified } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Voter not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: `Voter verification status updated successfully to ${isVerified}.` }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to update voter verification status:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
