
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Election, Candidate } from '@/lib/types';
import { CandidateCard } from '@/components/CandidateCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BarChart3, CalendarDays, CheckCircle, Info, Loader2, UserPlus, AlertCircle as AlertCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface ElectionDetailClientProps {
  initialElection: Election;
}

const candidateRegistrationClientSchema = z.object({
  name: z.string().min(2, { message: "Candidate name must be at least 2 characters." }),
  platform: z.string().min(10, { message: "Platform summary must be at least 10 characters." }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
});

type CandidateRegistrationFormValues = z.infer<typeof candidateRegistrationClientSchema>;

export function ElectionDetailClient({ initialElection }: ElectionDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [election, setElection] = useState<Election>(initialElection);
  const [votedCandidateId, setVotedCandidateId] = useState<string | null>(null);
  const [isLoadingClientState, setIsLoadingClientState] = useState(true);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isRegisteringCandidate, setIsRegisteringCandidate] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);


  const electionId = initialElection.id;

  const registrationForm = useForm<CandidateRegistrationFormValues>({
    resolver: zodResolver(candidateRegistrationClientSchema),
    defaultValues: {
      name: '',
      platform: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
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
    setIsLoadingClientState(false);
  }, [electionId]);

  const handleVote = (candidateId: string) => {
    if (votedCandidateId || !isElectionOngoing) return;

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

  const handleRegisterCandidateSubmit = async (data: CandidateRegistrationFormValues) => {
    setIsRegisteringCandidate(true);
    setRegistrationError(null);
    try {
      const response = await fetch(`/api/elections/${electionId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Server responded with ${response.status}`);
      }

      toast({
        title: "Candidate Registered!",
        description: `${result.candidate.name} has been successfully registered for this election.`,
      });
      
      // Update local election state with the new candidate
      setElection(prevElection => ({
        ...prevElection,
        candidates: [...prevElection.candidates, result.candidate],
      }));

      setIsRegisterDialogOpen(false);
      registrationForm.reset();
    } catch (error: any) {
      console.error("Failed to register candidate:", error);
      setRegistrationError(error.message || "An unexpected error occurred. Please try again.");
      toast({
        title: "Registration Failed",
        description: error.message || "Could not register the candidate.",
        variant: "destructive",
      });
    } finally {
      setIsRegisteringCandidate(false);
    }
  };

  const formatDate = (dateString: string | undefined) => dateString ? new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  
  const isElectionOngoing = useMemo(() => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    return now >= startDate && now <= endDate;
  }, [election.startDate, election.endDate]);

  const isElectionConcluded = useMemo(() => {
    const now = new Date();
    const endDate = new Date(election.endDate);
    return now > endDate;
  }, [election.endDate]);

  const electionStatusMessage = useMemo(() => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    if (now < startDate) return { type: "info", message: "This election has not started yet. Voting will be available from " + formatDate(election.startDate) + "." };
    if (isElectionConcluded) return { type: "concluded", message: "This election has concluded. Voting is closed." };
    return null; // Ongoing
  }, [election.startDate, election.endDate, isElectionConcluded, formatDate]);

  if (isLoadingClientState) {
     return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /> Loading election state...</div>;
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
                {formatDate(election.startDate)} - {formatDate(election.endDate)}
                </p>
                <p className="text-sm text-foreground/80 mb-4">{election.description}</p>
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-0">
                 <Button asChild variant="secondary">
                    <Link href={`/elections/${election.id}/results`}>
                        <BarChart3 className="mr-2 h-4 w-4" /> View Results
                    </Link>
                </Button>
                 <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" disabled={isElectionConcluded}>
                            <UserPlus className="mr-2 h-4 w-4" /> Register as Candidate
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                        <DialogTitle>Register as a Candidate</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to register for the "{election.name}" election.
                        </DialogDescription>
                        </DialogHeader>
                        {registrationError && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircleIcon className="h-4 w-4" />
                                <AlertTitle>Registration Error</AlertTitle>
                                <AlertDescription>{registrationError}</AlertDescription>
                            </Alert>
                        )}
                        <form onSubmit={registrationForm.handleSubmit(handleRegisterCandidateSubmit)} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="candidate-name">Candidate Name</Label>
                                <Input id="candidate-name" {...registrationForm.register("name")} placeholder="Your Full Name" />
                                {registrationForm.formState.errors.name && <p className="text-sm text-destructive">{registrationForm.formState.errors.name.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="candidate-platform">Platform Summary</Label>
                                <Textarea id="candidate-platform" {...registrationForm.register("platform")} placeholder="Briefly describe your platform." />
                                {registrationForm.formState.errors.platform && <p className="text-sm text-destructive">{registrationForm.formState.errors.platform.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="candidate-imageUrl">Image URL (Optional)</Label>
                                <Input id="candidate-imageUrl" {...registrationForm.register("imageUrl")} placeholder="https://example.com/your-image.png" />
                                {registrationForm.formState.errors.imageUrl && <p className="text-sm text-destructive">{registrationForm.formState.errors.imageUrl.message}</p>}
                            </div>
                            <DialogFooter className="mt-6">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isRegisteringCandidate}>
                                {isRegisteringCandidate ? (
                                    <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                                    </>
                                ) : (
                                    "Register"
                                )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
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
          <p className="text-muted-foreground">No candidates are listed for this election. You can be the first to register!</p>
        )}
      </section>
    </div>
  );
}
