"use client"

import { useState, useEffect, useRef } from "react"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Building2, Phone, Calendar, Upload, Edit2, Save, X, FileText, Users, Briefcase, Bell } from "lucide-react"

interface UserProfile {
    id: string
    email: string
    name?: string
    avatar_url?: string
    organization?: string
    phone?: string
    created_at: string
    last_login?: string
}

interface UserStats {
    job_ads: number
    talent_lists: number
    trackers: number
    notifications: number
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [stats, setStats] = useState<UserStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        organization: '',
        phone: ''
    })
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile')
            if (res.ok) {
                const data = await res.json()
                setProfile(data.user)
                setStats(data.stats)
                setFormData({
                    name: data.user.name || '',
                    organization: data.user.organization || '',
                    phone: data.user.phone || ''
                })
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                const data = await res.json()
                setProfile(data.user)
                setEditing(false)
            }
        } catch (error) {
            console.error('Failed to update profile:', error)
        }
    }

    const handleCancel = () => {
        setFormData({
            name: profile?.name || '',
            organization: profile?.organization || '',
            phone: profile?.phone || ''
        })
        setEditing(false)
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/profile/upload', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                const data = await res.json()
                setProfile(prev => prev ? { ...prev, avatar_url: data.avatar_url } : null)
            }
        } catch (error) {
            console.error('Failed to upload avatar:', error)
        } finally {
            setUploading(false)
        }
    }

    const getInitials = (name?: string, email?: string) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }
        if (email) {
            return email.slice(0, 2).toUpperCase()
        }
        return 'US'
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="container mx-auto py-6 px-4 sm:px-6">
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Loading profile...</p>
                    </div>
                </div>
            </AuthenticatedLayout>
        )
    }

    return (
        <AuthenticatedLayout>
            <div className="container mx-auto py-6 px-4 sm:px-6 space-y-6 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                    <p className="text-muted-foreground">
                        Manage your account information and view your activity
                    </p>
                </div>

                {/* Profile Header Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            {/* Avatar */}
                            <div className="relative group">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={profile?.avatar_url} alt={profile?.name || profile?.email} />
                                    <AvatarFallback className="bg-accent text-accent-foreground text-2xl font-semibold">
                                        {getInitials(profile?.name, profile?.email)}
                                    </AvatarFallback>
                                </Avatar>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Upload className="h-6 w-6 text-white" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center sm:text-left space-y-2">
                                <h2 className="text-2xl font-bold">
                                    {profile?.name || 'User'}
                                </h2>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                                        <Mail className="h-4 w-4" />
                                        {profile?.email}
                                    </div>
                                    {profile?.organization && (
                                        <>
                                            <span className="hidden sm:inline">•</span>
                                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                                <Building2 className="h-4 w-4" />
                                                {profile.organization}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                                    <Calendar className="h-4 w-4" />
                                    Member since {formatDate(profile?.created_at)}
                                </div>
                            </div>

                            {/* Edit Button */}
                            {!editing && (
                                <Button onClick={() => setEditing(true)} variant="outline" className="gap-2">
                                    <Edit2 className="h-4 w-4" />
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Job Ads</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.job_ads || 0}</div>
                            <p className="text-xs text-muted-foreground">Total created</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Talent Lists</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.talent_lists || 0}</div>
                            <p className="text-xs text-muted-foreground">Total processed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">JD Trackers</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.trackers || 0}</div>
                            <p className="text-xs text-muted-foreground">Total tracked</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                            <Bell className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.notifications || 0}</div>
                            <p className="text-xs text-muted-foreground">Total received</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Update your personal details and contact information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                {editing ? (
                                    <Input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter your full name"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/30">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        {profile?.name || 'Not set'}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/30">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    {profile?.email}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="organization">Organization</Label>
                                {editing ? (
                                    <Input
                                        id="organization"
                                        type="text"
                                        value={formData.organization}
                                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                        placeholder="Enter your organization"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/30">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        {profile?.organization || 'Not set'}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                {editing ? (
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Enter your phone number"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/30">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        {profile?.phone || 'Not set'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {editing && (
                            <div className="flex gap-2 justify-end pt-4">
                                <Button onClick={handleCancel} variant="outline" className="gap-2">
                                    <X className="h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    )
}
