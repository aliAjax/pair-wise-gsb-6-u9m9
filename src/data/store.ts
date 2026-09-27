import type {AppState, Pair, Workspace} from '../types';

const KEY = 'type-pairer:state:v1';
const LEGACY_KEY = 'type-pairs';

export const FONTS = ['Fraunces', 'DM Sans', 'Space Grotesk', 'Newsreader', 'IBM Plex Sans', 'Playfair Display'];

export const PAIR_DEFAULTS = {
  headingFont: 'Fraunces',
  bodyFont: 'DM Sans',
  size: 46,
  weight: 600,
  leading: 1.25,
  tracking: 0,
};

export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function seedPairs(workspaceId: string): Pair[] {
  const rows: Array<Pick<Pair, 'title' | 'heading' | 'body' | 'category' | 'favorite'>> = [
    {
      title: 'Editorial calm',
      heading: 'A slower way to see',
      body: 'Good typography creates space for ideas to breathe. Pair a confident display face with a quiet, generous text face.',
      category: 'Editorial',
      favorite: true,
    },
    {
      title: 'Studio notes',
      heading: 'Make room for the unexpected',
      body: 'A thoughtful pairing can add rhythm to even the simplest interface. Try contrast in shape, not just size.',
      category: 'Portfolio',
      favorite: false,
    },
    {
      title: 'Field guide',
      heading: 'Small details, lasting impressions',
      body: 'Typography is the voice of a page. Find a combination that feels clear, warm and distinctly yours.',
      category: 'Brand',
      favorite: false,
    },
  ];
  return rows.map((row) => ({...row, ...PAIR_DEFAULTS, id: uid(), workspaceId}));
}

function freshState(): AppState {
  const ws: Workspace = {id: uid(), name: '我的工作室', createdAt: Date.now()};
  const pairs = seedPairs(ws.id);
  return {
    workspaces: [ws],
    pairs,
    activeWorkspaceId: ws.id,
    selectedByWorkspace: {[ws.id]: pairs[0].id},
  };
}

/** 旧版本只有一份共享记录，迁移进默认工作区 */
function migrateLegacy(): AppState | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(LEGACY_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const old = JSON.parse(raw) as Array<Partial<Pair>>;
    if (!Array.isArray(old) || old.length === 0) return null;
    const ws: Workspace = {id: uid(), name: '我的工作室', createdAt: Date.now()};
    const pairs: Pair[] = old.map((p) => ({
      ...PAIR_DEFAULTS,
      id: String(p.id ?? uid()),
      workspaceId: ws.id,
      title: p.title ?? '未命名配对',
      heading: p.heading ?? 'Your new headline',
      body: p.body ?? '',
      category: p.category ?? '未分类',
      favorite: Boolean(p.favorite),
    }));
    localStorage.removeItem(LEGACY_KEY);
    return {
      workspaces: [ws],
      pairs,
      activeWorkspaceId: ws.id,
      selectedByWorkspace: {[ws.id]: pairs[0].id},
    };
  } catch {
    return null;
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as AppState;
      if (s && Array.isArray(s.workspaces) && Array.isArray(s.pairs)) {
        if (!s.workspaces.some((w) => w.id === s.activeWorkspaceId)) {
          s.activeWorkspaceId = s.workspaces[0]?.id ?? null;
        }
        s.selectedByWorkspace = s.selectedByWorkspace ?? {};
        return s;
      }
    }
  } catch {
    /* 数据损坏时回退到初始状态 */
  }
  return migrateLegacy() ?? freshState();
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 存储不可用时静默失败 */
  }
}
