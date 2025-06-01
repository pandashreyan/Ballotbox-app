
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { LogIn, AlertCircle, Newspaper, Info, UserCheck, Users, UserCog } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserRole } from "@/hooks/useAuth"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<UserRole | ''>('');

  const handleLoginAsRole = async () => {
    if (!selectedRole) {
      toast({
        title: "No Role Selected",
        description: "Please select a role to log in as.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    console.log("Login attempt with role (mock):", selectedRole)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

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
        {/* Login Card Section */}
        <div className="lg:col-span-1 flex justify-center lg:justify-start">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline text-primary flex items-center justify-center">
                {getRoleIcon(selectedRole)} Select Role to Login
              </CardTitle>
              <CardDescription>Choose a mock user role to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="role-select">User Role</Label>
                  <Select value={selectedRole || ''} onValueChange={(value) => setSelectedRole(value as UserRole)}>
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

                <Button onClick={handleLoginAsRole} disabled={isLoading || !selectedRole} className="w-full" size="lg">
                  {isLoading ? "Logging in..." : "Login as Selected Role"}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center text-sm">
              <p className="text-muted-foreground">
                This is a mock login to simulate different user perspectives.
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
