
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, UserPlus, Edit } from "lucide-react";
import { getAuth, createUserWithEmailAndPassword, AuthError } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { app, db } from "@/lib/firebase"; // Ensure db is exported from firebase.ts
import { differenceInYears } from 'date-fns';

const candidateRegistrationSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  dob: z.date({ required_error: "Date of birth is required." }),
  nationalId: z.string().min(5, { message: "National ID must be at least 5 characters." }),
  party: z.string().min(2, { message: "Party name must be at least 2 characters." }),
  manifesto: z.string().min(20, { message: "Manifesto must be at least 20 characters." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
}).refine(data => {
  if (!data.dob) return true;
  // Example: Candidates must be at least 21 years old. Adjust as needed.
  const age = differenceInYears(new Date(), data.dob);
  return age >= 21; 
}, {
  message: "Candidate must be at least 21 years old.",
  path: ["dob"],
});

type CandidateRegistrationFormValues = z.infer<typeof candidateRegistrationSchema>;

export default function RegisterCandidatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const firebaseAuth = getAuth(app);

  const form = useForm<CandidateRegistrationFormValues>({
    resolver: zodResolver(candidateRegistrationSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      dob: undefined,
      nationalId: "",
      party: "",
      manifesto: "",
    },
  });

  const onSubmit = async (data: CandidateRegistrationFormValues) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, data.email, data.password);
      const user = userCredential.user;

      await setDoc(doc(db, "candidates", user.uid), {
        uid: user.uid,
        email: data.email,
        fullName: data.fullName,
        dob: data.dob.toISOString().split('T')[0], // Store DOB as YYYY-MM-DD
        nationalId: data.nationalId,
        party: data.party,
        manifesto: data.manifesto,
        imageUrl: '', // Initialize with empty or placeholder
        isApproved: false, // Default to not approved
        isVerified: false, // Default to not verified
        // electionRegistrations: [], // To store which elections they are part of
      });

      setSuccessMessage("Candidate registered successfully! Your application will be reviewed.");
      toast({
        title: "Registration Successful!",
        description: "Your candidate application has been submitted for review.",
      });
      form.reset();
      // Optionally redirect to login or a dashboard after a short delay
      // setTimeout(() => router.push('/login'), 3000); 
    } catch (error: any) {
      let errorMessage = "Registration failed. Please try again.";
      if (error instanceof AuthError) { // Check if it's Firebase AuthError
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = "This email address is already in use by an existing account.";
        } else if (error.code === 'auth/weak-password') {
          errorMessage = "The password is too weak. Please choose a stronger password.";
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = "The email address is not valid.";
        } else {
          errorMessage = error.message; // Use Firebase's message for other auth errors
        }
      } else if (error.message) { // For other types of errors (e.g., Firestore)
        errorMessage = error.message;
      }
      console.error("Candidate Registration error:", error);
      setServerError(errorMessage);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen py-12 px-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary flex items-center justify-center">
            <Edit className="mr-2 h-7 w-7" />
            Candidate Registration
          </CardTitle>
          <CardDescription>Fill out the form below to register as a candidate. Your application will be reviewed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {serverError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Registration Error</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert variant="default" className="bg-accent/30 border-accent text-accent-foreground">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...form.register("fullName")} placeholder="Your Full Name" />
                {form.formState.errors.fullName && <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                 <Controller
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                    <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="Select your date of birth"
                    />
                    )}
                />
                {form.formState.errors.dob && <p className="text-sm text-destructive">{form.formState.errors.dob.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...form.register("email")} placeholder="you@example.com" autoComplete="email" />
                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID</Label>
                <Input id="nationalId" {...form.register("nationalId")} placeholder="Your National ID Number" />
                {form.formState.errors.nationalId && <p className="text-sm text-destructive">{form.formState.errors.nationalId.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register("password")} placeholder="••••••••" autoComplete="new-password" />
                {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} placeholder="••••••••" autoComplete="new-password" />
                {form.formState.errors.confirmPassword && <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="party">Political Party</Label>
              <Input id="party" {...form.register("party")} placeholder="Your Political Party Name" />
              {form.formState.errors.party && <p className="text-sm text-destructive">{form.formState.errors.party.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manifesto">Manifesto / Platform Summary</Label>
              <Textarea id="manifesto" {...form.register("manifesto")} placeholder="Describe your key platforms and goals (min. 20 characters)." rows={5} />
              {form.formState.errors.manifesto && <p className="text-sm text-destructive">{form.formState.errors.manifesto.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Application...
                </>
              ) : (
                "Register as Candidate"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm mt-4">
          <p className="text-muted-foreground">
            Already registered or have an account?
          </p>
          <Button variant="link" asChild className="mt-1">
            <Link href="/login">Login here</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
