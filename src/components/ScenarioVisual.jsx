import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
const Scene = lazy(() => import('./ScenarioScene'));
class Boundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="case-scene-fallback">OP<span>HR Agent 隨時待命</span></div> : this.props.children; }
}
export default function ScenarioVisual({ kind, progress, entry, reduced }) {
  const root = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '160px' });
    observer.observe(root.current); return () => observer.disconnect();
  }, []);
  return <div className="case-scene" ref={root} aria-hidden="true">
    {visible && <Boundary><Suspense fallback={<div className="case-scene-fallback">OP<span>正在準備 HR 工作空間</span></div>}><Scene kind={kind} progress={progress} entry={entry} reduced={reduced} /></Suspense></Boundary>}
  </div>;
}
