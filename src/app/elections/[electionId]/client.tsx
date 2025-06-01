
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Election, Candidate } from '@/lib/types';
import { CandidateCard } from '@/components/CandidateCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BarChart3, CalendarDays, CheckCircle, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ElectionDetailClientProps {
  initialElection: Election;
}

interface ClientElectionStatus {
  type: "info" | "concluded" | "ongoing";
  message: string;
}

export function ElectionDetailClient({ initialElection }: ElectionDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [election, setElection] = useState<Election>(initialElection);
  const [votedCandidateId, setVotedCandidateId] = useState<string | null>(null);
  const [isLoadingClientState, setIsLoadingClientState] = useState(true); // For localStorage access

  const [clientFormattedStartDate, setClientFormattedStartDate] = useState<string | null>(null);
  const [clientFormattedEndDate, setClientFormattedEndDate] = useState<string | null>(null);
  const [clientIsElectionOngoing, setClientIsElectionOngoing] = useState<boolean | null>(null);
  const [clientElectionStatusMessage, setClientElectionStatusMessage] = useState<ClientElectionStatus | null>(null);
  const [isClientMounted, setIsClientMounted] = useState(false);

  const electionId = initialElection.id;

  useEffect(() => {
    setIsClientMounted(true); // Component has mounted

    // Format dates on client
    const clientFormatDate = (dateString: string | undefined) => dateString ? new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    setClientFormattedStartDate(clientFormatDate(election.startDate));
    setClientFormattedEndDate(clientFormatDate(election.endDate));

    // Determine election status on client
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    endDate.setHours(23, 59, 59, 999); 
    const ongoing = now >= startDate && now <= endDate;
    setClientIsElectionOngoing(ongoing);

    if (now < startDate) {
      setClientElectionStatusMessage({ type: "info", message: "This election has not started yet. Voting will be available from " + clientFormatDate(election.startDate) + "." });
    } else if (now > endDate) {
      setClientElectionStatusMessage({ type: "concluded", message: "This election has concluded. Voting is closed." });
    } else {
      setClientElectionStatusMessage({ type: "ongoing", message: "This election is currently ongoing."}); // Or null if no message needed for ongoing
    }

    // LocalStorage logic
    const storedVotedState = localStorage.getItem(`ballotbox_voted_${electionId}`);
    if (storedVotedState) {
      setVotedCandidateId(storedVotedState);
    }

    const storedVotes = localStorage.getItem(`ballotbox_votes_${electionId}`);
    if (storedVotes) {
      const votes = JSON.parse(storedVotes) as Record<string, number>;
      setElection(prevElection => ({
        ...prevElection,
        candidates: prevElection.candidates.map(c => ({
          ...c,
          voteCount: votes[c.id] || c.voteCount || 0,
        })),
      }));
    }
    setIsLoadingClientState(false); // Done with localStorage
  }, [electionId, election.startDate, election.endDate]); // Dependencies for date/status calculations

  const handleVote = (candidateId: string) => {
    if (votedCandidateId || !clientIsElectionOngoing) return;

    setVotedCandidateId(candidateId);
    localStorage.setItem(`ballotbox_voted_${electionId}`, candidateId);

    const currentVotesString = localStorage.getItem(`ballotbox_votes_${electionId}`);
    let currentVotes = currentVotesString ? JSON.parse(currentVotesString) : {};
    currentVotes[candidateId] = (currentVotes[candidateId] || 0) + 1;
    localStorage.setItem(`ballotbox_votes_${electionId}`, JSON.stringify(currentVotes));
    
    setElection(prev => {
        if (!prev) return prev;
        return {
            ...prev,
            candidates: prev.candidates.map(c => 
                c.id === candidateId ? { ...c, voteCount: (c.voteCount || 0) + 1 } : c
            )
        }
    });

    toast({
      title: "Vote Cast Successfully!",
      description: `You voted for ${election.candidates.find(c => c.id === candidateId)?.name}.`,
      action: <CheckCircle className="text-green-500" />,
    });
  };
  
  // Fallback for server render or before client mount
  const serverFormattedStartDate = election.startDate.split('T')[0];
  const serverFormattedEndDate = election.endDate.split('T')[0];


  if (isLoadingClientState || !isClientMounted) {
     return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /> Loading election details...</div>;
  }

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Elections
      </Button>

      <section className="p-6 bg-card rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
                <h1 className="text-3xl font-headline font-bold text-primary mb-2">{election.name}</h1>
                <p className="text-muted-foreground mb-1 flex items-center">
                <CalendarDays className="mr-2 h-4 w-4" /> 
                {clientFormattedStartDate || serverFormattedStartDate} - {clientFormattedEndDate || serverFormattedEndDate}
                </p>
                <p className="text-sm text-foreground/80 mb-4">{election.description}</p>
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-0">
                 <Button asChild variant="secondary">
                    <Link href={`/elections/${election.id}/results`}>
                        <BarChart3 className="mr-2 h-4 w-4" /> View Results
                    </Link>
                </Button>
            </div>
        </div>
      </section>

      {clientElectionStatusMessage && clientElectionStatusMessage.type !== "ongoing" && (
        <Alert 
          variant={clientElectionStatusMessage.type === "concluded" ? "default" : "default"} 
          className={clientElectionStatusMessage.type === "concluded" ? "bg-gray-100 border-gray-300 text-gray-700" : "bg-blue-100 border-blue-300 text-blue-700"}
        >
          <Info className="h-4 w-4" />
          <AlertTitle>{clientElectionStatusMessage.type === "concluded" ? "Election Concluded" : "Election Information"}</AlertTitle>
          <AlertDescription>
            {clientElectionStatusMessage.message}
          </AlertDescription>
        </Alert>
      )}

      {votedCandidateId && clientIsElectionOngoing && (
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
                isElectionOngoing={clientIsElectionOngoing === null ? false : clientIsElectionOngoing} // Default to false if not yet determined
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No candidates are listed for this election yet.</p>
        )}
      </section>
    </div>
  );
}
