
'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Election } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, ListChecks, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ElectionCardProps {
  election: Election;
}

export function ElectionCard({ election }: ElectionCardProps) {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  
  const electionStatusDetails = React.useMemo(() => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    endDate.setHours(23, 59, 59, 999); // Election is ongoing throughout the end date

    if (now < startDate) return { status: "Upcoming", badge: <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">Upcoming</Badge>, isConcluded: false, isOngoing: false };
    if (now > endDate) return { status: "Concluded", badge: <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">Concluded</Badge>, isConcluded: true, isOngoing: false };
    return { status: "Ongoing", badge: <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white border-green-600">Ongoing</Badge>, isConcluded: false, isOngoing: true };
  }, [election.startDate, election.endDate]);

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-headline mb-1">{election.name}</CardTitle>
          {electionStatusDetails.badge}
        </div>
        <CardDescription className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4" />
          {formatDate(election.startDate)} - {formatDate(election.endDate)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground/80 mb-3">{election.description}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          {election.candidates.length} Candidate{election.candidates.length === 1 ? '' : 's'}
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Button asChild className="w-full bg-primary hover:bg-primary/90 transition-colors duration-200">
          <Link href={`/elections/${election.id}`}>
            <ListChecks className="mr-2 h-4 w-4" /> View Election
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
