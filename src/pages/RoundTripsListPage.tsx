import { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import { listRoundTrips, deleteRoundTrip, updateRoundTrip } from "../api/client";
import type { RoundTrip, DayOfWeek, TripColor } from "../types/types";

const WEEK: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const COLORS: TripColor[] = ['BLUE', 'GREEN', 'ORANGE', 'PURPLE', 'TEAL', 'PINK', 'BROWN', 'CYAN', 'LIME', 'RED'];

type EditModel = {
    outboundFlightNumber: string;
    outboundOrigin: string;
    outboundDestination: string;
    outboundDepUtc: string;
    outboundArrUtc: string;

    inboundFlightNumber: string;
    inboundOrigin: string;
    inboundDestination: string;
    inboundDepUtc: string;
    inboundArrUtc: string;

    daysOfWeek: DayOfWeek[];
    seasonStart: string; // YYYY-MM-DD
    seasonEnd: string;   // YYYY-MM-DD
    color: TripColor;
    inboundArrivesNextDay?: boolean;
};

export default function RoundTripsListPage() {
    const [items, setItems] = useState<RoundTrip[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // edit state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [draft, setDraft] = useState<EditModel | null>(null);
    const [busy, setBusy] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    const reload = async () => {
        setLoading(true); setError(null);
        try {
            setItems(await listRoundTrips());
        } catch (e: unknown) {
            if (e instanceof Error) setError(e.message);
            else setError("Failed");
        } finally { setLoading(false); }
    };
    useEffect(() => { reload(); }, []);

    const beginEdit = (rt: RoundTrip) => {
        setEditingId(rt.id);
        setDraft({
            outboundFlightNumber: rt.outbound.flightNumber,
            outboundOrigin: rt.outbound.origin,
            outboundDestination: rt.outbound.destination,
            outboundDepUtc: rt.outbound.departureUtc,
            outboundArrUtc: rt.outbound.arrivalUtc,

            inboundFlightNumber: rt.inbound.flightNumber,
            inboundOrigin: rt.inbound.origin,
            inboundDestination: rt.inbound.destination,
            inboundDepUtc: rt.inbound.departureUtc,
            inboundArrUtc: rt.inbound.arrivalUtc,

            daysOfWeek: [...rt.daysOfWeek],
            seasonStart: rt.seasonStart,
            seasonEnd: rt.seasonEnd,
            color: rt.color,
            // if you store this on backend: use a property from your entity;
            // here we default to false unless your backend returns something else on the read
            inboundArrivesNextDay: false,
        });
        setEditError(null);
    };
    const cancelEdit = () => {
        setEditingId(null);
        setDraft(null);
        setEditError(null);
        setBusy(false);
    };

    const toggleDay = (d: DayOfWeek) => {
        if (!draft) return;
        setDraft({
            ...draft,
            daysOfWeek: draft.daysOfWeek.includes(d)
                ? draft.daysOfWeek.filter(x => x !== d)
                : [...draft.daysOfWeek, d],
        });
    };

    const canSave = useMemo(() => {
        if (!draft) return false;
        const f = draft;
        return !!(
            f.outboundFlightNumber &&
            f.outboundOrigin && f.outboundDestination &&
            f.inboundFlightNumber &&
            f.inboundOrigin && f.inboundDestination &&
            f.outboundDepUtc && f.outboundArrUtc &&
            f.inboundDepUtc && f.inboundArrUtc &&
            f.seasonStart && f.seasonEnd &&
            f.daysOfWeek.length > 0
        );
    }, [draft]);

    const saveEdit = async () => {
        if (editingId == null || !draft) return;
        if (!canSave) { setEditError("Please fill all required fields."); return; }
        setBusy(true); setEditError(null);
        try {
            // ⚠️ If your backend expects a slightly different payload, adjust here.
            await updateRoundTrip(editingId, {
                outboundFlightNumber: draft.outboundFlightNumber,
                outboundOrigin: draft.outboundOrigin,
                outboundDestination: draft.outboundDestination,
                outboundDepUtc: draft.outboundDepUtc,
                outboundArrUtc: draft.outboundArrUtc,

                inboundFlightNumber: draft.inboundFlightNumber,
                inboundOrigin: draft.inboundOrigin,
                inboundDestination: draft.inboundDestination,
                inboundDepUtc: draft.inboundDepUtc,
                inboundArrUtc: draft.inboundArrUtc,

                daysOfWeek: draft.daysOfWeek,
                seasonStart: draft.seasonStart,
                seasonEnd: draft.seasonEnd,
                color: draft.color,
                inboundArrivesNextDay: !!draft.inboundArrivesNextDay,
            });
            await reload();
            cancelEdit();
        } catch (err: any) {
            setEditError(err?.response?.data?.message ?? err?.message ?? "Update failed");
        } finally {
            setBusy(false);
        }
    };

    const removeItem = async (id: number) => {
        if (!confirm("Delete this round trip?")) return;
        await deleteRoundTrip(id);
        reload();
    };

    return (
        <PageLayout title="Round Trips" subtitle="Search, edit, and delete">
            <section className="card">
                <header className="card__head"><h2>All Round Trips</h2></header>

                {loading ? "Loading…" : error ? (
                    <div className="alert alert--error">{error}</div>
                ) : (
                    <table className="table" style={{ width: "100%" }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Outbound</th>
                                <th>Inbound</th>
                                <th>Days</th>
                                <th>Season</th>
                                <th>Color</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(rt => {
                                const isEditing = editingId === rt.id;
                                return (
                                    <tr key={rt.id}>
                                        {!isEditing && (
                                            <>
                                                <td>RT-{rt.id}</td>
                                                <td>
                                                    {rt.outbound.origin}→{rt.outbound.destination} {rt.outbound.flightNumber}{" "}
                                                    {rt.outbound.departureUtc}-{rt.outbound.arrivalUtc}
                                                </td>
                                                <td>
                                                    {rt.inbound.origin}→{rt.inbound.destination} {rt.inbound.flightNumber}{" "}
                                                    {rt.inbound.departureUtc}-{rt.inbound.arrivalUtc}
                                                </td>
                                                <td>{rt.daysOfWeek.map(d => d.slice(0, 3)).join(", ")}</td>
                                                <td>{rt.seasonStart} → {rt.seasonEnd}</td>
                                                <td>{rt.color}</td>
                                                <td style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                    <button className="btn" onClick={() => beginEdit(rt)}>Edit</button>
                                                    <button className="btn btn--danger" onClick={() => removeItem(rt.id)}>Delete</button>
                                                </td>
                                            </>
                                        )}

                                        {isEditing && draft && (
                                            <td colSpan={7}>
                                                <div className="card" style={{ marginTop: 8 }}>
                                                    <div className="card-header" style={{ marginBottom: 12 }}>
                                                        <h3 style={{ margin: 0 }}>Edit Round Trip RT-{rt.id}</h3>
                                                        <div className={`status ${busy ? "is-busy" : canSave ? "is-ok" : "is-warn"}`}>
                                                            {busy ? "Saving…" : canSave ? "Ready" : "Missing fields"}
                                                        </div>
                                                    </div>

                                                    {/* Outbound / Inbound blocks */}
                                                    <div className="form-grid">
                                                        {/* Outbound */}
                                                        <div className="section-card">
                                                            <div className="section-header">
                                                                <h3>Outbound</h3>
                                                                <div className="route-preview">
                                                                    {draft.outboundOrigin} → {draft.outboundDestination || "???"}
                                                                </div>
                                                            </div>
                                                            <div className="form-grid compact">
                                                                <div className="form-field">
                                                                    <label className="field-label"><span className="label-text">Flight Number</span></label>
                                                                    <input className="form-input"
                                                                        value={draft.outboundFlightNumber}
                                                                        onChange={e => setDraft({ ...draft, outboundFlightNumber: e.target.value })}
                                                                        placeholder="UL501"
                                                                        required />
                                                                </div>
                                                                <div className="form-field">
                                                                    <label className="field-label"><span className="label-text">Origin</span></label>
                                                                    <input className="form-input"
                                                                        value={draft.outboundOrigin}
                                                                        onChange={e => setDraft({ ...draft, outboundOrigin: e.target.value.toUpperCase() })}
                                                                        placeholder="CMB"
                                                                        required />
                                                                </div>
                                                                <div className="form-field">
                                                                    <label className="field-label"><span className="label-text">Destination</span></label>
                                                                    <input className="form-input"
                                                                        value={draft.outboundDestination}
                                                                        onChange={e => setDraft({ ...draft, outboundDestination: e.target.value.toUpperCase() })}
                                                                        placeholder="DXB"
                                                                        required />
                                                                </div>
                                                                <div className="form-field">
                                                                    <label className="field-label"><span className="label-text">Dep (UTC)</span></label>
                                                                    <input type="time" className="form-input"
                                                                        value={draft.outboundDepUtc}
                                                                        onChange={e => setDraft({ ...draft, outboundDepUtc: e.target.value })}
                                                                        required />
                                                                </div>
                                                                <div className="form-field">
                                                                    <label className="field-label"><span className="label-text">Arr (UTC)</span></label>
                                                                    <input type="time" className="form-input"
                                                                        value={draft.outboundArrUtc}
                                                                        onChange={e => setDraft({ ...draft, outboundArrUtc: e.target.value })}
                                                                        required />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Inbound */}
                                                        <div className="section-card">
                                                            <div className="section-header">
                                                                <h3>Inbound</h3>
                                                                <div className="route-preview">
                                                                    {draft.inboundOrigin || "???"} → {draft.inboundDestination}
                                                                </div>
                                                            </div>
                                                            <div className="form-grid compact">
                                                                <div className="form-field">
                                                                    <label className="field-label"><span className="label-text">Flight Number</span></label>
                                                                    <input className="form-input"
                                                                        value={draft.inboundFlightNumber}
                                                                        onChange={e => setDraft({ ...draft, inboundFlightNumber: e.target.value })}
                                                                        placeholder="UL502"
                                                                        required />
                                                                </div>
                                                                <div className="form-field">
                                                                    <label className="field-label"><span className="label-text">Origin</span></label>
                                                                    <input className="form-input"
                                                                        value={draft.inboundOrigin}
                                                                        onChange={e => setDraft({ ...draft, inboundOrigin: e.target.value.toUpperCase() })}
                                                                        placeholder="DXB"
                                                                        required />
                                                                </div>
                                                                <div className="form-field">
                                                                    <label className="field-label"><span className="label-text">Destination</span></label>
                                                                    <input className="form-input"
                                                                        value={draft.inboundDestination}
                                                                        onChange={e => setDraft({ ...draft, inboundDestination: e.target.value.toUpperCase() })}
                                                                        placeholder="CMB"
                                                                        required />
                                                                </div>
                                                                <div className="form-field">
                                                                    <label className="field-label"><span className="label-text">Dep (UTC)</span></label>
                                                                    <input type="time" className="form-input"
                                                                        value={draft.inboundDepUtc}
                                                                        onChange={e => setDraft({ ...draft, inboundDepUtc: e.target.value })}
                                                                        required />
                                                                </div>
                                                                <div className="form-field">
                                                                    <label className="field-label"><span className="label-text">Arr (UTC)</span></label>
                                                                    <input type="time" className="form-input"
                                                                        value={draft.inboundArrUtc}
                                                                        onChange={e => setDraft({ ...draft, inboundArrUtc: e.target.value })}
                                                                        required />
                                                                </div>
                                                                <div className="form-field full-width">
                                                                    <label className="checkbox-label">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="checkbox-input"
                                                                            checked={!!draft.inboundArrivesNextDay}
                                                                            onChange={e => setDraft({ ...draft, inboundArrivesNextDay: e.target.checked })}
                                                                        />
                                                                        <span className="checkbox-custom"></span>
                                                                        <span className="checkbox-text">Inbound arrives next day (+1d)</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Days of week */}
                                                    <div className="section-card" style={{ marginTop: 16 }}>
                                                        <div className="section-header">
                                                            <h3>Operating Days</h3>
                                                            <div className="days-count">
                                                                {draft.daysOfWeek.length} day{draft.daysOfWeek.length !== 1 ? "s" : ""} selected
                                                            </div>
                                                        </div>
                                                        <div className="days-grid">
                                                            {WEEK.map(d => (
                                                                <button
                                                                    key={d}
                                                                    type="button"
                                                                    className={`day-chip ${draft.daysOfWeek.includes(d) ? "active" : ""}`}
                                                                    onClick={() => toggleDay(d)}
                                                                >
                                                                    {d.slice(0, 3)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Season + Color */}
                                                    <div className="form-grid" style={{ marginTop: 16 }}>
                                                        <div className="section-card">
                                                            <div className="section-header"><h3>Season Dates</h3></div>
                                                            <div className="form-grid compact">
                                                                <div className="form-field">
                                                                    <label className="field-label"><span className="label-text">Season Start</span></label>
                                                                    <input type="date" className="form-input"
                                                                        value={draft.seasonStart}
                                                                        onChange={e => setDraft({ ...draft, seasonStart: e.target.value })}
                                                                        required />
                                                                </div>
                                                                <div className="form-field">
                                                                    <label className="field-label"><span className="label-text">Season End</span></label>
                                                                    <input type="date" className="form-input"
                                                                        value={draft.seasonEnd}
                                                                        onChange={e => setDraft({ ...draft, seasonEnd: e.target.value })}
                                                                        required />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="section-card">
                                                            <div className="section-header"><h3>Visual Color</h3></div>
                                                            <div className="form-field">
                                                                <label className="field-label"><span className="label-text">Schedule Color</span></label>
                                                                <div className="color-grid">
                                                                    {COLORS.map(c => (
                                                                        <button
                                                                            key={c}
                                                                            type="button"
                                                                            className={`color-chip ${draft.color === c ? "active" : ""}`}
                                                                            style={colorChipStyle(c)}
                                                                            onClick={() => setDraft({ ...draft, color: c })}
                                                                        >
                                                                            {c}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Save / Cancel */}
                                                    {editError && (
                                                        <div className="status-message error">
                                                            <div className="message-icon">
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                                                </svg>
                                                            </div>
                                                            <div className="message-content">
                                                                <div className="message-title">Update Failed</div>
                                                                <div className="message-details">{editError}</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="form-actions" style={{ marginTop: 12 }}>
                                                        <button className={`submit-button ${busy ? "loading" : ""}`} onClick={saveEdit} disabled={!canSave || busy}>
                                                            {busy ? (
                                                                <>
                                                                    <div className="button-spinner"></div>
                                                                    Saving changes…
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                                                    </svg>
                                                                    Save Changes
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="submit-button"
                                                            onClick={cancelEdit}
                                                            disabled={busy}
                                                            style={{ background: "#e5e7eb", color: "#111827" }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </section>
        </PageLayout>
    );
}

/* Simple color swatches to match your existing theme chips */
function colorChipStyle(c: TripColor): React.CSSProperties {
    const map: Record<TripColor, { bg: string; text: string }> = {
        BLUE: { bg: '#3b82f6', text: '#ffffff' },
        GREEN: { bg: '#10b981', text: '#ffffff' },
        ORANGE: { bg: '#f59e0b', text: '#ffffff' },
        PURPLE: { bg: '#8b5cf6', text: '#ffffff' },
        TEAL: { bg: '#14b8a6', text: '#ffffff' },
        PINK: { bg: '#ec4899', text: '#ffffff' },
        BROWN: { bg: '#92400e', text: '#ffffff' },
        CYAN: { bg: '#06b6d4', text: '#ffffff' },
        LIME: { bg: '#84cc16', text: '#1f2937' },
        RED: { bg: '#ef4444', text: '#ffffff' },
    };
    return { backgroundColor: map[c].bg, color: map[c].text };
}
