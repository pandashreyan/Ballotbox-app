
'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Election } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarDays, ListChecks, Users, UserPlus, Loader2, AlertCircle as AlertCircleIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ElectionCardProps {
  election: Election;
}

const candidateRegistrationSchema = z.object({
  name: z.string().min(2, { message: "Candidate name must be at least 2 characters." }),
  platform: z.string().min(10, { message: "Platform summary must be at least 10 characters." }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
});

type CandidateRegistrationFormValues = z.infer<typeof candidateRegistrationSchema>;

export function ElectionCard({ election }: ElectionCardProps) {
  const { toast } = useToast();
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = React.useState(false);
  const [isRegisteringCandidate, setIsRegisteringCandidate] = React.useState(false);
  const [registrationError, setRegistrationError] = React.useState<string | null>(null);

  const registrationForm = useForm<CandidateRegistrationFormValues>({
    resolver: zodResolver(candidateRegistrationSchema),
    defaultValues: {
      name: '',
      platform: '',
      imageUrl: '',
    },
  });

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


  const handleRegisterCandidateSubmit = async (data: CandidateRegistrationFormValues) => {
    setIsRegisteringCandidate(true);
    setRegistrationError(null);
    try {
      const response = await fetch(`/api/elections/${election.id}/register`, {
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
        description: `${result.candidate.name} has been successfully registered for "${election.name}". The candidate count on this card will update on page refresh.`,
      });
      
      setIsRegisterDialogOpen(false);
      registrationForm.reset();
      // Note: We are not re-fetching elections here to update the count on the card.
      // This would require a more complex state management or prop drilling.
      // The data is updated in the DB and will be reflected on page refresh or navigation.

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
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button asChild className="w-full bg-primary hover:bg-primary/90 transition-colors duration-200">
          <Link href={`/elections/${election.id}`}>
            <ListChecks className="mr-2 h-4 w-4" /> View Election
          </Link>
        </Button>
        
        <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full" disabled={electionStatusDetails.isConcluded}>
                <UserPlus className="mr-2 h-4 w-4" /> Register Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
              <DialogTitle>Register Candidate for "{election.name}"</DialogTitle>
              <DialogDescription>
                  Fill in the details below to register a new candidate.
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
                      <Label htmlFor={`candidate-name-${election.id}`}>Candidate Name</Label>
                      <Input id={`candidate-name-${election.id}`} {...registrationForm.register("name")} placeholder="Full Name" />
                      {registrationForm.formState.errors.name && <p className="text-sm text-destructive">{registrationForm.formState.errors.name.message}</p>}
                  </div>
                  <div className="space-y-1">
                      <Label htmlFor={`candidate-platform-${election.id}`}>Platform Summary</Label>
                      <Textarea id={`candidate-platform-${election.id}`} {...registrationForm.register("platform")} placeholder="Briefly describe the platform." />
                      {registrationForm.formState.errors.platform && <p className="text-sm text-destructive">{registrationForm.formState.errors.platform.message}</p>}
                  </div>
                  <div className="space-y-1">
                      <Label htmlFor={`candidate-imageUrl-${election.id}`}>Image URL (Optional)</Label>
                      <Input id={`candidate-imageUrl-${election.id}`} {...registrationForm.register("imageUrl")} placeholder="https://example.com/image.png" />
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
      </CardFooter>
    </Card>
  );
}
