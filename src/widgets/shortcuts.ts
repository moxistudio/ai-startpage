import { escapeHtml } from "../core/dom";
import { getDomain, normalizeUrl, faviconUrl, inferNameFromUrl } from "../core/url";
import type { Shortcut } from "../core/state";

let editingShortcutId: string | null = null;

export function renderShortcuts(shortcuts: Shortcut[], widgetEditingEnabled: boolean): void {
  const grid = document.getElementById("shortcutsGrid");
  const emptyText = document.getElementById("emptyShortcutsText");
  const showBtn = document.getElementById("showShortcutFormButton");
  if (!grid || !emptyText) return;

  grid.innerHTML = "";
  emptyText.hidden = shortcuts.length > 0;

  shortcuts.forEach((shortcut) => {
    const link = document.createElement("a");
    link.className = "shortcut-card";
    link.href = shortcut.url;
    link.rel = "noopener noreferrer";
    link.title = getDomain(shortcut.url);
    link.dataset.shortcutId = shortcut.id;
    link.draggable = widgetEditingEnabled;

    if (!shortcut.url.startsWith("chrome://")) {
      link.target = "_blank";
    }

    link.addEventListener("click", (e) => {
      if (widgetEditingEnabled) e.preventDefault();
    });

    const button = document.createElement("span");
    button.className = "shortcut-button";

    const icon = document.createElement("span");
    icon.className = "shortcut-icon";

    const iconUrl = faviconUrl(shortcut.url);
    if (iconUrl) {
      const img = document.createElement("img");
      img.className = "favicon-icon";
      img.src = iconUrl;
      img.alt = "";
      img.addEventListener("error", () => {
        icon.innerHTML = `<span class="fallback-icon">${shortcut.name.slice(0, 1).toUpperCase()}</span>`;
      });
      icon.appendChild(img);
    } else {
      icon.innerHTML = `<span class="fallback-icon">${shortcut.name.slice(0, 1).toUpperCase()}</span>`;
    }

    const label = document.createElement("span");
    label.className = "shortcut-label";
    label.textContent = shortcut.name;

    const domain = document.createElement("span");
    domain.className = "shortcut-domain";
    domain.textContent = getDomain(shortcut.url);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-shortcut";
    deleteBtn.type = "button";
    deleteBtn.textContent = "×";
    deleteBtn.title = "删除";
    deleteBtn.setAttribute("aria-label", `删除 ${shortcut.name}`);
    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent("remove-shortcut", { detail: shortcut.id }));
    });

    const editBtn = document.createElement("button");
    editBtn.className = "edit-shortcut";
    editBtn.type = "button";
    editBtn.textContent = "编辑";
    editBtn.title = "编辑";
    editBtn.setAttribute("aria-label", `编辑 ${shortcut.name}`);
    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      startShortcutEdit(shortcut);
    });

    button.appendChild(icon);
    link.append(button, label, domain, editBtn, deleteBtn);
    grid.appendChild(link);
  });

  if (showBtn) grid.appendChild(showBtn);
  grid.classList.toggle("reorder-enabled", widgetEditingEnabled);
}

export function startShortcutEdit(shortcut: Shortcut): void {
  editingShortcutId = shortcut.id;
  const nameInput = document.getElementById("shortcutNameInput") as HTMLInputElement | null;
  const urlInput = document.getElementById("shortcutUrlInput") as HTMLInputElement | null;
  const form = document.getElementById("shortcutForm") as HTMLFormElement | null;
  if (!nameInput || !urlInput || !form) return;

  nameInput.value = shortcut.name;
  urlInput.value = shortcut.url;
  form.dataset.mode = "edit";
  const submitBtn = form.querySelector("button[type='submit']");
  if (submitBtn) submitBtn.textContent = "更新";
  form.classList.remove("hidden");
  nameInput.focus();
  nameInput.select();
}

export function resetShortcutForm(): void {
  editingShortcutId = null;
  const form = document.getElementById("shortcutForm") as HTMLFormElement | null;
  if (!form) return;
  form.reset();
  form.dataset.mode = "add";
  const submitBtn = form.querySelector("button[type='submit']");
  if (submitBtn) submitBtn.textContent = "保存";
  form.classList.add("hidden");
}

export function getEditingShortcutId(): string | null {
  return editingShortcutId;
}

export function fillShortcutNameFromUrl(): void {
  const nameInput = document.getElementById("shortcutNameInput") as HTMLInputElement | null;
  const urlInput = document.getElementById("shortcutUrlInput") as HTMLInputElement | null;
  if (!nameInput || !urlInput || nameInput.value.trim()) return;
  const inferred = inferNameFromUrl(urlInput.value);
  if (inferred) nameInput.value = inferred;
}

export function createShortcutData(name: string, url: string): { name: string; url: string } {
  const normalized = normalizeUrl(url);
  const finalName = name.trim() || inferNameFromUrl(normalized);
  return { name: finalName, url: normalized };
}
