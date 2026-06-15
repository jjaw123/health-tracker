export function toDateInputValue(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateInputToTimestamp(dateStr: string, time: Date = new Date()): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const result = new Date(y, m - 1, d, time.getHours(), time.getMinutes(), time.getSeconds());
  return result.getTime();
}

export function formatLogTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (isToday) return time;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " + time;
}

export function formatLogDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
