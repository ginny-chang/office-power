import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';

const RobotCanvas = lazy(() => import('./RobotCanvas'));

class RobotErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? <StaticRobot /> : this.props.children; }
}

export function StaticRobot() {
  return <div className="static-robot" aria-hidden="true"><div className="static-antenna" /><div className="static-head"><span /></div><div className="static-body"><i /></div><div className="static-arm arm-left" /><div className="static-arm arm-right" /><div className="static-leg leg-left" /><div className="static-leg leg-right" /></div>;
}

export default function HeroRobot({ scrollProgress = 0, reducedMotion = false, modelUrl }) {
  const [hasError, setHasError] = useState(false); const sceneRef = useRef();
  useEffect(() => { const handleError = () => setHasError(true); window.addEventListener('error', handleError); return () => window.removeEventListener('error', handleError); }, []);
  const progress = reducedMotion ? 0 : Math.min(1, Math.max(0, scrollProgress)); const scale = 1 - progress * 0.38; const x = progress * 28; const y = progress * 13;
  return <div ref={sceneRef} className="hero-robot" style={{ transform: `translate3d(${x}%, ${y}%, 0) scale(${scale})` }} aria-label="Office Power AI Robot 3D illustration"><div className="robot-orbit orbit-one" /><div className="robot-orbit orbit-two" />{hasError ? <StaticRobot /> : <RobotErrorBoundary><Suspense fallback={<StaticRobot />}><RobotCanvas modelUrl={modelUrl} reducedMotion={reducedMotion} /></Suspense></RobotErrorBoundary>}</div>;
}
