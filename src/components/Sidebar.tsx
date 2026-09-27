import {Eraser, Grid3X3, Heart, Plus, Type} from 'lucide-react';
import type {Workspace} from '../data/store';

const PALETTE = ['#e8b7a0', '#9fc9be', '#b4add8', '#d9c08b', '#a8c6e8', '#e3a9b6'];
export const wsColor = (name: string): string =>
  PALETTE[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % PALETTE.length];

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase();

export type Filter = 'all' | 'fav';

type Props = {
  workspaces: Workspace[];
  active: Workspace | null;
  filter: Filter;
  onFilter: (f: Filter) => void;
  onSwitch: (id: string) => void;
  onNewWorkspace: () => void;
  onClearWorkspace: (id: string) => void;
};

export default function Sidebar({workspaces, active, filter, onFilter, onSwitch, onNewWorkspace, onClearWorkspace}: Props) {
  const pairCount = active?.pairs.length ?? 0;
  const favCount = active?.pairs.filter(p => p.favorite).length ?? 0;

  return (
    <aside>
      <div className="brand">
        <div className="brand-mark"><Type size={18} /></div>
        <div><b>Type Pairer</b><small>FIND YOUR VOICE</small></div>
      </div>

      <div className="nav-section">
        <span>LIBRARY</span>
        <button className={filter === 'all' ? 'nav active' : 'nav'} onClick={() => onFilter('all')}>
          <Grid3X3 size={16} />All pairings <b>{pairCount}</b>
        </button>
        <button className={filter === 'fav' ? 'nav active' : 'nav'} onClick={() => onFilter('fav')}>
          <Heart size={16} />Favorites <b>{favCount}</b>
        </button>
      </div>

      <div className="saved">
        <div className="saved-head">
          <span>WORKSPACES</span>
          <button onClick={onNewWorkspace} title="Create a workspace"><Plus size={14} /></button>
        </div>
        {workspaces.map(w => (
          <div key={w.id} className={w.id === active?.id ? 'ws-row active-ws' : 'ws-row'}>
            <button className="ws-main" onClick={() => onSwitch(w.id)} title={`Switch to ${w.name}`}>
              <i style={{background: wsColor(w.name)}} />
              {w.name} <b>{w.pairs.length}</b>
            </button>
            <button
              className="ws-clear"
              title={`Clear ${w.name}`}
              disabled={w.pairs.length === 0}
              onClick={() => onClearWorkspace(w.id)}
            >
              <Eraser size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className="aside-foot">
        <div className="profile">
          <div className="avatar" style={{background: active ? '#c9d9cf' : '#e3e6e4'}}>
            {active ? initials(active.name) : '–'}
          </div>
          <div>
            <b>{active?.name ?? 'No workspace'}</b>
            <small>Active workspace</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
