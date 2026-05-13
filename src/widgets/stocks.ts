import { setStorage } from "../core/storage";
import type { StockQuote } from "../core/state";

export function normalizeStockSymbol(value: string): string {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function stockLink(symbol: string): string {
  return `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`;
}

export function renderStocks(stocks: string[], quotes: Record<string, StockQuote>): void {
  const list = document.getElementById("stocksList");
  if (!list) return;
  list.innerHTML = "";

  stocks.forEach((symbol) => {
    const quote = quotes[symbol];
    const card = document.createElement("a");
    card.className = "stock-card";
    card.href = stockLink(symbol);
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const symbolText = document.createElement("span");
    symbolText.className = "stock-symbol";
    symbolText.textContent = symbol;

    const priceText = document.createElement("span");
    priceText.className = "stock-price";
    priceText.textContent = quote?.price ? String(quote.price) : "--";

    const changeText = document.createElement("span");
    changeText.className = "stock-change";
    const changeValue = quote?.changePercent;
    changeText.textContent = Number.isFinite(changeValue) ? `${changeValue! > 0 ? "+" : ""}${(changeValue as number).toFixed(2)}%` : "待刷新";
    changeText.classList.toggle("up", Number.isFinite(changeValue) && changeValue! >= 0);
    changeText.classList.toggle("down", Number.isFinite(changeValue) && changeValue! < 0);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-stock-button";
    removeBtn.type = "button";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", `删除 ${symbol}`);
    removeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      removeStock(symbol);
    });

    card.append(symbolText, priceText, changeText, removeBtn);
    list.appendChild(card);
  });
}

export async function fetchStocks(stocks: string[]): Promise<Record<string, StockQuote>> {
  if (stocks.length === 0) return {};

  try {
    const symbols = stocks.map(encodeURIComponent).join(",");
    const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`);
    if (!response.ok) throw new Error("stocks unavailable");

    const data = await response.json();
    const quotes = (data.quoteResponse?.result || []) as Array<{
      symbol: string;
      regularMarketPrice: number;
      regularMarketChangePercent: number;
    }>;

    return Object.fromEntries(
      quotes.map((q) => [
        q.symbol,
        {
          price: Number.isFinite(q.regularMarketPrice) ? q.regularMarketPrice.toFixed(2) : "",
          changePercent: q.regularMarketChangePercent,
        },
      ])
    );
  } catch {
    return {};
  }
}

async function removeStock(symbol: string): Promise<void> {
  // This will be wired up in main.ts via state management
  // For now, dispatch a custom event
  window.dispatchEvent(new CustomEvent("remove-stock", { detail: symbol }));
}
