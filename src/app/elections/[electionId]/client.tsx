
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Election, Candidate } from '@/lib/types';
import { CandidateCard } from '@/components/CandidateCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth'; 
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
  const { user } = useAuth(); 
  
  const [election, setElection] = useState<Election>(initialElection);
  const [votedCandidateId, setVotedCandidateId] = useState<string | null>(null);
  const [isLoadingClientState, setIsLoadingClientState] = useState(true); 

  const [clientFormattedStartDate, setClientFormattedStartDate] = useState<string | null>(null);
  const [clientFormattedEndDate, setClientFormattedEndDate] = useState<string | null>(null);
  const [clientIsElectionOngoing, setClientIsElectionOngoing] = useState<boolean | null>(null);
  const [clientElectionStatusMessage, setClientElectionStatusMessage] = useState<ClientElectionStatus | null>(null);
  const [isClientMounted, setIsClientMounted] = useState(false);

  const electionId = initialElection.id;

  useEffect(() => {
    setIsClientMounted(true); 

    const clientFormatDate = (dateString: string | undefined) => dateString ? new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    setClientFormattedStartDate(clientFormatDate(election.startDate));
    setClientFormattedEndDate(clientFormatDate(election.endDate));

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
      setClientElectionStatusMessage({ type: "ongoing", message: "This election is currently ongoing."});
    }

    const storedVotedState = localStorage.getItem(`ballotbox_voted_${electionId}`);
    if (storedVotedState) {
      setVotedCandidateId(storedVotedState);
    }

    // No longer loading local votes for counts, DB is source of truth for results
    // const storedVotes = localStorage.getItem(`ballotbox_votes_${electionId}`);
    // if (storedVotes) {
    //   const votes = JSON.parse(storedVotes) as Record<string, number>;
    //   setElection(prevElection => ({
    //     ...prevElection,
    //     candidates: prevElection.candidates.map(c => ({
    //       ...c,
    //       voteCount: votes[c.id] || c.voteCount || 0,
    //     })),
    //   }));
    // }
    setIsLoadingClientState(false);
  }, [electionId, election.startDate, election.endDate]);

  const canUserVote = useMemo(() => {
    return user?.role === 'voter' || user?.role === 'candidate';
  }, [user]);

  const handleVote = async (candidateId: string) => {
    if (votedCandidateId || !clientIsElectionOngoing || !canUserVote) return;

    // Optimistic UI update
    setVotedCandidateId(candidateId);
    localStorage.setItem(`ballotbox_voted_${electionId}`, candidateId);
    
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
      title: "Vote Cast Locally!",
      description: `You voted for ${election.candidates.find(c => c.id === candidateId)?.name}. Saving to server...`,
      action: <CheckCircle className="text-green-500" />,
    });

    // Persist vote to DB
    try {
      const response = await fetch(`/api/elections/${electionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to persist vote to DB:', errorData.message);
        // Attempt to revert optimistic UI update (optional, can be complex)
        setElection(prev => { // Revert vote count
            if (!prev) return prev;
            return {
                ...prev,
                candidates: prev.candidates.map(c => 
                    c.id === candidateId ? { ...c, voteCount: (c.voteCount || 1) - 1 } : c //
                )
            }
        });
        setVotedCandidateId(null); // Allow re-voting if server save failed
        localStorage.removeItem(`ballotbox_voted_${electionId}`);

        toast({
          title: "Vote Save Failed",
          description: `Could not save your vote to the server: ${errorData.message || 'Unknown error'}. Please try again.`,
          variant: "destructive",
        });
      } else {
         toast({
            title: "Vote Saved!",
            description: `Your vote for ${election.candidates.find(c => c.id === candidateId)?.name} has been saved to the server.`,
        });
      }
    } catch (error) {
      console.error('Error persisting vote to DB:', error);
       setElection(prev => { // Revert vote count
            if (!prev) return prev;
            return {
                ...prev,
                candidates: prev.candidates.map(c => 
                    c.id === candidateId ? { ...c, voteCount: (c.voteCount || 1) - 1 } : c 
                )
            }
        });
      setVotedCandidateId(null);
      localStorage.removeItem(`ballotbox_voted_${electionId}`);
      toast({
        title: "Vote Sync Error",
        description: "Could not save your vote to the server due to a network or server error. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const serverFormattedStartDate = election.startDate.split('T')[0];
  const serverFormattedEndDate = election.endDate.split('T')[0];

  if (isLoadingClientState || !isClientMounted || user === undefined) {
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
                {isClientMounted && clientFormattedStartDate ? clientFormattedStartDate : serverFormattedStartDate} - {isClientMounted && clientFormattedEndDate ? clientFormattedEndDate : serverFormattedEndDate}
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

      {isClientMounted && clientElectionStatusMessage && clientElectionStatusMessage.type !== "ongoing" && (
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

      {isClientMounted && votedCandidateId && clientIsElectionOngoing && (
         <Alert variant="default" className="bg-accent/30 border-accent text-accent-foreground">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Vote Recorded</AlertTitle>
          <AlertDescription>
            You have successfully cast your vote in this election for {election.candidates.find(c=>c.id === votedCandidateId)?.name}.
          </AlertDescription>
        </Alert>
      )}
      
      {isClientMounted && !canUserVote && clientIsElectionOngoing && !votedCandidateId && (
         <Alert variant="default" className="bg-yellow-100 border-yellow-300 text-yellow-700">
          <Info className="h-4 w-4" />
          <AlertTitle>Voting Information</AlertTitle>
          <AlertDescription>
            Your current role ({user?.role || 'guest'}) does not permit voting in this election.
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
                isElectionOngoing={clientIsElectionOngoing === null ? false : clientIsElectionOngoing}
                canVote={!!canUserVote} 
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
