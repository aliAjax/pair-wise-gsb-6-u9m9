import {Heart} from 'lucide-react';
import type {Pair} from '../types';

type Props = {
  pairs: Pair[];
  selectedId: string | null;
  filtered: boolean;
  onSelect: (id: string) => void;
};

export default function Gallery({pairs, selectedId, filtered, onSelect}: Props) {
  return (
    <section className="gallery">
      <div className="gallery-head">
        <div>
          <h2>已保存的配对</h2>
          <span>{pairs.length} 组{filtered ? '收藏' : '配对'}</span>
        </div>
      </div>
      {pairs.length === 0 ? (
        <div className="empty">
          <p>{filtered ? '这个工作区还没有收藏任何配对。' : '这个工作区还没有配对，从右上角新建一组吧。'}</p>
        </div>
      ) : (
        <div className="pair-list">
          {pairs.map((p) => (
            <button
              key={p.id}
              className={selectedId === p.id ? 'pair selected' : 'pair'}
              onClick={() => onSelect(p.id)}
            >
              <div className="pair-top">
                <span>{p.category}</span>
                <Heart size={15} fill={p.favorite ? '#e88769' : 'none'} color={p.favorite ? '#e88769' : '#aeb5b7'} />
              </div>
              <strong style={{fontFamily: `'${p.headingFont}', serif`}}>{p.heading}</strong>
              <p style={{fontFamily: `'${p.bodyFont}', sans-serif`}}>{p.body}</p>
              <div className="pair-foot">
                <span>{p.title}</span>
                <small>打开画布 →</small>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
