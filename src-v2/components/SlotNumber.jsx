import React from 'react';

export default function SlotNumber({value,reduced}) {
  return <span className="slot-number" aria-label={value}>
    {value.split('').map((digit,i)=><span className="slot-window" key={i} aria-hidden="true"><span className={reduced?'slot-reel is-static':'slot-reel'} style={{'--digit':Number(digit),'--delay':i*.14+'s'}}>
      {Array.from({length:31},(_,j)=><span key={j}>{j%10}</span>)}
    </span></span>)}
  </span>;
}
