import { NextResponse } from 'next/server';
import clientPromise, { dbName } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET all voters
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const votersCollection = db.collection('voters');
    const votersList = await votersCollection.find({}).toArray();
    
    // Map _id to id as string
    const formattedVoters = votersList.map(v => ({
      id: v.uid || v._id.toString(),
      uid: v.uid,
      email: v.email,
      isEligible: v.isEligible,
      isVerified: v.isVerified,
      registeredAt: v.registeredAt,
    }));
    
    return NextResponse.json(formattedVoters);
  } catch (error: any) {
    console.error("Failed to fetch voters from MongoDB:", error);
    return NextResponse.json({ message: error.message || "Failed to fetch voters." }, { status: 500 });
  }
}

// POST create/register a voter
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { uid, email } = data;
    
    if (!uid || !email) {
      return NextResponse.json({ message: "UID and email are required." }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(dbName);
    const votersCollection = db.collection('voters');
    
    // Check if voter already exists
    const existingVoter = await votersCollection.findOne({ uid });
    if (existingVoter) {
      return NextResponse.json({ message: "Voter already registered in MongoDB.", voter: existingVoter }, { status: 200 });
    }
    
    const newVoter = {
      uid,
      email,
      isEligible: false,
      isVerified: false,
      registeredAt: new Date().toISOString(),
    };
    
    await votersCollection.insertOne(newVoter);
    return NextResponse.json({ message: "Voter registered successfully in MongoDB.", voter: newVoter }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to register voter in MongoDB:", error);
    return NextResponse.json({ message: error.message || "Failed to register voter." }, { status: 500 });
  }
}
