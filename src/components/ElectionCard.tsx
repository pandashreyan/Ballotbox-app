
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Election } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, ListChecks, Users, Trash2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ElectionCardProps {
  election: Election;
}

interface DisplayStatusDetails {
  status: string;
  badge: JSX.Element;
  isConcluded: boolean;
  isOngoing: boolean;
}

export function ElectionCard({ election }: ElectionCardProps) {
  const [formattedStartDate, setFormattedStartDate] = React.useState<string | null>(null);
  const [formattedEndDate, setFormattedEndDate] = React.useState<string | null>(null);
  const [displayStatus, setDisplayStatus] = React.useState<DisplayStatusDetails | null>(null);
  const [isClient, setIsClient] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    setIsClient(true); 

    const clientFormatDate = (dateString: string) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    setFormattedStartDate(clientFormatDate(election.startDate));
    setFormattedEndDate(clientFormatDate(election.endDate));

    const now = new Date(); 
    const startDateObj = new Date(election.startDate);
    const endDateObj = new Date(election.endDate);
    endDateObj.setHours(23, 59, 59, 999);

    let statusDetails: DisplayStatusDetails;
    if (now < startDateObj) {
      statusDetails = { status: "Upcoming", badge: <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">Upcoming</Badge>, isConcluded: false, isOngoing: false };
    } else if (now > endDateObj) {
      statusDetails = { status: "Concluded", badge: <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">Concluded</Badge>, isConcluded: true, isOngoing: false };
    } else {
      statusDetails = { status: "Ongoing", badge: <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white border-green-600">Ongoing</Badge>, isConcluded: false, isOngoing: true };
    }
    setDisplayStatus(statusDetails);

  }, [election.startDate, election.endDate]);

  const serverFormattedStartDate = election.startDate.split('T')[0];
  const serverFormattedEndDate = election.endDate.split('T')[0];

  const handleDeleteElection = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/elections/${election.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete election.');
      }
      toast({
        title: "Election Deleted",
        description: `Election "${election.name}" has been successfully deleted.`,
      });
      router.refresh(); // Refresh the page to update the list of elections
    } catch (error: any) {
      toast({
        title: "Error Deleting Election",
        description: error.message || "Could not delete the election.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-headline mb-1">{election.name}</CardTitle>
          {isClient && displayStatus ? displayStatus.badge : <Badge variant="outline">Loading status...</Badge>}
        </div>
        <CardDescription className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-2 h-4 w-4" />
          {isClient && formattedStartDate && formattedEndDate ? `${formattedStartDate} - ${formattedEndDate}` : `${serverFormattedStartDate} - ${serverFormattedEndDate}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground/80 mb-3">{election.description}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          {election.candidates.length} Candidate{election.candidates.length === 1 ? '' : 's'}
        </div>
      </CardContent>
      <CardFooter className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Button asChild className="w-full sm:flex-grow bg-primary hover:bg-primary/90 transition-colors duration-200">
          <Link href={`/elections/${election.id}`}>
            <ListChecks className="mr-2 h-4 w-4" /> View Election
          </Link>
        </Button>
        {user?.role === 'admin' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto sm:flex-shrink-0" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
                  Confirm Deletion
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the election "{election.name}"? This action cannot be undone and all associated data will be removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteElection} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}
