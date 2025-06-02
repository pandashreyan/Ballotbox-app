
import { NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase'; // Your Firebase app initialization
import * as z from 'zod';

const db = getFirestore(app);

const verifySchema = z.object({
  isVerified: z.boolean(),
});

export async function POST(req: Request, { params }: { params: { voterId: string } }) {
  const { voterId } = params;

  if (!voterId) {
    return NextResponse.json({ message: 'Voter ID is required.' }, { status: 400 });
  }

  // In a real app, you MUST add authentication here to ensure only admins can call this.
  // For example, verify a Firebase ID token and check for admin custom claims.
  // const authorization = req.headers.get('Authorization');
  // if (!authorization || !authorization.startsWith('Bearer ')) {
  //   return NextResponse.json({ message: 'Unauthorized: Missing or invalid token.' }, { status: 401 });
  // }
  // const idToken = authorization.split('Bearer ')[1];
  // try {
  //   const decodedToken = await admin.auth().verifyIdToken(idToken); // Using Firebase Admin SDK
  //   if (!decodedToken.admin) { // Assuming you have an 'admin' custom claim
  //     return NextResponse.json({ message: 'Forbidden: Not an admin.' }, { status: 403 });
  //   }
  // } catch (error) {
  //   return NextResponse.json({ message: 'Unauthorized: Invalid token.' }, { status: 401 });
  // }

  try {
    const rawData = await req.json();
    const validationResult = verifySchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid data provided.', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const { isVerified } = validationResult.data;
    const voterDocRef = doc(db, 'voters', voterId);

    // Check if voter exists
    const voterDoc = await getDoc(voterDocRef);
    if (!voterDoc.exists()) {
      return NextResponse.json({ message: 'Voter not found.' }, { status: 404 });
    }

    await updateDoc(voterDocRef, {
      isVerified: isVerified,
    });

    return NextResponse.json({ message: `Voter verification status updated successfully to ${isVerified}.` }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to update voter verification status:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
