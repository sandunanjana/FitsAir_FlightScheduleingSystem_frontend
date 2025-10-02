import React, { useEffect, useState } from 'react'
import { assignRoundTrip, listAircraft } from '../../api/client'
import type { Aircraft, Assignment } from '../../types'

export default function AssignForm() {
    const [aircraft, setAircraft] = useState<Aircraft[]>([])
    const [aircraftId, setAircraftId] = useState<number | ''>('')
    const [roundTripId, setRoundTripId] = useState<number | ''>('')
    const [minTurn, setMinTurn] = useState<number | ''>('')
    const [created, setCreated] = useState<Assignment | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        listAircraft().then(setAircraft).catch(() => { })
    }, [])

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (aircraftId === '' || roundTripId === '') return
        setLoading(true); setError(null); setCreated(null)
        try {
            const res = await assignRoundTrip({
                aircraftId: Number(aircraftId),
                roundTripId: Number(roundTripId),
                minTurnaroundMins: minTurn === '' ? undefined : Number(minTurn)
            })
            setCreated(res)
            setRoundTripId(''); setMinTurn('')
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err.message ?? 'Failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card">
            <h2>Assign Round Trip to Aircraft</h2>
            <form className="form" onSubmit={submit}>
                <label>
                    Aircraft
                    <select value={aircraftId} onChange={e => setAircraftId(e.target.value ? Number(e.target.value) : '')} required>
                        <option value="">Select aircraft…</option>
                        {aircraft.map(a => <option key={a.id} value={a.id}>{a.tail}</option>)}
                    </select>
                </label>

                <label>
                    Round Trip ID
                    <input type="number" value={roundTripId} onChange={e => setRoundTripId(e.target.value ? Number(e.target.value) : '')} placeholder="e.g., 1" required />
                </label>

                <label>
                    Min Turnaround (mins)
                    <input type="number" min={0} value={minTurn} onChange={e => setMinTurn(e.target.value ? Number(e.target.value) : '')} placeholder="optional" />
                </label>

                <button className="primary" type="submit" disabled={loading}>
                    {loading ? 'Assigning…' : 'Assign'}
                </button>
            </form>

            {created && (
                <div className="success">
                    ✔ Assigned RT-{created.roundTrip.id} to <b>{created.aircraft.tail}</b>.
                </div>
            )}
            {error && <div className="error">{error}</div>}
        </div>
    )
}
