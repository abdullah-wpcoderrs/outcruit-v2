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

  const [analytics, setAnalytics] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

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
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

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
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Users</CardTitle>
                  <CardDescription>Search, create, update, and delete users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-3">
                    <Input placeholder="Search email/name/org" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <Button onClick={refreshUsers} disabled={loadingUsers}>Search</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label>Email</Label>
                      <Input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                      <Label>Password</Label>
                      <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                      <Label>Name</Label>
                      <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                      <Label>Role</Label>
                      <Input value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} />
                      <Button onClick={createUser} disabled={creating}>Create User</Button>
                    </div>

                    <div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left">
                              <th className="p-2">Email</th>
                              <th className="p-2">Name</th>
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
                                  <Input defaultValue={u.role || 'user'} onBlur={(e) => updateUser(u.id, { role: e.target.value })} />
                                </td>
                                <td className="p-2 flex gap-2">
                                  <Button variant="outline" onClick={() => updateUser(u.id, { role: (u.role === 'admin' ? 'user' : 'admin') })}>
                                    Toggle Admin
                                  </Button>
                                  <Button variant="destructive" onClick={() => deleteUser(u.id)}>Delete</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest actions across users and workflows.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAnalytics ? (
                    <div>Loading...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">Notifications</h3>
                        <ul className="space-y-2">
                          {analytics?.latest?.notifications?.map((n: any) => (
                            <li key={n.id} className="text-sm">[{n.type}] {n.message}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Job Ads</h3>
                        <ul className="space-y-2">
                          {analytics?.latest?.job_ads?.map((j: any) => (
                            <li key={j.id} className="text-sm">{j.job_title}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Talent Lists</h3>
                        <ul className="space-y-2">
                          {analytics?.latest?.talent_lists?.map((t: any) => (
                            <li key={t.id} className="text-sm">{t.job_title}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Trackers</h3>
                        <ul className="space-y-2">
                          {analytics?.latest?.job_trackers?.map((tr: any) => (
                            <li key={tr.id} className="text-sm">{tr.brief_name} – {tr.role_name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Global Analytics</CardTitle>
                  <CardDescription>Usage metrics across the entire project.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAnalytics ? (
                    <div>Loading...</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Stat label="Users" value={analytics?.stats?.users} />
                      <Stat label="Notifications" value={analytics?.stats?.notifications} />
                      <Stat label="Job Ads" value={analytics?.stats?.job_ads} />
                      <Stat label="Talent Lists" value={analytics?.stats?.talent_lists} />
                      <Stat label="Trackers" value={analytics?.stats?.job_trackers} />
                      <Stat label="Candidates" value={analytics?.stats?.candidates} />
                      <Stat label="Emails" value={analytics?.stats?.email_communications} />
                      <Stat label="Interview Batches" value={analytics?.stats?.interview_batches} />
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