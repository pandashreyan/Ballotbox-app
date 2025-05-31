'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockElections } from '@/lib/mockData';
import type { Election, ElectionResults } from '@/lib/types';
import { ResultsChart } from '@/components/ResultsChart';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ElectionResultsPage() {
  const params = useParams();
  const router = useRouter();
  const electionId = params.electionId as string;

  const [resultsData, setResultsData] = useState<ElectionResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundElection = mockElections.find(e => e.id === electionId);
    if (foundElection) {
      // Load votes from localStorage
      const storedVotesString = localStorage.getItem(`ballotbox_votes_${electionId}`);
      const votesCount: { [candidateId: string]: number } = storedVotesString ? JSON.parse(storedVotesString) : {};

      const electionResults: ElectionResults = {
        electionId: foundElection.id,
        electionName: foundElection.name,
        results: foundElection.candidates.map(candidate => ({
          candidateId: candidate.id,
          candidateName: candidate.name,
          voteCount: votesCount[candidate.id] || 0, // Use stored votes or default to 0
        })).sort((a,b) => b.voteCount - a.voteCount), // Sort by vote count descending
      };
      setResultsData(electionResults);
    } else {
      // Handle election not found
      setResultsData(null); // Or redirect
    }
    setIsLoading(false);
  }, [electionId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><ArrowLeft className="animate-spin h-8 w-8 text-primary" /> Loading results...</div>;
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
            There are currently no votes recorded for this election. Results will be displayed once votes are cast.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
