import type {AppState, Pair} from '../types';
import {PAIR_DEFAULTS, uid} from '../data/store';

/** 在当前工作区新建配对并选中它 */
export function addPair(state: AppState, title: string): AppState {
  if (!state.activeWorkspaceId || !title.trim()) return state;
  const pair: Pair = {
    ...PAIR_DEFAULTS,
    id: uid(),
    workspaceId: state.activeWorkspaceId,
    title: title.trim(),
    heading: '你的新标题',
    body: '写一句能展现这组字体性格的话，让配对自己开口。',
    category: '未分类',
    favorite: false,
  };
  return {
    ...state,
    pairs: [...state.pairs, pair],
    selectedByWorkspace: {...state.selectedByWorkspace, [state.activeWorkspaceId]: pair.id},
  };
}

export function updatePair(state: AppState, id: string, patch: Partial<Pair>): AppState {
  return {...state, pairs: state.pairs.map((p) => (p.id === id ? {...p, ...patch} : p))};
}

export function removePair(state: AppState, id: string): AppState {
  const pair = state.pairs.find((p) => p.id === id);
  if (!pair) return state;
  const pairs = state.pairs.filter((p) => p.id !== id);
  const selectedByWorkspace = {...state.selectedByWorkspace};
  if (selectedByWorkspace[pair.workspaceId] === id) {
    const next = pairs.find((p) => p.workspaceId === pair.workspaceId);
    if (next) selectedByWorkspace[pair.workspaceId] = next.id;
    else delete selectedByWorkspace[pair.workspaceId];
  }
  return {...state, pairs, selectedByWorkspace};
}

/** 选中配对，并记为所属工作区“上次的位置” */
export function selectPair(state: AppState, id: string): AppState {
  const pair = state.pairs.find((p) => p.id === id);
  if (!pair) return state;
  return {...state, selectedByWorkspace: {...state.selectedByWorkspace, [pair.workspaceId]: id}};
}
