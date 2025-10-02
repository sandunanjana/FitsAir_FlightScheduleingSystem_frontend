import React, { useMemo, useState } from 'react'
import { createRoundTrip, type CreateRoundTripPayload } from '../../api/client'
import type { RoundTrip, DayOfWeek, TripColor } from '../../types'

const WEEK: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const COLORS: TripColor[] = ['BLUE', 'GREEN', 'ORANGE', 'PURPLE', 'TEAL', 'PINK', 'BROWN', 'CYAN', 'LIME', 'RED']

export default function RoundTripForm() {
    const [payload, setPayload] = useState<CreateRoundTripPayload>({
        outboundFlightNumber: '',
        outboundOrigin: 'CMB',
        outboundDestination: '',
        outboundDepUtc: '00:00',
        outboundArrUtc: '00:00',
        inboundFlightNumber: '',
        inboundOrigin: '',
        inboundDestination: 'CMB',
        inboundDepUtc: '00:00',
        inboundArrUtc: '00:00',
        daysOfWeek: [],
        seasonStart: '',
        seasonEnd: '',
        color: 'BLUE',
        inboundArrivesNextDay: false
    })
    const [created, setCreated] = useState<RoundTrip | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const toggleDay = (d: DayOfWeek) => {
        setPayload(p => ({
            ...p,
            daysOfWeek: p.daysOfWeek.includes(d) ? p.daysOfWeek.filter(x => x !== d) : [...p.daysOfWeek, d]
        }))
    }

    const canSubmit = useMemo(() =>
        payload.outboundFlightNumber && payload.inboundFlightNumber &&
        payload.outboundOrigin && payload.outboundDestination &&
        payload.inboundOrigin && payload.inboundDestination &&
        payload.seasonStart && payload.seasonEnd && payload.daysOfWeek.length > 0
        , [payload])

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!canSubmit) return
        setLoading(true); setError(null); setCreated(null)
        try {
            const res = await createRoundTrip(payload)
            setCreated(res)
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err.message ?? 'Failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card">
            <h2>Create Round Trip</h2>
            <form className="form grid-2" onSubmit={submit}>
                <fieldset>
                    <legend>Outbound</legend>
                    <label>Flight No<input value={payload.outboundFlightNumber} onChange={e => setPayload(p => ({ ...p, outboundFlightNumber: e.target.value }))} required /></label>
                    <label>Origin<input value={payload.outboundOrigin} onChange={e => setPayload(p => ({ ...p, outboundOrigin: e.target.value.toUpperCase() }))} required /></label>
                    <label>Destination<input value={payload.outboundDestination} onChange={e => setPayload(p => ({ ...p, outboundDestination: e.target.value.toUpperCase() }))} required /></label>
                    <label>Dep (UTC)<input type="time" value={payload.outboundDepUtc} onChange={e => setPayload(p => ({ ...p, outboundDepUtc: e.target.value }))} required /></label>
                    <label>Arr (UTC)<input type="time" value={payload.outboundArrUtc} onChange={e => setPayload(p => ({ ...p, outboundArrUtc: e.target.value }))} required /></label>
                </fieldset>

                <fieldset>
                    <legend>Inbound</legend>
                    <label>Flight No<input value={payload.inboundFlightNumber} onChange={e => setPayload(p => ({ ...p, inboundFlightNumber: e.target.value }))} required /></label>
                    <label>Origin<input value={payload.inboundOrigin} onChange={e => setPayload(p => ({ ...p, inboundOrigin: e.target.value.toUpperCase() }))} required /></label>
                    <label>Destination<input value={payload.inboundDestination} onChange={e => setPayload(p => ({ ...p, inboundDestination: e.target.value.toUpperCase() }))} required /></label>
                    <label>Dep (UTC)<input type="time" value={payload.inboundDepUtc} onChange={e => setPayload(p => ({ ...p, inboundDepUtc: e.target.value }))} required /></label>
                    <label>Arr (UTC)<input type="time" value={payload.inboundArrUtc} onChange={e => setPayload(p => ({ ...p, inboundArrUtc: e.target.value }))} required /></label>
                    <label className="checkbox">
                        <input type="checkbox"
                            checked={payload.inboundArrivesNextDay}
                            onChange={e => setPayload(p => ({ ...p, inboundArrivesNextDay: e.target.checked }))} />
                        &nbsp;Inbound arrives next day (+1d)
                    </label>
                </fieldset>

                <fieldset className="span-2">
                    <legend>Operating Days</legend>
                    <div className="days">
                        {WEEK.map(d => (
                            <label key={d} className={`chip ${payload.daysOfWeek.includes(d) ? 'active' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={payload.daysOfWeek.includes(d)}
                                    onChange={() => toggleDay(d)}
                                />
                                {d.slice(0, 3)}
                            </label>
                        ))}
                    </div>
                </fieldset>

                <fieldset>
                    <legend>Season</legend>
                    <label>Start<input type="date" value={payload.seasonStart} onChange={e => setPayload(p => ({ ...p, seasonStart: e.target.value }))} required /></label>
                    <label>End<input type="date" value={payload.seasonEnd} onChange={e => setPayload(p => ({ ...p, seasonEnd: e.target.value }))} required /></label>
                </fieldset>

                <fieldset>
                    <legend>Visuals</legend>
                    <label>Color
                        <select value={payload.color} onChange={e => setPayload(p => ({ ...p, color: e.target.value as TripColor }))}>
                            {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </label>
                </fieldset>

                <div className="span-2 actions">
                    <button className="primary" type="submit" disabled={!canSubmit || loading}>
                        {loading ? 'Saving…' : 'Create Round Trip'}
                    </button>
                </div>
            </form>

            {created && (
                <div className="success">
                    ✔ Created Round Trip <b>RT-{created.id}</b>. Use this ID when assigning to an aircraft.
                </div>
            )}
            {error && <div className="error">{error}</div>}
        </div>
    )
}
