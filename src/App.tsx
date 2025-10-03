import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { fetchGantt } from './api/client'
import type { GanttResponse } from './types'
import GanttChart from './components/GanttChart'

export default function App() {
  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'))
  const [data, setData] = useState<GanttResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async (d: string) => {
    setLoading(true); setError(null)
    try {
      const res = await fetchGantt(d)
      setData(res)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(date) }, []) // initial

  return (
    <div className="page">
      <header className="header">
        <h1>Weekly Flight Schedule (CMB Local)</h1>
        <div className="controls">
          <label>Week date:&nbsp;
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
          </label>
          <button onClick={() => load(date)} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
          {data && (
            <div className="week-range">
              {dayjs(data.weekStart).format('DD MMM YYYY')} – {dayjs(data.weekEnd).format('DD MMM YYYY')}
            </div>
          )}
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      {!loading && data && data.aircraft.length === 0 && (
        <div className="empty">No aircraft assigned for this week.</div>
      )}

      {/* Render ALL aircraft, stacked */}
      {data?.aircraft.map(a => (
        <section key={a.aircraftId} className="aircraft-section">
          <div className="aircraft-heading">
            <div className="aircraft-tail">{a.tail}</div>
            <div className="aircraft-meta">Aircraft ID: {a.aircraftId}</div>
          </div>
          <GanttChart aircraft={a} />
        </section>
      ))}
    </div>
  )
}
