
import { NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import * as z from 'zod';

const db = getFirestore(app);

// No schema needed for request body as we are just updating a flag.

export async function POST(req: Request, { params }: { params: { candidateId: string } }) {
  const { candidateId } = params;

  if (!candidateId) {
    return NextResponse.json({ message: 'Candidate ID is required.' }, { status: 400 });
  }

  // IMPORTANT: Add robust authentication here to ensure only admins can call this.
  // This might involve verifying a Firebase ID token and checking for admin custom claims.

  try {
    const candidateDocRef = doc(db, 'candidates', candidateId);

    const candidateDoc = await getDoc(candidateDocRef);
    if (!candidateDoc.exists()) {
      return NextResponse.json({ message: 'Candidate not found.' }, { status: 404 });
    }

    await updateDoc(candidateDocRef, {
      isApproved: true,
      // Optionally, you might also want to set isVerified to true here if approval implies verification
      // isVerified: true, 
    });

    return NextResponse.json({ message: `Candidate ${candidateId} approved successfully.` }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to approve candidate:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
