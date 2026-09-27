// ─── 切换规则层：工作区与配对的所有状态变更规则 ──────────────────────
// 纯函数 reducer，不碰 localStorage、不碰 React，方便单独测试与维护。

import {CanvasSettings, Pair, StoreData, Workspace, makePair, makeWorkspace} from '../data/store';

// 清空工作区时的两种决定：把配对移到别的工作区，或一并清掉。
export type ClearDecision = {mode: 'move'; targetId: string} | {mode: 'delete'};

export type Action =
  | {type: 'workspace/create'; name: string}
  | {type: 'workspace/switch'; id: string}
  | {type: 'workspace/clear'; id: string; decision: ClearDecision}
  | {type: 'pair/add'; title: string}
  | {type: 'pair/select'; id: string}
  | {type: 'pair/toggle-favorite'; id: string}
  | {type: 'pair/delete'; id: string}
  | {type: 'canvas/update'; patch: Partial<CanvasSettings>};

// 名称重复（忽略大小写与首尾空格）时，新建的人需要换一个名字。
export const nameTaken = (store: StoreData, name: string): boolean => {
  const wanted = name.trim().toLowerCase();
  return store.workspaces.some(w => w.name.trim().toLowerCase() === wanted);
};

// 配对与画布的操作一律只作用于当前工作区 —— 每个人只看到、只改到自己的内容。
const patchActive = (store: StoreData, fn: (ws: Workspace) => Workspace): StoreData => ({
  ...store,
  workspaces: store.workspaces.map(w => (w.id === store.activeId ? fn(w) : w)),
});

const patchPair = (ws: Workspace, id: string, fn: (p: Pair) => Pair): Workspace => ({
  ...ws,
  pairs: ws.pairs.map(p => (p.id === id ? fn(p) : p)),
});

export function reducer(store: StoreData, action: Action): StoreData {
  switch (action.type) {
    case 'workspace/create': {
      const name = action.name.trim();
      if (!name || nameTaken(store, name)) return store; // 重名则拒绝，由界面提示换名
      const ws = makeWorkspace(name);
      return {workspaces: [...store.workspaces, ws], activeId: ws.id}; // 建好即进入自己的工作区
    }

    case 'workspace/switch': {
      if (!store.workspaces.some(w => w.id === action.id)) return store;
      // 只换 activeId：列表、选中项、画布都随工作区本身一起切换。
      return {...store, activeId: action.id};
    }

    case 'workspace/clear': {
      const source = store.workspaces.find(w => w.id === action.id);
      if (!source || source.pairs.length === 0) return store;
      if (action.decision.mode === 'move') {
        const {targetId} = action.decision;
        if (targetId === action.id || !store.workspaces.some(w => w.id === targetId)) return store;
        return {
          ...store,
          workspaces: store.workspaces.map(w => {
            if (w.id === action.id) return {...w, pairs: [], selectedPairId: null}; // 旧工作区不再保留这些记录
            if (w.id === targetId) return {...w, pairs: [...w.pairs, ...source.pairs]}; // 收藏标记随配对一起带走
            return w;
          }),
        };
      }
      // 一并清掉：配对随清空删除，旧工作区不再出现这些记录。
      return {
        ...store,
        workspaces: store.workspaces.map(w => (w.id === action.id ? {...w, pairs: [], selectedPairId: null} : w)),
      };
    }

    case 'pair/add': {
      const title = action.title.trim();
      if (!title) return store;
      const pair = makePair(title);
      return patchActive(store, w => ({...w, pairs: [...w.pairs, pair], selectedPairId: pair.id}));
    }

    case 'pair/select':
      return patchActive(store, w => (w.pairs.some(p => p.id === action.id) ? {...w, selectedPairId: action.id} : w));

    case 'pair/toggle-favorite':
      return patchActive(store, w => patchPair(w, action.id, p => ({...p, favorite: !p.favorite})));

    case 'pair/delete':
      return patchActive(store, w => {
        const pairs = w.pairs.filter(p => p.id !== action.id);
        const selectedPairId = w.selectedPairId === action.id ? (pairs[0]?.id ?? null) : w.selectedPairId;
        return {...w, pairs, selectedPairId};
      });

    case 'canvas/update':
      return patchActive(store, w => ({...w, canvas: {...w.canvas, ...action.patch}}));

    default:
      return store;
  }
}
