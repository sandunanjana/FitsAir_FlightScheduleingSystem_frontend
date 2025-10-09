import React, { useEffect, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import { listAirports, createAirport, updateAirport, deleteAirport } from "../api/client";
import type { Airport, DayOfWeek } from "../types/types";

const WEEK: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

type CurfewEdit = { id?: number; days: DayOfWeek[]; startUtc: string; endUtc: string };

export default function AirportsPage() {
    const [airports, setAirports] = useState<Airport[]>([]);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [curfews, setCurfews] = useState<CurfewEdit[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // editing state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editCode, setEditCode] = useState("");
    const [editName, setEditName] = useState("");
    const [editCurfews, setEditCurfews] = useState<CurfewEdit[]>([]);
    const [editBusy, setEditBusy] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    const reload = async () => {
        try {
            const data = await listAirports();
            setAirports(data);
        } catch {
            // noop
        }
    };
    useEffect(() => { reload(); }, []);

    /* ------- Create Airport ------- */
    const addCurfew = () => setCurfews(c => [...c, { days: [], startUtc: "00:00", endUtc: "06:00" }]);
    const removeCurfew = (i: number) => setCurfews(c => c.filter((_, idx) => idx !== i));
    const toggleDay = (i: number, d: DayOfWeek) => {
        setCurfews(cs =>
            cs.map((c, idx) => idx !== i ? c : ({ ...c, days: c.days.includes(d) ? c.days.filter(x => x !== d) : [...c.days, d] }))
        );
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            await createAirport({ code: code.toUpperCase(), name: name.trim() || undefined, curfews });
            setCode(""); setName(""); setCurfews([]);
            await reload();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? err?.message ?? "Failed");
        } finally { setLoading(false); }
    };

    const destroy = async (id: number) => {
        if (!confirm("Delete airport?")) return;
        await deleteAirport(id);
        await reload();
    };

    /* ------- Edit Airport (inline) ------- */
    const beginEdit = (a: Airport) => {
        setEditingId(a.id);
        setEditCode(a.code || "");
        setEditName(a.name || "");
        setEditCurfews(
            (a.curfews || []).map(c => ({
                id: c.id,
                days: (c.days || []) as DayOfWeek[],
                startUtc: c.startUtc,
                endUtc: c.endUtc
            }))
        );
        setEditError(null);
    };
    const cancelEdit = () => {
        setEditingId(null);
        setEditCurfews([]);
        setEditCode("");
        setEditName("");
        setEditBusy(false);
        setEditError(null);
    };

    const addEditCurfew = () =>
        setEditCurfews(c => [...c, { days: [], startUtc: "00:00", endUtc: "06:00" }]);

    const removeEditCurfew = (i: number) =>
        setEditCurfews(c => c.filter((_, idx) => idx !== i));

    const toggleEditDay = (i: number, d: DayOfWeek) => {
        setEditCurfews(cs =>
            cs.map((c, idx) => idx !== i ? c : ({ ...c, days: c.days.includes(d) ? c.days.filter(x => x !== d) : [...c.days, d] }))
        );
    };

    const saveEdit = async () => {
        if (editingId == null) return;
        setEditBusy(true); setEditError(null);
        try {
            // NOTE: adjust if your API expects a different shape
            await updateAirport(editingId, {
                code: editCode.toUpperCase(),
                name: editName.trim() || undefined,
                curfews: editCurfews.map(c => ({
                    id: c.id, // include existing ids so backend can update instead of recreating
                    days: c.days,
                    startUtc: c.startUtc,
                    endUtc: c.endUtc,
                }))
            });
            await reload();
            cancelEdit();
        } catch (err: any) {
            setEditError(err?.response?.data?.message ?? err?.message ?? "Update failed");
        } finally {
            setEditBusy(false);
        }
    };

    /* ------- Render ------- */
    return (
        <PageLayout title="Airports & Curfews" subtitle="Manage airports and UTC curfew windows">
            {/* Create */}
            <section className="card">
                <header className="card__head"><h2>Create Airport</h2></header>
                <form className="form" onSubmit={submit}>
                    <div className="grid grid--3">
                        <label className="field">
                            <span className="field__label">Code</span>
                            <input className="input" value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                placeholder="CMB" required />
                        </label>
                        <label className="field">
                            <span className="field__label">Name</span>
                            <input className="input" value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Bandaranaike Intl" />
                        </label>
                        <div className="field">
                            <span className="field__label">Curfews</span>
                            <button type="button" className="btn" onClick={addCurfew}>Add Curfew</button>
                        </div>
                    </div>

                    {curfews.map((c, i) => (
                        <div key={i} className="curfew-row" style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, marginTop: 10 }}>
                            <div className="days" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {WEEK.map(d => (
                                    <button
                                        type="button"
                                        key={d}
                                        className={`chip ${c.days.includes(d) ? 'active' : ''}`}
                                        onClick={() => toggleDay(i, d)}
                                        style={{
                                            padding: "6px 10px",
                                            borderRadius: 999,
                                            border: "1px solid #e5e7eb",
                                            background: c.days.includes(d) ? "#111827" : "#fff",
                                            color: c.days.includes(d) ? "#fff" : "#111827",
                                            fontWeight: 700
                                        }}
                                    >
                                        {d.slice(0, 3)}
                                    </button>
                                ))}
                                <small className="hint" style={{ color: "#6b7280" }}>Select none = Daily</small>
                            </div>
                            <div className="times" style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
                                <label>Start (UTC)&nbsp;
                                    <input type="time" value={c.startUtc}
                                        onChange={e => setCurfews(cs => cs.map((x, idx) => idx === i ? { ...x, startUtc: e.target.value } : x))}
                                    />
                                </label>
                                <label>End (UTC)&nbsp;
                                    <input type="time" value={c.endUtc}
                                        onChange={e => setCurfews(cs => cs.map((x, idx) => idx === i ? { ...x, endUtc: e.target.value } : x))}
                                    />
                                </label>
                                <button type="button" className="btn btn--danger" onClick={() => removeCurfew(i)}>Remove</button>
                            </div>
                        </div>
                    ))}

                    <div className="actions">
                        <button className="btn" type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Create Airport"}
                        </button>
                    </div>
                    {error && <div className="alert alert--error"><strong>Error: </strong>{error}</div>}
                </form>
            </section>

            {/* List + Inline Edit */}
            <section className="card">
                <header className="card__head"><h2>Airports</h2></header>
                <table className="table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: "left" }}>Code</th>
                            <th style={{ textAlign: "left" }}>Name</th>
                            <th style={{ textAlign: "left" }}>Curfews</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {airports.map(a => {
                            const isEditing = editingId === a.id;
                            return (
                                <React.Fragment key={a.id}>
                                    {/* View Row */}
                                    {!isEditing && (
                                        <tr>
                                            <td>{a.code}</td>
                                            <td>{a.name || '-'}</td>
                                            <td>
                                                {a.curfews.length ? a.curfews.map(c =>
                                                    <div key={c.id}>
                                                        {(c.days?.length ? c.days.map(d => d.slice(0, 3)).join('/') : 'Daily')}
                                                        &nbsp;{c.startUtc}–{c.endUtc}
                                                    </div>
                                                ) : <span className="muted">None</span>}
                                            </td>
                                            <td style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                <button className="btn" onClick={() => beginEdit(a)}>Edit</button>
                                                <button className="btn btn--danger" onClick={() => destroy(a.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    )}

                                    {/* Edit Row */}
                                    {isEditing && (
                                        <tr>
                                            <td colSpan={4}>
                                                <div className="card" style={{ marginTop: 8 }}>
                                                    <div className="grid grid--3">
                                                        <label className="field">
                                                            <span className="field__label">Code</span>
                                                            <input className="input" value={editCode}
                                                                onChange={e => setEditCode(e.target.value.toUpperCase())}
                                                                placeholder="CMB" required />
                                                        </label>
                                                        <label className="field">
                                                            <span className="field__label">Name</span>
                                                            <input className="input" value={editName}
                                                                onChange={e => setEditName(e.target.value)}
                                                                placeholder="Bandaranaike Intl" />
                                                        </label>
                                                        <div className="field">
                                                            <span className="field__label">Curfews</span>
                                                            <button type="button" className="btn" onClick={addEditCurfew}>Add Curfew</button>
                                                        </div>
                                                    </div>

                                                    {editCurfews.map((c, i) => (
                                                        <div key={c.id ?? `new-${i}`} className="curfew-row" style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, marginTop: 10 }}>
                                                            <div className="days" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                                {WEEK.map(d => (
                                                                    <button
                                                                        type="button"
                                                                        key={d}
                                                                        className={`chip ${c.days.includes(d) ? 'active' : ''}`}
                                                                        onClick={() => toggleEditDay(i, d)}
                                                                        style={{
                                                                            padding: "6px 10px",
                                                                            borderRadius: 999,
                                                                            border: "1px solid #e5e7eb",
                                                                            background: c.days.includes(d) ? "#111827" : "#fff",
                                                                            color: c.days.includes(d) ? "#fff" : "#111827",
                                                                            fontWeight: 700
                                                                        }}
                                                                    >
                                                                        {d.slice(0, 3)}
                                                                    </button>
                                                                ))}
                                                                <small className="hint" style={{ color: "#6b7280" }}>Select none = Daily</small>
                                                            </div>
                                                            <div className="times" style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
                                                                <label>Start (UTC)&nbsp;
                                                                    <input type="time" value={c.startUtc}
                                                                        onChange={e => setEditCurfews(cs => cs.map((x, idx) => idx === i ? { ...x, startUtc: e.target.value } : x))}
                                                                    />
                                                                </label>
                                                                <label>End (UTC)&nbsp;
                                                                    <input type="time" value={c.endUtc}
                                                                        onChange={e => setEditCurfews(cs => cs.map((x, idx) => idx === i ? { ...x, endUtc: e.target.value } : x))}
                                                                    />
                                                                </label>
                                                                <button type="button" className="btn btn--danger" onClick={() => removeEditCurfew(i)}>Remove</button>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {editError && <div className="alert alert--error" style={{ marginTop: 12 }}>
                                                        <strong>Update Error: </strong>{editError}
                                                    </div>}

                                                    <div className="actions" style={{ marginTop: 12 }}>
                                                        <button className="btn" onClick={saveEdit} disabled={editBusy}>
                                                            {editBusy ? "Saving…" : "Save Changes"}
                                                        </button>
                                                        <button className="btn" type="button" onClick={cancelEdit} disabled={editBusy} style={{ background: "#e5e7eb", color: "#111827" }}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </section>
        </PageLayout>
    );
}
