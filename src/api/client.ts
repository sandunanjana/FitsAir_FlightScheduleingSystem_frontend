import axios from 'axios'
import type { Aircraft, Assignment, GanttResponse, RoundTrip, TripColor, DayOfWeek, Airport } from '../types/types'

const api = axios.create({
    baseURL: '/api',
    timeout: 15000
})

/** Airports */
export async function listAirports() {
    const { data } = await api.get<Airport[]>('/airports')
    return data
}
export async function getAirport(id: number) {
    const { data } = await api.get<Airport>(`/airports/${id}`)
    return data
}
export async function createAirport(payload: { code: string; name?: string; curfews?: { days?: DayOfWeek[]; startUtc: string; endUtc: string }[] }) {
    const { data } = await api.post<Airport>('/airports', payload)
    return data
}
export async function updateAirport(id: number, payload: { code?: string; name?: string; curfews?: { days?: DayOfWeek[]; startUtc: string; endUtc: string }[] }) {
    const { data } = await api.put<Airport>(`/airports/${id}`, payload)
    return data
}
export async function deleteAirport(id: number) {
    await api.delete(`/airports/${id}`)
}

/** Round Trip CRUD */
export async function listRoundTrips() {
    const { data } = await api.get<RoundTrip[]>('/schedule/round-trip')
    return data
}
export async function getRoundTrip(id: number) {
    const { data } = await api.get<RoundTrip>(`/schedule/round-trip/${id}`)
    return data
}
export async function updateRoundTrip(id: number, payload: CreateRoundTripPayload) {
    const { data } = await api.put<RoundTrip>(`/schedule/round-trip/${id}`, payload)
    return data
}
export async function deleteRoundTrip(id: number) {
    await api.delete(`/schedule/round-trip/${id}`)
}

/** Aircraft create now supports defaultTurnaroundMins */
export async function createAircraft(payload: { tail: string; type?: string; defaultTurnaroundMins?: number }) {
    const { data } = await api.post<Aircraft>('/aircraft', payload)
    return data
}


/** Gantt */
export async function fetchGantt(dateISO: string) {
    const { data } = await api.get<GanttResponse>('/schedule/gantt', { params: { date: dateISO } })
    return data
}

export async function listAircraft() {
    const { data } = await api.get<Aircraft[]>('/aircraft')
    return data
}

/** Round Trip */
export interface CreateRoundTripPayload {
    outboundFlightNumber: string
    outboundOrigin: string
    outboundDestination: string
    outboundDepUtc: string // "HH:mm"
    outboundArrUtc: string // "HH:mm"

    inboundFlightNumber: string
    inboundOrigin: string
    inboundDestination: string
    inboundDepUtc: string // "HH:mm"
    inboundArrUtc: string // "HH:mm"

    daysOfWeek: DayOfWeek[]
    seasonStart: string // "YYYY-MM-DD"
    seasonEnd: string   // "YYYY-MM-DD"
    color: TripColor
    inboundArrivesNextDay?: boolean
}
export async function createRoundTrip(payload: CreateRoundTripPayload) {
    const { data } = await api.post<RoundTrip>('/schedule/round-trip', payload)
    return data
}

/** Assignment */
export async function assignRoundTrip(payload: {
    aircraftId: number
    roundTripId: number
    minTurnaroundMins?: number | null
}) {
    const { data } = await api.post<Assignment>('/schedule/assign', payload)
    return data
}

// --- Aircraft CRUD additions ---
export async function updateAircraft(
  id: number,
  payload: { tail?: string; type?: string }
) {
  const { data } = await api.put<Aircraft>(`/aircraft/${id}`, payload);
  return data;
}

export async function deleteAircraft(id: number) {
  const { data } = await api.delete<void>(`/aircraft/${id}`);
  return data;
}
