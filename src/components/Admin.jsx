import React, { useEffect, useMemo, useState } from 'react'
import { AxiosClient } from '../utils/AxiosClient'

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#f59e0b', '#06b6d4']

function DonutChart({ data }) {
  const total = useMemo(() => Object.values(data).reduce((s, v) => s + v, 0), [data])
  const segments = useMemo(() => {
    let acc = 0
    const entries = Object.entries(data)
    return entries.map(([key, value], idx) => {
      const pct = total === 0 ? 0 : value / total
      const length = pct * 100
      const seg = { key, color: COLORS[idx % COLORS.length], dashArray: `${length} ${100 - length}`, dashOffset: -acc }
      acc += length
      return seg
    })
  }, [data, total])

  return (
    <div className='flex items-center gap-6'>
      <svg width='160' height='160' viewBox='0 0 36 36'>
        <circle cx='18' cy='18' r='16' fill='none' stroke='#1f2937' strokeWidth='4' />
        {segments.map((s) => (
          <circle key={s.key}
                  cx='18' cy='18' r='16' fill='none'
                  stroke={s.color} strokeWidth='4'
                  strokeDasharray={s.dashArray}
                  strokeDashoffset={s.dashOffset}
                  transform='rotate(-90 18 18)'
          />
        ))}
        <circle cx='18' cy='18' r='10' fill='#111827' />
        <text x='18' y='19' textAnchor='middle' fill='#e5e7eb' fontSize='5' fontWeight='600'>
          {total}
        </text>
      </svg>
      <div className='space-y-2'>
        {Object.entries(data).map(([key, value], idx) => (
          <div key={key} className='flex items-center gap-2 text-sm text-gray-200'>
            <span className='inline-block w-3 h-3 rounded' style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
            <span className='capitalize'>{key}</span>
            <span className='text-gray-400'>— {total === 0 ? 0 : Math.round((value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const Admin = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function loadReports() {
    try {
      setLoading(true)
      const res = await AxiosClient.get('/obstacles/all')
      setReports(res.result.obstacledata || [])
    } catch (e) {
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadReports() }, [])

  const byCategory = useMemo(() => {
    const counts = {}
    for (const r of reports) {
      const key = String(r.obstacleType || 'unknown')
      counts[key] = (counts[key] || 0) + 1
    }
    return counts
  }, [reports])

  async function updateStatus(id, status) {
    try {
      await AxiosClient.put(`/obstacles/${id}/status`, { status })
      setReports(prev => prev.map(r => (r._id === id ? { ...r, status } : r)))
    } catch (e) {
      setError('Failed to update status')
    }
  }

  async function reinitializeZones() {
    try {
      setInfo('Reinitializing zones...')
      await AxiosClient.post('/crowd/initialize')
      setInfo('Zones reinitialized successfully')
      setTimeout(() => setInfo(''), 2000)
    } catch (e) {
      setError('Failed to reinitialize zones')
      setTimeout(() => setError(''), 2000)
    }
  }

  const serverBase = import.meta.env.VITE_BASE_URL_SERVER

  return (
    <div className='w-[100vw] min-h-[100vh] bg-zinc-900 text-white p-6'>
      <div className='max-w-6xl mx-auto space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-semibold'>Admin Reports</h1>
          <div className='flex items-center gap-2'>
            <button onClick={reinitializeZones} className='px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500'>Reinitialize Zones</button>
            <button onClick={loadReports} className='px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700'>Refresh</button>
          </div>
        </div>

        <div className='rounded-lg border border-zinc-800 p-4'>
          <h2 className='text-lg font-medium mb-3'>Reports by Category</h2>
          <DonutChart data={byCategory} />
        </div>

        {error && <div className='text-red-400 text-sm'>{error}</div>}
        {info && <div className='text-emerald-400 text-sm'>{info}</div>}
        {loading ? (
          <div className='text-gray-300'>Loading...</div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {reports.map(r => (
              <div key={r._id} className='border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950'>
                <div className='aspect-video bg-black/30 flex items-center justify-center overflow-hidden'>
                  {r.path ? (
                    <img src={r.path} alt={r.filename} className='w-full h-full object-cover' />
                  ) : (
                    <div className='text-gray-500 text-sm'>No image</div>
                  )}
                </div>
                <div className='p-3 space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm capitalize text-gray-300'>{r.obstacleType}</span>
                    <span className='text-xs px-2 py-0.5 rounded-full border border-zinc-700 capitalize'>
                      {r.status}
                    </span>
                  </div>
                  <div className='text-xs text-gray-500'>
                    Reported by: {r.email}
                  </div>
                  <div className='flex gap-2 pt-1'>
                    <button onClick={() => updateStatus(r._id, 'resolved')} className='flex-1 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-sm'>Mark Solved</button>
                    <button onClick={() => updateStatus(r._id, 'in_progress')} className='flex-1 px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-sm'>Take Action</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin


