import {Grid3X3, Heart, Plus, Trash2, Type} from 'lucide-react';
import type {AppState} from '../types';

export type Filter = 'all' | 'favorites';

const PALETTE = ['#e8b7a0', '#9fc9be', '#b4add8', '#d9c98a', '#a8c4e0', '#e0a8b8'];

function colorFor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

type Props = {
  state: AppState;
  filter: Filter;
  onFilter: (filter: Filter) => void;
  onSwitchWorkspace: (id: string) => void;
  onNewWorkspace: () => void;
  onClearWorkspace: (id: string) => void;
};

export default function Sidebar({state, filter, onFilter, onSwitchWorkspace, onNewWorkspace, onClearWorkspace}: Props) {
  const active = state.workspaces.find((w) => w.id === state.activeWorkspaceId) ?? null;
  const workspacePairs = state.pairs.filter((p) => p.workspaceId === state.activeWorkspaceId);
  const favoriteCount = workspacePairs.filter((p) => p.favorite).length;

  return (
    <aside>
      <div className="brand">
        <div className="brand-mark">
          <Type size={18} />
        </div>
        <div>
          <b>Type Pairer</b>
          <small>FIND YOUR VOICE</small>
        </div>
      </div>

      <div className="nav-section">
        <span>LIBRARY</span>
        <button className={filter === 'all' ? 'nav active' : 'nav'} onClick={() => onFilter('all')}>
          <Grid3X3 size={16} />
          全部配对 <b>{workspacePairs.length}</b>
        </button>
        <button className={filter === 'favorites' ? 'nav active' : 'nav'} onClick={() => onFilter('favorites')}>
          <Heart size={16} />
          收藏 <b>{favoriteCount}</b>
        </button>
      </div>

      <div className="saved">
        <div className="saved-head">
          <span>工作区</span>
          <button title="新建工作区" onClick={onNewWorkspace}>
            <Plus size={14} />
          </button>
        </div>
        {state.workspaces.map((w) => {
          const count = state.pairs.filter((p) => p.workspaceId === w.id).length;
          const isActive = w.id === state.activeWorkspaceId;
          return (
            <div key={w.id} className={isActive ? 'ws-row active' : 'ws-row'}>
              <button className="ws-name" onClick={() => onSwitchWorkspace(w.id)}>
                <i style={{background: colorFor(w.id)}} />
                <span className="ws-label">{w.name}</span>
                <b>{count}</b>
              </button>
              <button className="ws-del" title={`清空「${w.name}」`} onClick={() => onClearWorkspace(w.id)}>
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="aside-foot">
        <div className="profile">
          <div className="avatar">{active ? active.name.slice(0, 1).toUpperCase() : '–'}</div>
          <div>
            <b>{active?.name ?? '未选择工作区'}</b>
            <small>当前工作区</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
