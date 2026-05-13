import { escapeHtml } from "../core/dom";
import type { PageSettings } from "../core/state";

export function renderClock(settings: PageSettings): void {
  const timeText = document.getElementById("timeText");
  const dateText = document.getElementById("dateText");
  if (!timeText || !dateText) return;

  const now = new Date();
  const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: settings.showSeconds ? "2-digit" : undefined,
    hour12: settings.use12Hour,
  });
  const timeParts = timeFormatter.formatToParts(now);
  const hasPeriod = timeParts.some((part) => part.type === "dayPeriod");

  timeText.classList.toggle("has-seconds", settings.showSeconds);
  timeText.classList.toggle("has-period", hasPeriod);
  timeText.setAttribute("aria-label", timeFormatter.format(now));
  timeText.innerHTML = timeParts
    .map((part) => {
      if (part.type === "hour" || part.type === "minute" || part.type === "second") {
        return `<span class="time-number">${escapeHtml(part.value)}</span>`;
      }
      if (part.type === "dayPeriod") {
        return `<span class="time-period">${escapeHtml(part.value)}</span>`;
      }
      if (part.type === "literal") {
        return `<span class="time-separator" aria-hidden="true">${escapeHtml(part.value)}</span>`;
      }
      return `<span>${escapeHtml(part.value)}</span>`;
    })
    .join("");

  dateText.hidden = false;
  if (settings.hideDate) {
    dateText.hidden = true;
    return;
  }

  if (settings.dateFormat === "iso") {
    dateText.textContent = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  } else if (settings.dateFormat === "weekday") {
    dateText.textContent = new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(now);
  } else {
    dateText.textContent = new Intl.DateTimeFormat("zh-CN", {
      month: "long",
      day: "numeric",
      weekday: "long",
    })
      .format(now)
      .replace("日星期", "日  星期");
  }
}
