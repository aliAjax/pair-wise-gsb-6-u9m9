import {useState} from 'react';
import type {Workspace} from '../data/store';
import type {ClearDecision} from '../state/workspaceRules';

function Modal({title, onClose, children}: {title: string; onClose: () => void; children: React.ReactNode}) {
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function NewPairingModal({onCreate, onClose}: {onCreate: (title: string) => void; onClose: () => void}) {
  const [title, setTitle] = useState('');
  const submit = () => {
    if (!title.trim()) return;
    onCreate(title.trim());
  };
  return (
    <Modal title="New pairing" onClose={onClose}>
      <label>Pairing name
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="e.g. Quiet confidence"
        />
      </label>
      <div className="modal-actions">
        <button className="outline" onClick={onClose}>Cancel</button>
        <button className="primary" onClick={submit}>Create pairing</button>
      </div>
    </Modal>
  );
}

export function NewWorkspaceModal({
  nameTaken,
  onCreate,
  onClose,
}: {
  nameTaken: (name: string) => boolean;
  onCreate: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const submit = () => {
    const n = name.trim();
    if (!n) {
      setError('Give the workspace a name.');
      return;
    }
    if (nameTaken(n)) {
      // 名称重复：让新建的人换一个
      setError(`“${n}” is already taken — pick another name.`);
      return;
    }
    onCreate(n);
  };
  return (
    <Modal title="New workspace" onClose={onClose}>
      <label>Workspace name
        <input
          autoFocus
          value={name}
          onChange={e => {
            setName(e.target.value);
            setError('');
          }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="e.g. Yuki, Aoi, Shared…"
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <p className="modal-note">Each workspace keeps its own pairings, favorites and canvas. You will switch into it right away.</p>
      <div className="modal-actions">
        <button className="outline" onClick={onClose}>Cancel</button>
        <button className="primary" onClick={submit}>Create workspace</button>
      </div>
    </Modal>
  );
}

export function ClearWorkspaceModal({
  workspace,
  targets,
  onConfirm,
  onClose,
}: {
  workspace: Workspace;
  targets: Workspace[];
  onConfirm: (decision: ClearDecision) => void;
  onClose: () => void;
}) {
  const canMove = targets.length > 0;
  const [mode, setMode] = useState<'move' | 'delete'>(canMove ? 'move' : 'delete');
  const [targetId, setTargetId] = useState(targets[0]?.id ?? '');
  const count = workspace.pairs.length;

  const confirm = () => {
    if (mode === 'move') {
      if (!targetId) return;
      onConfirm({mode: 'move', targetId});
    } else {
      onConfirm({mode: 'delete'});
    }
  };

  return (
    <Modal title={`Clear “${workspace.name}”`} onClose={onClose}>
      <p className="modal-lead">
        Before clearing, decide what happens to the {count} {count === 1 ? 'pairing' : 'pairings'} inside.
      </p>

      <label className={mode === 'move' ? 'choice picked' : canMove ? 'choice' : 'choice disabled'}>
        <input
          type="radio"
          name="clear-mode"
          disabled={!canMove}
          checked={mode === 'move'}
          onChange={() => setMode('move')}
        />
        <span>
          Move them to another workspace
          {canMove ? (
            <select value={targetId} onChange={e => setTargetId(e.target.value)} onClick={e => e.stopPropagation()}>
              {targets.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          ) : (
            <em>No other workspace exists yet.</em>
          )}
        </span>
      </label>

      <label className={mode === 'delete' ? 'choice picked' : 'choice'}>
        <input type="radio" name="clear-mode" checked={mode === 'delete'} onChange={() => setMode('delete')} />
        <span>Delete them along with the clear — this cannot be undone.</span>
      </label>

      <p className="modal-note">Either way, “{workspace.name}” keeps no record of these pairings afterwards.</p>

      <div className="modal-actions">
        <button className="outline" onClick={onClose}>Cancel</button>
        <button className="danger" onClick={confirm} disabled={mode === 'move' && !targetId}>
          Clear workspace
        </button>
      </div>
    </Modal>
  );
}
