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
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    startDate: z.string().min(1, "Start date is required"),
    startTime: z.string().min(1, "Start time is required"),
    timeIntervalMinutes: z.coerce.number().min(5, "Interval must be at least 5 minutes"),
    candidatesPerBatch: z.coerce.number().min(1, "Must have at least 1 candidate per batch"),
    meetingVenueUrl: z.string().url("Must be a valid URL"),
})

interface ScheduleInterviewFormProps {
    jobTrackerId: string
    jobName: string
}

export function ScheduleInterviewForm({ jobTrackerId, jobName }: ScheduleInterviewFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startDate: "",
            startTime: "09:00",
            timeIntervalMinutes: 15,
            candidatesPerBatch: 5,
            meetingVenueUrl: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const response = await fetch("/api/candidates/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobTrackerId,
                    config: {
                        ...values,
                        recruiterName: "Recruiter", // TODO: Get from user profile
                        recruiterEmail: "recruiter@example.com", // TODO: Get from user profile
                    },
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to schedule interviews")
            }

            toast.success(`Successfully scheduled ${data.count} candidates`)
            form.reset()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormDescription>
                                    The date to start scheduling interviews (weekends will be skipped).
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormDescription>
                                    The time the first interview starts each day.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="timeIntervalMinutes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time Interval (Minutes)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Duration between each interview slot.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="candidatesPerBatch"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Candidates Per Batch</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Number of candidates to schedule before moving to the next batch/day.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="meetingVenueUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Meeting Venue / URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://zoom.us/j/..." {...field} />
                            </FormControl>
                            <FormDescription>
                                The link candidates will use to join the interview.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Schedule Interviews
                </Button>
            </form>
        </Form>
    )
}
