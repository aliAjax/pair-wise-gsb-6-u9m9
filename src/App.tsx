import {useState} from 'react';
import {Download, Plus} from 'lucide-react';
import Gallery from './components/Gallery';
import Sidebar, {Filter} from './components/Sidebar';
import Studio from './components/Studio';
import {ClearWorkspaceModal, NewPairingModal, NewWorkspaceModal} from './components/modals';
import {useWorkspaces} from './state/useWorkspaces';
import {nameTaken} from './state/workspaceRules';

type ModalState = {kind: 'pair'} | {kind: 'workspace'} | {kind: 'clear'; id: string} | null;

export default function App() {
  const {store, active, dispatch} = useWorkspaces();
  const [filter, setFilter] = useState<Filter>('all');
  const [modal, setModal] = useState<ModalState>(null);
  const close = () => setModal(null);

  const pairs = active?.pairs ?? [];
  const visible = filter === 'fav' ? pairs.filter(p => p.favorite) : pairs;
  const current = pairs.find(p => p.id === active?.selectedPairId) ?? pairs[0] ?? null;
  const currentNumber = current ? pairs.findIndex(p => p.id === current.id) + 1 : 0;

  // 切换工作区：列表与画布随 activeId 一起换，筛选器回到全部。
  const switchWorkspace = (id: string) => {
    dispatch({type: 'workspace/switch', id});
    setFilter('all');
  };

  const exportCss = () => {
    if (!current || !active) return;
    const c = active.canvas;
    const css = `/* ${current.title} · ${active.name} */\n.heading { font-family: '${c.headingFont}'; font-size: ${c.size}px; font-weight: ${c.weight}; }\n.body { font-family: '${c.bodyFont}'; line-height: ${c.leading}; letter-spacing: ${c.tracking}px; }`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([css], {type: 'text/css'}));
    a.download = 'type-pair.css';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const clearing = modal?.kind === 'clear' ? store.workspaces.find(w => w.id === modal.id) : undefined;

  return (
    <div className="app">
      <Sidebar
        workspaces={store.workspaces}
        active={active}
        filter={filter}
        onFilter={setFilter}
        onSwitch={switchWorkspace}
        onNewWorkspace={() => setModal({kind: 'workspace'})}
        onClearWorkspace={id => setModal({kind: 'clear', id})}
      />

      <main>
        <header>
          <div>
            <div className="crumb">TYPE LIBRARY / <b>{(active?.name ?? 'WORKSPACE').toUpperCase()}</b></div>
            <h1>Find the right conversation.</h1>
            <p>Explore combinations, tune the details, and save what feels like you.</p>
          </div>
          <div className="actions">
            <button className="outline" onClick={exportCss} disabled={!current}><Download size={15} />Copy CSS</button>
            <button className="primary" onClick={() => setModal({kind: 'pair'})}><Plus size={16} />New pairing</button>
          </div>
        </header>

        <div className="layout">
          <Gallery
            pairs={visible}
            selectedId={current?.id ?? null}
            filter={filter}
            workspaceName={active?.name ?? ''}
            onSelect={id => dispatch({type: 'pair/select', id})}
          />
          <Studio
            pair={current}
            pairNumber={currentNumber}
            canvas={active?.canvas ?? {headingFont: 'Fraunces', bodyFont: 'DM Sans', size: 46, weight: 600, leading: 1.25, tracking: 0}}
            onCanvas={patch => dispatch({type: 'canvas/update', patch})}
            onToggleFavorite={() => current && dispatch({type: 'pair/toggle-favorite', id: current.id})}
            onDelete={() => current && dispatch({type: 'pair/delete', id: current.id})}
          />
        </div>
      </main>

      {modal?.kind === 'pair' && (
        <NewPairingModal
          onClose={close}
          onCreate={title => {
            dispatch({type: 'pair/add', title});
            close();
          }}
        />
      )}

      {modal?.kind === 'workspace' && (
        <NewWorkspaceModal
          nameTaken={n => nameTaken(store, n)}
          onClose={close}
          onCreate={name => {
            dispatch({type: 'workspace/create', name});
            setFilter('all');
            close();
          }}
        />
      )}

      {clearing && (
        <ClearWorkspaceModal
          workspace={clearing}
          targets={store.workspaces.filter(w => w.id !== clearing.id)}
          onClose={close}
          onConfirm={decision => {
            dispatch({type: 'workspace/clear', id: clearing.id, decision});
            close();
          }}
        />
      )}
    </div>
  );
}
