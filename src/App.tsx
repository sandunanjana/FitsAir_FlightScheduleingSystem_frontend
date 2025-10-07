import { useEffect, useMemo, useState } from 'react';
import { AppShell } from './pages/AppShell';

import SchedulePage from './pages/SchedulePage';
import RoundTripsPage from './pages/RoundTripsPage';
import AssignmentsPage from './pages/AssignmentsPage';
import AircraftPage from './pages/AircraftPage';

type NavKey = 'SCHEDULE' | 'ROUND_TRIPS' | 'ASSIGNMENTS' | 'AIRCRAFT';

export default function App() {
    const [active, setActive] = useState<NavKey>('SCHEDULE');

    // Start on hash if present (e.g., /#AIRCRAFT). Fallback to last saved tab.
    useEffect(() => {
        const fromHash = (location.hash.replace('#', '') as NavKey) || null;
        const fromStorage = (localStorage.getItem('activeNav') as NavKey) || null;
        const initial = (fromHash && isNavKey(fromHash)) ? fromHash
            : (fromStorage && isNavKey(fromStorage)) ? fromStorage
                : 'SCHEDULE';
        setActive(initial);
    }, []);

    // Keep URL hash in sync for deep links
    useEffect(() => {
        if (active) location.hash = active;
    }, [active]);

    const rightContent = useMemo(() => (
        <div className="kbd-hint">
            <kbd>G</kbd> + <kbd>S/R/A/F</kbd>
        </div>
    ), []);

    return (
        <AppShell active={active} onChange={setActive} rightContent={rightContent}>
            {active === 'SCHEDULE' && <SchedulePage />}

            {active === 'ROUND_TRIPS' && (
                <div className="page">
                    <RoundTripsPage />
                </div>
            )}

            {active === 'ASSIGNMENTS' && (
                <div className="page">
                    <AssignmentsPage />
                </div>
            )}

            {active === 'AIRCRAFT' && (
                <div className="page">
                    <AircraftPage />
                </div>
            )}
        </AppShell>
    );
}

function isNavKey(v: string): v is NavKey {
    return v === 'SCHEDULE' || v === 'ROUND_TRIPS' || v === 'ASSIGNMENTS' || v === 'AIRCRAFT';
}
