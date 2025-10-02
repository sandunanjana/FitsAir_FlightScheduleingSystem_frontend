export const MINUTES_PER_DAY = 1440;

export function minutesToLeftPercent(min: number) {
  return (min / MINUTES_PER_DAY) * 100;
}

export function minutesToWidthPercent(start: number, end: number) {
  const clampedStart = Math.max(0, Math.min(start, MINUTES_PER_DAY));
  const clampedEnd = Math.max(0, Math.min(end, MINUTES_PER_DAY));
  const w = Math.max(0, clampedEnd - clampedStart);
  return (w / MINUTES_PER_DAY) * 100;
}

export const DAY_ORDER: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

export const DAY_LABEL: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

/**
 * 30-minute ticks for a 24h day: 0..1440 step 30 (49 items).
 * We label only full hours in the timeline and skip the 1440 label.
 * In the lane rows we slice(0, 48) to avoid an endpoint spillover.
 */
export const TICKS_30_MIN = Array.from({ length: 49 }, (_, i) => i * 30);
