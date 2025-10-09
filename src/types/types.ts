export type DayOfWeek =
    | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY'
    | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export type TripColor =
    | 'BLUE' | 'GREEN' | 'ORANGE' | 'PURPLE' | 'TEAL'
    | 'PINK' | 'BROWN' | 'CYAN' | 'LIME' | 'RED';

export interface Aircraft {
    id: number;
    tail: string;
    type?: string;
}

export interface FlightLeg {
    id: number;
    flightNumber: string;
    origin: string;
    destination: string;
    departureUtc: string; // "HH:mm"
    arrivalUtc: string;   // "HH:mm"
}

export interface RoundTrip {
    id: number;
    outbound: FlightLeg;
    inbound: FlightLeg;
    daysOfWeek: DayOfWeek[];
    seasonStart: string; // ISO date
    seasonEnd: string;   // ISO date
    color: TripColor;
}

export interface Assignment {
    id: number;
    aircraft: Aircraft;
    roundTrip: RoundTrip;
    minTurnaroundMins?: number | null;
}

export interface Curfew {
    id: number;
    days?: DayOfWeek[] | null; // null/empty => DAILY
    startUtc: string;          // "HH:mm"
    endUtc: string;            // "HH:mm"
}

export interface Airport {
    country: string | undefined;
    id: number;
    code: string;
    name?: string;
    curfews: Curfew[];
}

/** Gantt types */
export interface GanttBar {
    day: DayOfWeek;
    startMinute: number;
    endMinute: number;
    label: string;
    tripId: string;
    color: TripColor;
    continuesNextDay: boolean;
    arrivalIsNextDay: boolean;
    turnaroundMins?: number | null;
    requiredTurnaroundMins?: number | null;
    turnaroundOk?: boolean | null;
    depCurfewViolation?: boolean | null;
    arrCurfewViolation?: boolean | null;
}

export interface GanttAircraftDayResponse {
    aircraftId: number;
    tail: string;
    bars: GanttBar[];
}

export interface GanttResponse {
    aircraft: GanttAircraftDayResponse[];
    weekStart: string;
    weekEnd: string;
}

// Aircraft: add defaultTurnaroundMins
export interface Aircraft {
    id: number;
    tail: string;
    type?: string;
    defaultTurnaroundMins?: number | null;
}

export interface CurfewRule {
  id?: number;
  dayOfWeek: DayOfWeek;       // e.g. "WEDNESDAY"
  startUtc: string;           // "HH:mm"
  endUtc: string;             // "HH:mm"
}