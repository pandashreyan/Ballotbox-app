
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { LogIn, AlertCircle, Newspaper, Info, UserCheck, Users, UserCog, ArrowLeft, Loader2, UserPlus, Edit3, Edit } from "lucide-react" 
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserRole } from "@/hooks/useAuth"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from 'firebase/app'; 
import { app } from "@/lib/firebase";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { differenceInYears } from 'date-fns';

const firebaseLoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password cannot be empty." }), 
});
type FirebaseLoginFormValues = z.infer<typeof firebaseLoginSchema>;


const voterDetailsSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  dob: z.date({ required_error: "Date of birth is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  nationalId: z.string().min(5, { message: "National ID must be at least 5 characters." }),
  aadhaarId: z.string().min(12, { message: "Aadhaar ID must be 12 digits." }).max(12, { message: "Aadhaar ID must be 12 digits."}).regex(/^\d{12}$/, { message: "Aadhaar ID must be 12 digits."}),
}).refine(data => {
  if (!data.dob) return true; 
  const age = differenceInYears(new Date(), data.dob);
  return age >= 18;
}, {
  message: "Voter must be at least 18 years old.",
  path: ["dob"], 
});
type VoterDetailsFormValues = z.infer<typeof voterDetailsSchema>;

type LoginPageStep = 'selectRole' | 'enterVoterDetails' | 'voterLogin' | 'candidateLogin';


export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<UserRole | ''>('');
  const [currentStep, setCurrentStep] = React.useState<LoginPageStep>('selectRole');
  
  const auth = getAuth(app);
  const currentYear = new Date().getFullYear();

  const voterLoginForm = useForm<FirebaseLoginFormValues>({
    resolver: zodResolver(firebaseLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const candidateLoginForm = useForm<FirebaseLoginFormValues>({ 
    resolver: zodResolver(firebaseLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const voterDetailsForm = useForm<VoterDetailsFormValues>({
    resolver: zodResolver(voterDetailsSchema),
    defaultValues: {
      fullName: "",
      dob: undefined,
      email: "",
      nationalId: "",
      aadhaarId: "",
    },
  });

  const handleRoleSelectedProceed = () => {
    if (!selectedRole) {
      toast({
        title: "No Role Selected",
        description: "Please select a role to proceed.",
        variant: "destructive",
      });
      return;
    }
    if (selectedRole === 'voter') {
      setCurrentStep('enterVoterDetails'); 
    } else if (selectedRole === 'admin') { 
      handleMockLogin(selectedRole);
    } else if (selectedRole === 'candidate') { 
      handleMockLogin(selectedRole);
    }
  };
  
  const handleFirebaseLoginSubmit = async (data: FirebaseLoginFormValues, roleToSet: 'voter' | 'candidate') => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      if (typeof window !== 'undefined' && (window as any).setMockUserRole) {
        (window as any).setMockUserRole(roleToSet); 
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${roleToSet.charAt(0).toUpperCase() + roleToSet.slice(1)}!`,
        });
        router.push('/'); 
      } else {
         throw new Error("Mock login function unavailable after Firebase auth.");
      }
    } catch (error: any) {
      const authError = error as FirebaseError; 
      console.error("Firebase Login error:", authError);
      let errorMessage = "Login failed. Please check your credentials.";
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (authError.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
      }
      toast({
        title: `${roleToSet.charAt(0).toUpperCase() + roleToSet.slice(1)} Login Failed`,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleMockLogin = async (role: UserRole) => {
     if (!role || role === null) return; 
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); 
    if (typeof window !== 'undefined' && (window as any).setMockUserRole) {
      (window as any).setMockUserRole(role);
      toast({
        title: `Logged in as ${role} (Mock)`,
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
    setIsLoading(false)
  };

  const onSubmitVoterDetails = async (data: VoterDetailsFormValues) => {
    setIsLoading(true);
    console.log("Mock Voter Details Submitted:", data);
        
    await new Promise(resolve => setTimeout(resolve, 500));

    if (typeof window !== 'undefined' && (window as any).setMockUserRole) {
      (window as any).setMockUserRole('voter'); 
      toast({
        title: "Mock Voter Details Submitted!",
        description: "Proceeding as Voter (mock).",
      });
      router.push('/');
    } else {
      toast({
        title: "Error",
        description: "Could not set mock user role.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };


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
  
  const cardTitle = currentStep === 'selectRole' 
    ? "Login to BallotBox" 
    : currentStep === 'voterLogin' 
    ? "Voter Login (Firebase)"
    : currentStep === 'candidateLogin'
    ? "Candidate Login (Firebase)"
    : "Voter Details (Mock)";

  const cardDescription = currentStep === 'selectRole' 
    ? "Select your role to continue. Admins use mock login. Candidates and Voters can use Firebase Auth or mock methods."
    : currentStep === 'voterLogin'
    ? "Enter your email and password to vote using your Firebase account."
    : currentStep === 'candidateLogin'
    ? "Enter your email and password for candidate access using your Firebase account."
    : "Provide your details for mock voter access.";


  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-1 flex justify-center lg:justify-start">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline text-primary flex items-center justify-center">
                { currentStep === 'enterVoterDetails' ? <Edit3 className="mr-2 h-7 w-7" /> : getRoleIcon(selectedRole) }
                {cardTitle}
              </CardTitle>
              <CardDescription>
                {cardDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 'selectRole' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-select">User Role</Label>
                    <Select 
                      value={selectedRole || ''} 
                      onValueChange={(value) => setSelectedRole(value as UserRole)}
                    >
                      <SelectTrigger id="role-select" className="w-full">
                        <SelectValue placeholder="Select a role..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center">
                            <UserCog className="mr-2 h-4 w-4" /> Admin (Mock)
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
                  {selectedRole && (selectedRole === 'admin') && (
                     <Button onClick={handleRoleSelectedProceed} disabled={isLoading} className="w-full" size="lg">
                        {isLoading ? <Loader2 className="animate-spin" /> : "Proceed (Mock Login)"}
                    </Button>
                  )}
                  {selectedRole && (selectedRole === 'voter' || selectedRole === 'candidate') && (
                    <>
                       <Button onClick={handleRoleSelectedProceed} disabled={isLoading} className="w-full" size="lg">
                        {isLoading ? <Loader2 className="animate-spin" /> : (selectedRole === 'voter' ? "Proceed (Enter Details - Mock)" : "Proceed (Mock Login)")}
                      </Button>
                      <Separator className="my-3"/>
                      <Button onClick={() => setCurrentStep(selectedRole === 'voter' ? 'voterLogin' : 'candidateLogin')} variant="outline" className="w-full">
                         Login with Email/Password ({selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)})
                      </Button>
                    </>
                  )}
                </div>
              )}

              {(currentStep === 'voterLogin' || currentStep === 'candidateLogin') && (
                 <form onSubmit={
                    currentStep === 'voterLogin' 
                    ? voterLoginForm.handleSubmit(data => handleFirebaseLoginSubmit(data, 'voter')) 
                    : candidateLoginForm.handleSubmit(data => handleFirebaseLoginSubmit(data, 'candidate'))
                  } className="space-y-4">
                   <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      {...(currentStep === 'voterLogin' ? voterLoginForm.register("email") : candidateLoginForm.register("email"))} 
                      autoComplete="email"
                    />
                    {(currentStep === 'voterLogin' ? voterLoginForm.formState.errors.email : candidateLoginForm.formState.errors.email) && 
                      <p className="text-sm text-destructive">
                        {(currentStep === 'voterLogin' ? voterLoginForm.formState.errors.email?.message : candidateLoginForm.formState.errors.email?.message)}
                      </p>
                    }
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                       {...(currentStep === 'voterLogin' ? voterLoginForm.register("password") : candidateLoginForm.register("password"))} 
                      autoComplete="current-password"
                    />
                     {(currentStep === 'voterLogin' ? voterLoginForm.formState.errors.password : candidateLoginForm.formState.errors.password) && 
                        <p className="text-sm text-destructive">
                            {(currentStep === 'voterLogin' ? voterLoginForm.formState.errors.password?.message : candidateLoginForm.formState.errors.password?.message)}
                        </p>
                     }
                  </div>
                   <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                    {isLoading ? <Loader2 className="animate-spin" /> : "Login"}
                  </Button>
                   <Button variant="outline" onClick={() => setCurrentStep('selectRole')} className="w-full mt-2">
                     Back to Role Selection
                   </Button>
                 </form>
              )}

              {currentStep === 'enterVoterDetails' && (
                <form onSubmit={voterDetailsForm.handleSubmit(onSubmitVoterDetails)} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...voterDetailsForm.register("fullName")} placeholder="Your Full Name" />
                    {voterDetailsForm.formState.errors.fullName && <p className="text-sm text-destructive">{voterDetailsForm.formState.errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Controller
                        control={voterDetailsForm.control}
                        name="dob"
                        render={({ field }) => (
                        <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                            placeholder="Select your date of birth"
                            fromYear={currentYear - 100}
                            toYear={currentYear}
                        />
                        )}
                    />
                    {voterDetailsForm.formState.errors.dob && <p className="text-sm text-destructive">{voterDetailsForm.formState.errors.dob.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="voterEmail">Email</Label>
                    <Input id="voterEmail" type="email" {...voterDetailsForm.register("email")} placeholder="you@example.com" />
                    {voterDetailsForm.formState.errors.email && <p className="text-sm text-destructive">{voterDetailsForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="nationalId">National ID</Label>
                    <Input id="nationalId" {...voterDetailsForm.register("nationalId")} placeholder="Your National ID" />
                    {voterDetailsForm.formState.errors.nationalId && <p className="text-sm text-destructive">{voterDetailsForm.formState.errors.nationalId.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="aadhaarId">Aadhaar ID</Label>
                    <Input id="aadhaarId" {...voterDetailsForm.register("aadhaarId")} placeholder="12 Digit Aadhaar ID" />
                    {voterDetailsForm.formState.errors.aadhaarId && <p className="text-sm text-destructive">{voterDetailsForm.formState.errors.aadhaarId.message}</p>}
                  </div>

                  <div className="flex flex-col space-y-2 pt-2">
                    <Button type="submit" disabled={isLoading} size="lg">
                      {isLoading ? <Loader2 className="animate-spin" /> : "Complete Mock Registration & Login"}
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentStep('selectRole')} disabled={isLoading}>
                      Back to Role Selection
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-center text-sm">
              {(currentStep === 'voterLogin' || currentStep === 'candidateLogin' || (selectedRole === 'voter' && currentStep !== 'enterVoterDetails') || (selectedRole === 'candidate' && currentStep !== 'enterVoterDetails') ) && (
                <>
                  <p className="text-muted-foreground">
                    Don&apos;t have an account?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-1">
                    <Button variant="link" asChild className="p-0 h-auto">
                      <Link href="/register">
                        <UserPlus className="mr-1 h-4 w-4" /> Voter Registration
                      </Link>
                    </Button>
                    <Button variant="link" asChild className="p-0 h-auto">
                      <Link href="/register-candidate">
                        <Edit className="mr-1 h-4 w-4" /> Candidate Registration
                      </Link>
                    </Button>
                  </div>
                  <Separator className="my-3"/>
                </>
              )}
               <p className="text-muted-foreground text-center">
                Select role to begin or use email/password for Firebase login.
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
