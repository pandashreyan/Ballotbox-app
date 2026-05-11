
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Election, ElectionResults, Candidate } from '@/lib/types';
import { ResultsChart } from '@/components/ResultsChart';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const POLLING_INTERVAL = 10000; // 10 seconds

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

    setError(null);
    const eventSource = new EventSource(`/api/elections/${electionId}/results/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.results) {
          setResultsData(data);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      setError("Lost connection to real-time updates. Attempting to reconnect...");
    };

    return () => {
      eventSource.close();
    };
  }, [electionId]); // Added isLoading to dependency array to reset polling logic if initial load fails and user retries.

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /> Loading results...</div>;
  }

  if (error && !resultsData) { // Only show full error screen if no data is available at all
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
         <Button onClick={() => { setIsLoading(true); setResultsData(null); setError(null); }} className="mt-4 ml-2"> {/* Basic Retry */}
          Retry
        </Button>
      </div>
    );
  }
  
  if (!resultsData && !isLoading) { // Should be caught by error case if fetch truly failed
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
  
  const totalVotes = resultsData?.results.reduce((sum, r) => sum + r.voteCount, 0) ?? 0;

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.push(`/elections/${electionId}`)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Election Details
      </Button>

      {error && resultsData && ( // Show error as an alert if we have some data but polling failed
         <Alert variant="destructive" className="my-4">
          <AlertTitle>Polling Error</AlertTitle>
          <AlertDescription>Could not update results: {error}. Displaying last known data.</AlertDescription>
        </Alert>
      )}

      <ResultsChart data={resultsData} />
      
      {resultsData && totalVotes === 0 && (
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

