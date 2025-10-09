import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import {
    createAircraft,
    listAircraft,
    updateAircraft,
    deleteAircraft,
} from "../api/client";
import type { Aircraft } from "../types/types";

type RowState = {
    id: number;
    tail: string;
    type?: string;
    isEditing?: boolean;
    saving?: boolean;
    error?: string | null;
};

export default function AircraftPage() {
    // create form
    const [tail, setTail] = useState("");
    const [type, setType] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [created, setCreated] = useState<Aircraft | null>(null);

    // table
    const [rows, setRows] = useState<RowState[]>([]);
    const [loading, setLoading] = useState(false);
    const [listError, setListError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setListError(null);
        try {
            const data = await listAircraft();
            setRows(
                data.map((a) => ({
                    id: a.id,
                    tail: a.tail,
                    type: a.type,
                    isEditing: false,
                    saving: false,
                    error: null,
                }))
            );
        } catch (e: any) {
            setListError(e?.message ?? "Failed to load aircraft");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const startEdit = (id: number) =>
        setRows((rs) =>
            rs.map((r) => (r.id === id ? { ...r, isEditing: true, error: null } : r))
        );

    const cancelEdit = (id: number) =>
        setRows((rs) =>
            rs.map((r) =>
                r.id === id ? { ...r, isEditing: false, error: null } : r
            )
        );

    const changeField = (id: number, field: "tail" | "type", value: string) =>
        setRows((rs) =>
            rs.map((r) => (r.id === id ? { ...r, [field]: value } : r))
        );

    const saveRow = async (row: RowState) => {
        if (!row.tail.trim()) {
            setRows((rs) =>
                rs.map((r) =>
                    r.id === row.id ? { ...r, error: "Tail is required" } : r
                )
            );
            return;
        }
        setRows((rs) =>
            rs.map((r) => (r.id === row.id ? { ...r, saving: true, error: null } : r))
        );
        try {
            await updateAircraft(row.id, {
                tail: row.tail.trim(),
                type: row.type?.trim() || undefined,
            });
            await load();
        } catch (e: any) {
            setRows((rs) =>
                rs.map((r) =>
                    r.id === row.id
                        ? {
                            ...r,
                            saving: false,
                            error: e?.response?.data?.message ?? e?.message ?? "Update failed",
                        }
                        : r
                )
            );
        }
    };

    const removeRow = async (id: number) => {
        if (!confirm("Delete this aircraft?")) return;
        try {
            await deleteAircraft(id);
            await load();
        } catch (e: any) {
            alert(e?.response?.data?.message ?? e?.message ?? "Delete failed");
        }
    };

    const submitCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tail.trim()) {
            setCreateError("Tail is required");
            return;
        }
        setCreating(true);
        setCreateError(null);
        setCreated(null);
        try {
            const res = await createAircraft({
                tail: tail.trim().toUpperCase(),
                type: type.trim() ? type.trim().toUpperCase() : undefined,
            });
            setCreated(res);
            setTail("");
            setType("");
            await load();
        } catch (err: any) {
            setCreateError(
                err?.response?.data?.message ?? err?.message ?? "Failed to create"
            );
        } finally {
            setCreating(false);
        }
    };

    const icon = (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 16V14L13.5 9L10.5 11L2 7V9L10.5 13L13.5 11L22 16Z" />
        </svg>
    );

    const fleetCount = rows.length;
    const statusClass = useMemo(
        () => (loading ? "is-busy" : fleetCount ? "is-ok" : "is-warn"),
        [loading, fleetCount]
    );

    return (
        <PageLayout
            title="Aircraft Fleet Management"
            subtitle="Register, view, edit, and remove aircraft"
            icon={icon}
        >
            {/* Create */}
            <section className="card">
                <header className="card__head">
                    <h2>Register New Aircraft</h2>
                    <span className={`status ${statusClass}`}>
                        {loading ? "Loading fleet…" : `${fleetCount} in fleet`}
                    </span>
                </header>

                <form className="form" onSubmit={submitCreate}>
                    <div className="grid grid--2">
                        <label className="field">
                            <span className="field__label">
                                Tail Number <span className="req">*</span>
                            </span>
                            <div className="field__control">
                                <input
                                    className="input"
                                    value={tail}
                                    onChange={(e) => setTail(e.target.value.toUpperCase())}
                                    placeholder="A320-A1"
                                    required
                                />
                            </div>
                            <small className="hint">Official registration (ICAO). Must be unique.</small>
                        </label>

                        <label className="field">
                            <span className="field__label">Aircraft Type</span>
                            <div className="field__control">
                                <input
                                    className="input"
                                    value={type}
                                    onChange={(e) => setType(e.target.value.toUpperCase())}
                                    placeholder="A320"
                                />
                            </div>
                            <small className="hint">ICAO designator (optional)</small>
                        </label>
                    </div>

                    <div className="actions">
                        <button className="btn" type="submit" disabled={creating}>
                            {creating ? "Registering…" : "Register Aircraft"}
                        </button>
                    </div>

                    {created && (
                        <div className="alert alert--success">
                            <strong>Aircraft Registered:</strong> {created.tail} • ID {created.id}
                        </div>
                    )}
                    {createError && (
                        <div className="alert alert--error">
                            <strong>Registration Failed:</strong> {createError}
                        </div>
                    )}
                </form>
            </section>

            {/* List / Edit / Delete */}
            <section className="card">
                <header className="card__head">
                    <h2>Fleet</h2>
                    {listError && (
                        <span className="status is-warn">{listError}</span>
                    )}
                </header>

                {loading ? (
                    <div>Loading…</div>
                ) : (
                    <table className="table" style={{ width: "100%" }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tail</th>
                                <th>Type</th>
                                <th style={{ width: 220 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => {
                                if (!r.isEditing) {
                                    return (
                                        <tr key={r.id}>
                                            <td>{r.id}</td>
                                            <td>{r.tail}</td>
                                            <td>{r.type || "—"}</td>
                                            <td style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                <button className="btn" onClick={() => startEdit(r.id)}>
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn--danger"
                                                    onClick={() => removeRow(r.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }

                                // Editing row
                                return (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>
                                        <td>
                                            <input
                                                className="input"
                                                value={r.tail}
                                                onChange={(e) =>
                                                    changeField(r.id, "tail", e.target.value.toUpperCase())
                                                }
                                                placeholder="A320-A1"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="input"
                                                value={r.type ?? ""}
                                                onChange={(e) =>
                                                    changeField(r.id, "type", e.target.value.toUpperCase())
                                                }
                                                placeholder="A320"
                                            />
                                        </td>
                                        <td style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                            <button
                                                className="btn"
                                                onClick={() => saveRow(r)}
                                                disabled={r.saving}
                                            >
                                                {r.saving ? "Saving…" : "Save"}
                                            </button>
                                            <button
                                                className="btn"
                                                style={{ background: "#e5e7eb", color: "#111827" }}
                                                onClick={() => cancelEdit(r.id)}
                                                disabled={r.saving}
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {rows.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="empty">No aircraft yet. Add one above.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
