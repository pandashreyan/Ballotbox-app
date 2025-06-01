
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { LogIn, AlertCircle, Newspaper, Info } from "lucide-react" // Added Newspaper and Info icons
import Link from "next/link"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Simple validation for mock
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setServerError(null)
    console.log("Login form submitted (mock):", data)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock success
    toast({
      title: "Login Attempted (Mock)",
      description: "This is a mock login. Real authentication is not implemented. Please use the header to switch roles.",
    })
    
    // In a real app, you would set auth state here.
    // For this mock, we just redirect.
    router.push('/')

    setIsLoading(false)
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* Login Card Section */}
        <div className="lg:col-span-1 flex justify-center lg:justify-start">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline text-primary flex items-center justify-center">
                <LogIn className="mr-2 h-7 w-7" /> Login to BallotBox
              </CardTitle>
              <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {serverError && (
                  <div className="bg-destructive/10 p-3 rounded-md flex items-center text-sm text-destructive">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    {serverError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...form.register("email")}
                    autoComplete="email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...form.register("password")}
                    autoComplete="current-password"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center text-sm">
              <p className="text-muted-foreground">
                Don&apos;t have an account? Registration is currently mocked.
              </p>
              <p className="text-muted-foreground mt-1">
                Use the header controls to simulate different user roles.
              </p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/">Back to Home</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Informational Content Section */}
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
                  <p className="mt-1">Make sure you're registered to vote before the upcoming deadline on November 1st. Check your registration status today!</p>
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
