export function monthKeyFromTs(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function yearFromTs(ts: number): number {
  return new Date(ts).getFullYear();
}

export function clamp0(n: number): number {
  return n < 0 ? 0 : n;
}
