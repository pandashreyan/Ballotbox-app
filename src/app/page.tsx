
import { ElectionCard } from '@/components/ElectionCard';
import type { Election, Announcement } from '@/lib/types'; // Added Announcement
import clientPromise, { dbName } from '@/lib/mongodb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Megaphone } from 'lucide-react'; // Added Megaphone
import { PageActions } from '@/components/PageActions';
import { mockAnnouncements } from '@/lib/mockData'; // Import mock announcements
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // For Announcement card
import Image from 'next/image'; // For Announcement image
import { Separator } from '@/components/ui/separator';

async function getElections(): Promise<Election[] | { error: string }> {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const electionsCollection = db.collection<Omit<Election, 'id'>>('elections');
    const electionsData = await electionsCollection.find({}).sort({ startDate: -1 }).toArray();

    return electionsData.map((electionDoc) => {
      const { _id, ...rest } = electionDoc;
      const electionIdString = _id.toString();
      return {
        id: electionIdString,
        ...rest,
        candidates: rest.candidates.map(candidate => {
          let candidateIdString: string;
          if (candidate.id && typeof candidate.id === 'string') {
            candidateIdString = candidate.id;
          }
          else if (candidate.id && typeof candidate.id.toString === 'function') {
            candidateIdString = candidate.id.toString();
          }
          // @ts-ignore _id may exist
          else if (candidate._id && typeof candidate._id.toString === 'function') {
          // @ts-ignore _id may exist
            candidateIdString = candidate._id.toString();
          }
          else {
            console.warn(`Candidate in election ${electionIdString} is missing a valid id or _id. Assigning a temporary UUID.`);
            candidateIdString = crypto.randomUUID();
          }
          return {
            id: candidateIdString,
            name: candidate.name,
            platform: candidate.platform,
            party: candidate.party, 
            imageUrl: candidate.imageUrl,
            voteCount: typeof candidate.voteCount === 'number' ? candidate.voteCount : 0,
            electionId: electionIdString,
          };
        }),
        startDate: rest.startDate instanceof Date ? rest.startDate.toISOString() : rest.startDate,
        endDate: rest.endDate instanceof Date ? rest.endDate.toISOString() : rest.endDate,
      };
    });
  } catch (e: any)  {
    console.error('Failed to fetch elections:', e);
    return { error: `Failed to load elections. ${e.message || 'Please try again later.'}` };
  }
}

// Function to get and sort announcements (mock for now)
async function getAnnouncements(): Promise<Announcement[]> {
  // In a real app, fetch from a database
  return mockAnnouncements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}


export default async function HomePage() {
  const electionsResult = await getElections();
  const announcements = await getAnnouncements();

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

  const now = new Date();
  const upcomingElections = elections.filter(election => {
    const startDate = new Date(election.startDate);
    return now < startDate;
  });

  return (
    <div className="space-y-12"> {/* Increased spacing */}
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
          <PageActions upcomingElections={upcomingElections} />
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

      <Separator />

      <section>
        <div className="flex items-center mb-6 pb-2 border-b-2 border-accent">
          <Megaphone className="mr-3 h-8 w-8 text-accent" />
          <h2 className="text-3xl font-headline font-semibold">
            Latest Announcements
          </h2>
        </div>
        {announcements.length > 0 ? (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  {announcement.imageUrl && (
                    <div className="relative w-full h-48 mb-4 rounded-t-md overflow-hidden">
                      <Image 
                        src={announcement.imageUrl} 
                        alt={announcement.title} 
                        layout="fill" 
                        objectFit="cover"
                        data-ai-hint="announcement event"
                      />
                    </div>
                  )}
                  <CardTitle className="text-xl font-headline text-primary">{announcement.title}</CardTitle>
                  <CardDescription>
                    Posted on: {new Date(announcement.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No announcements at the moment.</p>
        )}
      </section>
    </div>
  );
}
