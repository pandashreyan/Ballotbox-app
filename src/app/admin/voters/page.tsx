
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
import { Loader2, ShieldAlert, UserCheck, UserX, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { collection, onSnapshot, doc, getFirestore, query, where, orderBy } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';

interface VoterData extends AuthUser {
  registeredAt?: string; 
}

type VoterFilter = "all" | "eligible" | "ineligible" | "verified" | "unverified";

export default function AdminVotersPage() {
  const { user, isLoadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [voters, setVoters] = React.useState<VoterData[]>([]);
  const [isLoadingVoters, setIsLoadingVoters] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState<Record<string, boolean>>({});
  const [filter, setFilter] = React.useState<VoterFilter>("all");

  const db = getFirestore(app);

  React.useEffect(() => {
    if (isLoadingAuth) return;
    if (user?.role !== 'admin') {
      router.push('/'); 
      return;
    }

    setIsLoadingVoters(true);
    const votersCollectionRef = collection(db, "voters");
    let q;

    switch (filter) {
      case "eligible":
        q = query(votersCollectionRef, where("isEligible", "==", true), orderBy("email"));
        break;
      case "ineligible":
        q = query(votersCollectionRef, where("isEligible", "==", false), orderBy("email"));
        break;
      case "verified":
        q = query(votersCollectionRef, where("isVerified", "==", true), orderBy("email"));
        break;
      case "unverified":
        q = query(votersCollectionRef, where("isVerified", "==", false), orderBy("email"));
        break;
      default: // "all"
        q = query(votersCollectionRef, orderBy("email"));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const votersList: VoterData[] = [];
      querySnapshot.forEach((doc) => {
        votersList.push({ id: doc.id, ...doc.data() } as VoterData);
      });
      setVoters(votersList);
      setIsLoadingVoters(false);
    }, (error) => {
      console.error("Error fetching voters:", error);
      toast({ title: "Error", description: "Could not fetch voters list. Firestore might require an index for this query.", variant: "destructive" });
      setIsLoadingVoters(false);
    });

    return () => unsubscribe();
  }, [user, isLoadingAuth, router, toast, db, filter]);

  const handleToggleVerification = async (voterId: string, currentStatus: boolean | undefined) => {
    setIsUpdating(prev => ({ ...prev, [voterId]: true }));
    try {
      const response = await fetch(`/api/voters/${voterId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !currentStatus }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update verification status.");
      }
      toast({
        title: "Success",
        description: `Voter verification status updated.`,
      });
    } catch (error: any) {
      console.error("Error updating verification status:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsUpdating(prev => ({ ...prev, [voterId]: false }));
    }
  };
  
   const handleToggleEligibility = async (voterId: string, currentStatus: boolean | undefined) => {
    setIsUpdating(prev => ({ ...prev, [voterId]: true }));
    try {
      const response = await fetch(`/api/voters/${voterId}/eligible`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEligible: !currentStatus }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update eligibility status.");
      }
      toast({
        title: "Success",
        description: `Voter eligibility status updated.`,
      });
    } catch (error: any)      {
      console.error("Error updating eligibility status:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsUpdating(prev => ({ ...prev, [voterId]: false }));
    }
  };


  if (isLoadingAuth || (user?.role === 'admin' && isLoadingVoters)) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /> Loading voter data...</div>;
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
              You do not have permission to view this page. This action is restricted to administrators.
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
          <CardTitle>Voter Management</CardTitle>
          <CardDescription>View and manage registered voters. Toggle their verification and eligibility status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 max-w-xs">
            <Label htmlFor="voter-filter" className="mb-1 block text-sm font-medium">Filter Voters</Label>
            <Select value={filter} onValueChange={(value) => setFilter(value as VoterFilter)}>
              <SelectTrigger id="voter-filter">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Voters</SelectItem>
                <SelectItem value="eligible">Eligible Voters</SelectItem>
                <SelectItem value="ineligible">Not Eligible Voters</SelectItem>
                <SelectItem value="verified">Verified Voters</SelectItem>
                <SelectItem value="unverified">Not Verified Voters</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {voters.length === 0 && !isLoadingVoters ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Voters Found</AlertTitle>
              <AlertDescription>There are no voters matching the current filter, or no voters registered yet.</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>UID</TableHead>
                  <TableHead>Registered At</TableHead>
                  <TableHead className="text-center">Eligible</TableHead>
                  <TableHead className="text-center">Verified</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voters.map((voter) => (
                  <TableRow key={voter.id}>
                    <TableCell>{voter.email || 'N/A'}</TableCell>
                    <TableCell className="text-xs">{voter.id}</TableCell>
                    <TableCell className="text-xs">
                      {voter.registeredAt ? format(new Date(voter.registeredAt), 'PPp') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                      {voter.isEligible ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">Eligible</Badge>
                      ) : (
                        <Badge variant="destructive">Not Eligible</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {voter.isVerified ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Not Verified</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleEligibility(voter.id, voter.isEligible)}
                        disabled={isUpdating[voter.id]}
                        className="text-xs"
                      >
                        {isUpdating[voter.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : (voter.isEligible ? <XCircle className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />)}
                        {voter.isEligible ? "Set Ineligible" : "Set Eligible"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleVerification(voter.id, voter.isVerified)}
                        disabled={isUpdating[voter.id]}
                        className="text-xs"
                      >
                        {isUpdating[voter.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : (voter.isVerified ? <UserX className="h-3 w-3 mr-1" /> : <UserCheck className="h-3 w-3 mr-1" />)}
                        {voter.isVerified ? "Unverify" : "Verify"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
