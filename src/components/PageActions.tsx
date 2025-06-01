
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, UserPlus } from 'lucide-react';
import type { Election } from '@/lib/types';
import { RegisterCandidateDialog } from './RegisterCandidateDialog';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Import the new auth hook

interface PageActionsProps {
  upcomingElections: Election[];
}

export function PageActions({ upcomingElections }: PageActionsProps) {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = React.useState(false);
  const router = useRouter();
  const { user } = useAuth(); // Get the current user

  const handleCandidateRegistered = () => {
    router.refresh();
  };

  return (
    <div className="flex space-x-2">
      {user?.role === 'admin' && ( // Show "Create Election" only to admins
        <Button asChild>
          <Link href="/create-election">
            <PlusCircle className="mr-2 h-5 w-5" /> Create Election
          </Link>
        </Button>
      )}
      {user?.role === 'candidate' && ( // Show "Register Candidate" only to candidates
        <>
          <Button variant="outline" onClick={() => setIsRegisterDialogOpen(true)}>
            <UserPlus className="mr-2 h-5 w-5" /> Register as Candidate
          </Button>
          <RegisterCandidateDialog
            isOpen={isRegisterDialogOpen}
            onOpenChange={setIsRegisterDialogOpen}
            elections={upcomingElections}
            onCandidateRegistered={handleCandidateRegistered}
          />
        </>
      )}
    </div>
  );
}
