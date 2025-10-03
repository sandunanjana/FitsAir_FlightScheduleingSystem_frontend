import React, { useMemo } from "react";
import {
    DAY_LABEL,
    DAY_ORDER,
    minutesToLeftPercent,
    minutesToWidthPercent,
    TICKS_30_MIN,
} from "../util/time";
import type { GanttAircraftDayResponse, GanttBar, TripColor } from "../types";

const colorMap: Record<TripColor, string> = {
    BLUE: "#4A78C2",
    GREEN: "#2D9E6F",
    ORANGE: "#E08A2E",
    PURPLE: "#7A5AC8",
    TEAL: "#2AA7A0",
    PINK: "#E76AB1",
    BROWN: "#8A5A44",
    CYAN: "#3AA6D0",
    LIME: "#8BC34A",
    RED: "#E05A5A",
};

// Extract "AAA→BBB" from the label (e.g., "CMB→DXB 8D821")
function parseRoute(label: string): { from?: string; to?: string } {
    const m = label.match(/\b([A-Z]{3})\s*→\s*([A-Z]{3})\b/);
    return m ? { from: m[1], to: m[2] } : {};
}

function formatHHMM(totalMinutes: number) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function DayRow({
    dayKey,
    bars,
}: {
    dayKey: keyof typeof DAY_ORDER;
    bars: GanttBar[];
}) {
    // Bars for this day, sorted by start
    const dayBars = useMemo(
        () =>
            bars
                .filter((b) => b.day === dayKey)
                .sort((a, b) => a.startMinute - b.startMinute),
        [bars, dayKey]
    );

    // Only draw DXB turnaround (destination gap): CMB→DXB (arrive) followed by DXB→CMB (depart)
    // Adjust HUB if needed
    const HUB = "CMB";

    const gaps = useMemo(() => {
        const out: { leftPct: number; widthPct: number }[] = [];
        for (let i = 0; i < dayBars.length - 1; i++) {
            const a = dayBars[i];
            const b = dayBars[i + 1];

            if (!a.tripId || !b.tripId || a.tripId !== b.tripId) continue;

            const aRoute = parseRoute(a.label);
            const bRoute = parseRoute(b.label);
            if (!aRoute.from || !aRoute.to || !bRoute.from || !bRoute.to) continue;

            // Outbound must leave HUB and arrive somewhere else; inbound must leave there and return to HUB
            const isOutboundThenInbound =
                aRoute.from === HUB &&
                aRoute.to !== HUB &&
                bRoute.from === aRoute.to &&
                bRoute.to === HUB;

            // Same-day turnaround window
            const gapMins = b.startMinute - a.endMinute;

            if (isOutboundThenInbound && gapMins > 0) {
                out.push({
                    leftPct: minutesToLeftPercent(a.endMinute),
                    widthPct: minutesToWidthPercent(0, gapMins),
                });
            }
        }
        return out;
    }, [dayBars]);

    const GRID_TICKS = useMemo(() => TICKS_30_MIN.slice(0, 48), []);

    return (
        <div className="day-row">
            <div className="day-label">{DAY_LABEL[dayKey]}</div>
            <div className="lane">
                {/* vertical grid */}
                {GRID_TICKS.map((m, i) => (
                    <div key={i} className="tick" style={{ left: `${(m / 1440) * 100}%` }} />
                ))}

                {/* destination turnaround gaps only (e.g., CMB→DXB ... DXB→CMB) */}
                {gaps.map((g, i) => (
                    <div
                        key={`gap-${i}`}
                        className="turnaround-gap"
                        style={{ left: `${g.leftPct}%`, width: `${g.widthPct}%` }}
                        title="Turnaround"
                    />
                ))}

                {/* flight bars */}
                {dayBars.map((b, idx) => {
                    const left = minutesToLeftPercent(b.startMinute);
                    const width = minutesToWidthPercent(b.startMinute, b.endMinute);
                    const bg = colorMap[b.color];
                    return (
                        <div
                            key={idx}
                            className={`bar ${b.continuesNextDay ? "continues" : ""}`}
                            style={{ left: `${left}%`, width: `${width}%`, background: bg }}
                            title={b.label}
                        >
                            <span className="bar-label">{b.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function GanttChart({
    aircraft,
}: {
    aircraft: GanttAircraftDayResponse;
}) {
    const dayKeys = useMemo(
        () =>
            (Object.keys(DAY_ORDER) as (keyof typeof DAY_ORDER)[]).sort(
                (a, b) => DAY_ORDER[a] - DAY_ORDER[b]
            ),
        []
    );

    return (
        <div className="gantt">
            {/* top timeline with 30-min labels */}
            <div className="timeline">
                <div className="spacer" />
                <div className="ticks-30">
                    {TICKS_30_MIN.map((m, i) => {
                        const left = (m / 1440) * 100;
                        const isHour = m % 60 === 0;
                        const label = formatHHMM(m);
                        return (
                            <div
                                key={i}
                                className={`tick-30 ${isHour ? "hour" : "half"}`}
                                style={{ left: `${left}%` }}
                            >
                                <span className="tick-label">{label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {dayKeys.map((k) => (
                <DayRow key={k} dayKey={k} bars={aircraft.bars} />
            ))}
        </div>
    );
}
