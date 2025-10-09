import { useEffect, useMemo, useState } from 'react';
import { AppShell } from './pages/AppShell';

import SchedulePage from './pages/SchedulePage';
import RoundTripsPage from './pages/RoundTripsPage';
import AssignmentsPage from './pages/AssignmentsPage';
import AircraftPage from './pages/AircraftPage';

/* NEW pages */
import AirportsPage from './pages/AirportsPage';
import RoundTripsListPage from './pages/RoundTripsListPage';

type NavKey =
  | 'SCHEDULE'
  | 'ROUND_TRIPS'
  | 'ROUND_TRIPS_LIST'   // NEW
  | 'ASSIGNMENTS'
  | 'AIRCRAFT'
  | 'AIRPORTS';          // NEW

export default function App() {
  const [active, setActive] = useState<NavKey>('SCHEDULE');

  // Start on hash if present (e.g., /#AIRCRAFT). Fallback to last saved tab.
  useEffect(() => {
    const fromHash = (location.hash.replace('#', '') as NavKey) || null;
    const fromStorage = (localStorage.getItem('activeNav') as NavKey) || null;
    const initial =
      (fromHash && isNavKey(fromHash)) ? fromHash
      : (fromStorage && isNavKey(fromStorage)) ? fromStorage
      : 'SCHEDULE';
    setActive(initial);
  }, []);

  // Keep URL hash in sync for deep links
  useEffect(() => {
    if (active) {
      location.hash = active;
      localStorage.setItem('activeNav', active);
    }
  }, [active]);

  const rightContent = useMemo(
    () => (
      <div className="kbd-hint">
        <kbd>G</kbd> + <kbd>S/R/T/A/F/P</kbd>
      </div>
    ),
    []
  );

  return (
    <AppShell active={active} onChange={setActive} rightContent={rightContent}>
      {active === 'SCHEDULE' && <SchedulePage />}

      {active === 'ROUND_TRIPS' && (
        <div className="page">
          <RoundTripsPage />
        </div>
      )}

      {active === 'ROUND_TRIPS_LIST' && (
        <div className="page">
          <RoundTripsListPage />
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

      {active === 'AIRPORTS' && (
        <div className="page">
          <AirportsPage />
        </div>
      )}
    </AppShell>
  );
}

function isNavKey(v: string): v is NavKey {
  return (
    v === 'SCHEDULE' ||
    v === 'ROUND_TRIPS' ||
    v === 'ROUND_TRIPS_LIST' ||
    v === 'ASSIGNMENTS' ||
    v === 'AIRCRAFT' ||
    v === 'AIRPORTS'
  );
}
