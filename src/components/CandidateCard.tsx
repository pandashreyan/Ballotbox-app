
'use client';

import type { Candidate } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, VoteIcon } from 'lucide-react';
import { PlatformSummary } from './PlatformSummary';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface CandidateCardProps {
  candidate: Candidate;
  onVote: (candidateId: string) => void;
  hasVoted: boolean;
  votedForThisCandidate: boolean;
  isElectionOngoing: boolean;
  canVote: boolean;
}

export function CandidateCard({ candidate, onVote, hasVoted, votedForThisCandidate, isElectionOngoing, canVote }: CandidateCardProps) {
  return (
    <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
      <CardHeader className="items-center text-center pb-2">
        <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary shadow-md">
          {candidate.imageUrl ? (
            <Image
              src={candidate.imageUrl}
              alt={candidate.name}
              data-ai-hint="person portrait"
              layout="fill"
              objectFit="cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardTitle className="text-lg font-headline">{candidate.name}</CardTitle>
        {candidate.party && ( // Still good to check for empty string for display purposes
          <p className="text-xs text-muted-foreground">{candidate.party}</p>
        )}
        {votedForThisCandidate && (
           <Badge className="mt-1 bg-accent text-accent-foreground">Your Vote</Badge>
        )}
      </CardHeader>
      <CardContent className="flex-grow text-center px-4 py-2">
        <PlatformSummary candidateName={candidate.name} platformText={candidate.platform} />
      </CardContent>
      <CardFooter className="p-4">
        <Button
          onClick={() => onVote(candidate.id)}
          disabled={hasVoted || !isElectionOngoing || !canVote}
          className="w-full bg-primary hover:bg-primary/90 transition-colors duration-200 disabled:opacity-70"
          aria-label={`Vote for ${candidate.name}`}
        >
          <VoteIcon className="mr-2 h-4 w-4" />
          {votedForThisCandidate ? 'Voted' : (hasVoted ? 'Vote Cast' : (isElectionOngoing && canVote ? 'Vote' : 'Voting Closed'))}
        </Button>
      </CardFooter>
    </Card>
  );
}
