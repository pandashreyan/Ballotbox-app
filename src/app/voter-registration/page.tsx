
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { AlertCircle, Loader2, UserPlus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const voterRegistrationSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  dateOfBirth: z.date({ required_error: "Date of birth is required." }),
  nationalId: z.string().min(5, { message: "National ID must be at least 5 characters." }), // Basic validation
  address: z.string().min(10, { message: "Address must be at least 10 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Confirm password must be at least 8 characters." }),
  idDocument: z.any().optional(), // Placeholder for file upload; actual file validation is complex
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type VoterRegistrationFormValues = z.infer<typeof voterRegistrationSchema>;

export default function VoterRegistrationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<VoterRegistrationFormValues>({
    resolver: zodResolver(voterRegistrationSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: undefined,
      nationalId: "",
      address: "",
      email: "",
      password: "",
      confirmPassword: "",
      idDocument: undefined,
    },
  });

  const onSubmit = async (data: VoterRegistrationFormValues) => {
    setIsLoading(true);
    setServerError(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Mock Voter Registration Data:", {
      ...data,
      idDocument: data.idDocument ? (data.idDocument[0] as File)?.name : "No file selected", // Log file name if present
    });
    
    // IMPORTANT: In a real application, NEVER log passwords or sensitive PII like this.
    // This is for demonstration of form data capture ONLY.
    // DO NOT send this data to a real backend without proper security, encryption, and PII handling.
    // The 'idDocument' would require secure file upload and storage mechanisms.

    setIsLoading(false);
    toast({
      title: "Registration Submitted (Mock)",
      description: "Your information has been logged for demonstration. No data was stored.",
    });
    form.reset();
    // router.push('/'); // Optionally redirect after mock submission
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary flex items-center">
            <UserPlus className="mr-3 h-8 w-8" /> Voter Registration (Mock UI)
          </CardTitle>
          <CardDescription>
            Fill in your details below.
            <span className="block text-sm text-destructive mt-1">
              This is a UI demonstration only. Data entered is not securely stored or processed.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {serverError && ( // Though not used in this mock, kept for structure
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...form.register("fullName")} placeholder="Enter your full name" />
              {form.formState.errors.fullName && <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Controller
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    placeholder="Select your date of birth"
                  />
                )}
              />
              {form.formState.errors.dateOfBirth && <p className="text-sm text-destructive">{form.formState.errors.dateOfBirth.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID</Label>
              <Input id="nationalId" {...form.register("nationalId")} placeholder="Enter your National ID number" />
              {form.formState.errors.nationalId && <p className="text-sm text-destructive">{form.formState.errors.nationalId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" {...form.register("address")} placeholder="Enter your full residential address" />
              {form.formState.errors.address && <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...form.register("email")} placeholder="you@example.com" />
              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register("password")} placeholder="Create a password" />
                {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} placeholder="Confirm your password" />
                {form.formState.errors.confirmPassword && <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idDocument">Upload ID Document (Mock)</Label>
              <Input id="idDocument" type="file" {...form.register("idDocument")} />
              {form.formState.errors.idDocument && <p className="text-sm text-destructive">{form.formState.errors.idDocument.message}</p>}
              <p className="text-xs text-muted-foreground">
                File upload is for UI demonstration only. Document will not be stored or processed.
              </p>
            </div>

            <CardFooter className="flex justify-end p-0 pt-6">
              <Button type="submit" disabled={isLoading} size="lg" className="min-w-[150px]">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Register (Mock)"
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
