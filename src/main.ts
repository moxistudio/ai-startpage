import { defaultProviderIds, providers } from "./config/providers";
import { widgetConfigs } from "./config/widgets";
import { getSkinLayout } from "./config/skins";
import { getDailyQuote } from "./config/quotes";
import { getStorage, setStorage } from "./core/storage";
import { defaultSettings, defaultStocks, defaultNotes, createDefaultShortcuts, type AppState, type PageSettings, type Shortcut } from "./core/state";
import { applyFontSettings } from "./core/font";
import { normalizeUrl } from "./core/url";
import { clampNumber, escapeHtml } from "./core/dom";
import { renderClock } from "./widgets/clock";
import { renderWeather } from "./widgets/weather";
import { renderQuote } from "./widgets/quote";
import { renderNotes, saveNotesSoon } from "./widgets/notes";
import { renderStocks, fetchStocks, normalizeStockSymbol } from "./widgets/stocks";
import { renderShortcuts, resetShortcutForm, getEditingShortcutId, fillShortcutNameFromUrl, createShortcutData } from "./widgets/shortcuts";
import { renderProviderMode, renderProviders, renderPrimaryTarget, openSelectedProviders, type ProviderKind } from "./widgets/search";
import { applyWidgetLayout, getWidgetLayout, isWidgetVisible, applySkinPack } from "./widgets/layout";
import { applySettings } from "./features/settings";

// ─── State ───
const state: AppState = {
  selectedProviderIds: [...defaultProviderIds],
  shortcuts: [],
  stocks: [],
  stockQuotes: {},
  notes: defaultNotes,
  activeProviderKind: null,
  shortcutNameEdited: false,
  settings: { ...defaultSettings },
};

let widgetEditingEnabled = false;

// ─── DOM Refs ───
function getEl<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

// ─── Storage Helpers ───
async function saveSettings(patch: Partial<PageSettings>): Promise<void> {
  state.settings = { ...state.settings, ...patch };
  await setStorage({ pageSettings: state.settings });
  applySettings(state.settings);
  renderClock(state.settings);
  applyWidgetLayout(state.settings);
}

// ─── Widget Library ───
function updatePluginLibraryState(): void {
  document.querySelectorAll<HTMLElement>("[data-widget-toggle]").forEach((btn) => {
    const id = btn.dataset.widgetToggle!;
    const visible = isWidgetVisible(id, state.settings);
    btn.classList.toggle("active", visible);
    const status = document.querySelector(`[data-widget-status-for="${id}"]`);
    if (status) status.textContent = visible ? "已添加" : "添加";
  });
}

async function toggleWidgetFromLibrary(id: string): Promise<void> {
  const layout = getWidgetLayout(id, state.settings);
  const newLayout = { ...state.settings.widgetLayout, [id]: { ...layout, hidden: layout.hidden !== true } };
  await saveSettings({ widgetLayout: newLayout });
  updatePluginLibraryState();
}

// ─── Provider Toggles ───
async function toggleProvider(id: string, checked: boolean): Promise<void> {
  const selected = new Set(state.selectedProviderIds);
  if (checked) {
    selected.delete(id);
    state.selectedProviderIds = [id, ...selected];
  } else {
    selected.delete(id);
    state.selectedProviderIds = [...selected];
  }
  await setStorage({ selectedProviderIds: state.selectedProviderIds });
  renderProviders(state.selectedProviderIds, state.activeProviderKind);
  renderPrimaryTarget(state.selectedProviderIds);
}

async function toggleVisibleProviders(checked: boolean): Promise<void> {
  const visibleIds = getVisibleProviderIds();
  const visibleSet = new Set(visibleIds);
  const otherSelected = state.selectedProviderIds.filter((id) => !visibleSet.has(id));
  state.selectedProviderIds = checked ? [...visibleIds, ...otherSelected] : otherSelected;
  await setStorage({ selectedProviderIds: state.selectedProviderIds });
  renderProviders(state.selectedProviderIds, state.activeProviderKind);
  renderPrimaryTarget(state.selectedProviderIds);
}

function getVisibleProviderIds(): string[] {
  return providers.filter((p) => !state.activeProviderKind || p.kind === state.activeProviderKind).map((p) => p.id);
}

// ─── Shortcut CRUD ───
async function addShortcut(event: Event): Promise<void> {
  event.preventDefault();
  const nameInput = getEl<HTMLInputElement>("shortcutNameInput");
  const urlInput = getEl<HTMLInputElement>("shortcutUrlInput");
  if (!nameInput || !urlInput) return;

  const data = createShortcutData(nameInput.value, urlInput.value);
  if (!data.name || !data.url) return;

  const editingId = getEditingShortcutId();
  if (editingId) {
    state.shortcuts = state.shortcuts.map((s) => (s.id === editingId ? { ...s, ...data } : s));
  } else {
    state.shortcuts = [{ id: crypto.randomUUID(), ...data }, ...state.shortcuts];
  }

  await setStorage({ shortcuts: state.shortcuts });
  resetShortcutForm();
  renderShortcuts(state.shortcuts, widgetEditingEnabled);
}

async function removeShortcut(id: string): Promise<void> {
  state.shortcuts = state.shortcuts.filter((s) => s.id !== id);
  await setStorage({ shortcuts: state.shortcuts });
  if (getEditingShortcutId() === id) resetShortcutForm();
  renderShortcuts(state.shortcuts, widgetEditingEnabled);
}

// ─── Stock CRUD ───
async function addStock(event: Event): Promise<void> {
  event.preventDefault();
  const input = getEl<HTMLInputElement>("stockSymbolInput");
  if (!input) return;
  const symbol = normalizeStockSymbol(input.value);
  if (!symbol || state.stocks.includes(symbol)) return;

  state.stocks = [symbol, ...state.stocks].slice(0, 12);
  await setStorage({ stocks: state.stocks });
  (getEl<HTMLFormElement>("stockForm"))?.reset();
  renderStocks(state.stocks, state.stockQuotes);
  refreshStocks();
}

async function removeStock(symbol: string): Promise<void> {
  state.stocks = state.stocks.filter((s) => s !== symbol);
  await setStorage({ stocks: state.stocks });
  renderStocks(state.stocks, state.stockQuotes);
  refreshStocks();
}

async function refreshStocks(): Promise<void> {
  state.stockQuotes = await fetchStocks(state.stocks);
  renderStocks(state.stocks, state.stockQuotes);
}

// ─── Settings Panel ───
function setWidgetEditing(enabled: boolean): void {
  widgetEditingEnabled = enabled;
  document.body.classList.toggle("widget-editing", enabled);
  getEl("widgetEditButton")?.classList.toggle("active", enabled);
  getEl("widgetEditButton")?.setAttribute("aria-pressed", String(enabled));

  if (!enabled) {
    getEl("settingsPanel")?.classList.add("hidden");
    setPluginLibraryOpen(false);
  }
}

function setPluginLibraryOpen(open: boolean): void {
  getEl("pluginLibraryPanel")?.classList.toggle("hidden", !open);
  getEl("addPluginButton")?.classList.toggle("active", open);
  getEl("addPluginButton")?.setAttribute("aria-pressed", String(open));
  if (open) {
    getEl("settingsPanel")?.classList.add("hidden");
  }
}

function setProviderMode(kind: ProviderKind): void {
  state.activeProviderKind = state.activeProviderKind === kind ? null : kind;
  if (state.activeProviderKind) {
    // Ensure at least one provider is selected for this kind
    const hasSelected = providers.some((p) => p.kind === kind && state.selectedProviderIds.includes(p.id));
    const firstInKind = providers.find((p) => p.kind === kind);
    if (!hasSelected && firstInKind) {
      state.selectedProviderIds = [firstInKind.id];
      setStorage({ selectedProviderIds: state.selectedProviderIds });
    }
  }
  renderProviderMode(state.activeProviderKind);
  renderProviders(state.selectedProviderIds, state.activeProviderKind);
  renderPrimaryTarget(state.selectedProviderIds);
}

// ─── Init ───
async function init(): Promise<void> {
  const saved = await getStorage(["selectedProviderIds", "shortcuts", "stocks", "notes", "pageSettings"]);

  state.selectedProviderIds = Array.isArray(saved.selectedProviderIds) ? (saved.selectedProviderIds as string[]) : [...defaultProviderIds];
  state.shortcuts = Array.isArray(saved.shortcuts) ? (saved.shortcuts as Shortcut[]) : createDefaultShortcuts();
  state.stocks = Array.isArray(saved.stocks) ? (saved.stocks as string[]) : [...defaultStocks];
  state.notes = typeof saved.notes === "string" ? saved.notes : defaultNotes;
  state.settings = { ...defaultSettings, ...(saved.pageSettings as PageSettings || {}) };

  if (!(saved.pageSettings as PageSettings | undefined)?.pluginLibraryInitialized) {
    state.settings.widgetLayout = {
      ...(state.settings.widgetLayout || {}),
      stocks: { ...getWidgetLayout("stocks", state.settings), hidden: true },
      notes: { ...getWidgetLayout("notes", state.settings), hidden: true },
    };
    state.settings.pluginLibraryInitialized = true;
    await setStorage({ pageSettings: state.settings });
  }

  applySettings(state.settings);
  renderQuote();
  renderProviderMode(state.activeProviderKind);
  renderProviders(state.selectedProviderIds, state.activeProviderKind);
  renderPrimaryTarget(state.selectedProviderIds);
  renderShortcuts(state.shortcuts, widgetEditingEnabled);
  renderStocks(state.stocks, state.stockQuotes);
  renderNotes(state.notes);
  renderClock(state.settings);
  applyWidgetLayout(state.settings);
  updatePluginLibraryState();

  await renderWeather(state.settings.weatherCity);
  await refreshStocks();

  window.setInterval(() => renderClock(state.settings), 1000);
  window.setInterval(() => renderWeather(state.settings.weatherCity), 30 * 60 * 1000);
  window.setInterval(refreshStocks, 5 * 60 * 1000);
}

// ─── Event Listeners ───
document.addEventListener("DOMContentLoaded", () => {
  init();

  // Search
  getEl<HTMLFormElement>("searchForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = getEl<HTMLInputElement>("queryInput")?.value || "";
    openSelectedProviders(query, state.selectedProviderIds);
  });

  getEl("askAiButton")?.addEventListener("click", () => setProviderMode("ai"));
  getEl("searchEngineButton")?.addEventListener("click", () => setProviderMode("search"));
  getEl<HTMLInputElement>("selectAllProvidersInput")?.addEventListener("change", (e) => {
    toggleVisibleProviders((e.target as HTMLInputElement).checked);
  });

  // Settings
  getEl("settingsButton")?.addEventListener("click", () => {
    if (widgetEditingEnabled) setWidgetEditing(false);
    setPluginLibraryOpen(false);
    getEl("settingsPanel")?.classList.toggle("hidden");
  });

  getEl("closeSettingsButton")?.addEventListener("click", () => getEl("settingsPanel")?.classList.add("hidden"));

  getEl("saveBackgroundButton")?.addEventListener("click", () => {
    const url = getEl<HTMLInputElement>("backgroundUrlInput")?.value.trim() || "";
    saveSettings({ backgroundUrl: url });
  });

  getEl("resetBackgroundButton")?.addEventListener("click", () => {
    const newSettings = applySkinPack("default", state.settings);
    saveSettings(newSettings);
  });

  document.querySelectorAll<HTMLElement>("[data-skin]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const newSettings = applySkinPack(btn.dataset.skin!, state.settings);
      saveSettings(newSettings);
    });
  });

  getEl("saveWeatherButton")?.addEventListener("click", async () => {
    const city = getEl<HTMLInputElement>("weatherCityInput")?.value.trim() || defaultSettings.weatherCity;
    await saveSettings({ weatherCity: city });
    renderWeather(city);
  });

  getEl<HTMLInputElement>("showSecondsInput")?.addEventListener("change", (e) => saveSettings({ showSeconds: (e.target as HTMLInputElement).checked }));
  getEl<HTMLInputElement>("use12HourInput")?.addEventListener("change", (e) => saveSettings({ use12Hour: (e.target as HTMLInputElement).checked }));
  getEl<HTMLInputElement>("hideDateInput")?.addEventListener("change", (e) => saveSettings({ hideDate: (e.target as HTMLInputElement).checked }));
  getEl<HTMLSelectElement>("dateFormatSelect")?.addEventListener("change", (e) => saveSettings({ dateFormat: (e.target as HTMLSelectElement).value as "zh" | "iso" | "weekday" }));
  getEl<HTMLSelectElement>("defaultChineseFontSelect")?.addEventListener("change", (e) => saveSettings({ defaultChineseFont: (e.target as HTMLSelectElement).value }));
  getEl<HTMLSelectElement>("defaultEnglishFontSelect")?.addEventListener("change", (e) => saveSettings({ defaultEnglishFont: (e.target as HTMLSelectElement).value }));
  getEl("saveCustomFontButton")?.addEventListener("click", () => {
    const family = getEl<HTMLInputElement>("customFontInput")?.value.trim() || "";
    saveSettings({ customFontFamily: family });
  });

  // Widget editing
  getEl("widgetEditButton")?.addEventListener("click", () => {
    setWidgetEditing(!widgetEditingEnabled);
    if (widgetEditingEnabled) {
      getEl("settingsPanel")?.classList.add("hidden");
      setPluginLibraryOpen(false);
    }
  });

  getEl("addPluginButton")?.addEventListener("click", () => {
    if (widgetEditingEnabled) setWidgetEditing(false);
    setPluginLibraryOpen(getEl("pluginLibraryPanel")?.classList.contains("hidden") ?? false);
  });

  getEl("closePluginLibraryButton")?.addEventListener("click", () => setPluginLibraryOpen(false));
  getEl("resetWidgetsButton")?.addEventListener("click", () => saveSettings({ widgetLayout: { ...defaultSettings.widgetLayout } }));

  document.querySelectorAll<HTMLElement>("[data-widget-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => toggleWidgetFromLibrary(btn.dataset.widgetToggle!));
  });

  // Shortcuts
  getEl("showShortcutFormButton")?.addEventListener("click", () => {
    if (getEditingShortcutId()) {
      resetShortcutForm();
      getEl("shortcutForm")?.classList.remove("hidden");
      getEl<HTMLInputElement>("shortcutUrlInput")?.focus();
      return;
    }
    getEl("shortcutForm")?.classList.toggle("hidden");
    if (!getEl("shortcutForm")?.classList.contains("hidden")) {
      getEl<HTMLInputElement>("shortcutUrlInput")?.focus();
    }
  });

  getEl<HTMLInputElement>("shortcutNameInput")?.addEventListener("input", (e) => {
    state.shortcutNameEdited = (e.target as HTMLInputElement).value.trim().length > 0;
  });

  getEl<HTMLInputElement>("shortcutUrlInput")?.addEventListener("input", fillShortcutNameFromUrl);
  getEl<HTMLInputElement>("shortcutUrlInput")?.addEventListener("blur", fillShortcutNameFromUrl);
  getEl<HTMLFormElement>("shortcutForm")?.addEventListener("submit", addShortcut);

  // Stocks
  getEl<HTMLFormElement>("stockForm")?.addEventListener("submit", addStock);
  getEl("refreshStocksButton")?.addEventListener("click", refreshStocks);

  // Notes
  getEl<HTMLTextAreaElement>("notesTextInput")?.addEventListener("input", (e) => {
    saveNotesSoon((e.target as HTMLTextAreaElement).value);
  });

  // Custom events
  window.addEventListener("remove-shortcut", (e) => removeShortcut((e as CustomEvent).detail));
  window.addEventListener("remove-stock", (e) => removeStock((e as CustomEvent).detail));
  window.addEventListener("toggle-provider", (e) => toggleProvider((e as CustomEvent).detail.id, (e as CustomEvent).detail.checked));
});

// Styles
import "./styles/main.scss";
