import React, { useMemo, useState } from 'react'
import { createRoundTrip, type CreateRoundTripPayload } from '../api/client'
import type { RoundTrip, DayOfWeek, TripColor } from '../types/types'
import PageLayout from '../components/layout/PageLayout'

const WEEK: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const COLORS: TripColor[] = ['BLUE', 'GREEN', 'ORANGE', 'PURPLE', 'TEAL', 'PINK', 'BROWN', 'CYAN', 'LIME', 'RED']

const COLOR_MAP = {
    BLUE: { bg: '#3b82f6', text: '#ffffff' },
    GREEN: { bg: '#10b981', text: '#ffffff' },
    ORANGE: { bg: '#f59e0b', text: '#ffffff' },
    PURPLE: { bg: '#8b5cf6', text: '#ffffff' },
    TEAL: { bg: '#14b8a6', text: '#ffffff' },
    PINK: { bg: '#ec4899', text: '#ffffff' },
    BROWN: { bg: '#92400e', text: '#ffffff' },
    CYAN: { bg: '#06b6d4', text: '#ffffff' },
    LIME: { bg: '#84cc16', text: '#1f2937' },
    RED: { bg: '#ef4444', text: '#ffffff' }
}

export default function RoundTripsPage() {
    const [payload, setPayload] = useState<CreateRoundTripPayload>({
        outboundFlightNumber: '',
        outboundOrigin: 'CMB',
        outboundDestination: '',
        outboundDepUtc: '08:00',
        outboundArrUtc: '10:00',
        inboundFlightNumber: '',
        inboundOrigin: '',
        inboundDestination: 'CMB',
        inboundDepUtc: '11:00',
        inboundArrUtc: '13:00',
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
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null) {
                const errorObj = err as { response?: { data?: { message?: string } }, message?: string };
                setError(errorObj.response?.data?.message ?? errorObj.message ?? 'Failed');
            } else {
                setError('Failed');
            }
        } finally {
            setLoading(false)
        }
    }

    const roundTripIcon = (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
    )

    return (
        <PageLayout
            title="Round Trip Management"
            subtitle="Define flight patterns, operating days, and schedules"
            icon={roundTripIcon}
        >
            <div className="page-grid">
                {/* Main Form Section */}
                <div className="form-section">
                    <div className="section-card">
                        <div className="card-header">
                            <h2>Create New Round Trip</h2>
                            <div className={`status-indicator ${loading ? 'processing' : canSubmit ? 'ready' : 'setup'}`}>
                                {loading ? 'Creating Schedule...' : canSubmit ? 'Ready to Create' : 'Setup Required'}
                            </div>
                        </div>

                        <form className="aviation-form" onSubmit={submit}>
                            {/* Flight Sections */}
                            <div className="form-sections">
                                {/* Outbound Flight */}
                                <div className="flight-section outbound">
                                    <div className="section-header">
                                        <div className="section-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M20.5 19h-17c-.55 0-1 .45-1 1s.45 1 1 1h17c.55 0 1-.45 1-1s-.45-1-1-1zM3.5 14h11c.55 0 1-.45 1-1s-.45-1-1-1h-11c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h13c.55 0 1-.45 1-1s-.45-1-1-1h-13c-.55 0-1 .45-1 1s.45 1 1 1z" />
                                            </svg>
                                        </div>
                                        <h3>Outbound Flight</h3>
                                        <div className="route-preview">
                                            {payload.outboundOrigin} → {payload.outboundDestination || '???'}
                                        </div>
                                    </div>
                                    <div className="form-grid compact">
                                        <div className="form-field">
                                            <label className="field-label">
                                                <span className="label-text">Flight Number</span>
                                                <span className="required-badge">Required</span>
                                            </label>
                                            <input
                                                className="form-input"
                                                value={payload.outboundFlightNumber}
                                                onChange={e => setPayload(p => ({ ...p, outboundFlightNumber: e.target.value }))}
                                                placeholder="UL501"
                                                required
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label className="field-label">
                                                <span className="label-text">Origin</span>
                                                <span className="required-badge">Required</span>
                                            </label>
                                            <input
                                                className="form-input"
                                                value={payload.outboundOrigin}
                                                onChange={e => setPayload(p => ({ ...p, outboundOrigin: e.target.value.toUpperCase() }))}
                                                placeholder="CMB"
                                                required
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label className="field-label">
                                                <span className="label-text">Destination</span>
                                                <span className="required-badge">Required</span>
                                            </label>
                                            <input
                                                className="form-input"
                                                value={payload.outboundDestination}
                                                onChange={e => setPayload(p => ({ ...p, outboundDestination: e.target.value.toUpperCase() }))}
                                                placeholder="DXB"
                                                required
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label className="field-label">
                                                <span className="label-text">Departure (UTC)</span>
                                                <span className="required-badge">Required</span>
                                            </label>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={payload.outboundDepUtc}
                                                onChange={e => setPayload(p => ({ ...p, outboundDepUtc: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label className="field-label">
                                                <span className="label-text">Arrival (UTC)</span>
                                                <span className="required-badge">Required</span>
                                            </label>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={payload.outboundArrUtc}
                                                onChange={e => setPayload(p => ({ ...p, outboundArrUtc: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Inbound Flight */}
                                <div className="flight-section inbound">
                                    <div className="section-header">
                                        <div className="section-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M20.5 19h-17c-.55 0-1 .45-1 1s.45 1 1 1h17c.55 0 1-.45 1-1s-.45-1-1-1zM3.5 14h11c.55 0 1-.45 1-1s-.45-1-1-1h-11c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h13c.55 0 1-.45 1-1s-.45-1-1-1h-13c-.55 0-1 .45-1 1s.45 1 1 1z" />
                                            </svg>
                                        </div>
                                        <h3>Inbound Flight</h3>
                                        <div className="route-preview">
                                            {payload.inboundOrigin || '???'} → {payload.inboundDestination}
                                        </div>
                                    </div>
                                    <div className="form-grid compact">
                                        <div className="form-field">
                                            <label className="field-label">
                                                <span className="label-text">Flight Number</span>
                                                <span className="required-badge">Required</span>
                                            </label>
                                            <input
                                                className="form-input"
                                                value={payload.inboundFlightNumber}
                                                onChange={e => setPayload(p => ({ ...p, inboundFlightNumber: e.target.value }))}
                                                placeholder="UL502"
                                                required
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label className="field-label">
                                                <span className="label-text">Origin</span>
                                                <span className="required-badge">Required</span>
                                            </label>
                                            <input
                                                className="form-input"
                                                value={payload.inboundOrigin}
                                                onChange={e => setPayload(p => ({ ...p, inboundOrigin: e.target.value.toUpperCase() }))}
                                                placeholder="DXB"
                                                required
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label className="field-label">
                                                <span className="label-text">Destination</span>
                                                <span className="required-badge">Required</span>
                                            </label>
                                            <input
                                                className="form-input"
                                                value={payload.inboundDestination}
                                                onChange={e => setPayload(p => ({ ...p, inboundDestination: e.target.value.toUpperCase() }))}
                                                placeholder="CMB"
                                                required
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label className="field-label">
                                                <span className="label-text">Departure (UTC)</span>
                                                <span className="required-badge">Required</span>
                                            </label>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={payload.inboundDepUtc}
                                                onChange={e => setPayload(p => ({ ...p, inboundDepUtc: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label className="field-label">
                                                <span className="label-text">Arrival (UTC)</span>
                                                <span className="required-badge">Required</span>
                                            </label>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={payload.inboundArrUtc}
                                                onChange={e => setPayload(p => ({ ...p, inboundArrUtc: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-field full-width">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-input"
                                                    checked={payload.inboundArrivesNextDay}
                                                    onChange={e => setPayload(p => ({ ...p, inboundArrivesNextDay: e.target.checked }))}
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="checkbox-text">Inbound arrives next day (+1d)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Operating Days */}
                            <div className="section-card">
                                <div className="section-header">
                                    <h3>Operating Days</h3>
                                    <div className="days-count">
                                        {payload.daysOfWeek.length} day{payload.daysOfWeek.length !== 1 ? 's' : ''} selected
                                    </div>
                                </div>
                                <div className="days-grid">
                                    {WEEK.map(d => (
                                        <button
                                            key={d}
                                            type="button"
                                            className={`day-chip ${payload.daysOfWeek.includes(d) ? 'active' : ''}`}
                                            onClick={() => toggleDay(d)}
                                        >
                                            {d.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Season & Visuals */}
                            <div className="form-grid">
                                <div className="section-card">
                                    <div className="section-header">
                                        <h3>Season Dates</h3>
                                    </div>
                                    <div className="form-grid compact">
                                        <div className="form-field">
                                            <label className="field-label">
                                                <span className="label-text">Season Start</span>
                                                <span className="required-badge">Required</span>
                                            </label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                value={payload.seasonStart}
                                                onChange={e => setPayload(p => ({ ...p, seasonStart: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label className="field-label">
                                                <span className="label-text">Season End</span>
                                                <span className="required-badge">Required</span>
                                            </label>
                                            <input
                                                type="date"
                                                className="form-input"
                                                value={payload.seasonEnd}
                                                onChange={e => setPayload(p => ({ ...p, seasonEnd: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="section-card">
                                    <div className="section-header">
                                        <h3>Visual Settings</h3>
                                    </div>
                                    <div className="form-field">
                                        <label className="field-label">
                                            <span className="label-text">Schedule Color</span>
                                        </label>
                                        <div className="color-grid">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    className={`color-chip ${payload.color === c ? 'active' : ''}`}
                                                    style={{
                                                        backgroundColor: COLOR_MAP[c].bg,
                                                        color: COLOR_MAP[c].text
                                                    }}
                                                    onClick={() => setPayload(p => ({ ...p, color: c }))}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Section */}
                            <div className="form-actions">
                                <button
                                    className={`submit-button large ${loading ? 'loading' : ''}`}
                                    type="submit"
                                    disabled={!canSubmit || loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="button-spinner"></div>
                                            Creating Schedule...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                            </svg>
                                            Create Round Trip Schedule
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Status Messages */}
                        {created && (
                            <div className="status-message success">
                                <div className="message-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                </div>
                                <div className="message-content">
                                    <div className="message-title">Round Trip Schedule Created</div>
                                    <div className="message-details">
                                        Schedule ID: <strong>RT-{created.id}</strong> • Use this ID when assigning to aircraft
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="status-message error">
                                <div className="message-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                    </svg>
                                </div>
                                <div className="message-content">
                                    <div className="message-title">Schedule Creation Failed</div>
                                    <div className="message-details">{error}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}