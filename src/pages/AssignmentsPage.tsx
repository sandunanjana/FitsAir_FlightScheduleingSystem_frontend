import React, { useEffect, useState } from "react";
import { assignRoundTrip, listAircraft } from "../api/client";
import type { Aircraft, Assignment } from "../types/types";
import PageLayout from "../components/layout/PageLayout";

export default function AssignmentsPage() {
    const [aircraft, setAircraft] = useState<Aircraft[]>([]);
    const [aircraftId, setAircraftId] = useState<number | "">("");
    const [roundTripId, setRoundTripId] = useState<number | "">("");
    const [minTurn, setMinTurn] = useState<number | "">("");
    const [created, setCreated] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listAircraft().then(setAircraft).catch(() => { });
    }, []);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (aircraftId === "" || roundTripId === "") return;
        setLoading(true); setError(null); setCreated(null);
        try {
            const res = await assignRoundTrip({
                aircraftId: Number(aircraftId),
                roundTripId: Number(roundTripId),
                minTurnaroundMins: minTurn === "" ? undefined : Number(minTurn),
            });
            setCreated(res);
            setRoundTripId(""); setMinTurn("");
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? "Failed");
        } finally {
            setLoading(false);
        }
    };

    const icon = (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7" />
            <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7" />
        </svg>
    );

    const selected = aircraftId === "" ? undefined : aircraft.find(a => a.id === Number(aircraftId));

    return (
        <PageLayout
            title="Aircraft Assignment"
            subtitle="Assign round trips to aircraft with turnaround requirements"
            icon={icon}
        >
            <section className="card">
                <header className="card__head">
                    <h2>Create Assignment</h2>
                    <span className={`status ${loading ? "is-busy" : aircraft.length ? "is-ok" : "is-warn"}`}>
                        {loading ? "Processing…" : aircraft.length ? `${aircraft.length} in fleet` : "Loading fleet…"}
                    </span>
                </header>

                <form className="form" onSubmit={submit}>
                    <div className="grid grid--3">
                        <label className="field">
                            <span className="field__label">Aircraft <span className="req">*</span></span>
                            <select
                                className="input"
                                value={aircraftId}
                                onChange={e => setAircraftId(e.target.value ? Number(e.target.value) : "")}
                                required
                            >
                                <option value="">Select aircraft…</option>
                                {aircraft.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.tail}{a.type ? ` (${a.type})` : ""}
                                    </option>
                                ))}
                            </select>
                            {selected && <small className="hint">Selected: {selected.tail}{selected.type ? ` • ${selected.type}` : ""}</small>}
                        </label>

                        <label className="field">
                            <span className="field__label">Round Trip ID <span className="req">*</span></span>
                            <input
                                className="input"
                                type="number"
                                min={1}
                                value={roundTripId}
                                onChange={e => setRoundTripId(e.target.value ? Number(e.target.value) : "")}
                                placeholder="e.g. 42"
                                required
                            />
                        </label>

                        <label className="field">
                            <span className="field__label">Min Turnaround (min)</span>
                            <input
                                className="input"
                                type="number"
                                min={0}
                                value={minTurn}
                                onChange={e => setMinTurn(e.target.value ? Number(e.target.value) : "")}
                                placeholder="Optional"
                            />
                        </label>
                    </div>

                    <div className="actions">
                        <button className="btn" type="submit" disabled={loading || aircraftId === "" || roundTripId === ""}>
                            {loading ? "Assigning…" : "Confirm Assignment"}
                        </button>
                    </div>
                </form>

                {created && (
                    <div className="alert alert--success">
                        <strong>Assigned:</strong> RT-{created.roundTrip.id} → {created.aircraft.tail}
                        {created.minTurnaroundMins ? ` • Turnaround ${created.minTurnaroundMins}m` : ""}
                    </div>
                )}
                {error && (
                    <div className="alert alert--error">
                        <strong>Assignment Failed:</strong> {error}
                    </div>
                )}
            </section>

            <aside className="card">
                <h3>Tips</h3>
                <ul className="list">
                    <li>Use turnaround to ensure ground servicing time.</li>
                    <li>Avoid overlapping schedules per tail.</li>
                    <li>Keep RT IDs handy from the Round Trips page.</li>
                </ul>
            </aside>
        </PageLayout>
    );
}
