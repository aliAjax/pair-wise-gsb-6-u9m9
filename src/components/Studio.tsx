import {Download, SlidersHorizontal, Star, Trash2} from 'lucide-react';
import type {Pair} from '../types';
import {FONTS} from '../data/store';

type Props = {
  pair: Pair;
  onPatch: (patch: Partial<Pair>) => void;
  onDelete: () => void;
};

export default function Studio({pair, onPatch, onDelete}: Props) {
  const exportCss = () => {
    const css = `/* ${pair.title} */\n.heading { font-family: '${pair.headingFont}'; font-size: ${pair.size}px; font-weight: ${pair.weight}; letter-spacing: ${pair.tracking}px; }\n.body { font-family: '${pair.bodyFont}'; line-height: ${pair.leading}; letter-spacing: ${pair.tracking / 2}px; }`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([css], {type: 'text/css'}));
    a.download = 'type-pair.css';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <section className="studio">
      <div className="studio-head">
        <div>
          <span>PAIRING CANVAS</span>
          <h2>{pair.title}</h2>
        </div>
        <button
          className="favorite"
          title={pair.favorite ? '取消收藏' : '收藏'}
          onClick={() => onPatch({favorite: !pair.favorite})}
        >
          <Star size={16} fill={pair.favorite ? '#e5a35e' : 'none'} color={pair.favorite ? '#e5a35e' : '#98a4a7'} />
        </button>
      </div>

      <div className="canvas">
        <div className="canvas-bar">
          <span>PREVIEW</span>
        </div>
        <div className="preview">
          <span className="preview-kicker">A NOTE ON TYPE</span>
          <h3
            style={{
              fontFamily: `'${pair.headingFont}', serif`,
              fontSize: `${pair.size}px`,
              fontWeight: pair.weight,
              letterSpacing: `${pair.tracking}px`,
              lineHeight: 1.05,
            }}
          >
            {pair.heading}
          </h3>
          <p style={{fontFamily: `'${pair.bodyFont}', sans-serif`, lineHeight: pair.leading, letterSpacing: `${pair.tracking / 2}px`}}>
            {pair.body}
          </p>
          <div className="preview-rule" />
          <span className="preview-meta">
            {pair.title.toUpperCase()} · {pair.category.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="controls">
        <div className="control-head">
          <div>
            <span>TYPE CONTROLS</span>
            <h3>微调这组配对</h3>
          </div>
          <SlidersHorizontal size={17} />
        </div>
        <div className="font-row">
          <label>
            标题字体
            <select value={pair.headingFont} onChange={(e) => onPatch({headingFont: e.target.value})}>
              {FONTS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label>
            正文字体
            <select value={pair.bodyFont} onChange={(e) => onPatch({bodyFont: e.target.value})}>
              {FONTS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="range-row">
          <label>
            字号 <b>{pair.size}px</b>
            <input type="range" min="28" max="76" value={pair.size} onChange={(e) => onPatch({size: Number(e.target.value)})} />
          </label>
          <label>
            字重 <b>{pair.weight}</b>
            <input
              type="range"
              min="300"
              max="800"
              step="100"
              value={pair.weight}
              onChange={(e) => onPatch({weight: Number(e.target.value)})}
            />
          </label>
        </div>
        <div className="range-row">
          <label>
            行高 <b>{pair.leading.toFixed(2)}</b>
            <input
              type="range"
              min="1"
              max="1.8"
              step=".05"
              value={pair.leading}
              onChange={(e) => onPatch({leading: Number(e.target.value)})}
            />
          </label>
          <label>
            字距 <b>{pair.tracking}px</b>
            <input
              type="range"
              min="-1"
              max="3"
              step=".5"
              value={pair.tracking}
              onChange={(e) => onPatch({tracking: Number(e.target.value)})}
            />
          </label>
        </div>
      </div>

      <div className="studio-foot">
        <button className="delete" onClick={onDelete}>
          <Trash2 size={15} />
          删除配对
        </button>
        <div className="foot-right">
          <span className="autosave">
            <span className="check">✓</span>已自动保存到本工作区
          </span>
          <button className="outline" onClick={exportCss}>
            <Download size={15} />
            导出 CSS
          </button>
        </div>
      </div>
    </section>
  );
}
