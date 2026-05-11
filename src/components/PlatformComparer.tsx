'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Loader2, GitCompare, HelpCircle, Check, AlertCircle } from 'lucide-react';
import type { Candidate } from '@/lib/types';
import type { CompareCandidatesOutput } from '@/ai/flows/compare-candidates-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PlatformComparerProps {
  candidates: Candidate[];
}

export function PlatformComparer({ candidates }: PlatformComparerProps) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isComparing, setIsComparing] = React.useState(false);
  const [comparison, setComparison] = React.useState<CompareCandidatesOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleCheckboxChange = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      } else {
        if (prev.length >= 4) {
          // Limit to 4 candidates at a time for UI readability
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      setError('Please select at least 2 candidates to compare side-by-side.');
      return;
    }

    setIsComparing(true);
    setError(null);
    setComparison(null);

    const candidatesToCompare = candidates
      .filter((c) => selectedIds.includes(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        party: c.party || 'Independent',
        platform: c.platform,
      }));

    try {
      const response = await fetch('/api/candidates/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidates: candidatesToCompare }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Comparison failed.');
      }

      const data: CompareCandidatesOutput = await response.json();
      setComparison(data);
    } catch (err: any) {
      console.error('AI Comparison failed:', err);
      setError(err.message || 'Failed to generate comparison. Please try again.');
    } finally {
      setIsComparing(false);
    }
  };

  if (candidates.length < 2) {
    return null;
  }

  return (
    <Card className="border border-primary/20 shadow-xl bg-card rounded-xl overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-2xl font-headline font-semibold text-primary">
              AI Platform Comparison Assistant
            </CardTitle>
            <CardDescription>
              Select up to 4 candidates to get an instant, objective, and side-by-side AI comparative report of their platforms.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Candidate Selector Grid */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-foreground/80">Select Candidates to Compare:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {candidates.map((c) => {
              const isChecked = selectedIds.includes(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => handleCheckboxChange(c.id)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer select-none transition-all duration-200 hover:bg-muted ${
                    isChecked
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-background'
                  }`}
                >
                  <Checkbox
                    id={`compare-${c.id}`}
                    checked={isChecked}
                    onCheckedChange={() => handleCheckboxChange(c.id)}
                    className="pointer-events-none"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.party || 'Independent'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Comparison Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Control Button */}
        <div className="flex justify-start">
          <Button
            onClick={handleCompare}
            disabled={selectedIds.length < 2 || isComparing}
            className="font-semibold shadow-md min-w-[180px]"
            size="lg"
          >
            {isComparing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Platforms...
              </>
            ) : (
              <>
                <GitCompare className="mr-2 h-5 w-5" />
                Compare Platforms
              </>
            )}
          </Button>
        </div>

        {/* Dynamic Comparison Report Matrix */}
        {comparison && (
          <div className="border border-border rounded-xl overflow-hidden mt-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-primary/5 border-b border-border">
                    <th className="p-4 font-headline font-semibold text-primary w-48">Topic / Category</th>
                    {candidates
                      .filter((c) => selectedIds.includes(c.id))
                      .map((c) => (
                        <th key={c.id} className="p-4 font-headline font-semibold text-foreground min-w-[200px]">
                          <div>
                            <p className="font-bold">{c.name}</p>
                            <p className="text-xs text-muted-foreground font-normal">{c.party || 'Independent'}</p>
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comparison.categories.map((category, catIdx) => (
                    <tr key={catIdx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-semibold text-primary align-top bg-primary/[0.01]">
                        {category.name}
                      </td>
                      {candidates
                        .filter((c) => selectedIds.includes(c.id))
                        .map((c) => {
                          const candidatePoints =
                            category.comparisons.find((comp) => comp.candidateId === c.id)?.points || [];
                          return (
                            <td key={c.id} className="p-4 align-top">
                              {candidatePoints.length > 0 ? (
                                <ul className="list-disc pl-4 space-y-1.5 text-foreground/80 text-xs sm:text-sm">
                                  {candidatePoints.map((point, pointIdx) => (
                                    <li key={pointIdx}>{point}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted-foreground italic text-xs">No explicit statement on this category.</p>
                              )}
                            </td>
                          );
                        })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Overall AI Summary / Verdict */}
            <div className="p-6 bg-accent/5 border-t border-border space-y-3">
              <h4 className="font-headline font-semibold text-primary text-base flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-accent animate-pulse" />
                Unbiased Comparative Verdict
              </h4>
              <p className="text-foreground/90 leading-relaxed text-sm md:text-base">
                {comparison.overallVerdict}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
