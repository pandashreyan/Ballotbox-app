
import { NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import * as z from 'zod';

const db = getFirestore(app);

const eligibilitySchema = z.object({
  isEligible: z.boolean(),
});

export async function POST(req: Request, { params }: { params: { voterId: string } }) {
  const { voterId } = params;

  if (!voterId) {
    return NextResponse.json({ message: 'Voter ID is required.' }, { status: 400 });
  }

  // IMPORTANT: Add robust authentication here to ensure only admins can call this.
  // This might involve verifying a Firebase ID token and checking for admin custom claims.

  try {
    const rawData = await req.json();
    const validationResult = eligibilitySchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid data provided.', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const { isEligible } = validationResult.data;
    const voterDocRef = doc(db, 'voters', voterId);

    const voterDoc = await getDoc(voterDocRef);
    if (!voterDoc.exists()) {
      return NextResponse.json({ message: 'Voter not found.' }, { status: 404 });
    }

    await updateDoc(voterDocRef, {
      isEligible: isEligible,
    });

    return NextResponse.json({ message: `Voter eligibility status updated successfully to ${isEligible}.` }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to update voter eligibility status:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
