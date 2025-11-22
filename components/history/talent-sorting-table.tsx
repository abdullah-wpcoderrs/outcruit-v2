"use client"
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type TalentList = {
  id: string
  job_title: string
  candidate_count: number
  sheet_url?: string | null
  application_sheet_id?: string | null
}

type CandidateRow = {
  id: string
  row_no: number | null
  name: string | null
  email: string | null
  phone_number: string | null
  academic_qualification: string | null
  residential_address: string | null
  gender: string | null
  role_applying_for: string | null
  application_sheet_id: string | null
}

export function TalentSortingTable() {
  const [lists, setLists] = useState<TalentList[]>([])
  const [selectedListId, setSelectedListId] = useState<string>('')
  const [items, setItems] = useState<CandidateRow[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [gender, setGender] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/talent-lists')
      if (res.ok) {
        const data = await res.json()
        setLists(data)
        const first = data[0]?.id
        if (first) setSelectedListId(first)
      }
    })()
  }, [])

  useEffect(() => {
    if (!selectedListId) return
    ;(async () => {
      setLoading(true)
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (q) params.set('q', q)
      if (gender && gender !== 'ALL') params.set('gender', gender)
      if (role) params.set('role', role)
      if (status && status !== 'ALL') params.set('status', status)
      const res = await fetch(`/api/talent-lists/${selectedListId}/candidates?` + params.toString())
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
        setTotal(data.total || 0)
      }
      setLoading(false)
    })()
  }, [selectedListId, page, pageSize, q, gender, role, status])

  const currentList = useMemo(() => lists.find(l => l.id === selectedListId), [lists, selectedListId])
  const pages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])
  const sheetUrl = useMemo(() => {
    const s = currentList?.sheet_url || ''
    const id = currentList?.application_sheet_id || ''
    if (s) return s
    if (id) return `https://docs.google.com/spreadsheets/d/${id}`
    return ''
  }, [currentList])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={selectedListId} onValueChange={(v) => { setSelectedListId(v); setPage(1) }}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select list" />
          </SelectTrigger>
          <SelectContent>
            {lists.map(l => (
              <SelectItem key={l.id} value={l.id}>{l.job_title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} className="w-64" />
        <Select value={gender} onValueChange={(v) => { setGender(v); setPage(1) }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Gender" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Role" value={role} onChange={(e) => { setRole(e.target.value); setPage(1) }} className="w-48" />
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="Passed">Passed</SelectItem>
            <SelectItem value="Not Qualified">Not Qualified</SelectItem>
          </SelectContent>
        </Select>
        {!!sheetUrl && (
          <Button variant="outline" onClick={() => window.open(sheetUrl, '_blank')}>Open Sheet</Button>
        )}
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-x-auto px-[5px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">S/N</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone no.</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Residential Address</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Sheet url</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center">Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center">No candidates</TableCell></TableRow>
            ) : (
              items.map(it => (
                <TableRow key={it.id}>
                  <TableCell>{it.row_no ?? ''}</TableCell>
                  <TableCell>{it.name ?? ''}</TableCell>
                  <TableCell>{it.email ?? ''}</TableCell>
                  <TableCell>{it.phone_number ?? ''}</TableCell>
                  <TableCell>{it.academic_qualification ?? ''}</TableCell>
                  <TableCell>{it.residential_address ?? ''}</TableCell>
                  <TableCell>{it.gender ?? ''}</TableCell>
                  <TableCell>{it.role_applying_for ?? ''}</TableCell>
                  <TableCell>
                    {sheetUrl ? (
                      <Button size="sm" variant="ghost" onClick={() => window.open(sheetUrl, '_blank')}>Open</Button>
                    ) : ''}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v)); setPage(1) }}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
          <span>{page} / {pages}</span>
          <Button variant="outline" disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>Next</Button>
        </div>
      </div>
    </div>
  )
}