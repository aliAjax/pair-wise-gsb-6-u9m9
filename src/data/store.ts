// ─── 资料层：类型、本地持久化、旧数据迁移 ─────────────────────────────
// 这一层只管「数据长什么样、存到哪里去」，不含任何切换规则或页面逻辑。

export type Pair = {
  id: string;
  title: string;
  heading: string;
  body: string;
  category: string;
  favorite: boolean;
};

export type CanvasSettings = {
  headingFont: string;
  bodyFont: string;
  size: number;
  weight: number;
  leading: number;
  tracking: number;
};

// 每个工作区自带配对列表、当前选中的配对和画布设置，
// 因此切换工作区时列表与画布会自然一起换。
export type Workspace = {
  id: string;
  name: string;
  pairs: Pair[];
  selectedPairId: string | null;
  canvas: CanvasSettings;
};

export type StoreData = {
  workspaces: Workspace[];
  activeId: string | null; // 上次所在的工作区，下次打开回到这里
};

export const FONT_OPTIONS = ['Fraunces', 'DM Sans', 'Space Grotesk', 'Newsreader', 'IBM Plex Sans', 'Playfair Display'];

export const uid = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const defaultCanvas = (): CanvasSettings => ({
  headingFont: 'Fraunces',
  bodyFont: 'DM Sans',
  size: 46,
  weight: 600,
  leading: 1.25,
  tracking: 0,
});

export const makePair = (title: string): Pair => ({
  id: uid(),
  title,
  heading: 'Your new headline',
  body: 'Start with a sentence that lets your type pairing show its character.',
  category: 'Untitled',
  favorite: false,
});

export const makeWorkspace = (name: string, pairs: Pair[] = []): Workspace => ({
  id: uid(),
  name,
  pairs,
  selectedPairId: pairs[0]?.id ?? null,
  canvas: defaultCanvas(),
});

const STORE_KEY = 'type-pairer.store.v1';
const LEGACY_KEY = 'type-pairs'; // 共用电脑时代所有人挤在一起的旧记录

const seedPairs = (): Pair[] => [
  {
    id: 'seed-1',
    title: 'Editorial calm',
    heading: 'A slower way to see',
    body: 'Good typography creates space for ideas to breathe. Pair a confident display face with a quiet, generous text face.',
    category: 'Editorial',
    favorite: true,
  },
  {
    id: 'seed-2',
    title: 'Studio notes',
    heading: 'Make room for the unexpected',
    body: 'A thoughtful pairing can add rhythm to even the simplest interface. Try contrast in shape, not just size.',
    category: 'Portfolio',
    favorite: false,
  },
  {
    id: 'seed-3',
    title: 'Field guide',
    heading: 'Small details, lasting impressions',
    body: 'Typography is the voice of a page. Find a combination that feels clear, warm and distinctly yours.',
    category: 'Brand',
    favorite: false,
  },
];

// 旧版单份记录迁移：原样搬进一个公共工作区，不丢任何人的内容。
const migrateLegacy = (): StoreData | null => {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const legacy = JSON.parse(raw);
    if (!Array.isArray(legacy) || legacy.length === 0) return null;
    const pairs: Pair[] = legacy.map((p: Partial<Pair>) => ({
      id: String(p.id ?? uid()),
      title: String(p.title ?? 'Untitled'),
      heading: String(p.heading ?? ''),
      body: String(p.body ?? ''),
      category: String(p.category ?? 'Untitled'),
      favorite: Boolean(p.favorite),
    }));
    const ws = makeWorkspace('Studio', pairs);
    return {workspaces: [ws], activeId: ws.id};
  } catch {
    return null;
  }
};

const freshStore = (): StoreData => {
  const ws = makeWorkspace('Studio', seedPairs());
  return {workspaces: [ws], activeId: ws.id};
};

// 模块级缓存让加载幂等：StrictMode 重复调用 init 也不会把迁移结果冲掉。
let cache: StoreData | null = null;

export function loadStore(): StoreData {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as StoreData;
      if (data && Array.isArray(data.workspaces) && data.workspaces.length > 0) {
        cache = data;
        return data;
      }
    }
  } catch {
    // 数据损坏时回到初始状态
  }
  cache = migrateLegacy() ?? freshStore();
  return cache;
}

export function saveStore(data: StoreData): void {
  cache = data;
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  localStorage.removeItem(LEGACY_KEY); // 迁移完成后清掉旧钥匙，避免下次重复迁移
}
