import axios from 'axios'
import type { Aircraft, Assignment, GanttResponse, RoundTrip, TripColor, DayOfWeek } from '../types/types'

const api = axios.create({
    baseURL: '/api',
    timeout: 15000
})

/** Gantt */
export async function fetchGantt(dateISO: string) {
    const { data } = await api.get<GanttResponse>('/schedule/gantt', { params: { date: dateISO } })
    return data
}

/** Aircraft */
export async function createAircraft(payload: { tail: string; type?: string }) {
    const { data } = await api.post<Aircraft>('/aircraft', payload)
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
