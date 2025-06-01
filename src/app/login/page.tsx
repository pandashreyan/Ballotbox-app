
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
import { LogIn, AlertCircle } from "lucide-react"
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
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
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
                {/* <Link
                  href="/forgot-password" // Mock link
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link> */}
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
  )
}
