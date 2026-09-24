import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { scenarioDurations } from '../hr-packs';

// One clock drives every scenario scene. It ticks only while the stage is on
// screen and the tab is visible, and resets whenever the scenario changes.
const ScenarioTime = createContext({ time: 0, reduced: true });
export const useScenarioTime = () => useContext(ScenarioTime);

export default function ScenarioClock({ active, entry, reduced, scenario = 0, playing, onComplete, replay = 0, children }) {
  const [time, setTime] = useState(0);
 const sample=useRef({time:0,stamp:performance.now()});
 const getTime=()=>{
  if(reduced)return 28;
  const running=active&&entry.current>=.95&&!document.hidden&&(!playing||playing.current);
  return sample.current.time+(running?Math.min(.25,(performance.now()-sample.current.stamp)/1000):0);
 };

  const complete = useRef(onComplete);
  complete.current = onComplete;

  useEffect(() => {
    setTime(0); sample.current={time:0,stamp:performance.now()};
    if (!active || reduced) return;
    let elapsed = 0;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const step = Math.min(.25, (now - last) / 1000);
      last = now; sample.current.stamp=now;
      // Hold the clock while the stage is scrolled away or the tab is hidden.
      if (entry.current < .95 || document.hidden || (playing && !playing.current)) return;
      elapsed += step;
      if (elapsed >= scenarioDurations[scenario]) { elapsed = 0; complete.current?.(); }
      sample.current.time=elapsed;setTime(elapsed);
    }, 100);
    return () => clearInterval(timer);
  }, [active, entry, reduced, scenario, playing, replay]);

  return <ScenarioTime.Provider value={{ time: reduced ? 20 : time, reduced, getTime }}>{children}</ScenarioTime.Provider>;
}
