import { widgetConfigs, type WidgetLayout } from "../config/widgets";
import { getSkinLayout } from "../config/skins";
import type { PageSettings } from "../core/state";
import { clampNumber } from "../core/dom";
import { getWidgetFontStack } from "../core/font";

export function getWidgetLayout(id: string, settings: PageSettings): WidgetLayout {
  return settings.widgetLayout?.[id] ?? {};
}

export function isWidgetVisible(id: string, settings: PageSettings): boolean {
  return getWidgetLayout(id, settings).hidden !== true;
}

export function sanitizeWidgetBgColor(value: unknown): string {
  return /^#[\da-f]{6}$/i.test(String(value || "")) ? String(value).toLowerCase() : "#ffffff";
}

export function getWidgetBgColor(id: string, settings: PageSettings): string {
  return sanitizeWidgetBgColor(getWidgetLayout(id, settings).bgColor);
}

export function getWidgetBgOpacity(id: string, settings: PageSettings): number {
  return clampNumber(getWidgetLayout(id, settings).bgOpacity, 0, 1, 0.28);
}

export function getWidgetBgPercent(id: string, settings: PageSettings): number {
  return Math.round((1 - getWidgetBgOpacity(id, settings)) * 100);
}

export function applyWidgetBackground(id: string, element: HTMLElement, settings: PageSettings): void {
  const layout = getWidgetLayout(id, settings);
  const hasCustom = typeof layout.bgColor === "string" || Number.isFinite(layout.bgOpacity);
  element.classList.toggle("has-custom-widget-bg", hasCustom);

  if (!hasCustom) {
    element.style.removeProperty("--widget-custom-bg");
    element.style.removeProperty("--widget-custom-border");
    element.style.removeProperty("--widget-custom-shadow");
    element.style.removeProperty("--widget-custom-backdrop");
    return;
  }

  const color = getWidgetBgColor(id, settings);
  const opacity = getWidgetBgOpacity(id, settings);
  const rgb = hexToRgb(color);
  const borderOpacity = opacity === 0 ? 0.28 : Math.min(0.92, opacity + 0.32);
  const shadowOpacity = Math.min(0.22, opacity * 0.28);

  element.style.setProperty("--widget-custom-bg", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`);
  element.style.setProperty("--widget-custom-border", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${borderOpacity})`);
  element.style.setProperty("--widget-custom-shadow", opacity === 0 ? "none" : `0 14px 38px rgba(32, 34, 38, ${shadowOpacity})`);
  element.style.setProperty("--widget-custom-backdrop", opacity === 0 ? "none" : "blur(18px)");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const color = hex.slice(1);
  return {
    r: parseInt(color.slice(0, 2), 16),
    g: parseInt(color.slice(2, 4), 16),
    b: parseInt(color.slice(4, 6), 16),
  };
}

export function applyWidgetLayout(settings: PageSettings): void {
  widgetConfigs.forEach(({ id, label }) => {
    const element = document.querySelector<HTMLElement>(`.${id.replace(/-/g, "-")}`) ?? document.querySelector<HTMLElement>(id);
    // Try common selectors
    const el = document.querySelector<HTMLElement>(`.${id}-widget`) ?? document.querySelector<HTMLElement>(`.${id}-panel`);
    if (!el) return;

    el.classList.add("desktop-widget");
    el.dataset.widgetId = id;
    el.dataset.widgetLabel = label;

    const layout = getWidgetLayout(id, settings);
    resetWidgetElementStyle(el);
    el.hidden = layout.hidden === true || (id === "date" && settings.hideDate);
    el.style.scale = String(layout.scale ?? 1);
    el.dataset.widgetStyle = String(layout.style ?? 0);

    const fontStack = getWidgetFontStack(id, settings);
    if (fontStack) {
      el.style.setProperty("--widget-font-family", fontStack);
    } else {
      el.style.removeProperty("--widget-font-family");
    }

    applyWidgetBackground(id, el, settings);
    if (Number.isFinite(layout.width)) el.style.width = `${layout.width}px`;
    if (Number.isFinite(layout.height)) el.style.height = `${layout.height}px`;

    if (isStoredWidgetPositionVisible(layout)) {
      positionMovedWidget(el, { x: layout.x!, y: layout.y! });
    }
  });
}

function resetWidgetElementStyle(element: HTMLElement): void {
  element.hidden = false;
  element.style.position = "";
  element.style.left = "";
  element.style.top = "";
  element.style.right = "";
  element.style.bottom = "";
  element.style.margin = "";
  element.style.marginTop = "";
  element.style.transform = "";
  element.style.scale = "";
  element.style.zIndex = "";
  element.style.width = "";
  element.style.height = "";
}

function isStoredWidgetPositionVisible(layout: WidgetLayout): boolean {
  if (!Number.isFinite(layout.x) || !Number.isFinite(layout.y)) return false;
  return layout.x! < window.innerWidth - 48 && layout.y! < window.innerHeight - 48;
}

function positionMovedWidget(element: HTMLElement, layout: { x: number; y: number }): { x: number; y: number } {
  const position = clampWidgetPosition(element, layout.x, layout.y);
  element.style.position = "fixed";
  element.style.left = `${position.x}px`;
  element.style.top = `${position.y}px`;
  element.style.right = "auto";
  element.style.bottom = "auto";
  element.style.margin = "0";
  element.style.marginTop = "0";
  element.style.transform = "none";
  element.style.zIndex = "2";
  return position;
}

function clampWidgetPosition(element: HTMLElement, x: number, y: number): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  const width = Math.min(rect.width || element.offsetWidth || 0, window.innerWidth);
  const height = Math.min(rect.height || element.offsetHeight || 0, window.innerHeight);
  const maxX = Math.max(0, window.innerWidth - width);
  const maxY = Math.max(0, window.innerHeight - height);
  return { x: Math.min(Math.max(0, x), maxX), y: Math.min(Math.max(0, y), maxY) };
}

export function applySkinPack(skin: string, settings: PageSettings): PageSettings {
  return {
    ...settings,
    skin,
    backgroundUrl: "",
    widgetLayout: getSkinLayout(skin),
  };
}
