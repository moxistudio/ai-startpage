import type { WidgetLayout } from "../config/widgets";

export interface Shortcut {
  id: string;
  name: string;
  url: string;
}

export interface StockQuote {
  price: string;
  changePercent: number;
}

export interface PageSettings {
  backgroundUrl: string;
  skin: string;
  weatherCity: string;
  showSeconds: boolean;
  use12Hour: boolean;
  hideDate: boolean;
  dateFormat: "zh" | "iso" | "weekday";
  defaultChineseFont: string;
  defaultEnglishFont: string;
  customFontFamily: string;
  widgetLayout: Record<string, WidgetLayout>;
  pluginLibraryInitialized?: boolean;
}

export interface AppState {
  selectedProviderIds: string[];
  shortcuts: Shortcut[];
  stocks: string[];
  stockQuotes: Record<string, StockQuote>;
  notes: string;
  activeProviderKind: "ai" | "search" | null;
  shortcutNameEdited: boolean;
  settings: PageSettings;
}

export const defaultSettings: PageSettings = {
  backgroundUrl: "",
  skin: "default",
  weatherCity: "北京",
  showSeconds: false,
  use12Hour: false,
  hideDate: false,
  dateFormat: "zh",
  defaultChineseFont: "zhuque",
  defaultEnglishFont: "bebas",
  customFontFamily: "",
  widgetLayout: {
    stocks: { hidden: true, style: 0 },
    notes: { hidden: true, style: 0 },
  },
};

export const defaultStocks = ["AAPL", "NVDA", "TSLA"];
export const defaultNotes = "";

export function createDefaultShortcuts(): Shortcut[] {
  return [
    { id: crypto.randomUUID(), name: "工作台", url: "https://notion.so" },
    { id: crypto.randomUUID(), name: "文档", url: "https://docs.google.com" },
    { id: crypto.randomUUID(), name: "灵感", url: "https://www.pinterest.com" },
    { id: crypto.randomUUID(), name: "日历", url: "https://calendar.google.com" },
    { id: crypto.randomUUID(), name: "邮箱", url: "https://mail.google.com" },
    { id: crypto.randomUUID(), name: "音乐", url: "https://music.youtube.com" },
    { id: crypto.randomUUID(), name: "云盘", url: "https://drive.google.com" },
    { id: crypto.randomUUID(), name: "设置", url: "chrome://settings/" },
  ];
}
