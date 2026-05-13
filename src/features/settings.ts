import { fontLibrary, getFontsByCategory } from "../config/fonts";
import type { PageSettings } from "../core/state";
import { escapeHtml } from "../core/dom";
import { applyFontSettings } from "../core/font";
import { getWidgetLayout, getWidgetBgColor, getWidgetBgPercent } from "../widgets/layout";

export function applySettings(settings: PageSettings): void {
  document.body.dataset.skin = settings.skin || "default";

  if (settings.backgroundUrl) {
    document.body.classList.add("custom-background");
    document.body.style.setProperty("--custom-background-url", `url("${settings.backgroundUrl.replace(/"/g, "%22")}")`);
  } else {
    document.body.classList.remove("custom-background");
    document.body.style.removeProperty("--custom-background-url");
  }

  applyFontSettings(settings);

  // Update settings panel inputs
  const bgInput = document.getElementById("backgroundUrlInput") as HTMLInputElement | null;
  const cityInput = document.getElementById("weatherCityInput") as HTMLInputElement | null;
  const secondsInput = document.getElementById("showSecondsInput") as HTMLInputElement | null;
  const hourInput = document.getElementById("use12HourInput") as HTMLInputElement | null;
  const hideDateInput = document.getElementById("hideDateInput") as HTMLInputElement | null;
  const dateFormat = document.getElementById("dateFormatSelect") as HTMLSelectElement | null;

  if (bgInput) bgInput.value = settings.backgroundUrl;
  if (cityInput) cityInput.value = settings.weatherCity;
  if (secondsInput) secondsInput.checked = settings.showSeconds;
  if (hourInput) hourInput.checked = settings.use12Hour;
  if (hideDateInput) hideDateInput.checked = settings.hideDate;
  if (dateFormat) dateFormat.value = settings.dateFormat;

  // Update skin preset buttons
  document.querySelectorAll<HTMLElement>("[data-skin]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.skin === (settings.skin || "default"));
  });

  // Update font selects
  const zhSelect = document.getElementById("defaultChineseFontSelect") as HTMLSelectElement | null;
  const enSelect = document.getElementById("defaultEnglishFontSelect") as HTMLSelectElement | null;
  const customInput = document.getElementById("customFontInput") as HTMLInputElement | null;

  if (zhSelect && !zhSelect.options.length) populateFontSelect(zhSelect, "zh");
  if (enSelect && !enSelect.options.length) populateFontSelect(enSelect, "en");
  if (zhSelect) zhSelect.value = settings.defaultChineseFont;
  if (enSelect) enSelect.value = settings.defaultEnglishFont;
  if (customInput) customInput.value = settings.customFontFamily;

  // Update font library list
  const fontList = document.getElementById("fontLibraryList");
  if (fontList && !fontList.children.length) renderFontLibrary(fontList);
}

function populateFontSelect(select: HTMLSelectElement, category: "zh" | "en"): void {
  getFontsByCategory(category).forEach((font) => {
    const option = document.createElement("option");
    option.value = font.id;
    option.textContent = `${font.label} · ${font.tone}`;
    option.style.fontFamily = font.stack;
    select.appendChild(option);
  });
}

function renderFontLibrary(container: HTMLElement): void {
  fontLibrary.forEach((font) => {
    const item = document.createElement("div");
    item.className = "font-library-item";
    item.style.fontFamily = font.stack;
    item.innerHTML = `
      <span class="font-library-name">${escapeHtml(font.label)}</span>
      <span class="font-library-meta">${font.category === "zh" ? "中文" : "英文"} · ${font.tone} · ${font.bundled ? "已内置" : font.source}</span>
    `;
    container.appendChild(item);
  });
}
