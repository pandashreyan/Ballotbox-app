
import { NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export async function POST(req: Request, { params }: { params: { candidateId: string } }) {
  const { candidateId } = params;

  if (!candidateId) {
    return NextResponse.json({ message: 'Candidate ID is required.' }, { status: 400 });
  }

  // IMPORTANT: Add robust authentication here to ensure only admins can call this.

  try {
    const candidateDocRef = doc(db, 'candidates', candidateId);

    const candidateDoc = await getDoc(candidateDocRef);
    if (!candidateDoc.exists()) {
      return NextResponse.json({ message: 'Candidate not found.' }, { status: 404 });
    }

    await updateDoc(candidateDocRef, {
      isApproved: false,
    });

    return NextResponse.json({ message: `Candidate ${candidateId} approval revoked successfully.` }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to revoke candidate approval:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
