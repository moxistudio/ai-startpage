import { providers, buildProviderUrl, getVisibleProviders, getSelectedProviders, getPrimaryProvider } from "../config/providers";
import { setStorage } from "../core/storage";
import { escapeHtml } from "../core/dom";

export type ProviderKind = "ai" | "search" | null;

export interface SearchState {
  selectedProviderIds: string[];
  activeProviderKind: ProviderKind;
}

export function renderProviderMode(activeKind: ProviderKind): void {
  const dock = document.getElementById("providerDock");
  const askBtn = document.getElementById("askAiButton");
  const searchBtn = document.getElementById("searchEngineButton");
  if (!dock || !askBtn || !searchBtn) return;

  dock.classList.toggle("hidden", !activeKind);
  askBtn.classList.toggle("active", activeKind === "ai");
  searchBtn.classList.toggle("active", activeKind === "search");
  askBtn.setAttribute("aria-expanded", String(activeKind === "ai"));
  searchBtn.setAttribute("aria-expanded", String(activeKind === "search"));
}

export function renderProviders(selectedIds: string[], activeKind: ProviderKind): void {
  const list = document.getElementById("providersList");
  const selectAllInput = document.getElementById("selectAllProvidersInput") as HTMLInputElement | null;
  const selectAllText = document.getElementById("selectAllProvidersText");
  if (!list) return;

  list.innerHTML = "";
  const visible = getVisibleProviders(activeKind);

  visible.forEach((provider) => {
    const label = document.createElement("label");
    label.className = "provider-card";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedIds.includes(provider.id);
    checkbox.addEventListener("change", () => {
      window.dispatchEvent(new CustomEvent("toggle-provider", { detail: { id: provider.id, checked: checkbox.checked } }));
    });

    const name = document.createElement("span");
    name.textContent = provider.name;

    const kind = document.createElement("span");
    kind.className = "provider-kind";
    kind.textContent = provider.kind === "ai" ? "AI" : "Search";

    label.append(checkbox, name, kind);
    list.appendChild(label);
  });

  const selectedCount = visible.filter((p) => selectedIds.includes(p.id)).length;
  if (selectAllInput) {
    selectAllInput.checked = visible.length > 0 && selectedCount === visible.length;
    selectAllInput.indeterminate = selectedCount > 0 && selectedCount < visible.length;
  }
  if (selectAllText) {
    selectAllText.textContent = activeKind === "ai" ? "全选 AI" : "全选搜索引擎";
  }
}

export function renderPrimaryTarget(selectedIds: string[]): void {
  const el = document.getElementById("primaryTargetText");
  if (el) el.textContent = getPrimaryProvider(selectedIds)?.name || "Google";
}

export async function openSelectedProviders(query: string, selectedIds: string[]): Promise<void> {
  if (!query.trim()) {
    document.getElementById("queryInput")?.focus();
    return;
  }

  const selected = getSelectedProviders(selectedIds);
  const providersToOpen = selected.length > 0 ? selected : [providers.find((p) => p.id === "google")!];
  const urls = providersToOpen.map((p) => buildProviderUrl(p, query));

  if (providersToOpen.length === 1 && providersToOpen[0].kind === "search") {
    window.location.assign(urls[0]);
    return;
  }

  const openedTabs = urls.map(() => {
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    return tab;
  });

  await saveAiHandoff(query, providersToOpen);

  openedTabs.forEach((tab, index) => {
    if (tab) {
      tab.location = urls[index];
    } else {
      window.open(urls[index], "_blank", "noopener,noreferrer");
    }
  });
}

async function saveAiHandoff(query: string, selectedProviders: typeof providers): Promise<void> {
  const aiProviderIds = selectedProviders.filter((p) => p.kind === "ai").map((p) => p.id);
  if (aiProviderIds.length === 0) return;

  await setStorage({
    pendingAiPrompt: {
      id: crypto.randomUUID(),
      query,
      providerIds: aiProviderIds,
      completedProviderIds: [],
      createdAt: Date.now(),
    },
  });
}
