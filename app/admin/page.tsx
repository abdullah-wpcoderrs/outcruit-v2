"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthUser } from "@/hooks/use-auth-user"
import ErrorModal from "@/components/modals/error-modal"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { formatDistanceToNow } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Bell,
  FileText,
  Users,
  Briefcase,
  Search,
  Filter,
  Mail,
  Calendar
} from "lucide-react"

interface AdminUser {
  id: string
  email: string
  name?: string
  role?: string
  organization?: string
  phone?: string
  created_at?: string
  updated_at?: string
}

export default function AdminPage() {
  // Get current user and loading state
  const { user, isLoading } = useAuthUser()
  const router = useRouter()
  // Track if access is blocked and modal should show
  const [blocked, setBlocked] = useState(false)
  const [deniedOpen, setDeniedOpen] = useState(false)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(false)

  const [newUser, setNewUser] = useState({ email: "", password: "", name: "", role: "user" })
  const [creating, setCreating] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const [analytics, setAnalytics] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [activityFilter, setActivityFilter] = useState("all")
  const [activitySearch, setActivitySearch] = useState("")

  useEffect(() => {
    // When user is known and is not admin: show modal and schedule redirect
    if (user && user.role !== "admin") {
      setBlocked(true)
      setDeniedOpen(true)
      const t = setTimeout(() => {
        // Redirect back to normal dashboard quickly
        router.replace("/dashboard")
      }, 2000)
      return () => clearTimeout(t)
    }

    // When user is admin, load admin data
    if (user && user.role === "admin") {
      setBlocked(false)
      refreshUsers()
      refreshAnalytics()
    }
  }, [user, router])

  const refreshUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(search)}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } finally {
      setLoadingUsers(false)
    }
  }

  const refreshAnalytics = async () => {
    setLoadingAnalytics(true)
    try {
      const res = await fetch('/api/admin/analytics')
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const createUser = async () => {
    if (!newUser.email || !newUser.password) return
    setCreating(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      if (res.ok) {
        setNewUser({ email: "", password: "", name: "", role: "user" })
        await refreshUsers()
      }
    } finally {
      setCreating(false)
    }
  }

  const updateUser = async (id: string, updates: Partial<AdminUser>) => {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    await refreshUsers()
  }

  const deleteUser = async (id: string) => {
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    await refreshUsers()
  }

  // While user is loading, render nothing to avoid any admin UI flash
  if (isLoading) {
    return (
      <AuthenticatedLayout>
        {/* Intentionally render hidden node to satisfy required children */}
        <span className="hidden" />
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-6 space-y-8 p-4 sm:p-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          {user?.role === "admin" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">User Dashboard</span>
              <Switch
                onCheckedChange={() => { window.location.replace("/dashboard") }}
                className="data-[state=unchecked]:bg-gray-700"
              />
            </div>
          )}
        </div>

        {blocked ? (
          <>
            {/* Access denied popup overlay and immediate redirect */}
            <ErrorModal
              isOpen={deniedOpen}
              onClose={() => setDeniedOpen(false)}
              message="Access denied. Only administrators can view this page."
            />
          </>
        ) : (
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Manage Users</CardTitle>
                      <CardDescription>Search, create, update, and delete users.</CardDescription>
                    </div>
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                      <DialogTrigger asChild>
                        <Button>Create User</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <Label>Email</Label>
                          <Input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                          <Label>Password</Label>
                          <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                          <Label>Name</Label>
                          <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                          <Label>Role</Label>
                          <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button onClick={async () => { await createUser(); setCreateOpen(false); }} disabled={creating}>Create</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-3">
                    <Input placeholder="Search email/name/org" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <Button onClick={refreshUsers} disabled={loadingUsers}>Search</Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th className="p-2">Email</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Organization</th>
                          <th className="p-2">Role</th>
                          <th className="p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} className="border-t">
                            <td className="p-2">{u.email}</td>
                            <td className="p-2">
                              <Input defaultValue={u.name || ''} onBlur={(e) => updateUser(u.id, { name: e.target.value })} />
                            </td>
                            <td className="p-2">
                              <Input defaultValue={u.organization || ''} onBlur={(e) => updateUser(u.id, { organization: e.target.value })} />
                            </td>
                            <td className="p-2">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                                {(u.role || 'user').toUpperCase()}
                              </span>
                            </td>
                            <td className="p-2 flex gap-2">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={u.role === 'admin'}
                                  onCheckedChange={(checked) => updateUser(u.id, { role: checked ? 'admin' : 'user' })}
                                  className="data-[state=unchecked]:bg-gray-700"
                                />
                                <span className="text-xs text-muted-foreground">Admin</span>
                              </div>
                              <Button variant="destructive" className="text-white" onClick={() => deleteUser(u.id)}>Delete</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Recent Activities</CardTitle>
                      <CardDescription>Real-time feed of actions across the platform.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search activities..."
                          className="pl-8 w-[200px] or w-[300px]"
                          value={activitySearch}
                          onChange={(e) => setActivitySearch(e.target.value)}
                        />
                      </div>
                      <Select value={activityFilter} onValueChange={setActivityFilter}>
                        <SelectTrigger className="w-[150px]">
                          <Filter className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Activities</SelectItem>
                          <SelectItem value="notifications">Notifications</SelectItem>
                          <SelectItem value="job_ads">Job Ads</SelectItem>
                          <SelectItem value="talent_lists">Talent Lists</SelectItem>
                          <SelectItem value="job_trackers">Trackers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingAnalytics ? (
                    <div className="flex justify-center py-8">Loading activities...</div>
                  ) : (
                    <ActivityFeed
                      data={analytics?.latest}
                      filter={activityFilter}
                      search={activitySearch}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Global Analytics</CardTitle>
                  <CardDescription>Key usage metrics across the project.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAnalytics ? (
                    <div>Loading...</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <Stat label="Registered Users" value={analytics?.stats?.users} />
                      <Stat label="Job Postings" value={analytics?.stats?.job_ads} />
                      <Stat label="JD Trackers" value={analytics?.stats?.job_trackers} />
                      <Stat label="Candidate Records" value={analytics?.stats?.candidates} />
                      <Stat label="Emails Sent" value={analytics?.stats?.email_communications} />
                      <Stat label="Interview Schedules" value={analytics?.stats?.interview_batches} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AuthenticatedLayout>
  )
}

function Stat({ label, value }: { label: string, value: number }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{Number(value || 0)}</div>
    </div>
  )
}

function ActivityFeed({ data, filter, search }: { data: any, filter: string, search: string }) {
  if (!data) return <div className="text-center py-8 text-muted-foreground">No activity data available.</div>

  // Merge and normalize data
  const activities = [
    ...(data.notifications || []).map((i: any) => ({ ...i, category: 'notifications', label: 'Notification', icon: Bell, title: i.message, details: i.type })),
    ...(data.job_ads || []).map((i: any) => ({ ...i, category: 'job_ads', label: 'Job Ad', icon: Briefcase, title: i.job_title, details: 'Created new job ad' })),
    ...(data.talent_lists || []).map((i: any) => ({ ...i, category: 'talent_lists', label: 'Talent List', icon: Users, title: i.job_title, details: `Candidate count: ${i.candidate_count || 0}` })),
    ...(data.job_trackers || []).map((i: any) => ({ ...i, category: 'job_trackers', label: 'Tracker', icon: FileText, title: i.brief_name, details: i.role_name })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Filter
  const filtered = activities.filter(item => {
    if (filter !== 'all' && item.category !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        item.title?.toLowerCase().includes(s) ||
        item.user_name?.toLowerCase().includes(s) ||
        item.user_email?.toLowerCase().includes(s) ||
        item.details?.toLowerCase().includes(s)
      )
    }
    return true
  })

  if (filtered.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No activities found matching your criteria.</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>User</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item, idx) => {
            const Icon = item.icon
            return (
              <TableRow key={`${item.category}-${item.id}-${idx}`}>
                <TableCell>
                  <div className={`p-2 rounded-full w-fit ${item.category === 'notifications' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      item.category === 'job_ads' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        item.category === 'talent_lists' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://avatar.vercel.sh/${item.user_email}`} />
                      <AvatarFallback>{item.user_name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.user_name || 'Unknown User'}</span>
                      <span className="text-xs text-muted-foreground">{item.user_email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    <Badge variant="outline" className="w-fit mt-1 text-[10px]">{item.label}</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.details}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}