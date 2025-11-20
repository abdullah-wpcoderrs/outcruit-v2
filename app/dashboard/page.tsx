"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthenticatedLayout from "@/components/authenticated-layout"

export default function DashboardPage() {
    return (
        <AuthenticatedLayout>
            <div className="container mx-auto py-6 space-y-8 p-4 sm:p-6 max-w-4xl">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Select a tool to get started.
                    </p>
                </div>

                <Tabs defaultValue="job-ads" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="job-ads">Create Job Ads</TabsTrigger>
                        <TabsTrigger value="talent-sorting">Talent Sorting</TabsTrigger>
                        <TabsTrigger value="jd-tracker">JD Tracker</TabsTrigger>
                    </TabsList>

                    <TabsContent value="job-ads" className="flex justify-center">
                        <Card className="w-full max-w-[570px]">
                            <CardHeader>
                                <CardTitle>Create Job Ads</CardTitle>
                                <CardDescription>
                                    Upload a Job Description to generate professional job ads.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 p-8">
                                <div className="space-y-2">
                                    <Label htmlFor="jd-file">Job Description (PDF)</Label>
                                    <Input id="jd-file" type="file" accept=".pdf" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="recruiter-email">Recruiter Email</Label>
                                    <Input id="recruiter-email" type="email" placeholder="you@company.com" />
                                </div>
                                <Button className="w-full">Generate Ads</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="talent-sorting" className="flex justify-center">
                        <Card className="w-full max-w-[570px]">
                            <CardHeader>
                                <CardTitle>Talent Sorting</CardTitle>
                                <CardDescription>
                                    Upload a spreadsheet to sort and qualify candidates.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 p-8">
                                <div className="space-y-2">
                                    <Label htmlFor="candidates-sheet">Candidates Sheet (URL or File)</Label>
                                    <Input id="candidates-sheet" type="text" placeholder="Google Sheet URL" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="recruiter-email-sort">Recruiter Email</Label>
                                    <Input id="recruiter-email-sort" type="email" placeholder="you@company.com" />
                                </div>
                                <Button className="w-full">Sort Candidates</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="jd-tracker" className="flex justify-center">
                        <Card className="w-full max-w-[570px]">
                            <CardHeader>
                                <CardTitle>JD Tracker</CardTitle>
                                <CardDescription>
                                    Add a new Job Description to the tracker.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 p-8">
                                <div className="space-y-2">
                                    <Label htmlFor="jd-file-tracker">Job Description (PDF)</Label>
                                    <Input id="jd-file-tracker" type="file" accept=".pdf" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="job-name">Job Name</Label>
                                    <Input id="job-name" type="text" placeholder="e.g. Senior Developer" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="recruiter-email-tracker">Recruiter Email</Label>
                                    <Input id="recruiter-email-tracker" type="email" placeholder="you@company.com" />
                                </div>
                                <Button className="w-full">Add To Tracker</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    )
}
