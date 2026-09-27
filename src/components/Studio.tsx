import {SlidersHorizontal, Star, Trash2} from 'lucide-react';
import {CanvasSettings, FONT_OPTIONS, Pair} from '../data/store';

type Props = {
  pair: Pair | null;
  pairNumber: number;
  canvas: CanvasSettings;
  onCanvas: (patch: Partial<CanvasSettings>) => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
};

export default function Studio({pair, pairNumber, canvas, onCanvas, onToggleFavorite, onDelete}: Props) {
  if (!pair) {
    return (
      <section className="studio">
        <div className="studio-head">
          <div><span>PAIRING CANVAS</span><h2>Nothing on the canvas</h2></div>
        </div>
        <div className="empty">This workspace has no pairings yet. Create one and it will show up here.</div>
      </section>
    );
  }

  return (
    <section className="studio">
      <div className="studio-head">
        <div><span>PAIRING CANVAS</span><h2>{pair.title}</h2></div>
        <button className="favorite" onClick={onToggleFavorite} title="Toggle favorite">
          <Star size={16} fill={pair.favorite ? '#e5a35e' : 'none'} color={pair.favorite ? '#e5a35e' : '#98a4a7'} />
        </button>
      </div>

      <div className="canvas">
        <div className="canvas-bar">
          <span>PREVIEW</span>
          <div><button>Desktop</button><button>Tablet</button><button>Mobile</button></div>
        </div>
        <div className="preview">
          <span className="preview-kicker">A NOTE ON TYPE</span>
          <h3 style={{fontFamily: canvas.headingFont, fontSize: `${canvas.size}px`, fontWeight: canvas.weight, letterSpacing: `${canvas.tracking}px`}}>
            {pair.heading}
          </h3>
          <p style={{fontFamily: canvas.bodyFont, lineHeight: canvas.leading, letterSpacing: `${canvas.tracking / 2}px`}}>
            {pair.body}
          </p>
          <div className="preview-rule" />
          <span className="preview-meta">PAIRING {String(pairNumber).padStart(2, '0')} · {pair.category.toUpperCase()}</span>
        </div>
      </div>

      <div className="controls">
        <div className="control-head">
          <div><span>TYPE CONTROLS</span><h3>Fine tune your pairing</h3></div>
          <SlidersHorizontal size={17} />
        </div>
        <div className="font-row">
          <label>Heading font
            <select value={canvas.headingFont} onChange={e => onCanvas({headingFont: e.target.value})}>
              {FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </label>
          <label>Body font
            <select value={canvas.bodyFont} onChange={e => onCanvas({bodyFont: e.target.value})}>
              {FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </label>
        </div>
        <div className="range-row">
          <label>Size <b>{canvas.size}px</b>
            <input type="range" min="28" max="76" value={canvas.size} onChange={e => onCanvas({size: Number(e.target.value)})} />
          </label>
          <label>Weight <b>{canvas.weight}</b>
            <input type="range" min="300" max="800" step="100" value={canvas.weight} onChange={e => onCanvas({weight: Number(e.target.value)})} />
          </label>
        </div>
        <div className="range-row">
          <label>Line height <b>{canvas.leading.toFixed(2)}</b>
            <input type="range" min="1" max="1.8" step=".05" value={canvas.leading} onChange={e => onCanvas({leading: Number(e.target.value)})} />
          </label>
          <label>Letter spacing <b>{canvas.tracking}px</b>
            <input type="range" min="-1" max="3" step=".5" value={canvas.tracking} onChange={e => onCanvas({tracking: Number(e.target.value)})} />
          </label>
        </div>
      </div>

      <div className="studio-foot">
        <button className="delete" onClick={onDelete}><Trash2 size={15} />Delete pairing</button>
        <span className="save"><span className="check">✓</span>Auto-saved locally</span>
      </div>
    </section>
  );
}
