import type {AppState, ClearStrategy, Workspace} from '../types';
import {uid} from '../data/store';

/** 校验工作区名称；返回错误文案，合法时返回 null */
export function validateWorkspaceName(workspaces: Workspace[], raw: string): string | null {
  const name = raw.trim();
  if (!name) return '请输入工作区名称';
  if (name.length > 24) return '名称最多 24 个字符';
  const clash = workspaces.some((w) => w.name.trim().toLowerCase() === name.toLowerCase());
  if (clash) return '该名称已被使用，请换一个';
  return null;
}

/** 新建工作区并切换过去；名称重复时不改动状态，返回错误 */
export function createWorkspace(state: AppState, rawName: string): {state: AppState; error: string | null} {
  const error = validateWorkspaceName(state.workspaces, rawName);
  if (error) return {state, error};
  const ws: Workspace = {id: uid(), name: rawName.trim(), createdAt: Date.now()};
  return {
    error: null,
    state: {...state, workspaces: [...state.workspaces, ws], activeWorkspaceId: ws.id},
  };
}

/** 当前工作区里应选中的配对：优先该工作区上次的位置，否则第一个 */
export function selectedPairId(state: AppState): string | null {
  if (!state.activeWorkspaceId) return null;
  const inWorkspace = state.pairs.filter((p) => p.workspaceId === state.activeWorkspaceId);
  const remembered = state.selectedByWorkspace[state.activeWorkspaceId];
  if (remembered && inWorkspace.some((p) => p.id === remembered)) return remembered;
  return inWorkspace[0]?.id ?? null;
}

/** 切换工作区：列表与画布随 activeWorkspaceId 一起换 */
export function switchWorkspace(state: AppState, id: string): AppState {
  if (id === state.activeWorkspaceId) return state;
  if (!state.workspaces.some((w) => w.id === id)) return state;
  return {...state, activeWorkspaceId: id};
}

/**
 * 清空工作区。配对要么移到 targetId 工作区，要么一并删除；
 * 无论哪种，旧工作区及其选中记录都不再保留。
 */
export function clearWorkspace(state: AppState, id: string, strategy: ClearStrategy): AppState {
  if (!state.workspaces.some((w) => w.id === id)) return state;
  const workspaces = state.workspaces.filter((w) => w.id !== id);
  const moveTarget =
    strategy.type === 'move' && workspaces.some((w) => w.id === strategy.targetId) ? strategy.targetId : null;
  const pairs = moveTarget
    ? state.pairs.map((p) => (p.workspaceId === id ? {...p, workspaceId: moveTarget} : p))
    : state.pairs.filter((p) => p.workspaceId !== id);
  const selectedByWorkspace = {...state.selectedByWorkspace};
  delete selectedByWorkspace[id];
  const activeWorkspaceId =
    state.activeWorkspaceId === id ? (moveTarget ?? workspaces[0]?.id ?? null) : state.activeWorkspaceId;
  return {workspaces, pairs, activeWorkspaceId, selectedByWorkspace};
}
