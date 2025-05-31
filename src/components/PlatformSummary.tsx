'use client';

import { useState, useEffect } from 'react';
import { summarizeCandidatePlatform } from '@/ai/flows/summarize-candidate-platform';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PlatformSummaryProps {
  candidateName: string;
  platformText: string;
}

export function PlatformSummary({ candidateName, platformText }: PlatformSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchSummary = async () => {
    if (!platformText) {
      setError('No platform text available to summarize.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummary(null); 
    try {
      const result = await summarizeCandidatePlatform({ platformText });
      setSummary(result.summary);
    } catch (e) {
      console.error('Error fetching summary:', e);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch summary when dialog opens, if not already fetched or errored
  useEffect(() => {
    if (isOpen && !summary && !error && !isLoading) {
      fetchSummary();
    }
  }, [isOpen, summary, error, isLoading, platformText]);


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
          <Sparkles className="mr-2 h-4 w-4" />
          AI Platform Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">
            AI Summary: {candidateName}'s Platform
          </DialogTitle>
          <DialogDescription>
            An AI-generated objective summary of the candidate's platform.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-muted-foreground">Generating summary...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-40 text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
              <Button onClick={fetchSummary} variant="outline" size="sm" className="mt-4">
                Retry
              </Button>
            </div>
          )}
          {summary && (
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-card p-4 my-4 text-card-foreground">
              <p className="whitespace-pre-line">{summary}</p>
            </div>
          )}
           {!platformText && !isLoading && !error && (
             <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>No platform text provided for this candidate.</p>
              </div>
           )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
