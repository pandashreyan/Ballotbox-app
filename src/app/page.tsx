
import { ElectionCard } from '@/components/ElectionCard';
import type { Election } from '@/lib/types';
import clientPromise, { dbName } from '@/lib/mongodb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getElections(): Promise<Election[] | { error: string }> {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const electionsCollection = db.collection<Omit<Election, 'id'>>('elections');
    const electionsData = await electionsCollection.find({}).sort({ startDate: -1 }).toArray();

    return electionsData.map((electionDoc) => {
      const { _id, ...rest } = electionDoc;
      return {
        id: _id.toString(),
        ...rest,
        candidates: rest.candidates.map(candidate => {
          let candidateIdString: string;
          if (candidate.id && typeof candidate.id === 'string') {
            candidateIdString = candidate.id;
          } else if (candidate.id) {
            candidateIdString = candidate.id.toString();
          // @ts-ignore _id may exist if candidates were separate documents or subdocs with ObjectIds
          } else if (candidate._id) {
          // @ts-ignore _id may exist
            candidateIdString = candidate._id.toString();
          } else {
            console.warn(`Candidate in election ${_id.toString()} is missing a valid 'id' or '_id'. Assigning a temporary UUID.`);
            candidateIdString = crypto.randomUUID();
          }
          return {
            ...candidate,
            id: candidateIdString,
            // Ensure voteCount is a number, defaulting to 0 if not present
            voteCount: typeof candidate.voteCount === 'number' ? candidate.voteCount : 0,
          };
        }),
      };
    });
  } catch (e) {
    console.error('Failed to fetch elections:', e);
    return { error: 'Failed to load elections. Please try again later.' };
  }
}


export default async function HomePage() {
  const electionsResult = await getElections();

  if (typeof electionsResult === 'object' && 'error' in electionsResult) {
    return (
      <div className="space-y-8">
        <section className="text-center py-8">
          <h1 className="text-4xl font-headline font-bold text-primary mb-4">
            Welcome to BallotBox
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore ongoing and upcoming elections. Cast your vote and make your voice heard.
          </p>
        </section>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{electionsResult.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const elections: Election[] = electionsResult;

  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">
          Welcome to BallotBox
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore ongoing and upcoming elections. Cast your vote and make your voice heard.
        </p>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-primary">
          <h2 className="text-3xl font-headline font-semibold">
            Available Elections
          </h2>
          <Button asChild>
            <Link href="/create-election">
              <PlusCircle className="mr-2 h-5 w-5" /> Create Election
            </Link>
          </Button>
        </div>
        {elections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No elections available at the moment. Please check back later or create a new one.</p>
        )}
      </section>
    </div>
  );
}
