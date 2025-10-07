import React, { useState } from "react";
import { createAircraft } from "../api/client";
import type { Aircraft } from "../types/types";
import PageLayout from "../components/layout/PageLayout";

export default function AircraftPage() {
    const [tail, setTail] = useState("");
    const [type, setType] = useState("");
    const [created, setCreated] = useState<Aircraft | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(null); setCreated(null);
        try {
            const res = await createAircraft({ tail: tail.trim(), type: type.trim() || undefined });
            setCreated(res);
            setTail(""); setType("");
        } catch (err: unknown) {
            if (err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "data" in err.response && err.response.data && typeof err.response.data === "object" && "message" in err.response.data) {
                setError((err as { response: { data: { message?: string } } }).response.data.message ?? "Failed");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const aircraftIcon = (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 16V14L13.5 9L10.5 11L2 7V9L10.5 13L13.5 11L22 16Z" />
        </svg>
    );

    return (
        <PageLayout
            title="Aircraft Fleet Management"
            subtitle="Register and manage aircraft in the operational fleet"
            icon={aircraftIcon}
        >
            <section className="card">
                <header className="card__head">
                    <h2>Register New Aircraft</h2>
                    <span className={`status ${loading ? "is-busy" : "is-ok"}`}>
                        {loading ? "Processing…" : "System Ready"}
                    </span>
                </header>

                <form className="form" onSubmit={submit}>
                    <div className="grid grid--2">
                        <label className="field">
                            <span className="field__label">Tail Number <span className="req">*</span></span>
                            <div className="field__control">
                                <input
                                    className="input"
                                    value={tail}
                                    onChange={e => setTail(e.target.value.toUpperCase())}
                                    placeholder="N320US"
                                    required
                                />
                            </div>
                            <small className="hint">Official registration (ICAO)</small>
                        </label>

                        <label className="field">
                            <span className="field__label">Aircraft Type</span>
                            <div className="field__control">
                                <input
                                    className="input"
                                    value={type}
                                    onChange={e => setType(e.target.value.toUpperCase())}
                                    placeholder="A320"
                                />
                            </div>
                            <small className="hint">ICAO designator (optional)</small>
                        </label>
                    </div>

                    <div className="actions">
                        <button className="btn" type="submit" disabled={loading}>
                            {loading ? "Registering…" : "Register Aircraft"}
                        </button>
                    </div>
                </form>

                {created && (
                    <div className="alert alert--success">
                        <strong>Aircraft Registered:</strong> {created.tail} • ID {created.id}
                    </div>
                )}
                {error && (
                    <div className="alert alert--error">
                        <strong>Registration Failed:</strong> {error}
                    </div>
                )}
            </section>

            <aside className="card">
                <h3>Registration Guidelines</h3>
                <ul className="list">
                    <li>Use official ICAO registration format</li>
                    <li>Type is optional but recommended</li>
                    <li>Tail number must be unique</li>
                    <li>Contact operations for special cases</li>
                </ul>
            </aside>
        </PageLayout>
    );
}
