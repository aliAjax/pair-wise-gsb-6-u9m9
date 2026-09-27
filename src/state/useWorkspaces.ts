// ─── 规则与 React 的桥接：加载上次位置、每次变更后自动落盘 ──────────

import {useEffect, useReducer} from 'react';
import {StoreData, loadStore, saveStore} from '../data/store';
import {reducer} from './workspaceRules';

export function useWorkspaces() {
  // loadStore 会带回上次所在的 activeId，下次打开回到上次的位置。
  const [store, dispatch] = useReducer(reducer, undefined as StoreData | undefined, s => s ?? loadStore());

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const active = store.workspaces.find(w => w.id === store.activeId) ?? store.workspaces[0] ?? null;

  return {store, active, dispatch};
}
