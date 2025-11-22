"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Mail } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
    emailType: z.enum(["interview_schedule", "congratulatory", "rejection"], {
        required_error: "Please select an email type",
    }),
})

interface SendEmailFormProps {
    talentListId: string
    jobName: string
}

export function SendEmailForm({ talentListId, jobName }: SendEmailFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [previewData, setPreviewData] = useState<any>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const emailType = form.watch("emailType")

    const getEmailDescription = (type: string) => {
        switch (type) {
            case "interview_schedule":
                return "Sends interview details to 'Scheduled' candidates. Updates status to 'Scheduled' (Notified)."
            case "congratulatory":
                return "Sends congratulatory emails to 'Shortlisted' candidates. Updates status to 'PROCEEDING'."
            case "rejection":
                return "Sends rejection emails to 'Dropped' candidates. Updates status to 'Notified-Rejected - CLOSED'."
            default:
                return ""
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const response = await fetch("/api/candidates/communicate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    talentListId,
                    jobName,
                    emailType: values.emailType,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to send emails")
            }

            toast.success(
                `Processed emails: ${data.successCount} sent, ${data.failCount} failed`
            )
            if (data.message.includes("No candidates")) {
                toast.info(data.message)
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="emailType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select email type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="interview_schedule">Schedule Interview</SelectItem>
                                        <SelectItem value="congratulatory">Send Congratulatory Mail</SelectItem>
                                        <SelectItem value="rejection">Send Rejection Mail</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    {emailType ? getEmailDescription(emailType) : "Select the type of email to broadcast."}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {emailType && (
                        <Alert>
                            <Mail className="h-4 w-4" />
                            <AlertTitle>Ready to Broadcast</AlertTitle>
                            <AlertDescription>
                                This will send emails to all eligible candidates for the <strong>{jobName}</strong> role.
                                Please ensure your email service is configured.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button type="submit" disabled={isLoading || !emailType}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Emails
                    </Button>
                </form>
            </Form>
        </div>
    )
}
