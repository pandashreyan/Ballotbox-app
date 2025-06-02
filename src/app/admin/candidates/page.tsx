
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth, type AuthUser } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldAlert, CheckCircle, XCircle, Users, FileText, Landmark, Calendar, AlertCircle as AlertTriangleIcon } from "lucide-react"; // Renamed AlertCircle to AlertTriangleIcon
import { collection, onSnapshot, query, where, orderBy, getFirestore } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { format } from 'date-fns';

interface CandidateDocument {
  id: string;
  fullName?: string;
  email?: string;
  dob?: string; // Stored as ISO string
  nationalId?: string;
  party?: string;
  manifesto?: string;
  isApproved?: boolean;
  isVerified?: boolean; // Though approval might imply verification
  imageUrl?: string;
}

export default function AdminCandidatesPage() {
  const { user, isLoadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [unapprovedCandidates, setUnapprovedCandidates] = React.useState<CandidateDocument[]>([]);
  const [approvedCandidates, setApprovedCandidates] = React.useState<CandidateDocument[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<Record<string, boolean>>({});

  const db = getFirestore(app);

  React.useEffect(() => {
    if (isLoadingAuth) return;
    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    setIsLoadingCandidates(true);
    const candidatesCollectionRef = collection(db, "candidates");

    // Listener for unapproved candidates
    const unapprovedQuery = query(candidatesCollectionRef, where("isApproved", "==", false), orderBy("email", "asc"));
    const unsubscribeUnapproved = onSnapshot(unapprovedQuery, (querySnapshot) => {
      const candidatesList: CandidateDocument[] = [];
      querySnapshot.forEach((doc) => {
        candidatesList.push({ id: doc.id, ...doc.data() } as CandidateDocument);
      });
      setUnapprovedCandidates(candidatesList);
      setIsLoadingCandidates(false);
    }, (error) => {
      console.error("Error fetching unapproved candidates:", error);
      toast({ title: "Error", description: "Could not fetch unapproved candidates. Firestore might require an index.", variant: "destructive" });
      setIsLoadingCandidates(false);
    });

    // Listener for approved candidates
    const approvedQuery = query(candidatesCollectionRef, where("isApproved", "==", true), orderBy("email", "asc"));
    const unsubscribeApproved = onSnapshot(approvedQuery, (querySnapshot) => {
      const candidatesList: CandidateDocument[] = [];
      querySnapshot.forEach((doc) => {
        candidatesList.push({ id: doc.id, ...doc.data() } as CandidateDocument);
      });
      setApprovedCandidates(candidatesList);
      setIsLoadingCandidates(false); // Potentially set to false only after both queries load initially
    }, (error) => {
      console.error("Error fetching approved candidates:", error);
      toast({ title: "Error", description: "Could not fetch approved candidates. Firestore might require an index.", variant: "destructive" });
      setIsLoadingCandidates(false);
    });

    return () => {
      unsubscribeUnapproved();
      unsubscribeApproved();
    };
  }, [user, isLoadingAuth, router, toast, db]);

  const handleApprovalAction = async (candidateId: string, action: 'approve' | 'revoke') => {
    setActionLoading(prev => ({ ...prev, [candidateId]: true }));
    const endpoint = action === 'approve' ? `/api/candidates/${candidateId}/approve` : `/api/candidates/${candidateId}/revoke`;
    const successMessage = action === 'approve' ? 'Candidate approved successfully.' : 'Candidate approval revoked.';
    const failureMessage = action === 'approve' ? 'Failed to approve candidate.' : 'Failed to revoke candidate approval.';

    try {
      const response = await fetch(endpoint, { method: 'POST' });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || failureMessage);
      }
      toast({ title: "Success", description: successMessage });
    } catch (error: any) {
      console.error(`Error performing ${action} action:`, error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(prev => ({ ...prev, [candidateId]: false }));
    }
  };
  
  const renderCandidateRow = (candidate: CandidateDocument, isApprovedList: boolean) => (
    <TableRow key={candidate.id}>
      <TableCell className="font-medium">{candidate.fullName || 'N/A'}</TableCell>
      <TableCell>{candidate.email || 'N/A'}</TableCell>
      <TableCell className="text-xs">{candidate.party || 'N/A'}</TableCell>
      <TableCell className="text-xs max-w-xs truncate" title={candidate.manifesto}>{candidate.manifesto || 'N/A'}</TableCell>
      <TableCell className="text-xs">{candidate.dob ? format(new Date(candidate.dob), 'PP') : 'N/A'}</TableCell>
      <TableCell className="text-xs">{candidate.nationalId || 'N/A'}</TableCell>
      <TableCell className="text-center">
        {isApprovedList ? (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>
        ) : (
          <Badge variant="secondary">Pending</Badge>
        )}
      </TableCell>
      <TableCell className="text-center">
        {isApprovedList ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleApprovalAction(candidate.id, 'revoke')}
            disabled={actionLoading[candidate.id]}
            className="text-xs"
          >
            {actionLoading[candidate.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
            Revoke Approval
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleApprovalAction(candidate.id, 'approve')}
            disabled={actionLoading[candidate.id]}
            className="text-xs bg-primary hover:bg-primary/90"
          >
            {actionLoading[candidate.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
            Approve
          </Button>
        )}
      </TableCell>
    </TableRow>
  );

  if (isLoadingAuth || (user?.role === 'admin' && isLoadingCandidates)) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /> Loading candidate data...</div>;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-destructive flex items-center justify-center">
              <ShieldAlert className="mr-2 h-8 w-8" /> Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              You do not have permission to view this page.
            </p>
            <Button onClick={() => router.push('/')} className="mt-6">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Unapproved Candidates</CardTitle>
          <CardDescription>Review and approve candidates awaiting verification.</CardDescription>
        </CardHeader>
        <CardContent>
          {unapprovedCandidates.length === 0 && !isLoadingCandidates ? (
             <Alert>
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>No Unapproved Candidates</AlertTitle>
              <AlertDescription>There are currently no candidates awaiting approval.</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Users className="inline h-4 w-4 mr-1" />Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead><Landmark className="inline h-4 w-4 mr-1" />Party</TableHead>
                  <TableHead><FileText className="inline h-4 w-4 mr-1" />Manifesto</TableHead>
                  <TableHead><Calendar className="inline h-4 w-4 mr-1" />DOB</TableHead>
                  <TableHead>National ID</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unapprovedCandidates.map(candidate => renderCandidateRow(candidate, false))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approved Candidates</CardTitle>
          <CardDescription>View and manage already approved candidates.</CardDescription>
        </CardHeader>
        <CardContent>
           {approvedCandidates.length === 0 && !isLoadingCandidates ? (
             <Alert>
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>No Approved Candidates</AlertTitle>
              <AlertDescription>There are currently no candidates approved in the system.</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Users className="inline h-4 w-4 mr-1" />Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead><Landmark className="inline h-4 w-4 mr-1" />Party</TableHead>
                  <TableHead><FileText className="inline h-4 w-4 mr-1" />Manifesto</TableHead>
                  <TableHead><Calendar className="inline h-4 w-4 mr-1" />DOB</TableHead>
                  <TableHead>National ID</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedCandidates.map(candidate => renderCandidateRow(candidate, true))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
