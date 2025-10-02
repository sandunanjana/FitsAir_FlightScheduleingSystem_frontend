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

// helper to format HH:MM from minutes
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
    const sorted = useMemo(
        () =>
            bars
                .filter((b) => b.day === dayKey)
                .sort((a, b) => a.startMinute - b.startMinute),
        [bars, dayKey]
    );

    // 30-min grid ticks excluding final 24:00 line in rows (avoid spill)
    const GRID_TICKS = useMemo(() => TICKS_30_MIN.slice(0, 48), []);

    return (
        <div className="day-row">
            <div className="day-label">{DAY_LABEL[dayKey]}</div>
            <div className="lane">
                {/* vertical grid */}
                {GRID_TICKS.map((m, i) => (
                    <div
                        key={i}
                        className="tick"
                        style={{ left: `${(m / 1440) * 100}%` }}
                    />
                ))}

                {/* bars + turnaround gaps */}
                {sorted.map((b, idx) => {
                    const left = minutesToLeftPercent(b.startMinute);
                    const width = minutesToWidthPercent(b.startMinute, b.endMinute);
                    const bg = colorMap[b.color];

                    // turnaround block is drawn as a LANE-LEVEL element (not inside the bar)
                    const hasTurn = !!b.turnaroundMins && b.turnaroundMins > 0;
                    const turnLeft = minutesToLeftPercent(b.endMinute);
                    const turnWidth = minutesToWidthPercent(0, b.turnaroundMins || 0);

                    return (
                        <React.Fragment key={idx}>
                            {/* flight bar */}
                            <div
                                className={`bar ${b.continuesNextDay ? "continues" : ""}`}
                                style={{ left: `${left}%`, width: `${width}%`, background: bg }}
                                title={b.label}
                            >
                                <span className="bar-label">{b.label}</span>
                            </div>

                            {/* turnaround shading (same-day gap after arrival) */}
                            {hasTurn && (
                                <div
                                    className="turnaround-gap"
                                    style={{ left: `${turnLeft}%`, width: `${turnWidth}%` }}
                                    title={`Turnaround ${b.turnaroundMins} min`}
                                />
                            )}
                        </React.Fragment>
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

            {/* rows */}
            {dayKeys.map((k) => (
                <DayRow key={k} dayKey={k} bars={aircraft.bars} />
            ))}
        </div>
    );
}
