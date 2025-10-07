import React, { useMemo, useRef, useState } from "react";
import type { DAY_ORDER } from "../util/time";

/** ------------ Types ------------ */
type TripColor =
    | "BLUE" | "GREEN" | "ORANGE" | "PURPLE" | "TEAL"
    | "PINK" | "BROWN" | "CYAN" | "LIME" | "RED";

export type GanttBar = {
    day: keyof typeof DAY_ORDER;
    startMinute: number; // 0..1440
    endMinute: number;   // 0..1440
    label: string;       // e.g. "CMB → DXB"
    color: TripColor;
    continuesNextDay?: boolean;
    turnaroundMins?: number;
    tripId?: number | string;
};

export type GanttAircraftDayResponse = {
    bars: GanttBar[];
    /** shown in header */
    tail?: string;
    aircraftId?: number | string;
};

/** ------------ Component ------------ */
export default function GanttChart({ aircraft }: { aircraft: GanttAircraftDayResponse }) {
    /** Layout constants (keep in sync with your CSS) */
    const TIMELINE_H = 40; // px
    const ROW_H = 64;      // px

    /** Day order / labels */
    const DAY_ORDER = useMemo(
        () => ({
            MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4,
            FRIDAY: 5, SATURDAY: 6, SUNDAY: 7,
        }),
        []
    );
    const DAY_LABEL: Record<keyof typeof DAY_ORDER, string> = {
        MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu",
        FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun",
    };
    const dayKeys = useMemo(
        () =>
            (Object.keys(DAY_ORDER) as (keyof typeof DAY_ORDER)[]).sort(
                (a, b) => DAY_ORDER[a] - DAY_ORDER[b]
            ),
        [DAY_ORDER]
    );

    /** Timeline ticks (every 30 minutes, including 24:00) */
    const TICKS_30_MIN = useMemo(
        () => Array.from({ length: 49 }, (_, i) => i * 30), // 0..1440 step 30
        []
    );

    /** Helpers */
    const minutesToLeftPercent = (m: number) => (m / 1440) * 100;
    const minutesToWidthPercent = (start: number, end: number) => {
        const w = Math.max(0, end - start);
        return (w / 1440) * 100;
    };
    const formatHHMM = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };
    const parseRoute = (label: string): { from?: string; to?: string } => {
        const m = label.match(/\b([A-Z]{3})\s*→\s*([A-Z]{3})\b/);
        return m ? { from: m[1], to: m[2] } : {};
    };

    /** Colors */
    const colorMap: Record<TripColor, string> = {
        BLUE: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        GREEN: "linear-gradient(135deg, #10b981, #047857)",
        ORANGE: "linear-gradient(135deg, #f59e0b, #d97706)",
        PURPLE: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
        TEAL: "linear-gradient(135deg, #14b8a6, #0d9488)",
        PINK: "linear-gradient(135deg, #ec4899, #db2777)",
        BROWN: "linear-gradient(135deg, #92400e, #78350f)",
        CYAN: "linear-gradient(135deg, #06b6d4, #0891b2)",
        LIME: "linear-gradient(135deg, #84cc16, #65a30d)",
        RED: "linear-gradient(135deg, #ef4444, #dc2626)",
    };
    const colorBorderMap: Record<TripColor, string> = {
        BLUE: "#1e40af",
        GREEN: "#065f46",
        ORANGE: "#92400e",
        PURPLE: "#5b21b6",
        TEAL: "#0f766e",
        PINK: "#be185d",
        BROWN: "#451a03",
        CYAN: "#0e7490",
        LIME: "#3f6212",
        RED: "#b91c1c",
    };

    /** A single day's lane (grid + bars + turnaround) */
    const DayLane = ({ dayKey, bars }: { dayKey: keyof typeof DAY_ORDER; bars: GanttBar[] }) => {
        const dayBars = useMemo(
            () =>
                bars
                    .filter((b) => b.day === dayKey)
                    .sort((a, b) => a.startMinute - b.startMinute),
            [bars, dayKey]
        );

        // Detect turnaround when we have a trip that goes HUB->X then X->HUB with a gap at the intermediate station
        const HUB = "CMB";
        const gaps = useMemo(() => {
            const out: { leftPct: number; widthPct: number; title: string; mins: number }[] = [];
            for (let i = 0; i < dayBars.length - 1; i++) {
                const a = dayBars[i];
                const b = dayBars[i + 1];
                if (!a.tripId || !b.tripId || a.tripId !== b.tripId) continue;

                const aR = parseRoute(a.label);
                const bR = parseRoute(b.label);
                if (!aR.from || !aR.to || !bR.from || !bR.to) continue;

                const isOutboundThenInbound =
                    aR.from === HUB &&
                    aR.to !== HUB &&
                    bR.from === aR.to &&
                    bR.to === HUB;

                const gapMins = b.startMinute - a.endMinute;
                if (isOutboundThenInbound && gapMins > 0) {
                    out.push({
                        leftPct: minutesToLeftPercent(a.endMinute),
                        widthPct: minutesToWidthPercent(0, gapMins),
                        title: `Turnaround: ${gapMins} min`,
                        mins: gapMins,
                    });
                }
            }
            return out;
        }, [dayBars]);

        // Grid: draw only 0..23:30 (48 marks) as verticals inside the 24h lane
        const GRID_TICKS = useMemo(() => TICKS_30_MIN.slice(0, 48), [TICKS_30_MIN]);

        return (
            <div className="gantt-lane" style={{ height: ROW_H }}>
                {/* grid ticks */}
                {GRID_TICKS.map((m, i) => (
                    <div
                        key={i}
                        className="gantt-tick"
                        style={{ left: `${(m / 1440) * 100}%` }}
                    />
                ))}

                {/* turnaround overlays */}
                {gaps.map((g, i) => (
                    <div
                        key={`gap-${i}`}
                        className="turnaround-indicator"
                        style={{ left: `${g.leftPct}%`, width: `${g.widthPct}%` }}
                        title={g.title}
                    >
                        <div className="turnaround-label">{g.mins}m</div>
                    </div>
                ))}

                {/* bars */}
                {dayBars.map((b, idx) => {
                    const left = minutesToLeftPercent(b.startMinute);
                    const width = minutesToWidthPercent(b.startMinute, b.endMinute);
                    const bg = colorMap[b.color];
                    const borderColor = colorBorderMap[b.color];
                    const route = parseRoute(b.label);

                    return (
                        <div
                            key={idx}
                            className={`gantt-bar ${b.continuesNextDay ? "continues" : ""}`}
                            style={{
                                left: `${left}%`,
                                width: `${Math.max(width, 0.5)}%`,
                                background: bg,
                                borderLeft: `2px solid ${borderColor}`,
                                borderRight: `2px solid ${borderColor}`,
                            }}
                            title={`${b.label} (${formatHHMM(b.startMinute)}–${formatHHMM(b.endMinute)})`}
                        >
                            <div className="gantt-bar-content">
                                <div className="flight-route">
                                    <span className="airport-code">{route.from}</span>
                                    <svg width="12" height="12" viewBox="0 0 24 24" className="flight-arrow">
                                        <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" />
                                    </svg>
                                    <span className="airport-code">{route.to}</span>
                                </div>
                                <div className="flight-times">
                                    {formatHHMM(b.startMinute)}–{formatHHMM(b.endMinute)}
                                </div>
                            </div>
                            {b.continuesNextDay && (
                                <div className="continues-indicator">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    /** Horizontal drag/scroll only on the timeline area */
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const isDownRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const [dragging, setDragging] = useState(false);

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        isDownRef.current = true;
        scroller.setPointerCapture(e.pointerId);
        setDragging(true);
        startXRef.current = e.clientX;
        scrollLeftRef.current = scroller.scrollLeft;
    };
    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const scroller = scrollerRef.current;
        if (!scroller || !isDownRef.current) return;
        const dx = e.clientX - startXRef.current;
        scroller.scrollLeft = scrollLeftRef.current - dx;
    };
    const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
        const scroller = scrollerRef.current;
        if (scroller) scroller.releasePointerCapture(e.pointerId);
        isDownRef.current = false;
        setDragging(false);
    };
    const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            scroller.scrollLeft += e.deltaY * 0.5;
            e.preventDefault();
        }
    };

    return (
        <div className="gantt-chart-container">
            {/* Header */}
            <div className="gantt-header">
                <div className="gantt-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="gantt-icon">
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                    <div>
                        <h3>Aircraft Schedule</h3>
                        <p className="aircraft-identifiers">
                            Tail: <strong>{aircraft.tail ?? "—"}</strong> &nbsp;•&nbsp; ID:{" "}
                            <strong>{aircraft.aircraftId != null ? String(aircraft.aircraftId) : "—"}</strong>
                        </p>
                    </div>
                </div>

                <div className="gantt-controls">
                    <div className="time-legend">
                        <div className="legend-item">
                            <div className="legend-color flight"></div>
                            <span>Scheduled Flight</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color turnaround"></div>
                            <span>Turnaround Time</span>
                        </div>
                    </div>
                    <div className="scroll-hint">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11 18l-6-6 6-6 1.41 1.41L7.83 12l4.58 4.59L11 18zm6 0l-6-6 6-6 1.41 1.41L13.83 12l4.58 4.59L17 18z" />
                        </svg>
                        Scroll timeline to navigate
                    </div>
                </div>
            </div>

            {/* Main grid: fixed day column + horizontally scrollable timeline */}
            <div className="gantt-main">
                {/* Fixed left column */}
                <div className="gantt-fixed-col" style={{ width: 96 }}>
                    <div className="gantt-fixed-col-header" style={{ height: TIMELINE_H }} />
                    {dayKeys.map((k) => (
                        <div
                            key={k}
                            className="gantt-day-label"
                            style={{ height: ROW_H }}
                            title={k}
                        >
                            {DAY_LABEL[k]}
                        </div>
                    ))}
                </div>

                {/* Scrollable timeline area */}
                <div
                    className={`gantt-scroll-container ${dragging ? "dragging" : ""}`}
                    ref={scrollerRef}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerLeave={endDrag}
                    onWheel={onWheel}
                >
                    <div className="gantt-scroll-content">
                        {/* Timeline header (sticky within scroll area) */}
                        <div className="gantt-timeline" style={{ height: TIMELINE_H }}>
                            {TICKS_30_MIN.map((m, i) => {
                                const left = (m / 1440) * 100;
                                const isEnd = m === 1440;
                                const isHour = m % 60 === 0;
                                const label = formatHHMM(m);
                                return (
                                    <div
                                        key={i}
                                        className={`timeline-tick ${isHour ? "hour" : "half"} ${isEnd ? "end" : ""}`}
                                        style={{ left: `${left}%` }}
                                    >
                                        {!isEnd && <span className="tick-label">{label}</span>}
                                        <div className="tick-line" />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Day lanes */}
                        <div className="gantt-days">
                            {dayKeys.map((k) => (
                                <DayLane key={k} dayKey={k} bars={aircraft.bars} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}