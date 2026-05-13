export interface FontEntry {
  id: string;
  label: string;
  category: "zh" | "en";
  tone: string;
  source: string;
  bundled?: boolean;
  stack: string;
}

export const fontLibrary: FontEntry[] = [
  {
    id: "zhuque",
    label: "朱雀仿宋",
    category: "zh",
    tone: "书卷 / 仿宋",
    source: "TrionesType",
    bundled: true,
    stack: '"Zhuque Fangsong Local", "Zhuque Fangsong", "Noto Serif SC", "Songti SC", serif',
  },
  {
    id: "lxgw-wenkai",
    label: "霞鹜文楷",
    category: "zh",
    tone: "温润 / 文楷",
    source: "LXGW",
    stack: '"LXGW WenKai", "霞鹜文楷", "Klee One", "Songti SC", serif',
  },
  {
    id: "noto-serif-sc",
    label: "Noto Serif SC",
    category: "zh",
    tone: "宋体 / 正文",
    source: "Google",
    stack: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif',
  },
  {
    id: "source-han-serif",
    label: "思源宋体",
    category: "zh",
    tone: "现代宋 / 稳重",
    source: "Adobe / Google",
    stack: '"Source Han Serif SC", "Noto Serif CJK SC", "Noto Serif SC", "Songti SC", serif',
  },
  {
    id: "noto-sans-sc",
    label: "Noto Sans SC",
    category: "zh",
    tone: "黑体 / 清晰",
    source: "Google",
    stack: '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", sans-serif',
  },
  {
    id: "source-han-sans",
    label: "思源黑体",
    category: "zh",
    tone: "现代黑 / UI",
    source: "Adobe / Google",
    stack: '"Source Han Sans SC", "Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", sans-serif',
  },
  {
    id: "zcool-xiaowei",
    label: "站酷小薇",
    category: "zh",
    tone: "标题 / 复古",
    source: "Google Fonts",
    stack: '"ZCOOL XiaoWei", "站酷小薇LOGO体", "Noto Serif SC", serif',
  },
  {
    id: "ma-shan-zheng",
    label: "马善政毛笔",
    category: "zh",
    tone: "书法 / 手写",
    source: "Google Fonts",
    stack: '"Ma Shan Zheng", "STKaiti", "KaiTi", cursive',
  },
  {
    id: "long-cang",
    label: "龙藏体",
    category: "zh",
    tone: "行草 / 古意",
    source: "Google Fonts",
    stack: '"Long Cang", "STKaiti", "KaiTi", cursive',
  },
  {
    id: "alibaba-puhuiti",
    label: "阿里巴巴普惠体",
    category: "zh",
    tone: "品牌 / 现代",
    source: "Alibaba",
    stack: '"Alibaba PuHuiTi", "阿里巴巴普惠体", "PingFang SC", sans-serif',
  },
  {
    id: "bebas",
    label: "Bebas Neue",
    category: "en",
    tone: "窄高 / 锁屏",
    source: "Dharma Type",
    bundled: true,
    stack: '"Bebas Neue Local", "Bebas Neue", "DIN Condensed", "Arial Narrow", sans-serif',
  },
  {
    id: "oswald",
    label: "Oswald",
    category: "en",
    tone: "窄体 / 海报",
    source: "Google Fonts",
    stack: '"Oswald", "Arial Narrow", sans-serif',
  },
  {
    id: "anton",
    label: "Anton",
    category: "en",
    tone: "粗窄 / 冲击",
    source: "Google Fonts",
    stack: '"Anton", "Impact", "Arial Narrow", sans-serif',
  },
  {
    id: "teko",
    label: "Teko",
    category: "en",
    tone: "方正 / 数字",
    source: "Google Fonts",
    stack: '"Teko", "Rajdhani", "Arial Narrow", sans-serif',
  },
  {
    id: "rajdhani",
    label: "Rajdhani",
    category: "en",
    tone: "科技 / 方角",
    source: "Google Fonts",
    stack: '"Rajdhani", "DIN Alternate", sans-serif',
  },
  {
    id: "inter",
    label: "Inter",
    category: "en",
    tone: "UI / 清晰",
    source: "Rasmus Andersson",
    stack: '"Inter", system-ui, sans-serif',
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    category: "en",
    tone: "几何 / 科技",
    source: "Google Fonts",
    stack: '"Space Grotesk", "Inter", system-ui, sans-serif',
  },
  {
    id: "outfit",
    label: "Outfit",
    category: "en",
    tone: "圆润 / 现代",
    source: "Google Fonts",
    stack: '"Outfit", "Inter", system-ui, sans-serif',
  },
  {
    id: "playfair",
    label: "Playfair Display",
    category: "en",
    tone: "优雅 / 衬线",
    source: "Google Fonts",
    stack: '"Playfair Display", Georgia, serif',
  },
  {
    id: "cormorant",
    label: "Cormorant Garamond",
    category: "en",
    tone: "古典 / 文艺",
    source: "Google Fonts",
    stack: '"Cormorant Garamond", Garamond, Georgia, serif',
  },
];

export function getFontsByCategory(category: "zh" | "en"): FontEntry[] {
  return fontLibrary.filter((f) => f.category === category);
}

export function getFontById(id: string): FontEntry | undefined {
  return fontLibrary.find((f) => f.id === id);
}

export function getFontStack(id: string, fallbackCategory: "zh" | "en"): string {
  const font = getFontById(id) ?? getFontsByCategory(fallbackCategory)[0];
  return font?.stack ?? "system-ui, sans-serif";
}
