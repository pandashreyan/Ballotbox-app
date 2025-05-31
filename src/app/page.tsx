import { ElectionCard } from '@/components/ElectionCard';
import { mockElections } from '@/lib/mockData';
import type { Election } from '@/lib/types';

export default function HomePage() {
  const elections: Election[] = mockElections;

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
        <h2 className="text-3xl font-headline font-semibold mb-6 pb-2 border-b-2 border-primary">
          Available Elections
        </h2>
        {elections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No elections available at the moment. Please check back later.</p>
        )}
      </section>
    </div>
  );
}
