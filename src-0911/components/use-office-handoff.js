import {useEffect,useRef} from 'react';
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=(v,a,b)=>{const x=clamp((v-a)/(b-a));return x*x*(3-2*x);};
export default function useOfficeHandoff(){
 const handoff=useRef({progress:0,blend:0,settled:false,reduced:false});
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');let frame;
  const measure=()=>{
   frame=undefined;const cases=document.getElementById('usecases'),shell=document.querySelector('.site-shell');if(!cases||!shell)return;
   const raw=clamp(-cases.getBoundingClientRect().top/innerHeight),p=media.matches?1:raw;
   const blend=media.matches?1:smooth(p,.56,.88);
   handoff.current={progress:media.matches?0:raw,blend,settled:p>=.995,reduced:media.matches};
   shell.style.setProperty('--handoff-pin',`${media.matches?0:raw*innerHeight}px`);
   shell.style.setProperty('--handoff-blend',blend);
   shell.style.setProperty('--handoff-progress',media.matches?1:raw);
   shell.style.setProperty('--handoff-copy',media.matches?1:smooth(p,.88,1));
   shell.style.setProperty('--handoff-source-copy',media.matches?1:1-smooth(p,0,.22));
   shell.style.setProperty('--handoff-scale',media.matches?1:.88+.12*smooth(p,.56,.94));
   shell.dataset.handoff=media.matches?'off':raw>=1?'done':raw>0?'active':'before';
   window.dispatchEvent(new CustomEvent('office-handoff',{detail:handoff.current}));
  };
  const schedule=()=>{if(frame===undefined)frame=requestAnimationFrame(measure);};
  const hash=()=>{if(location.hash==='#usecases'&&!media.matches){const el=document.getElementById('usecases');if(el)window.scrollTo({top:scrollY+el.getBoundingClientRect().top+innerHeight,behavior:'instant'});}schedule();};
  schedule();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);window.addEventListener('hashchange',hash);media.addEventListener('change',schedule);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);window.removeEventListener('hashchange',hash);media.removeEventListener('change',schedule);};
 },[]);
 return handoff;
}
