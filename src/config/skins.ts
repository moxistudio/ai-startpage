import type { WidgetLayout } from "./widgets";

export interface SkinPack {
  layout: Record<string, WidgetLayout>;
}

export const skinPacks: Record<string, SkinPack> = {
  default: {
    layout: {
      weather: { style: 0 },
      time: { style: 0 },
      date: { style: 0 },
      quote: { style: 0 },
      stocks: { hidden: true, style: 0 },
      notes: { hidden: true, style: 0 },
      search: { style: 0 },
      shortcuts: { style: 0 },
    },
  },
  orbit: {
    layout: {
      weather: { x: 64, y: 54, scale: 1, style: 2 },
      time: { x: 536, y: 72, scale: 1.04, style: 2 },
      date: { x: 560, y: 224, scale: 1, style: 2 },
      quote: { x: 72, y: 642, scale: 1, style: 2 },
      stocks: { x: 1050, y: 150, scale: 1, style: 2, hidden: true },
      notes: { x: 1030, y: 470, scale: 1, style: 2, hidden: true },
      search: { x: 350, y: 300, scale: 1, style: 0 },
      shortcuts: { x: 350, y: 400, scale: 1, style: 0 },
    },
  },
  garden: {
    layout: {
      weather: { x: 64, y: 52, scale: 1.05, style: 2 },
      time: { x: 580, y: 78, scale: 0.96, style: 0 },
      date: { x: 590, y: 214, scale: 1, style: 0 },
      quote: { x: 90, y: 590, scale: 1.05, style: 0 },
      stocks: { x: 1040, y: 170, scale: 0.96, style: 2, hidden: true },
      notes: { x: 1020, y: 488, scale: 1, style: 0, hidden: true },
      search: { x: 270, y: 320, scale: 1, style: 2 },
      shortcuts: { x: 270, y: 420, scale: 1, style: 2 },
    },
  },
  night: {
    layout: {
      weather: { x: 64, y: 56, scale: 1, style: 1 },
      time: { x: 96, y: 210, scale: 1.12, style: 1 },
      date: { x: 106, y: 360, scale: 1, style: 1 },
      quote: { x: 86, y: 610, scale: 1, style: 1 },
      stocks: { x: 1020, y: 120, scale: 1, style: 1, hidden: true },
      notes: { x: 1020, y: 460, scale: 1, style: 1, hidden: true },
      search: { x: 420, y: 300, scale: 1, style: 1 },
      shortcuts: { x: 420, y: 404, scale: 1, style: 1 },
    },
  },
};

export function scaleSkinLayout(layout: Record<string, WidgetLayout>): Record<string, WidgetLayout> {
  const baseWidth = 1440;
  const baseHeight = 900;
  const scaleX = window.innerWidth / baseWidth;
  const scaleY = window.innerHeight / baseHeight;

  return Object.fromEntries(
    Object.entries(layout).map(([id, values]) => [
      id,
      {
        ...values,
        x: Number.isFinite(values.x) ? Math.round(values.x! * scaleX) : values.x,
        y: Number.isFinite(values.y) ? Math.round(values.y! * scaleY) : values.y,
      },
    ])
  );
}

export function getSkinLayout(skin: string): Record<string, WidgetLayout> {
  const pack = skinPacks[skin] ?? skinPacks.default;
  return scaleSkinLayout(pack.layout);
}
