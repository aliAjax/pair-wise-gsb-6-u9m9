import {useState} from 'react';
import type {ClearStrategy, Workspace} from '../types';

function Backdrop({children, onClose}: {children: React.ReactNode; onClose: () => void}) {
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/** 新建工作区：名称重复时由 onCreate 返回错误文案，要求换一个 */
export function NewWorkspaceModal({onCreate, onClose}: {onCreate: (name: string) => string | null; onClose: () => void}) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const err = onCreate(name);
    if (err) setError(err);
    else onClose();
  };
  return (
    <Backdrop onClose={onClose}>
      <h2>新建工作区</h2>
      <label>
        工作区名称
        <input
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="例如：阿哲的配对"
        />
      </label>
      {error && <p className="error-text">{error}</p>}
      <div className="modal-actions">
        <button className="outline" onClick={onClose}>
          取消
        </button>
        <button className="primary" onClick={submit}>
          创建并进入
        </button>
      </div>
    </Backdrop>
  );
}

/** 清空工作区：先决定配对移到别的工作区，还是一并删除 */
export function ClearWorkspaceModal({
  workspace,
  pairCount,
  others,
  onConfirm,
  onClose,
}: {
  workspace: Workspace;
  pairCount: number;
  others: Workspace[];
  onConfirm: (strategy: ClearStrategy) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'move' | 'purge'>(others.length > 0 ? 'move' : 'purge');
  const [targetId, setTargetId] = useState(others[0]?.id ?? '');
  const confirm = () => onConfirm(mode === 'move' && targetId ? {type: 'move', targetId} : {type: 'purge'});
  return (
    <Backdrop onClose={onClose}>
      <h2>清空「{workspace.name}」</h2>
      <p className="modal-note">
        这个工作区里还有 {pairCount} 个配对。清空前先决定它们的去向，清空后这些记录不会再出现在「{workspace.name}」中。
      </p>
      <div className="radio-group">
        {others.length > 0 && (
          <label className={mode === 'move' ? 'radio on' : 'radio'}>
            <input type="radio" checked={mode === 'move'} onChange={() => setMode('move')} />
            <span>
              移动到其他工作区
              {mode === 'move' && (
                <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
                  {others.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              )}
            </span>
          </label>
        )}
        <label className={mode === 'purge' ? 'radio on' : 'radio'}>
          <input type="radio" checked={mode === 'purge'} onChange={() => setMode('purge')} />
          <span>一并删除，不再保留</span>
        </label>
      </div>
      <div className="modal-actions">
        <button className="outline" onClick={onClose}>
          取消
        </button>
        <button className="primary danger" onClick={confirm}>
          确认清空
        </button>
      </div>
    </Backdrop>
  );
}

export function NewPairModal({onCreate, onClose}: {onCreate: (title: string) => void; onClose: () => void}) {
  const [title, setTitle] = useState('');
  const submit = () => {
    if (!title.trim()) return;
    onCreate(title);
    onClose();
  };
  return (
    <Backdrop onClose={onClose}>
      <h2>新建配对</h2>
      <label>
        配对名称
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="例如：Quiet confidence"
        />
      </label>
      <div className="modal-actions">
        <button className="outline" onClick={onClose}>
          取消
        </button>
        <button className="primary" onClick={submit}>
          创建配对
        </button>
      </div>
    </Backdrop>
  );
}
