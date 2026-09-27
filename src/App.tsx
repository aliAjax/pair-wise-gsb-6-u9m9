import {useEffect, useState} from 'react';
import {Plus} from 'lucide-react';
import type {AppState, ClearStrategy} from './types';
import {loadState, saveState} from './data/store';
import {clearWorkspace, createWorkspace, selectedPairId, switchWorkspace} from './lib/workspaceRules';
import {addPair, removePair, selectPair, updatePair} from './lib/pairRules';
import Sidebar, {type Filter} from './components/Sidebar';
import Gallery from './components/Gallery';
import Studio from './components/Studio';
import {ClearWorkspaceModal, NewPairModal, NewWorkspaceModal} from './components/Modals';

type Modal = {kind: 'new-workspace'} | {kind: 'new-pair'} | {kind: 'clear-workspace'; id: string} | null;

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [filter, setFilter] = useState<Filter>('all');
  const [modal, setModal] = useState<Modal>(null);

  // 任何变化都写回本地，下次打开回到上次的工作区与画布位置
  useEffect(() => saveState(state), [state]);

  const activeWorkspace = state.workspaces.find((w) => w.id === state.activeWorkspaceId) ?? null;
  const workspacePairs = state.pairs.filter((p) => p.workspaceId === state.activeWorkspaceId);
  const visiblePairs = filter === 'favorites' ? workspacePairs.filter((p) => p.favorite) : workspacePairs;
  const current = workspacePairs.find((p) => p.id === selectedPairId(state)) ?? null;

  const clearing = modal?.kind === 'clear-workspace' ? state.workspaces.find((w) => w.id === modal.id) : null;

  const handleCreateWorkspace = (name: string): string | null => {
    const result = createWorkspace(state, name);
    if (!result.error) setState(result.state);
    return result.error;
  };

  const handleClearWorkspace = (id: string, strategy: ClearStrategy) => {
    setState((s) => clearWorkspace(s, id, strategy));
    setModal(null);
  };

  return (
    <div className="app">
      <Sidebar
        state={state}
        filter={filter}
        onFilter={setFilter}
        onSwitchWorkspace={(id) => setState((s) => switchWorkspace(s, id))}
        onNewWorkspace={() => setModal({kind: 'new-workspace'})}
        onClearWorkspace={(id) => setModal({kind: 'clear-workspace', id})}
      />

      <main>
        {activeWorkspace ? (
          <>
            <header>
              <div>
                <div className="crumb">
                  工作区 / <b>{activeWorkspace.name}</b>
                </div>
                <h1>Find the right conversation.</h1>
                <p>这里只显示「{activeWorkspace.name}」的配对与收藏，切换工作区后列表和画布会一起更换。</p>
              </div>
              <div className="actions">
                <button className="primary" onClick={() => setModal({kind: 'new-pair'})}>
                  <Plus size={16} />
                  新建配对
                </button>
              </div>
            </header>
            <div className="layout">
              <Gallery
                pairs={visiblePairs}
                selectedId={current?.id ?? null}
                filtered={filter === 'favorites'}
                onSelect={(id) => setState((s) => selectPair(s, id))}
              />
              {current ? (
                <Studio
                  pair={current}
                  onPatch={(patch) => setState((s) => updatePair(s, current.id, patch))}
                  onDelete={() => setState((s) => removePair(s, current.id))}
                />
              ) : (
                <section className="studio">
                  <div className="empty canvas-empty">
                    <p>还没有可编辑的配对，先新建一组吧。</p>
                  </div>
                </section>
              )}
            </div>
          </>
        ) : (
          <div className="empty no-workspace">
            <h1>还没有工作区</h1>
            <p>为每位同事建一个命名工作区，各自的配对和收藏互不干扰。</p>
            <button className="primary" onClick={() => setModal({kind: 'new-workspace'})}>
              <Plus size={16} />
              新建工作区
            </button>
          </div>
        )}
      </main>

      {modal?.kind === 'new-workspace' && <NewWorkspaceModal onCreate={handleCreateWorkspace} onClose={() => setModal(null)} />}
      {modal?.kind === 'new-pair' && (
        <NewPairModal onCreate={(title) => setState((s) => addPair(s, title))} onClose={() => setModal(null)} />
      )}
      {clearing && (
        <ClearWorkspaceModal
          workspace={clearing}
          pairCount={state.pairs.filter((p) => p.workspaceId === clearing.id).length}
          others={state.workspaces.filter((w) => w.id !== clearing.id)}
          onConfirm={(strategy) => handleClearWorkspace(clearing.id, strategy)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
