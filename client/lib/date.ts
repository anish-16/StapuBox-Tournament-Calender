const IST_TIMEZONE = "Asia/Kolkata";

function ensureIso(value: string): string {
  if (!value) {
    return value;
  }
  return value.endsWith("Z") ? value : `${value}Z`;
}

export function toISTDate(value: string): Date {
  const date = new Date(ensureIso(value));
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }
  return date;
}

export function formatISTDate(value: string): string {
  const date = toISTDate(value);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatISTTime(value: string): string {
  const date = toISTDate(value);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatISTDateRange(start: string, end: string): string {
  const startLabel = formatISTDate(start);
  const endLabel = formatISTDate(end);
  if (startLabel === endLabel) {
    return startLabel;
  }
  return `${startLabel} - ${endLabel}`;
}

export function getISTDateKey(value: string): string {
  const date = toISTDate(value);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isSameISTDay(a: string, b: string): boolean {
  return getISTDateKey(a) === getISTDateKey(b);
}

export function getISTDateKeyFromDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatISTDateFromKey(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  if ([year, month, day].some((value) => Number.isNaN(value))) {
    return key;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
