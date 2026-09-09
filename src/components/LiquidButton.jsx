import React, { useEffect, useRef } from 'react';
import { attachLiquid } from './liquid-metal';

// A pill whose face is a dispersion shader. Idle instances stop their loop,
// so only the button being looked at costs anything.
export default function LiquidButton({ className = '', children, alive = false, ...rest }) {
  const host = useRef();
  useEffect(() => attachLiquid(host.current, { alive }), [alive]);
  return <button ref={host} className={`liquid-btn ${className}`.trim()} {...rest}>
    <span className="liquid-face">{children}</span>
  </button>;
}
