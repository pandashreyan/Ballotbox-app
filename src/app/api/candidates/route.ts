import { NextResponse } from 'next/server';
import clientPromise, { dbName } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET all candidates
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const candidatesCollection = db.collection('candidates');
    const candidatesList = await candidatesCollection.find({}).toArray();
    
    // Map _id to id as string
    const formattedCandidates = candidatesList.map(c => ({
      id: c.uid || c._id.toString(),
      uid: c.uid,
      email: c.email,
      fullName: c.fullName,
      dob: c.dob,
      nationalId: c.nationalId,
      party: c.party,
      manifesto: c.manifesto,
      imageUrl: c.imageUrl,
      isApproved: c.isApproved,
      isVerified: c.isVerified,
    }));
    
    return NextResponse.json(formattedCandidates);
  } catch (error: any) {
    console.error("Failed to fetch candidates from MongoDB:", error);
    return NextResponse.json({ message: error.message || "Failed to fetch candidates." }, { status: 500 });
  }
}

// POST create/register a candidate
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { uid, email, fullName, dob, nationalId, party, manifesto } = data;
    
    if (!uid || !email) {
      return NextResponse.json({ message: "UID and email are required." }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(dbName);
    const candidatesCollection = db.collection('candidates');
    
    // Check if candidate already exists
    const existingCandidate = await candidatesCollection.findOne({ uid });
    if (existingCandidate) {
      return NextResponse.json({ message: "Candidate already registered in MongoDB.", candidate: existingCandidate }, { status: 200 });
    }
    
    const newCandidate = {
      uid,
      email,
      fullName,
      dob,
      nationalId,
      party,
      manifesto,
      imageUrl: "",
      isApproved: false,
      isVerified: false,
    };
    
    await candidatesCollection.insertOne(newCandidate);
    return NextResponse.json({ message: "Candidate registered successfully in MongoDB.", candidate: newCandidate }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to register candidate in MongoDB:", error);
    return NextResponse.json({ message: error.message || "Failed to register candidate." }, { status: 500 });
  }
}
