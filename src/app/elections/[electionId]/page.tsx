'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockElections } from '@/lib/mockData';
import type { Election, Candidate } from '@/lib/types';
import { CandidateCard } from '@/components/CandidateCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BarChart3, CalendarDays, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ElectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const electionId = params.electionId as string;

  const [election, setElection] = useState<Election | null>(null);
  const [votedCandidateId, setVotedCandidateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundElection = mockElections.find(e => e.id === electionId);
    if (foundElection) {
      // Deep copy to allow modification of vote counts for this session
      const electionCopy = JSON.parse(JSON.stringify(foundElection)) as Election;
      setElection(electionCopy);
      
      // Attempt to load persisted votes for this election
      const storedVotes = localStorage.getItem(`ballotbox_votes_${electionId}`);
      if (storedVotes) {
        const votes = JSON.parse(storedVotes);
        // This example assumes we're updating vote counts directly in the client for demo
        // In a real app, votes are stored server-side.
        // Here, we'll just reflect if the user has voted.
         electionCopy.candidates.forEach(c => {
           c.voteCount = votes[c.id] || 0;
         });
      }

      const storedVotedState = localStorage.getItem(`ballotbox_voted_${electionId}`);
      if (storedVotedState) {
        setVotedCandidateId(storedVotedState);
      }

    } else {
      // Handle election not found, maybe redirect or show error
      router.push('/'); 
    }
    setIsLoading(false);
  }, [electionId, router]);

  const handleVote = (candidateId: string) => {
    if (!election || votedCandidateId || !isElectionOngoing) return;

    setVotedCandidateId(candidateId);
    localStorage.setItem(`ballotbox_voted_${electionId}`, candidateId);

    // Update mock vote counts in localStorage for results demo
    const storedVotesString = localStorage.getItem(`ballotbox_votes_${electionId}`);
    let votes = storedVotesString ? JSON.parse(storedVotesString) : {};
    votes[candidateId] = (votes[candidateId] || 0) + 1;
    localStorage.setItem(`ballotbox_votes_${electionId}`, JSON.stringify(votes));
    
    // Update local state for immediate UI feedback (optional, if not re-fetching)
    if (election) {
        const updatedCandidates = election.candidates.map(c => 
            c.id === candidateId ? { ...c, voteCount: (c.voteCount || 0) + 1 } : c
        );
        setElection(prev => prev ? {...prev, candidates: updatedCandidates} : null);
    }


    toast({
      title: "Vote Cast Successfully!",
      description: `You voted for ${election.candidates.find(c => c.id === candidateId)?.name}.`,
      action: <CheckCircle className="text-green-500" />,
    });
  };

  const formatDate = (dateString: string | undefined) => dateString ? new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  
  const isElectionOngoing = useMemo(() => {
    if (!election) return false;
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    return now >= startDate && now <= endDate;
  }, [election]);

  const electionStatusMessage = useMemo(() => {
    if (!election) return null;
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    if (now < startDate) return { type: "info", message: "This election has not started yet. Voting will be available from " + formatDate(election.startDate) + "." };
    if (now > endDate) return { type: "concluded", message: "This election has concluded. Voting is closed." };
    return null; // Ongoing
  }, [election]);


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><ArrowLeft className="animate-spin h-8 w-8 text-primary" /> Loading election details...</div>;
  }

  if (!election) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">Election Not Found</h1>
        <p className="text-muted-foreground">The election you are looking for does not exist or could not be loaded.</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Elections
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Elections
      </Button>

      <section className="p-6 bg-card rounded-lg shadow-md">
        <h1 className="text-3xl font-headline font-bold text-primary mb-2">{election.name}</h1>
        <p className="text-muted-foreground mb-1 flex items-center">
          <CalendarDays className="mr-2 h-4 w-4" /> 
          {formatDate(election.startDate)} - {formatDate(election.endDate)}
        </p>
        <p className="text-sm text-foreground/80 mb-4">{election.description}</p>
        <Button asChild variant="secondary">
          <Link href={`/elections/${election.id}/results`}>
            <BarChart3 className="mr-2 h-4 w-4" /> View Results
          </Link>
        </Button>
      </section>

      {electionStatusMessage && (
        <Alert variant={electionStatusMessage.type === "concluded" ? "default" : "default"} className={electionStatusMessage.type === "concluded" ? "bg-gray-100 border-gray-300 text-gray-700" : "bg-blue-100 border-blue-300 text-blue-700"}>
          <Info className="h-4 w-4" />
          <AlertTitle>{electionStatusMessage.type === "concluded" ? "Election Concluded" : "Election Information"}</AlertTitle>
          <AlertDescription>
            {electionStatusMessage.message}
          </AlertDescription>
        </Alert>
      )}

      {votedCandidateId && isElectionOngoing && (
         <Alert variant="default" className="bg-accent/30 border-accent text-accent-foreground">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Vote Recorded</AlertTitle>
          <AlertDescription>
            You have successfully cast your vote in this election for {election.candidates.find(c=>c.id === votedCandidateId)?.name}.
          </AlertDescription>
        </Alert>
      )}


      <section>
        <h2 className="text-2xl font-headline font-semibold mb-6">Candidates</h2>
        {election.candidates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {election.candidates.map((candidate: Candidate) => (
              <CandidateCard 
                key={candidate.id} 
                candidate={candidate} 
                onVote={handleVote}
                hasVoted={!!votedCandidateId}
                votedForThisCandidate={votedCandidateId === candidate.id}
                isElectionOngoing={isElectionOngoing}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No candidates are listed for this election.</p>
        )}
      </section>
    </div>
  );
}
