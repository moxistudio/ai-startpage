export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^(https?|chrome):\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function inferNameFromUrl(value: string): string {
  const url = normalizeUrl(value);
  if (!url || url.startsWith("chrome://")) return "";

  const host = getDomain(url);
  const base = host.split(".").filter(Boolean)[0] || host;
  const knownNames: Record<string, string> = {
    github: "GitHub",
    google: "Google",
    notion: "Notion",
    youtube: "YouTube",
    bilibili: "Bilibili",
    figma: "Figma",
    yuque: "语雀",
    feishu: "飞书",
  };

  return (
    knownNames[base.toLowerCase()] ||
    base.replace(/(^|-)(\w)/g, (_, separator: string, letter: string) => `${separator}${letter.toUpperCase()}`)
  );
}

export function faviconUrl(url: string): string {
  if (!/^https?:\/\//i.test(url)) return "";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(getDomain(url))}&sz=64`;
}
