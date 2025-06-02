
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
// DatePicker is removed as voter details form is removed for Firebase login
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { LogIn, AlertCircle, Newspaper, Info, UserCheck, Users, UserCog, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserRole } from "@/hooks/useAuth"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { getAuth, signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { app } from "@/lib/firebase"; // Import your initialized Firebase app

const voterLoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
type VoterLoginFormValues = z.infer<typeof voterLoginSchema>;

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<UserRole | ''>('');
  
  const auth = getAuth(app);

  const voterLoginForm = useForm<VoterLoginFormValues>({
    resolver: zodResolver(voterLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLoginAttempt = async (data?: VoterLoginFormValues) => {
    if (!selectedRole) {
      toast({
        title: "No Role Selected",
        description: "Please select a role to proceed.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true);

    if (selectedRole === 'voter') {
      if (!data) {
        toast({ title: "Login Error", description: "Email and password are required.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      try {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        // If Firebase login is successful, then set the mock role for UI consistency
        if (typeof window !== 'undefined' && (window as any).setMockUserRole) {
          (window as any).setMockUserRole('voter');
          toast({
            title: "Login Successful!",
            description: "Welcome back, Voter!",
          });
          router.push('/');
        } else {
           throw new Error("Mock login function unavailable after Firebase auth.");
        }
      } catch (error: any) {
        const authError = error as AuthError;
        console.error("Firebase Login error:", authError);
        let errorMessage = "Login failed. Please check your credentials.";
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
          errorMessage = "Invalid email or password.";
        } else if (authError.code === 'auth/invalid-email') {
          errorMessage = "The email address is not valid.";
        }
        toast({
          title: "Voter Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } else { // Admin or Candidate mock login
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
      if (typeof window !== 'undefined' && (window as any).setMockUserRole) {
        (window as any).setMockUserRole(selectedRole);
        toast({
          title: `Logged in as ${selectedRole} (Mock)`,
          description: "You have successfully switched your mock role.",
        })
        router.push('/')
      } else {
        toast({
          title: "Mock Login Function Unavailable",
          description: "Could not set mock user role.",
          variant: "destructive",
        })
      }
    }
    setIsLoading(false)
  }

  const getRoleIcon = (role: UserRole | '') => {
    if (!role) return <LogIn className="mr-2 h-7 w-7" />;
    switch (role) {
      case 'admin':
        return <UserCog className="mr-2 h-5 w-5" />;
      case 'candidate':
        return <UserCheck className="mr-2 h-5 w-5" />;
      case 'voter':
        return <Users className="mr-2 h-5 w-5" />;
      default:
        return <LogIn className="mr-2 h-7 w-7" />;
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-1 flex justify-center lg:justify-start">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline text-primary flex items-center justify-center">
                {getRoleIcon(selectedRole)}
                Login to BallotBox
              </CardTitle>
              <CardDescription>
                {selectedRole === 'voter' ? "Enter your credentials to vote." : "Select your role to continue."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="role-select">User Role</Label>
                  <Select 
                    value={selectedRole || ''} 
                    onValueChange={(value) => {
                      setSelectedRole(value as UserRole);
                      if (value === 'voter') voterLoginForm.reset(); // Reset voter form if role changes to voter
                    }}
                  >
                    <SelectTrigger id="role-select" className="w-full">
                      <SelectValue placeholder="Select a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center">
                          <UserCog className="mr-2 h-4 w-4" /> Admin
                        </div>
                      </SelectItem>
                      <SelectItem value="candidate">
                        <div className="flex items-center">
                          <UserCheck className="mr-2 h-4 w-4" /> Candidate
                        </div>
                      </SelectItem>
                      <SelectItem value="voter">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4" /> Voter
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedRole === 'voter' && (
                  <form onSubmit={voterLoginForm.handleSubmit(handleLoginAttempt)} className="space-y-4 pt-4 border-t">
                     <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        {...voterLoginForm.register("email")} 
                        autoComplete="email"
                      />
                      {voterLoginForm.formState.errors.email && <p className="text-sm text-destructive">{voterLoginForm.formState.errors.email.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        {...voterLoginForm.register("password")} 
                        autoComplete="current-password"
                      />
                      {voterLoginForm.formState.errors.password && <p className="text-sm text-destructive">{voterLoginForm.formState.errors.password.message}</p>}
                    </div>
                     <Button type="submit" disabled={isLoading || !selectedRole} className="w-full" size="lg">
                      {isLoading ? <Loader2 className="animate-spin" /> : "Login"}
                    </Button>
                  </form>
                )}

                {selectedRole && selectedRole !== 'voter' && (
                  <Button onClick={() => handleLoginAttempt()} disabled={isLoading || !selectedRole} className="w-full" size="lg">
                    {isLoading ? <Loader2 className="animate-spin" /> : `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                  </Button>
                )}
                
                {!selectedRole && (
                     <Button disabled className="w-full opacity-50" size="lg">
                        Select a Role to Login
                    </Button>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center text-sm">
              <p className="text-muted-foreground">
                Select your role. Voters use email/password. Other roles are for mock demonstration.
              </p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/">Back to Home</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <Newspaper className="mr-3 h-6 w-6" /> Election News & Updates
              </CardTitle>
              <CardDescription>Stay informed with the latest happenings in the election cycle.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Voter Registration Deadline Approaching</h3>
                  <p className="text-muted-foreground text-sm">Published on: October 25, 2024</p>
                  <p className="mt-1">Make sure you&apos;re registered to vote before the upcoming deadline on November 1st. Check your registration status today!</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">New Polling Locations Announced</h3>
                  <p className="text-muted-foreground text-sm">Published on: October 22, 2024</p>
                  <p className="mt-1">Several new polling locations have been added for convenience. Find your nearest polling station on our official website.</p>
                </div>
                 <div>
                  <h3 className="font-semibold text-lg">Candidate Debates Schedule</h3>
                  <p className="text-muted-foreground text-sm">Published on: October 20, 2024</p>
                  <p className="mt-1">The final round of candidate debates will be held next week. Tune in to hear their views on key issues. Check broadcast channels for details.</p>
                </div>
              </div>
            </CardContent>
             <CardFooter>
              <Button variant="outline" size="sm">Read More News</Button>
            </CardFooter>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <Info className="mr-3 h-6 w-6" /> About This Election
              </CardTitle>
              <CardDescription>Learn more about the current election process and important information.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90">
                This platform provides a secure and transparent way to participate in elections. Here you can find information about candidates, their platforms, and cast your vote during the designated period. 
                Our goal is to make the electoral process accessible and straightforward for all eligible citizens.
              </p>
              <h4 className="font-semibold mt-4 mb-2">Key Dates:</h4>
              <ul className="list-disc list-inside text-foreground/80 space-y-1">
                <li><strong>Registration Deadline:</strong> November 1, 2024</li>
                <li><strong>Early Voting Period:</strong> November 5, 2024 - November 15, 2024</li>
                <li><strong>Election Day:</strong> November 20, 2024</li>
                <li><strong>Results Announcement:</strong> November 21, 2024 (tentative)</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">Frequently Asked Questions</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
    

    