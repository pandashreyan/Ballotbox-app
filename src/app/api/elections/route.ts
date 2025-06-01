
import { NextResponse } from 'next/server';
import clientPromise, { dbName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import * as z from 'zod';
import type { Election as ElectionType } from '@/lib/types'; // For return type

const candidateSchema = z.object({
  name: z.string().min(2),
  platform: z.string().min(10),
  party: z.string().min(2, { message: "Party name must be at least 2 characters." }), // Made required
  imageUrl: z.string().url().optional().or(z.literal('')),
});

const createElectionSchema = z.object({
  name: z.string().min(5),
  description: z.string().min(10),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid start date" }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid end date" }),
  candidates: z.array(candidateSchema).min(1),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date.",
  path: ["endDate"],
});

export async function POST(req: Request) {
  try {
    const rawData = await req.json();

    const validationResult = createElectionSchema.safeParse(rawData);
    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid data provided.', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const electionData = validationResult.data;

    const client = await clientPromise;
    const db = client.db(dbName);
    const electionsCollection = db.collection('elections');

    const electionId = new ObjectId();

    const candidatesWithIdsAndVotes = electionData.candidates.map(candidate => ({
      ...candidate,
      id: new ObjectId().toString(),
      electionId: electionId.toString(),
      voteCount: 0,
      // party: candidate.party, // Party is now required and should be present
      imageUrl: candidate.imageUrl || undefined,
    }));

    const electionDocument = {
      _id: electionId,
      name: electionData.name,
      description: electionData.description,
      startDate: new Date(electionData.startDate),
      endDate: new Date(electionData.endDate),
      candidates: candidatesWithIdsAndVotes,
    };

    const result = await electionsCollection.insertOne(electionDocument);

    if (!result.acknowledged || !result.insertedId) {
      return NextResponse.json({ message: 'Failed to create election in database.' }, { status: 500 });
    }

    const createdElection = await electionsCollection.findOne({ _id: result.insertedId });
    if (!createdElection) {
        return NextResponse.json({ message: 'Election created but failed to retrieve.' }, { status: 500 });
    }

    const { _id, ...restOfCreatedElection } = createdElection;

    return NextResponse.json({
        message: 'Election created successfully!',
        election: {
            id: _id.toString(),
            ...restOfCreatedElection,
            startDate: new Date(restOfCreatedElection.startDate).toISOString(),
            endDate: new Date(restOfCreatedElection.endDate).toISOString(),
            candidates: restOfCreatedElection.candidates.map(c => ({
                ...c,
                // party: c.party, // Party is now required
            }))
        } as ElectionType
    }, { status: 201 });

  } catch (error: any) {
    console.error('Failed to create election:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const electionsCollection = db.collection('elections');
    const electionsData = await electionsCollection.find({}).sort({ startDate: -1 }).toArray();

    const elections = electionsData.map((electionDoc: any) => {
      const { _id, ...rest } = electionDoc;
      const electionIdString = _id.toString();
      return {
        id: electionIdString,
        ...rest,
        startDate: new Date(rest.startDate).toISOString(),
        endDate: new Date(rest.endDate).toISOString(),
        candidates: rest.candidates.map((candidate: any) => {
          let candidateIdString: string;
          if (candidate.id && typeof candidate.id === 'string') {
            candidateIdString = candidate.id;
          } else if (candidate.id) {
            candidateIdString = candidate.id.toString();
          } else if (candidate._id) {
            candidateIdString = candidate._id.toString();
          } else {
            candidateIdString = new ObjectId().toString();
          }
          return {
            ...candidate,
            id: candidateIdString,
            electionId: electionIdString,
            party: candidate.party, // Party is now required
            voteCount: typeof candidate.voteCount === 'number' ? candidate.voteCount : 0,
          };
        }),
      };
    });
    return NextResponse.json(elections, { status: 200 });
  } catch (e) {
    console.error('Failed to fetch elections:', e);
    return NextResponse.json({ message: 'Failed to load elections.' }, { status: 500 });
  }
}
