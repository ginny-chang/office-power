import React from 'react';
import './budget-dashboard.css';
import { useLang } from '../i18n';

const dollars = (value) => '$' + Math.round(value).toLocaleString('en-US');

// Both charts are driven by how far the spend has climbed, so they move with it.
// Deterministic wobble keeps them lively without ever redrawing at random.
const SPARK_POINTS = 8;
function sparkPath(ratio) {
  const points = Array.from({ length: SPARK_POINTS }, (_, i) => {
    const along = i / (SPARK_POINTS - 1);
    const wobble = Math.sin(i * 1.9) * .05 + Math.sin(i * 4.3) * .025;
    // Earlier points sit lower, so the line always climbs to the live value.
    const value = Math.max(.03, Math.min(1, ratio * (.3 + .7 * along) + wobble * along));
    const x = along * 100;
    const y = 22 - value * 20;
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return points.join(' ');
}
function barHeights(ratio) {
  return Array.from({ length: 7 }, (_, i) => {
    const along = (i + 1) / 7;
    const swing = Math.abs(Math.sin(i * 2.1 + ratio * 7));
    return Math.max(.18, Math.min(1, (.3 + .7 * swing) * (.45 + .55 * along)));
  });
}

export default function BudgetDashboard({ cost, limit, alarm, onReset }) {
  const { t } = useLang();
  const b = t.budget;
  const ratio = Math.min(1, cost / limit);
  const conversations = Math.max(1, Math.round(cost * 4));
  const tokens = Math.round(cost * 3200);
  return <div className={`budget-dashboard${alarm ? ' is-alarm' : ''}`}>
    <header><span><i />{b.heading}</span><small>{b.live}</small></header>
    <div className="budget-total">
      <div>
        <span>{b.total}</span>
        {/* Spend reads large, the ceiling stays quiet beside it. */}
        <strong>{dollars(cost)}<em>/{dollars(limit)}</em></strong>
        <small>{b.cap(dollars(limit))}</small>
      </div>
      <div className="budget-ring">
        <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="42" strokeDasharray={`${ratio * 264} 264`}/></svg>
        <b>{Math.round(ratio * 100)}<small>%</small></b>
      </div>
    </div>
    <div className="budget-stats">
      <div><span>{b.tokens}</span><strong>{(tokens / 1000000).toFixed(2)}<small>M</small></strong><svg viewBox="0 0 100 24" aria-hidden="true"><path d={sparkPath(ratio)}/></svg></div>
      <div><span>{b.conversations}</span><strong>{conversations.toLocaleString()}</strong><div className="budget-bars" aria-hidden="true">{barHeights(ratio).map((v, i) => <i key={i} style={{ transform: `scaleY(${v})` }} />)}</div></div>
      <div><span>{b.avg}</span><strong>{'$' + (cost / conversations).toFixed(2)}</strong><small>{b.perChat}</small></div>
    </div>
    <div className="budget-status" role="status">
      <b>{alarm ? b.hit : b.ok}</b>
      <span>{alarm ? b.hitNote : b.okNote(dollars(Math.max(0, limit - cost)))}</span>
    </div>
    <footer><button type="button" onClick={onReset}>{b.replay}</button></footer>
  </div>;
}
