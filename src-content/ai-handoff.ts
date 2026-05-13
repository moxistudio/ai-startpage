interface ProviderHost {
  id: string;
  hosts: string[];
}

const providerByHost: ProviderHost[] = [
  { id: "chatgpt", hosts: ["chatgpt.com"] },
  { id: "claude", hosts: ["claude.ai"] },
  { id: "grok", hosts: ["grok.com"] },
  { id: "gemini", hosts: ["gemini.google.com"] },
  { id: "kimi", hosts: ["www.kimi.com", "kimi.com"] },
  { id: "deepseek", hosts: ["chat.deepseek.com"] },
  { id: "qwen", hosts: ["chat.qwen.ai"] },
  { id: "doubao", hosts: ["www.doubao.com", "doubao.com"] },
  { id: "perplexity", hosts: ["www.perplexity.ai", "perplexity.ai"] },
];

const inputSelectors = [
  "textarea:not([disabled])",
  "div[contenteditable='true']",
  "[role='textbox']",
  "input[type='text']:not([disabled])",
  "input:not([type]):not([disabled])",
];

const sendButtonSelectors = [
  "button[data-testid='send-button']",
  "button[data-testid='submit-button']",
  "button[aria-label*='Send']",
  "button[aria-label*='发送']",
  "button[aria-label*='Submit']",
  "button[aria-label*='提交']",
  "button[type='submit']",
];

const dismissButtonTexts = [
  "以后再说", "稍后", "跳过", "关闭", "知道了", "我知道了",
  "Not now", "Maybe later", "Skip", "Dismiss", "Close", "Got it",
];

interface PendingPrompt {
  id: string;
  query: string;
  providerIds: string[];
  completedProviderIds?: string[];
  createdAt: number;
}

const currentProvider = providerByHost.find((p) => p.hosts.includes(location.hostname));

function storageGet(keys: string[]): Promise<Record<string, unknown>> {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}

function storageSet(values: Record<string, unknown>): Promise<void> {
  return chrome.storage.local.set(values);
}

function isVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
}

function findPromptInput(): Element | undefined {
  const candidates = inputSelectors.flatMap((selector) => [...document.querySelectorAll(selector)]);
  return candidates.find((el) => isVisible(el) && !el.closest("[aria-hidden='true']"));
}

function dismissBlockingPrompts(): void {
  const buttons = [...document.querySelectorAll("button")].filter((b) => isVisible(b) && !(b as HTMLButtonElement).disabled);
  const closeByLabel = buttons.find((b) => /close|dismiss|关闭/i.test(b.getAttribute("aria-label") || ""));
  if (closeByLabel) {
    (closeByLabel as HTMLButtonElement).click();
    return;
  }
  const closeByText = buttons.find((b) => dismissButtonTexts.includes(b.textContent?.trim() || ""));
  if (closeByText) (closeByText as HTMLButtonElement).click();
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  if (descriptor?.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }
}

function fillInput(element: Element, value: string): void {
  const htmlEl = element as HTMLElement;
  htmlEl.focus();

  if ((htmlEl as HTMLElement).isContentEditable || htmlEl.getAttribute("role") === "textbox") {
    htmlEl.textContent = value;
  } else {
    setNativeValue(element as HTMLInputElement | HTMLTextAreaElement, value);
  }

  htmlEl.dispatchEvent(new InputEvent("beforeinput", { bubbles: true, inputType: "insertText", data: value }));
  htmlEl.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
  htmlEl.dispatchEvent(new Event("change", { bubbles: true }));
}

function findSendButton(): HTMLButtonElement | undefined {
  const buttons = sendButtonSelectors.flatMap((selector) => [...document.querySelectorAll(selector)]);
  const usable = buttons.filter((b) => isVisible(b) && !(b as HTMLButtonElement).disabled && b.getAttribute("aria-disabled") !== "true");
  return usable[usable.length - 1] as HTMLButtonElement | undefined;
}

function submitPrompt(input: Element): boolean {
  const button = findSendButton();
  if (button) {
    button.click();
    return true;
  }

  const form = input.closest("form");
  if (!form) return false;

  if (typeof (form as HTMLFormElement).requestSubmit === "function") {
    (form as HTMLFormElement).requestSubmit();
  } else {
    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
  }
  return true;
}

async function markCompleted(prompt: PendingPrompt): Promise<void> {
  const { pendingAiPrompt } = await storageGet(["pendingAiPrompt"]) as { pendingAiPrompt?: PendingPrompt };
  if (!pendingAiPrompt || pendingAiPrompt.id !== prompt.id) return;

  const completedProviderIds = Array.from(new Set([...(pendingAiPrompt.completedProviderIds || []), currentProvider!.id]));
  await storageSet({ pendingAiPrompt: { ...pendingAiPrompt, completedProviderIds } });
}

async function tryHandoffPrompt(): Promise<boolean> {
  if (!currentProvider) return true;

  const { pendingAiPrompt } = await storageGet(["pendingAiPrompt"]) as { pendingAiPrompt?: PendingPrompt };
  if (!pendingAiPrompt?.query || !pendingAiPrompt.providerIds?.includes(currentProvider.id)) return true;
  if (Date.now() - pendingAiPrompt.createdAt > 3 * 60 * 1000) return true;
  if (pendingAiPrompt.completedProviderIds?.includes(currentProvider.id)) return true;
  if (sessionStorage.getItem(`ai-handoff-${pendingAiPrompt.id}-${currentProvider.id}`)) return true;

  dismissBlockingPrompts();
  const input = findPromptInput();
  if (!input) return false;

  fillInput(input, pendingAiPrompt.query);
  await new Promise((resolve) => window.setTimeout(resolve, 300));
  const submitted = submitPrompt(input);
  if (!submitted) return false;

  sessionStorage.setItem(`ai-handoff-${pendingAiPrompt.id}-${currentProvider.id}`, "1");
  await markCompleted(pendingAiPrompt);
  return true;
}

async function runWithRetries(): Promise<void> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const done = await tryHandoffPrompt();
    if (done) return;
    await new Promise((resolve) => window.setTimeout(resolve, 600));
  }
}

runWithRetries();
