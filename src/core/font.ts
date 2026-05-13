import { getFontById, getFontsByCategory, getFontStack, type FontEntry } from "../config/fonts";
import { widgetFontCategories } from "../config/widgets";
import type { PageSettings } from "./state";

export function getCustomFontStack(customFontFamily: string): string {
  const family = customFontFamily?.trim();
  if (!family) return "";
  return `"${family.replace(/"/g, "")}", `;
}

export function getWidgetFontCategory(id: string): "zh" | "en" {
  return widgetFontCategories[id] ?? "zh";
}

export function getWidgetFontStack(id: string, settings: PageSettings): string {
  const layout = settings.widgetLayout?.[id];
  if (!layout?.fontId) return "";
  const category = getWidgetFontCategory(id);
  const customPrefix = getCustomFontStack(settings.customFontFamily);
  return `${customPrefix}${getFontStack(layout.fontId, category)}`;
}

export function getNextWidgetFontId(id: string, settings: PageSettings): string {
  const category = getWidgetFontCategory(id);
  const fonts = getFontsByCategory(category);
  const defaultId = category === "en" ? settings.defaultEnglishFont : settings.defaultChineseFont;
  const currentId = settings.widgetLayout?.[id]?.fontId || defaultId;
  const index = fonts.findIndex((f) => f.id === currentId);
  return fonts[(index + 1) % fonts.length]?.id || defaultId;
}

export function getWidgetCurrentFontId(id: string, settings: PageSettings): string {
  const category = getWidgetFontCategory(id);
  return settings.widgetLayout?.[id]?.fontId || (category === "en" ? settings.defaultEnglishFont : settings.defaultChineseFont);
}

export function getWidgetFontOptions(id: string): FontEntry[] {
  return getFontsByCategory(getWidgetFontCategory(id));
}

export function applyFontSettings(settings: PageSettings): void {
  document.body.style.setProperty("--page-zh-font", `${getCustomFontStack(settings.customFontFamily)}${getFontStack(settings.defaultChineseFont, "zh")}`);
  document.body.style.setProperty("--page-en-font", `${getCustomFontStack(settings.customFontFamily)}${getFontStack(settings.defaultEnglishFont, "en")}`);
}
