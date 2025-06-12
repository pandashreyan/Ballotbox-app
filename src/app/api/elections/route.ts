
import { NextResponse } from 'next/server';
import clientPromise, { dbName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import * as z from 'zod';
import type { Election as ElectionType, Candidate as CandidateType } from '@/lib/types'; // For return type

const candidateSchema = z.object({
  name: z.string().min(2),
  platform: z.string().min(10),
  party: z.string().min(2, { message: "Party name must be at least 2 characters." }),
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
    const electionIdString = electionId.toString();

    const candidatesWithIdsAndVotes = electionData.candidates.map(candidate => ({
      ...candidate,
      id: new ObjectId().toString(),
      electionId: electionIdString, // Store electionId with candidate
      voteCount: 0, // Initialize voteCount
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

    // Map to application type
    const responseElection: ElectionType = {
        id: _id.toString(),
        name: restOfCreatedElection.name,
        description: restOfCreatedElection.description,
        startDate: new Date(restOfCreatedElection.startDate).toISOString(),
        endDate: new Date(restOfCreatedElection.endDate).toISOString(),
        candidates: restOfCreatedElection.candidates.map((c: { id: any; name: any; platform: any; party: any; imageUrl: any; voteCount: any; }) => ({
            id: c.id,
            name: c.name,
            platform: c.platform,
            party: c.party,
            imageUrl: c.imageUrl,
            voteCount: c.voteCount, // Already a number
            electionId: _id.toString(), // Ensure parent electionId
        }))
    };

    return NextResponse.json({
        message: 'Election created successfully!',
        election: responseElection
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
    const electionsCollection = db.collection('elections'); // Should use ElectionInDB type if defined globally
    const electionsData = await electionsCollection.find({}).sort({ startDate: -1 }).toArray();

    const elections: ElectionType[] = electionsData.map((electionDoc: any) => { // Use any for electionDoc if ElectionInDB not defined here
      const { _id, ...rest } = electionDoc;
      const electionIdString = _id.toString();
      return {
        id: electionIdString,
        name: rest.name,
        description: rest.description,
        startDate: new Date(rest.startDate).toISOString(),
        endDate: new Date(rest.endDate).toISOString(),
        candidates: rest.candidates.map((candidate: any) => { // Use any for candidate if CandidateInDB not defined here
          // Basic assertion that candidate.id is a string and voteCount is a number
          const candId = typeof candidate.id === 'string' ? candidate.id : new ObjectId().toString();
          if (typeof candidate.id !== 'string') {
            console.warn(`Candidate ID in election ${electionIdString} for candidate ${candidate.name} is not a string.`, candidate.id);
          }
          const candVoteCount = typeof candidate.voteCount === 'number' ? candidate.voteCount : 0;
           if (typeof candidate.voteCount !== 'number') {
            console.warn(`Candidate voteCount in election ${electionIdString} for candidate ${candidate.name} is not a number.`, candidate.voteCount);
          }

          return {
            id: candId,
            name: candidate.name,
            platform: candidate.platform,
            party: candidate.party,
            imageUrl: candidate.imageUrl,
            voteCount: candVoteCount,
            electionId: electionIdString,
          };
        }),
      };
    });
    return NextResponse.json(elections, { status: 200 });
  } catch (e:any) {
    console.error('Failed to fetch elections:', e);
    return NextResponse.json({ message: `Failed to load elections: ${e.message}` }, { status: 500 });
  }
}
