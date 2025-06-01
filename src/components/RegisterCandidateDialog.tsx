
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle as AlertCircleIcon, UserPlus } from 'lucide-react';
import type { Election } from '@/lib/types';

interface RegisterCandidateDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  elections: Election[]; // Now specifically upcoming elections
  onCandidateRegistered?: () => void;
}

const candidateRegistrationSchema = z.object({
  electionId: z.string().min(1, { message: "Please select an election." }),
  name: z.string().min(2, { message: "Candidate name must be at least 2 characters." }),
  platform: z.string().min(10, { message: "Platform summary must be at least 10 characters." }),
  party: z.string().min(2, { message: "Party name must be at least 2 characters." }), // Made required
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
});

type CandidateRegistrationFormValues = z.infer<typeof candidateRegistrationSchema>;

export function RegisterCandidateDialog({ isOpen, onOpenChange, elections, onCandidateRegistered }: RegisterCandidateDialogProps) {
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [registrationError, setRegistrationError] = React.useState<string | null>(null);

  const form = useForm<CandidateRegistrationFormValues>({
    resolver: zodResolver(candidateRegistrationSchema),
    defaultValues: {
      electionId: '',
      name: '',
      platform: '',
      party: '',
      imageUrl: '',
    },
  });

  const handleSubmit = async (data: CandidateRegistrationFormValues) => {
    setIsRegistering(true);
    setRegistrationError(null);
    try {
      const response = await fetch(`/api/elections/${data.electionId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          platform: data.platform,
          party: data.party, // Party is now required
          imageUrl: data.imageUrl
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Server responded with ${response.status}`);
      }

      toast({
        title: "Candidate Registered!",
        description: `${result.candidate.name} has been successfully registered.`,
      });

      form.reset();
      onOpenChange(false);
      if (onCandidateRegistered) {
        onCandidateRegistered();
      }

    } catch (error: any) {
      console.error("Failed to register candidate:", error);
      setRegistrationError(error.message || "An unexpected error occurred. Please try again.");
      toast({
        title: "Registration Failed",
        description: error.message || "Could not register the candidate.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  React.useEffect(() => {
    if (!isOpen) {
      form.reset();
      setRegistrationError(null);
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" /> Register New Candidate
          </DialogTitle>
          <DialogDescription>
            Select an upcoming election and fill in the candidate's details.
          </DialogDescription>
        </DialogHeader>
        {registrationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Registration Error</AlertTitle>
            <AlertDescription>{registrationError}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="electionId">Election</Label>
            <Controller
              control={form.control}
              name="electionId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <SelectTrigger id="electionId">
                    <SelectValue placeholder="Select an upcoming election" />
                  </SelectTrigger>
                  <SelectContent>
                    {elections.length > 0 ? (
                      elections.map((election) => (
                        <SelectItem key={election.id} value={election.id}>
                          {election.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-elections" disabled>No upcoming elections available for registration</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.electionId && <p className="text-sm text-destructive">{form.formState.errors.electionId.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="candidate-name">Candidate Name</Label>
            <Input id="candidate-name" {...form.register("name")} placeholder="Full Name" />
            {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
          </div>
           <div className="space-y-1">
            <Label htmlFor="candidate-party">Party Name</Label>
            <Input id="candidate-party" {...form.register("party")} placeholder="Candidate's Political Party" />
            {form.formState.errors.party && <p className="text-sm text-destructive">{form.formState.errors.party.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="candidate-platform">Platform Summary</Label>
            <Textarea id="candidate-platform" {...form.register("platform")} placeholder="Briefly describe the platform." />
            {form.formState.errors.platform && <p className="text-sm text-destructive">{form.formState.errors.platform.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="candidate-imageUrl">Image URL (Optional)</Label>
            <Input id="candidate-imageUrl" {...form.register("imageUrl")} placeholder="https://example.com/image.png" />
            {form.formState.errors.imageUrl && <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>}
          </div>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isRegistering || !form.watch("electionId")}>
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                </>
              ) : (
                "Register Candidate"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
