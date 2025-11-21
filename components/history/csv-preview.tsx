"use client"
import { useEffect, useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function CsvPreview({ fileId }: { fileId: string }) {
  const [rows, setRows] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [isCsv, setIsCsv] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  function parseCsv(text: string): string[][] {
    const rows: string[][] = []
    let i = 0
    const len = text.length
    let row: string[] = []
    let cell = ''
    let inQuotes = false
    while (i < len) {
      const ch = text[i]
      const next = i + 1 < len ? text[i + 1] : ''
      if (inQuotes) {
        if (ch === '"' && next === '"') { cell += '"'; i += 2; continue }
        if (ch === '"') { inQuotes = false; i++; continue }
        cell += ch
        i++
      } else {
        if (ch === '"') { inQuotes = true; i++; continue }
        if (ch === ',') { row.push(cell); cell = ''; i++; continue }
        if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell=''; i++; continue }
        if (ch === '\r' && next === '\n') { row.push(cell); rows.push(row); row = []; cell=''; i+=2; continue }
        cell += ch
        i++
      }
    }
    row.push(cell)
    rows.push(row)
    return rows
  }

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/files/${fileId}`)
        const ct = res.headers.get('Content-Type') || ''
        const text = await res.text()
        const data = parseCsv(text).filter(r => r.length > 0)
        if (data.length > 0) {
            const [first, ...rest] = data
            setHeaders(first)
            setRows(rest)
            const looksCsv = (first.length > 1) || ct.includes('text/csv') || ct.includes('csv')
            setIsCsv(looksCsv)
            return
        }
        setError('Unable to parse CSV')
      } catch (e: any) {
        setError('Failed to load file')
      }
    })()
  }, [fileId])

  const grid = useMemo(() => ({ headers, rows }), [headers, rows])

  if (error) {
    return <div className="p-4 text-sm text-destructive">{error}</div>
  }
  if (!isCsv) {
    return <iframe src={`/api/files/${fileId}`} className="w-full h-full" title="Document" />
  }

  return (
    <div className="w-full h-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {grid.headers.map((h, i) => (
              <TableHead key={i} className="min-w-40">{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {grid.rows.map((r, ri) => (
            <TableRow key={ri}>
              {grid.headers.map((_, ci) => (
                <TableCell key={ci} className="whitespace-pre-wrap">{r?.[ci] ?? ''}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}