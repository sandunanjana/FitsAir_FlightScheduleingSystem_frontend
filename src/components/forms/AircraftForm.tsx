import React, { useState } from 'react'
import { createAircraft } from '../../api/client'
import type { Aircraft } from '../../types'

export default function AircraftForm() {
    const [tail, setTail] = useState('')
    const [type, setType] = useState('')
    const [created, setCreated] = useState<Aircraft | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setError(null); setCreated(null)
        try {
            const res = await createAircraft({ tail, type: type || undefined })
            setCreated(res)
            setTail(''); setType('')
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err.message ?? 'Failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card">
            <h2>Create Aircraft</h2>
            <form className="form" onSubmit={submit}>
                <label>
                    Tail
                    <input value={tail} onChange={e => setTail(e.target.value)} placeholder="A320-A1" required />
                </label>
                <label>
                    Type
                    <input value={type} onChange={e => setType(e.target.value)} placeholder="A320" />
                </label>
                <button className="primary" type="submit" disabled={loading}>
                    {loading ? 'Saving…' : 'Create'}
                </button>
            </form>

            {created && (
                <div className="success">
                    ✔ Created aircraft <b>{created.tail}</b> (id: {created.id})
                </div>
            )}
            {error && <div className="error">{error}</div>}
        </div>
    )
}
