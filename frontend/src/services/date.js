export function parseLocal(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayLocal() {
  return toIso(new Date());
}

export function addDays(iso, delta) {
  const date = parseLocal(iso);
  date.setDate(date.getDate() + delta);
  return toIso(date);
}

export function formatShort(iso) {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

export function weekStart(iso) {
  const diff = (parseLocal(iso).getDay() + 6) % 7;
  return addDays(iso, -diff);
}

export function isoWeekday(iso) {
  return ((parseLocal(iso).getDay() + 6) % 7) + 1;
}