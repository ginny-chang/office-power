import React, { useEffect, useState } from 'react';

// Latin runs stay in one unbreakable group so a per-character reveal never splits a word.
const tokenize = (text) => text.match(/[A-Za-z0-9]+|\n|[\s\S]/g) || [];

export default function Typewriter({ text, speed = 48, delay = 0, reduced = false, tag: Tag = 'span', className }) {
  const total = [...text].length;
  const [typed, setTyped] = useState(reduced ? total : 0);

  useEffect(() => {
    if (reduced) { setTyped(total); return; }
    setTyped(0);
    let frame;
    const startedAt = performance.now();
    const tick = (now) => {
      const elapsed = now - startedAt - delay;
      if (elapsed < 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const next = Math.min(total, Math.floor(elapsed / speed) + 1);
      setTyped((current) => current === next ? current : next);
      if (next < total) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, total, speed, delay, reduced]);

  const done = typed >= total;
  // Untyped characters keep their space, so the paragraph never reflows while it types.
  const reveal = (token, base) => [...token].flatMap((char, i) => [
    base + i === typed && !done ? <i className="type-caret" key={`caret${i}`} aria-hidden="true" /> : null,
    <span key={i} aria-hidden="true" style={{ visibility: base + i < typed ? 'visible' : 'hidden' }}>{char}</span>,
  ]).filter(Boolean);

  let cursor = 0;
  const nodes = tokenize(text).map((token, i) => {
    const base = cursor;
    cursor += [...token].length;
    if (token === '\n') return <br key={i} />;
    if (token.length > 1) return <span className="type-word" key={i}>{reveal(token, base)}</span>;
    return <React.Fragment key={i}>{reveal(token, base)}</React.Fragment>;
  });

  return <Tag className={className} aria-label={text}>{nodes}</Tag>;
}
