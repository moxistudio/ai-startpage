export interface WidgetConfig {
  id: string;
  label: string;
  selector: string;
}

export const widgetConfigs: WidgetConfig[] = [
  { id: "weather", label: "天气", selector: ".weather-widget" },
  { id: "time", label: "时间", selector: ".time-panel" },
  { id: "date", label: "日期", selector: ".date-panel" },
  { id: "quote", label: "金句", selector: ".quote-widget" },
  { id: "stocks", label: "自选股", selector: ".stocks-widget" },
  { id: "notes", label: "便签", selector: ".notes-widget" },
  { id: "search", label: "搜索框", selector: ".search-widget" },
  { id: "shortcuts", label: "快捷访问", selector: ".shortcuts-panel" },
];

export const widgetStyleCount = 3;

export const widthResizableWidgets = new Set(["quote", "date"]);
export const heightResizableWidgets = new Set(["notes"]);

export const widgetFontCategories: Record<string, "zh" | "en"> = {
  weather: "zh",
  time: "en",
  date: "zh",
  quote: "zh",
  stocks: "en",
  notes: "zh",
  search: "zh",
  shortcuts: "zh",
};

export interface WidgetLayout {
  hidden?: boolean;
  style?: number;
  x?: number;
  y?: number;
  scale?: number;
  width?: number;
  height?: number;
  bgColor?: string;
  bgOpacity?: number;
  fontId?: string;
}
