import React, { useEffect, useMemo, useState, type JSX } from "react";

export type NavKey =
    | "SCHEDULE"
    | "ROUND_TRIPS"
    | "ROUND_TRIPS_LIST"   // NEW
    | "ASSIGNMENTS"
    | "AIRCRAFT"
    | "AIRPORTS";          // NEW

export function AppShell({
    active,
    onChange,
    children,
    rightContent,
}: {
    active: NavKey;
    onChange: (k: NavKey) => void;
    children: React.ReactNode;
    rightContent?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const navItems: { key: NavKey; label: string; icon: JSX.Element; hint: string }[] = useMemo(
        () => [
            { key: "SCHEDULE", label: "Flight Schedule", icon: <CalendarIcon />, hint: "g then s" },
            { key: "ROUND_TRIPS", label: "Create Round Trip", icon: <ArrowsLoopIcon />, hint: "g then r" },
            { key: "ROUND_TRIPS_LIST", label: "Round Trips List", icon: <ListIcon />, hint: "g then t" }, // NEW
            { key: "ASSIGNMENTS", label: "Assignments", icon: <LinkIcon />, hint: "g then a" },
            { key: "AIRCRAFT", label: "Aircraft", icon: <PlaneIcon />, hint: "g then f" },
            { key: "AIRPORTS", label: "Airports", icon: <TowerIcon />, hint: "g then p" }, // NEW
        ],
        []
    );

    useEffect(() => {
        let lastG = 0;
        const onKey = (e: KeyboardEvent) => {
            const t = Date.now();
            const key = e.key.toLowerCase();
            if (key === "g") { lastG = t; return; }
            if (t - lastG < 800) {
                if (key === "s") onChange("SCHEDULE");
                if (key === "r") onChange("ROUND_TRIPS");
                if (key === "t") onChange("ROUND_TRIPS_LIST"); // NEW
                if (key === "a") onChange("ASSIGNMENTS");
                if (key === "f") onChange("AIRCRAFT");
                if (key === "p") onChange("AIRPORTS"); // NEW
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onChange]);

    return (
        <div className="app-shell">
            <header className={`topbar ${scrolled ? "topbar--scrolled" : ""}`}>
                <div className="topbar__left">
                    <button className="icon-btn" onClick={() => setOpen(s => !s)} aria-label="Menu">
                        <BurgerIcon />
                    </button>
                    <div className="brand">
                        <div className="brand__icon"><PlaneFill /></div>
                        <div>
                            <div className="brand__name">FitsAir</div>
                            <div className="brand__sub">Aircraft Management</div>
                        </div>
                    </div>
                </div>

                <nav className="nav">
                    {navItems.map(n => (
                        <button
                            key={n.key}
                            className={`nav__pill ${active === n.key ? "is-active" : ""}`}
                            onClick={() => onChange(n.key)}
                            title={`${n.label} • ${n.hint}`}
                        >
                            <span className="pill__icon">{n.icon}</span>
                            <span>{n.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="topbar__right">
                    {rightContent}
                    <span className="kbd-hint">
                        <kbd>G</kbd>+<kbd>S/R/T/A/F/P</kbd>
                    </span>
                </div>
            </header>

            <aside className={`drawer ${open ? "is-open" : ""}`}>
                <div className="drawer__head">
                    <div className="brand"><PlaneFill /><span>FitsAir</span></div>
                    <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close"><CloseIcon /></button>
                </div>
                <div className="drawer__nav">
                    {navItems.map(n => (
                        <button
                            key={n.key}
                            className={`drawer__item ${active === n.key ? "is-active" : ""}`}
                            onClick={() => { onChange(n.key); setOpen(false); }}
                        >
                            <span className="drawer__icon">{n.icon}</span>
                            <span className="drawer__label">{n.label}</span>
                            <span className="drawer__hint">{n.hint}</span>
                        </button>
                    ))}
                </div>
            </aside>
            {open && <div className="drawer__overlay" onClick={() => setOpen(false)} />}

            <main className="app-content">{children}</main>
        </div>
    );
}

/* Icons */
function CalendarIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>); }
function ArrowsLoopIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12a9 9 0 1 1-6.2-8.6" /><path d="M21 4v5h-5" /><path d="M3 12a9 9 0 0 1 6.2 8.6" /><path d="M3 20v-5h5" /></svg>); }
function ListIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>); } // NEW
function LinkIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7" /></svg>); }
function PlaneIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2l-1.1.5.3 1.8L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-5 3.5 5.5 1.8-.5" /></svg>); }
function TowerIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v6m0 0l4 2m-4-2l-4 2M6 22h12M8 22l2-10h4l2 10" /></svg>); } // NEW
function PlaneFill() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" /></svg>); }
function BurgerIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>); }
function CloseIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>); }
