export interface Provider {
  id: string;
  name: string;
  kind: "ai" | "search";
  url: string;
}

export const providers: Provider[] = [
  { id: "chatgpt", name: "ChatGPT", kind: "ai", url: "https://chatgpt.com/" },
  { id: "claude", name: "Claude", kind: "ai", url: "https://claude.ai/new" },
  { id: "grok", name: "Grok", kind: "ai", url: "https://grok.com/" },
  { id: "gemini", name: "Gemini", kind: "ai", url: "https://gemini.google.com/app" },
  { id: "kimi", name: "Kimi", kind: "ai", url: "https://www.kimi.com/" },
  { id: "deepseek", name: "DeepSeek", kind: "ai", url: "https://chat.deepseek.com/" },
  { id: "qwen", name: "Qwen", kind: "ai", url: "https://chat.qwen.ai/" },
  { id: "doubao", name: "豆包", kind: "ai", url: "https://www.doubao.com/chat/" },
  { id: "perplexity", name: "Perplexity", kind: "ai", url: "https://www.perplexity.ai/" },
  { id: "google", name: "Google", kind: "search", url: "https://www.google.com/search?q={query}" },
  { id: "bing", name: "Bing", kind: "search", url: "https://www.bing.com/search?q={query}" },
  { id: "baidu", name: "百度", kind: "search", url: "https://www.baidu.com/s?wd={query}" },
  { id: "duckduckgo", name: "DuckDuckGo", kind: "search", url: "https://duckduckgo.com/?q={query}" },
  { id: "brave", name: "Brave", kind: "search", url: "https://search.brave.com/search?q={query}" },
  { id: "sogou", name: "搜狗", kind: "search", url: "https://www.sogou.com/web?query={query}" },
  { id: "so360", name: "360", kind: "search", url: "https://www.so.com/s?q={query}" },
  { id: "yandex", name: "Yandex", kind: "search", url: "https://yandex.com/search/?text={query}" },
  { id: "github", name: "GitHub", kind: "search", url: "https://github.com/search?q={query}" },
  { id: "zhihu", name: "知乎", kind: "search", url: "https://www.zhihu.com/search?type=content&q={query}" },
  { id: "bilibili", name: "B站", kind: "search", url: "https://search.bilibili.com/all?keyword={query}" },
];

export const defaultProviderIds = ["google"];

export function buildProviderUrl(provider: Provider, query: string): string {
  return provider.url.replace("{query}", encodeURIComponent(query));
}

export function getVisibleProviders(activeKind: "ai" | "search" | null): Provider[] {
  return providers.filter((p) => !activeKind || p.kind === activeKind);
}

export function getSelectedProviders(selectedIds: string[]): Provider[] {
  return providers.filter((p) => selectedIds.includes(p.id));
}

export function getPrimaryProvider(selectedIds: string[]): Provider {
  return getSelectedProviders(selectedIds)[0] ?? providers.find((p) => p.id === "google")!;
}
