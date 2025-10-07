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
