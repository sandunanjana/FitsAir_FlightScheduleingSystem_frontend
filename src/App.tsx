import React, { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { fetchGantt } from './api/client'
import type { GanttResponse, GanttAircraftDayResponse } from './types'
import Tabs from './components/Tabs'
import GanttChart from './components/GanttChart'
import AircraftForm from './components/forms/AircraftForm'
import RoundTripForm from './components/forms/RoundTripForm'
import AssignForm from './components/forms/AssignForm'

type MainTab = 'GANTT' | 'CREATE_AIRCRAFT' | 'CREATE_RT' | 'ASSIGN'

export default function App() {
  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'))
  const [data, setData] = useState<GanttResponse | null>(null)
  const [activeAircraftId, setActiveAircraftId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<MainTab>('GANTT')

  const load = async (d: string) => {
    setLoading(true); setError(null)
    try {
      const res = await fetchGantt(d)
      setData(res)
      const firstId = res.aircraft[0]?.aircraftId ?? null
      setActiveAircraftId(prev => prev ?? firstId)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(date) }, [])

  const active: GanttAircraftDayResponse | undefined = useMemo(
    () => data?.aircraft.find(a => a.aircraftId === activeAircraftId),
    [data, activeAircraftId]
  )

  return (
    <div className="page">
      <header className="header">
        <h1>Flight Schedule Console (CMB Local)</h1>
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
        <div className="main-tabs">
          <button className={tab==='GANTT' ? 'active' : ''} onClick={()=>setTab('GANTT')}>Gantt</button>
          <button className={tab==='CREATE_AIRCRAFT' ? 'active' : ''} onClick={()=>setTab('CREATE_AIRCRAFT')}>Create Aircraft</button>
          <button className={tab==='CREATE_RT' ? 'active' : ''} onClick={()=>setTab('CREATE_RT')}>Create Round Trip</button>
          <button className={tab==='ASSIGN' ? 'active' : ''} onClick={()=>setTab('ASSIGN')}>Assign</button>
        </div>
      </header>

      {tab === 'GANTT' && (
        <>
          {error && <div className="error">{error}</div>}
          {data && data.aircraft.length > 0 ? (
            <>
              <Tabs
                tabs={data.aircraft.map(a => ({ id: a.aircraftId, label: a.tail }))}
                activeId={activeAircraftId ?? data.aircraft[0].aircraftId}
                onChange={(id) => setActiveAircraftId(id as number)}
              />
              {active && <GanttChart aircraft={active} />}
            </>
          ) : !loading && <div className="empty">No aircraft assigned for this week.</div>}
        </>
      )}

      {tab === 'CREATE_AIRCRAFT' && <AircraftForm />}
      {tab === 'CREATE_RT' && <RoundTripForm />}
      {tab === 'ASSIGN' && <AssignForm />}
    </div>
  )
}
