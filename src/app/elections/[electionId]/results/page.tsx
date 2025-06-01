
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Election, ElectionResults, Candidate } from '@/lib/types';
import { ResultsChart } from '@/components/ResultsChart';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ElectionResultsPage() {
  const params = useParams();
  const router = useRouter();
  const electionId = params.electionId as string;

  const [resultsData, setResultsData] = useState<ElectionResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!electionId) {
      setIsLoading(false);
      setError("Election ID is missing.");
      return;
    }

    const fetchElectionResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // API route /api/elections/[electionId] is now force-dynamic
        const response = await fetch(`/api/elections/${electionId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch election data: ${response.status}`);
        }
        const election: Election = await response.json();

        const electionResults: ElectionResults = {
          electionId: election.id,
          electionName: election.name,
          results: election.candidates.map(candidate => ({
            candidateId: candidate.id,
            candidateName: candidate.name,
            // candidate.voteCount should now always be a number from the API
            voteCount: candidate.voteCount, 
          })).sort((a,b) => b.voteCount - a.voteCount),
        };
        setResultsData(electionResults);

      } catch (err: any) {
        console.error("Error fetching election results:", err);
        setError(err.message || "Could not load election results.");
        setResultsData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElectionResults();
  }, [electionId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /> Loading results...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold text-destructive">Error Loading Results</h1>
        <Alert variant="destructive" className="max-w-md mx-auto my-4">
          <AlertTitle>Loading Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push(`/elections/${electionId}`)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Election
        </Button>
      </div>
    );
  }

  if (!resultsData) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Results Not Found</h1>
        <p className="text-muted-foreground">Results for this election could not be loaded or the election does not exist.</p>
        <Button onClick={() => router.push(`/elections/${electionId}`)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Election
        </Button>
      </div>
    );
  }
  
  const totalVotes = resultsData.results.reduce((sum, r) => sum + r.voteCount, 0);

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.push(`/elections/${electionId}`)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Election Details
      </Button>

      <ResultsChart data={resultsData} />
      
      {totalVotes === 0 && (
        <Alert className="mt-4">
          <AlertTitle>No Votes Yet</AlertTitle>
          <AlertDescription>
            There are currently no votes recorded for this election in the database. Results will be displayed once votes are cast and persisted.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
