export function escapeHtml(value: string): string {
  return String(value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!)
  );
}

export function $(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

export function $$<T extends Element = HTMLElement>(selector: string): T[] {
  return [...document.querySelectorAll(selector)] as T[];
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}
