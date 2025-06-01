
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, UserPlus } from 'lucide-react';
import type { Election } from '@/lib/types';
import { RegisterCandidateDialog } from './RegisterCandidateDialog';
import { useRouter } from 'next/navigation';


interface PageActionsProps {
  upcomingElections: Election[]; // Changed from nonConcludedElections
}

export function PageActions({ upcomingElections }: PageActionsProps) {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = React.useState(false);
  const router = useRouter();

  const handleCandidateRegistered = () => {
    // Refresh the page data to show updated candidate counts, etc.
    router.refresh();
  };

  return (
    <div className="flex space-x-2">
      <Button asChild>
        <Link href="/create-election">
          <PlusCircle className="mr-2 h-5 w-5" /> Create Election
        </Link>
      </Button>
      <Button variant="outline" onClick={() => setIsRegisterDialogOpen(true)}>
        <UserPlus className="mr-2 h-5 w-5" /> Register Candidate
      </Button>
      <RegisterCandidateDialog
        isOpen={isRegisterDialogOpen}
        onOpenChange={setIsRegisterDialogOpen}
        elections={upcomingElections} // Pass upcomingElections
        onCandidateRegistered={handleCandidateRegistered}
      />
    </div>
  );
}
