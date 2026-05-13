export const dailyQuotes: [string, string][] = [
  ["把注意力放回今天能做好的事。", "今日"],
  ["缓慢也是一种认真，只要方向还在。", "备忘"],
  ["先完成一个小闭环，世界就会松动一点。", "行动"],
  ["不要急着变厉害，先变清楚。", "清醒"],
  ["真正的效率，是少一点内耗，多一点抵达。", "效率"],
  ["留白不是空着，是给更重要的东西让路。", "留白"],
  ["今天的你，只需要比昨天多靠近一点。", "靠近"],
  ["把复杂交给系统，把温柔留给自己。", "系统"],
  ["有些答案不是想出来的，是做出来的。", "实践"],
  ["先把问题放到桌面上，它就已经小了一半。", "问题"],
];

export function getDailyQuote(): string {
  const now = new Date();
  const dayKey = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000);
  const [quote] = dailyQuotes[dayKey % dailyQuotes.length];
  return quote;
}
