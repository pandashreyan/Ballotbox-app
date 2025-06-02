
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, UserPlus } from "lucide-react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; // Removed AuthError import
import { FirebaseError } from 'firebase/app'; // Import FirebaseError for type checking
import { doc, setDoc } from "firebase/firestore"; // Added for Firestore
import { app, db } from "@/lib/firebase"; // Ensure db is exported and app is correct

const registrationSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], 
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const firebaseAuth = getAuth(app); // Renamed to avoid conflict if auth is imported directly

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, data.email, data.password);
      const user = userCredential.user;

      // Create a document in Firestore 'voters' collection
      await setDoc(doc(db, "voters", user.uid), {
        uid: user.uid,
        email: user.email,
        isEligible: false, // Default to false, admin or other process to set true
        isVerified: false, // Default to false, admin to verify
        registeredAt: new Date().toISOString(),
      });

      setSuccessMessage("Registration successful! Your account is pending verification. You can now log in.");
      toast({
        title: "Registration Successful!",
        description: "Your account has been created and is pending verification. You can log in.",
      });
      form.reset();
      // setTimeout(() => router.push('/login'), 2000); 
    } catch (error: any) {
      let errorMessage = "Registration failed. Please try again.";
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = "This email address is already in use.";
        } else if (error.code === 'auth/weak-password') {
          errorMessage = "The password is too weak. Please choose a stronger password.";
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = "The email address is not valid.";
        } else {
          errorMessage = error.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      console.error("Registration error:", error);
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
    <div className="flex justify-center items-center min-h-screen py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary flex items-center justify-center">
            <UserPlus className="mr-2 h-7 w-7" />
            Voter Registration
          </CardTitle>
          <CardDescription>Create a new account to participate. Verification will be required.</CardDescription>
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
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="you@example.com" 
                {...form.register("email")} 
                autoComplete="email"
              />
              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                {...form.register("password")} 
                autoComplete="new-password"
              />
              {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="••••••••" 
                {...form.register("confirmPassword")} 
                autoComplete="new-password"
              />
              {form.formState.errors.confirmPassword && <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm mt-4">
          <p className="text-muted-foreground">
            Already have an account?
          </p>
          <Button variant="link" asChild className="mt-1">
            <Link href="/login">Login here</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    