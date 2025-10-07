import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { fetchGantt } from "../api/client";
import type { GanttResponse } from "../types/types";
import GanttChart from "../components/GanttChart";

export default function SchedulePage() {
    const [date, setDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
    const [data, setData] = useState<GanttResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = async (d: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchGantt(d);
            setData(res);
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("Failed to load");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(date);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // initial load

    return (
        <div className="page page--full">
            <header className="header">
                <h1>Weekly Flight Schedule (CMB Local)</h1>
                <div className="controls">
                    <label>
                        Week date:&nbsp;
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </label>
                    <button onClick={() => load(date)} disabled={loading}>
                        {loading ? "Loading…" : "Refresh"}
                    </button>
                    {data && (
                        <div className="week-range">
                            {dayjs(data.weekStart).format("DD MMM YYYY")} –{" "}
                            {dayjs(data.weekEnd).format("DD MMM YYYY")}
                        </div>
                    )}
                </div>
            </header>

            {error && <div className="error">{error}</div>}
            {!loading && data && data.aircraft.length === 0 && (
                <div className="empty">No aircraft assigned for this week.</div>
            )}

            {data?.aircraft.map((a) => {
                // Map bars to ensure turnaroundMins is never null
                const fixedAircraft = {
                    ...a,
                    bars: a.bars.map(bar => ({
                        ...bar,
                        turnaroundMins: bar.turnaroundMins === null ? undefined : bar.turnaroundMins,
                    })),
                };
                return (
                    <section key={a.aircraftId} className="aircraft-section">
                        <GanttChart aircraft={fixedAircraft} />
                    </section>
                );
            })}
        </div>
    );
}
