
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, PlusCircle, Trash2, Loader2, ShieldAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/hooks/useAuth";

const candidateSchema = z.object({
  name: z.string().min(2, { message: "Candidate name must be at least 2 characters." }),
  platform: z.string().min(10, { message: "Platform summary must be at least 10 characters." }),
  party: z.string().min(2, { message: "Party name must be at least 2 characters."}), // Made required
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
})

const createElectionSchema = z.object({
  name: z.string().min(5, { message: "Election name must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
  candidates: z.array(candidateSchema).min(1, { message: "At least one candidate is required." }),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date.",
  path: ["endDate"],
});

type CreateElectionFormValues = z.infer<typeof createElectionSchema>;

export default function CreateElectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    console.log("CreateElectionPage component has mounted.");
  }, []);

  const form = useForm<CreateElectionFormValues>({
    resolver: zodResolver(createElectionSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      candidates: [{ name: "", platform: "", party: "", imageUrl: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "candidates",
  });

  const onSubmit = async (data: CreateElectionFormValues) => {
    if (user?.role !== 'admin') {
      setServerError("Access Denied: Only administrators can create elections.");
      toast({ title: "Access Denied", description: "You do not have permission to create elections.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setServerError(null);
    try {
      const payload = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        candidates: data.candidates.map(c => ({
          ...c,
          // party: c.party, // Party is now required
        }))
      };

      const response = await fetch('/api/elections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let message = errorData.message || `Server responded with ${response.status}`;
        if (errorData.errors && typeof errorData.errors === 'object') {
          const fieldErrors = Object.entries(errorData.errors)
            // @ts-ignore
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          if (fieldErrors) message += ` Details: ${fieldErrors}`;
        }
        throw new Error(message);
      }

      toast({
        title: "Election Created!",
        description: `The election "${data.name}" has been successfully created.`,
      });
      router.push('/');
    } catch (error: any) {
      console.error("Failed to create election:", error);
      setServerError(error.message || "An unexpected error occurred. Please try again.");
      toast({
        title: "Error Creating Election",
        description: error.message || "Could not create the election.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (user === undefined) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /> Loading...</div>;
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
              You do not have permission to create new elections. This action is restricted to administrators.
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Create New Election</CardTitle>
          <CardDescription>Fill in the details below to set up a new election.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {serverError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Creation Failed</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <section className="space-y-4 p-6 border rounded-lg shadow-sm bg-card">
              <h3 className="text-xl font-semibold text-foreground mb-4">Election Details</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Election Name</Label>
                <Input id="name" {...form.register("name")} placeholder="e.g., Presidential Election 2024" />
                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...form.register("description")} placeholder="A brief summary of the election's purpose." />
                {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Controller
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="Select start date"
                      />
                    )}
                  />
                  {form.formState.errors.startDate && <p className="text-sm text-destructive">{form.formState.errors.startDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Controller
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="Select end date"
                        disabled={(date) =>
                          form.getValues("startDate") ? date < form.getValues("startDate") : false
                        }
                      />
                    )}
                  />
                  {form.formState.errors.endDate && <p className="text-sm text-destructive">{form.formState.errors.endDate.message}</p>}
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-4 p-6 border rounded-lg shadow-sm bg-card">
              <h3 className="text-xl font-semibold text-foreground mb-4">Candidates</h3>
              {fields.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-md space-y-3 relative bg-background shadow">
                  <h4 className="font-medium text-md text-primary">Candidate {index + 1}</h4>
                  {fields.length > 1 && (
                     <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(index)}
                      aria-label="Remove candidate"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor={`candidates.${index}.name`}>Name</Label>
                    <Input id={`candidates.${index}.name`} {...form.register(`candidates.${index}.name`)} placeholder="Candidate Full Name" />
                    {form.formState.errors.candidates?.[index]?.name && <p className="text-sm text-destructive">{form.formState.errors.candidates?.[index]?.name?.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor={`candidates.${index}.party`}>Party Name</Label>
                    <Input id={`candidates.${index}.party`} {...form.register(`candidates.${index}.party`)} placeholder="Candidate's Political Party" />
                    {form.formState.errors.candidates?.[index]?.party && <p className="text-sm text-destructive">{form.formState.errors.candidates?.[index]?.party?.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`candidates.${index}.platform`}>Platform Summary</Label>
                    <Textarea id={`candidates.${index}.platform`} {...form.register(`candidates.${index}.platform`)} placeholder="Brief platform description" />
                    {form.formState.errors.candidates?.[index]?.platform && <p className="text-sm text-destructive">{form.formState.errors.candidates?.[index]?.platform?.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`candidates.${index}.imageUrl`}>Image URL (Optional)</Label>
                    <Input id={`candidates.${index}.imageUrl`} {...form.register(`candidates.${index}.imageUrl`)} placeholder="https://example.com/image.png" />
                    {form.formState.errors.candidates?.[index]?.imageUrl && <p className="text-sm text-destructive">{form.formState.errors.candidates?.[index]?.imageUrl?.message}</p>}
                  </div>
                </div>
              ))}
              {form.formState.errors.candidates?.root && !form.formState.errors.candidates.length && (
                <p className="text-sm text-destructive">{form.formState.errors.candidates.root.message}</p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ name: "", platform: "", party: "", imageUrl: "" })}
                className="mt-2"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Candidate
              </Button>
            </section>

            <CardFooter className="flex justify-end p-0 pt-6">
              <Button type="submit" disabled={isLoading} size="lg" className="min-w-[150px]">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Election"
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
