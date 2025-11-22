"use client"

import { useState, useEffect } from "react"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Palette, Shield, Lock, Save } from "lucide-react"
import { useRouter } from "next/navigation"

interface Preferences {
    notifications: {
        job_ads: boolean
        talent_sorting: boolean
        jd_tracker: boolean
        email_notifications: boolean
    }
    appearance: {
        theme: string
        density: string
    }
}

export default function SettingsPage() {
    const router = useRouter()
    const [preferences, setPreferences] = useState<Preferences>({
        notifications: {
            job_ads: true,
            talent_sorting: true,
            jd_tracker: true,
            email_notifications: true
        },
        appearance: {
            theme: 'system',
            density: 'comfortable'
        }
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [email, setEmail] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings')
            if (res.ok) {
                const data = await res.json()
                setPreferences(data.preferences)
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSavePreferences = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferences })
            })

            if (res.ok) {
                // Apply theme changes
                applyTheme(preferences.appearance.theme)
            }
        } catch (error) {
            console.error('Failed to save settings:', error)
        } finally {
            setSaving(false)
        }
    }

    const applyTheme = (theme: string) => {
        const root = document.documentElement
        if (theme === 'dark') {
            root.classList.add('dark')
        } else if (theme === 'light') {
            root.classList.remove('dark')
        } else {
            // System preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark')
            } else {
                root.classList.remove('dark')
            }
        }
    }

    const updateNotificationPreference = (key: keyof Preferences['notifications'], value: boolean) => {
        setPreferences(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: value
            }
        }))
    }

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="container mx-auto py-6 px-4 sm:px-6">
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Loading settings...</p>
                    </div>
                </div>
            </AuthenticatedLayout>
        )
    }

    return (
        <AuthenticatedLayout>
            <div className="container mx-auto py-6 px-4 sm:px-6 space-y-6 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                </div>

                {/* Settings Tabs */}
                <Tabs defaultValue="notifications" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="h-4 w-4" />
                            <span className="hidden sm:inline">Notifications</span>
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="gap-2">
                            <Palette className="h-4 w-4" />
                            <span className="hidden sm:inline">Appearance</span>
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Security</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>
                                    Choose what notifications you want to receive
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="job-ads-notif" className="text-base font-medium">
                                                Job Ads Completion
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Get notified when your job ad generation is complete
                                            </p>
                                        </div>
                                        <Switch
                                            id="job-ads-notif"
                                            checked={preferences.notifications.job_ads}
                                            onCheckedChange={(checked) => updateNotificationPreference('job_ads', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="talent-sorting-notif" className="text-base font-medium">
                                                Talent Sorting Completion
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Get notified when your talent sorting is complete
                                            </p>
                                        </div>
                                        <Switch
                                            id="talent-sorting-notif"
                                            checked={preferences.notifications.talent_sorting}
                                            onCheckedChange={(checked) => updateNotificationPreference('talent_sorting', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="jd-tracker-notif" className="text-base font-medium">
                                                JD Tracker Updates
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Get notified about updates to your job description trackers
                                            </p>
                                        </div>
                                        <Switch
                                            id="jd-tracker-notif"
                                            checked={preferences.notifications.jd_tracker}
                                            onCheckedChange={(checked) => updateNotificationPreference('jd_tracker', checked)}
                                        />
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="email-notif" className="text-base font-medium">
                                                    Email Notifications
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive notifications via email as well
                                                </p>
                                            </div>
                                            <Switch
                                                id="email-notif"
                                                checked={preferences.notifications.email_notifications}
                                                onCheckedChange={(checked) => updateNotificationPreference('email_notifications', checked)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleSavePreferences} disabled={saving} className="gap-2">
                                        <Save className="h-4 w-4" />
                                        {saving ? 'Saving...' : 'Save Preferences'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Appearance Tab */}
                    <TabsContent value="appearance" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance Settings</CardTitle>
                                <CardDescription>
                                    Customize how the application looks
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="theme">Theme</Label>
                                        <Select
                                            value={preferences.appearance.theme}
                                            onValueChange={(value) => setPreferences(prev => ({
                                                ...prev,
                                                appearance: { ...prev.appearance, theme: value }
                                            }))}
                                        >
                                            <SelectTrigger id="theme">
                                                <SelectValue placeholder="Select theme" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="light">Light</SelectItem>
                                                <SelectItem value="dark">Dark</SelectItem>
                                                <SelectItem value="system">System</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-muted-foreground">
                                            Choose your preferred color scheme
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="density">Display Density</Label>
                                        <Select
                                            value={preferences.appearance.density}
                                            onValueChange={(value) => setPreferences(prev => ({
                                                ...prev,
                                                appearance: { ...prev.appearance, density: value }
                                            }))}
                                        >
                                            <SelectTrigger id="density">
                                                <SelectValue placeholder="Select density" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="compact">Compact</SelectItem>
                                                <SelectItem value="comfortable">Comfortable</SelectItem>
                                                <SelectItem value="spacious">Spacious</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-muted-foreground">
                                            Adjust the spacing and size of UI elements
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleSavePreferences} disabled={saving} className="gap-2">
                                        <Save className="h-4 w-4" />
                                        {saving ? 'Saving...' : 'Save Preferences'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>


                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>
                                    Manage your password and security preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Change Password</h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input
                                            id="current-password"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input
                                            id="new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                        />
                                    </div>

                                    <Button variant="outline" disabled className="gap-2">
                                        <Lock className="h-4 w-4" />
                                        Update Password
                                    </Button>
                                </div>

                                <div className="border-t pt-6 space-y-4">
                                    <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Add an extra layer of security to your account
                                    </p>
                                    <Button variant="outline" disabled>
                                        Enable Two-Factor Authentication
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    )
}
