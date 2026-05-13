import { getDailyQuote } from "../config/quotes";

export function renderQuote(): void {
  const el = document.getElementById("dailyQuoteText");
  if (el) el.textContent = getDailyQuote();
}
