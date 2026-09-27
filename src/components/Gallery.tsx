import {BookOpen, Grid3X3, Heart} from 'lucide-react';
import type {Pair} from '../data/store';
import type {Filter} from './Sidebar';

type Props = {
  pairs: Pair[];
  selectedId: string | null;
  filter: Filter;
  workspaceName: string;
  onSelect: (id: string) => void;
};

export default function Gallery({pairs, selectedId, filter, workspaceName, onSelect}: Props) {
  return (
    <section className="gallery">
      <div className="gallery-head">
        <div>
          <h2>Saved pairings</h2>
          <span>
            {pairs.length} {filter === 'fav' ? 'favorites' : 'compositions'} · {workspaceName}
          </span>
        </div>
        <div className="view-toggle">
          <button className="on"><Grid3X3 size={14} /></button>
          <button><BookOpen size={14} /></button>
        </div>
      </div>

      {pairs.length === 0 ? (
        <div className="empty">
          {filter === 'fav'
            ? 'No favorites in this workspace yet — tap the star on the canvas to keep one.'
            : 'This workspace is empty. Create a pairing to make it yours.'}
        </div>
      ) : (
        <div className="pair-list">
          {pairs.map(p => (
            <button key={p.id} className={selectedId === p.id ? 'pair selected' : 'pair'} onClick={() => onSelect(p.id)}>
              <div className="pair-top">
                <span>{p.category}</span>
                <Heart size={15} fill={p.favorite ? '#e88769' : 'none'} color={p.favorite ? '#e88769' : '#aeb5b7'} />
              </div>
              <strong>{p.heading}</strong>
              <p>{p.body}</p>
              <div className="pair-foot"><span>{p.title}</span><small>Open canvas →</small></div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
