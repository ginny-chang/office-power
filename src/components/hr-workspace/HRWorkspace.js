import {paintEnglishStory} from './EnglishStory.js';
import {paintStoryVisual} from './StoryVisuals.js';
import {punchStep,PUNCH_STARTS,paintPunch} from './PunchStory.js';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import { createHRHelper } from './HRHelper.js';
import {dispatchStep,DISPATCH_STARTS,paintDispatch} from './DispatchStory.js';
import {leaveStep,LEAVE_STARTS,paintLeave} from './LeaveStory.js';
import {contractStep,CONTRACT_STARTS,paintContract} from './ContractStory.js';

export const STEP_STARTS=[0,3,7,11,14,18,22,25];
export const STEP_LABELS=['每週一 09:00 · 排程啟動','每週掃描加班時數','發現 2 人超過 40h 預警線','柏宇 44h · 佳穎 41.5h','LINE 通知員工與主管','陳經理正在調整排班','排班調整已確認','已記錄 · HR 已收到'];
export function overtimeStep(time){let i=7;while(i>0&&time<STEP_STARTS[i])i--;return i;}

export function createHRWorkspace({scenario='overtime',lang='zh'}={}){
 const punch=scenario==='punch',dispatch=scenario==='dispatch',leave=scenario==='leave',contract=scenario==='contract';
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e6e8ed');
 const group=new THREE.Group();scene.add(group);const textures=[],materials=[],geometries=[];
 const material=(color,extra={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.65,...extra});materials.push(m);return m;};
 const ivory=material('#efebe3'),metal=material('#c4c8c8',{metalness:.6,roughness:.3}),dark=material('#30383a'),green=material('#58813d'),pot=material('#f1e9dc');
 function mesh(geo,mat,pos,parent=group){geometries.push(geo);const m=new THREE.Mesh(geo,mat);m.position.fromArray(pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const box=(size,pos,mat,parent)=>mesh(new THREE.BoxGeometry(...size),mat,pos,parent);
 const cylinder=(rt,rb,h,pos,mat,parent)=>mesh(new THREE.CylinderGeometry(rt,rb,h,40),mat,pos,parent);
 function woodTexture(){const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');x.fillStyle='#caa477';x.fillRect(0,0,512,512);let seed=14;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};for(let i=0;i<1400;i++){x.strokeStyle=`rgba(${rnd()>.5?'255,235,205':'115,76,45'},${rnd()*.12})`;x.lineWidth=rnd()*1.8;x.beginPath();let y=rnd()*512;for(let z=0;z<=512;z+=16){x.lineTo(z,y+Math.sin(z*.014+i)*rnd()*2);}x.stroke();}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,1);textures.push(t);return t;}
 const wood=material('#fff',{map:woodTexture(),roughness:.58});
 // Layout follows the approved 01-01 storyboard: left return + rear desk,
 // two end pedestals, open centre, left-wall artwork and no office chair.
 box([4.6,.16,4.2],[0,-.065,0],ivory);
 for(let i=0;i<18;i++)box([4.43,.035,.224],[0,.031,-1.97+i*.231],wood);
 box([4.6,3.18,.09],[0,1.59,-2.055],ivory);
 box([.09,3.18,4.2],[-2.255,1.59,0],ivory);
 const trim=material('#f8f5ed');
 box([4.48,.13,.055],[0,.12,-1.986],trim);box([.055,.13,4.05],[-2.187,.12,0],trim);
 box([.055,3.2,.08],[-2.20,1.59,2.065],trim);box([.08,3.2,.055],[2.26,1.59,-2.0],trim);
 // A fine woven rug occupies the clear floor in front of the workstation.
 const weave=document.createElement('canvas');weave.width=128;weave.height=128;
 const wx=weave.getContext('2d');wx.fillStyle='#d7d2ca';wx.fillRect(0,0,128,128);
 for(let n=0;n<128;n+=3){wx.fillStyle=n%2?'#c5c0b8':'#e2ddd5';wx.fillRect(n,0,1,128);wx.fillRect(0,n,128,1);}
 const woven=new THREE.CanvasTexture(weave);woven.colorSpace=THREE.SRGBColorSpace;woven.wrapS=woven.wrapT=THREE.RepeatWrapping;woven.repeat.set(9,7);textures.push(woven);
 const rug=material('#fff',{map:woven,roughness:1});box([2.55,.018,1.88],[.16,.06,.81],rug);
 // Both runs meet at the rear-left corner, leaving the front completely open.
 box([.94,.075,3.17],[-1.70,.94,-.365],wood);
 box([3.47,.075,1.24],[.49,.94,-1.375],wood);

 function pedestal(x,z,angle=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;group.add(g);
  box([.68,.82,.75],[0,.48,0],wood,g);
  for(let i=0;i<3;i++){
   box([.625,.246,.033],[0,.21+i*.258,.394],wood,g);
   box([.17,.021,.012],[0,.285+i*.258,.414],dark,g);
   box([.18,.018,.02],[0,.30+i*.258,.42],wood,g);
  }
 }
 pedestal(-1.69,.74,Math.PI/2);pedestal(1.64,-1.38);
 // Slim metal trestles wrap around the two outer drawer units.
 for(const [x,z]of [[-2.12,1.17],[-1.25,1.17],[-2.12,-1.88],[2.16,-1.92],[2.16,-.81]])box([.035,.89,.035],[x,.50,z],metal);
 box([.88,.035,.035],[-1.68,.085,1.17],metal);box([.035,.035,1.1],[2.16,.085,-1.365],metal);
 // Fixed monitor size and transform across every storyboard stage.
 const monitor=new THREE.Group();monitor.position.set(.57,1.66,-1.69);group.add(monitor);
 box([1.67,.96,.065],[0,0,0],dark,monitor);
 box([.065,.23,.065],[0,-.575,0],metal,monitor);box([.47,.025,.32],[0,-.67,.075],metal,monitor);
 const display=document.createElement('canvas');display.width=1024;display.height=640;const ctx=display.getContext('2d');
 const screenTexture=new THREE.CanvasTexture(display);screenTexture.colorSpace=THREE.SRGBColorSpace;textures.push(screenTexture);
 const sm=new THREE.MeshBasicMaterial({map:screenTexture,toneMapped:false});materials.push(sm);
 mesh(new THREE.PlaneGeometry(1.58,.875),sm,[0,0,.034],monitor);
 // Robot and keyboard share a single workstation orientation and scale.
 const keyboard=new THREE.Group();keyboard.position.set(-.10,.041,-.35);keyboard.rotation.y=2.7;keyboard.scale.setScalar(.87);group.add(keyboard);
 box([1,.035,.32],[0,1.095,.92],metal,keyboard);const keys=[];
 for(let r=0;r<4;r++)for(let c=0;c<12;c++)keys.push(box([.068,.018,.053],[-.443+c*.0805,1.12,.82+r*.064],ivory,keyboard));
 const robot=createHRHelper();robot.object.position.copy(keyboard.position);robot.object.rotation.y=2.7;robot.object.scale.setScalar(.87);group.add(robot.object);
 // Laptop on the left return, screen facing into the room.
 const laptop=new THREE.Group();laptop.position.set(-1.63,.994,.32);laptop.rotation.y=Math.PI/2;group.add(laptop);
 box([.72,.024,.51],[0,0,0],metal,laptop);
 const lid=box([.72,.46,.025],[0,.227,-.215],dark,laptop);lid.rotation.x=-.15;
 const laptopMat=new THREE.MeshBasicMaterial({map:screenTexture,toneMapped:false});materials.push(laptopMat);
 const laptopDisplay=mesh(new THREE.PlaneGeometry(.67,.40),laptopMat,[0,.227,-.197],laptop);laptopDisplay.rotation.x=-.15;
 for(let r=0;r<4;r++)for(let c=0;c<10;c++)box([.046,.004,.036],[-.27+c*.06,.015,-.09+r*.045],dark,laptop);
 box([.20,.002,.10],[0,.015,.17],ivory,laptop);
 // Pale binders arranged on the left desk toward the rear corner.
 for(let i=0;i<5;i++){
  const z=-.72+i*.105;box([.31,.43,.085],[-1.68,1.205,z],ivory);
  box([.014,.32,.05],[-1.517,1.23,z],trim);
  const hole=cylinder(.013,.013,.007,[-1.505,1.075,z],dark);hole.rotation.z=Math.PI/2;
 }
 cylinder(.071,.067,.145,[-1.55,1.055,.92],pot);
 for(let i=0;i<6;i++){const pencil=cylinder(.006,.006,.21,[-1.59+i*.014,1.21,.92+(i%2)*.018],wood);pencil.rotation.z=(i-2)*.07;}
 const phone=box([.15,.25,.021],[-1.40,1.11,.71],dark);phone.rotation.set(-.2,Math.PI/2,0);
 box([.15,.018,.12],[-1.42,.99,.71],dark);
 // Mouse, cup and saucer belong to the right desktop, away from the keys.
 box([.42,.008,.33],[1.13,.983,-1.02],dark);
 const mouse=mesh(new THREE.SphereGeometry(1,24,16),ivory,[1.13,1.014,-1.02]);mouse.scale.set(.075,.035,.115);
 cylinder(.084,.069,.14,[1.59,1.066,-.96],pot);cylinder(.13,.13,.018,[1.59,.987,-.96],ivory);
 cylinder(.071,.071,.002,[1.59,1.137,-.96],material('#806042'));
 const handle=mesh(new THREE.TorusGeometry(.047,.011,12,24),pot,[1.68,1.066,-.96]);
 // Tapered leaves and stems create a light silhouette instead of solid blobs.
 function plant(x,y,z,s=1){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);group.add(g);
  cylinder(.14,.10,.24,[0,.12,0],pot,g);cylinder(.125,.125,.006,[0,.239,0],material('#655747'),g);
  for(let i=0;i<17;i++){const a=i*2.4,h=.34+(i%5)*.08;
   const stem=cylinder(.006,.007,h,[Math.sin(a)*.06,.24+h*.40,Math.cos(a)*.06],green,g);stem.rotation.z=Math.sin(a)*.28;
   const leaf=mesh(new THREE.SphereGeometry(1,16,10),green,[Math.sin(a)*.15,.25+h*.75,Math.cos(a)*.15],g);
   leaf.scale.set(.048,.16,.012);leaf.rotation.set(Math.cos(a)*.7,a,Math.sin(a)*.7);
  }return g;
 }
 plant(-1.39,.982,-1.53,1.12);plant(1.88,.982,-1.52,.83);
 // Articulated pale floor lamp at the front-left, angled over the laptop.
 function rod(start,end,r,mat,parent=group){const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),v=b.clone().sub(a);const m=cylinder(r,r,v.length(),a.clone().add(b).multiplyScalar(.5).toArray(),mat,parent);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
 cylinder(.24,.26,.035,[-1.96,.079,1.48],ivory);rod([-1.96,.09,1.48],[-1.96,1.61,1.48],.012,metal);
 rod([-2.00,1.54,1.57],[-1.80,2.04,.28],.018,metal);
 const pivot=mesh(new THREE.SphereGeometry(.055,20,12),ivory,[-1.96,1.61,1.48]);
 const shade=cylinder(.074,.21,.20,[-1.77,1.94,.25],ivory);shade.rotation.z=-.3;
 const bulb=material('#fff4d9',{emissive:'#fff4db',emissiveIntensity:.3});cylinder(.18,.18,.005,[-1.74,1.84,.25],bulb);
 // The storyboard's artwork and clock are on the left wall, not behind the monitor.
 for(let i=0;i<2;i++){
  const art=new THREE.Group();art.position.set(-2.192,2.15,.97-i*.70);art.rotation.y=Math.PI/2;group.add(art);
  box([.57,.83,.035],[0,0,0],wood,art);box([.51,.77,.011],[0,0,.025],pot,art);
  for(let j=0;j<4;j++){const dot=mesh(new THREE.CircleGeometry(.065+j*.013,30),material(['#c5ac87','#bba27e','#9c8a72','#e0ceac'][j]),[(j%2-.5)*.13,(j-1.5)*.12,.033],art);dot.scale.y=1.35;}
  for(let j=0;j<3;j++)rod([-.12+j*.09,-.25,.038],[.04+j*.04,.23,.038],.002,dark,art);
 }
 const clockGroup=new THREE.Group();clockGroup.position.set(-2.185,2.32,-.53);clockGroup.rotation.y=Math.PI/2;group.add(clockGroup);
 const clock=cylinder(.245,.245,.036,[0,0,0],dark,clockGroup);clock.rotation.x=Math.PI/2;
 mesh(new THREE.CircleGeometry(.226,48),pot,[0,0,.020],clockGroup);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;const tick=box([.008,.035,.003],[Math.sin(a)*.193,Math.cos(a)*.193,.023],dark,clockGroup);tick.rotation.z=-a;}
 const hand1=box([.009,.145,.005],[-.032,.053,.026],dark,clockGroup);hand1.rotation.z=.6;
 const hand2=box([.007,.19,.005],[.05,.064,.028],dark,clockGroup);hand2.rotation.z=-.67;
 scene.add(new THREE.HemisphereLight('#fff9ed','#a5abb7',2.0));
 const sun=new THREE.DirectionalLight('#fff6e7',3.1);sun.position.set(3,7,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5});sun.shadow.normalBias=.018;sun.shadow.bias=-.0001;sun.shadow.radius=4;sun.intensity=1.05;scene.add(sun);for(const dx of [-.8,.8]){const soft=sun.clone();soft.position.x+=dx;soft.position.z+=dx*.4;soft.intensity=.9;soft.castShadow=false;scene.add(soft);}
 const fill=new THREE.DirectionalLight('#dce8f5',1.2);fill.position.set(5,4,-1);scene.add(fill);
 const groundMat=new THREE.ShadowMaterial({opacity:.07});materials.push(groundMat);const ground=mesh(new THREE.PlaneGeometry(200,200),groundMat,[0,-.145,0]);ground.castShadow=false;ground.rotation.x=-Math.PI/2;
 // Batch stationary furniture by material: one draw per material instead of
 // separate draw calls for every plank, drawer, laptop key and plant leaf.
 const moving=new Set(keys);robot.object.traverse(o=>moving.add(o));
 scene.updateMatrixWorld(true);const batches=new Map();
 group.traverse(o=>{if(!o.isMesh||moving.has(o))return;
  const key=o.material.uuid+':'+o.castShadow;
  if(!batches.has(key))batches.set(key,{material:o.material,cast:o.castShadow,parts:[],objects:[]});
  const batch=batches.get(key),g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);
  batch.parts.push(g.index?g.toNonIndexed():g);if(g.index)g.dispose();batch.objects.push(o);
 });
 for(const batch of batches.values()){
  const geometry=mergeGeometries(batch.parts);batch.parts.forEach(g=>g.dispose());
  if(!geometry)continue;geometries.push(geometry);
  const combined=new THREE.Mesh(geometry,batch.material);combined.castShadow=batch.cast;combined.receiveShadow=true;scene.add(combined);
  batch.objects.forEach(o=>o.removeFromParent());
 }
 let lastPaint=-1;
 function paint(time,step){
 if(lang==='en'){paintEnglishStory(ctx,scenario,time,step);screenTexture.needsUpdate=true;return;}
 if(punch){paintPunch(ctx,time,step);paintStoryVisual(ctx,scenario,time,step);screenTexture.needsUpdate=true;return;}
 if(contract){paintContract(ctx,time,step);paintStoryVisual(ctx,scenario,time,step);screenTexture.needsUpdate=true;return;}
 if(leave){paintLeave(ctx,time,step);paintStoryVisual(ctx,scenario,time,step);screenTexture.needsUpdate=true;return;}
 if(dispatch){paintDispatch(ctx,time,step);paintStoryVisual(ctx,scenario,time,step);screenTexture.needsUpdate=true;return;}
 ctx.fillStyle='#172332';ctx.fillRect(0,0,1024,640);ctx.fillStyle='#eff5fa';ctx.font='bold 40px sans-serif';ctx.fillText('OP',42,65);ctx.font='27px sans-serif';ctx.fillText(['加班時數守門員','全公司出勤 · 180 人','本月累計加班','本月累計加班','LINE 通知已送出','主管處理中','已調整排班','已同步 HR'][step],125,62);
 if(step===0){ctx.font='44px sans-serif';ctx.fillText('每週一 09:00',60,230);ctx.font='30px sans-serif';ctx.fillStyle='#a7bdd0';ctx.fillText('自動掃描加班時數',60,300);}
 else if(step===1){const rows=['柏宇     09/07      09:00     20:00     2h','佳穎     09/07      09:00     19:30     1.5h','陳經理  09/07      09:00     18:00     0h','同仁 A  09/07      09:00     18:00     0h'];ctx.font='25px sans-serif';ctx.fillStyle='#9caebe';ctx.fillText('員工       日期           上班         下班        加班',45,155);rows.forEach((r,i)=>{ctx.fillStyle='#24374b';ctx.fillRect(35,183+i*88,954,69);ctx.fillStyle='#dde7ef';ctx.fillText(r,55,225+i*88);});const scan=185+((time-3)/4)*330;ctx.fillStyle='#b0e4e9';ctx.fillRect(35,scan,954,5);}
 else if(step===2||step===3){const f=THREE.MathUtils.smoothstep(time,7,9),vals=[27,33,41.5,44];vals.forEach((v,i)=>{const h=v*8*f;ctx.fillStyle=v*f>40?'#e78976':'#8caac6';ctx.fillRect(110+i*214,515-h,95,h);ctx.font='bold 32px sans-serif';ctx.fillStyle='#edf4f8';ctx.fillText(v+'h',110+i*214,498-h);ctx.font='25px sans-serif';ctx.fillText(['同仁 A','同仁 B','佳穎','柏宇'][i],110+i*214,560);});ctx.strokeStyle='#efc373';ctx.lineWidth=4;ctx.setLineDash([12,9]);ctx.beginPath();ctx.moveTo(40,195);ctx.lineTo(955,195);ctx.stroke();ctx.setLineDash([]);ctx.font='24px sans-serif';ctx.fillStyle='#efc373';ctx.fillText('40h 預警線',780,177);}
 else {ctx.font='bold 115px sans-serif';ctx.fillStyle='#e9be71';ctx.fillText('2',150,320);ctx.fillStyle='#a9d0b7';ctx.fillText(step===7?'0':'2',645,320);ctx.font='32px sans-serif';ctx.fillStyle='#d5e2ed';ctx.fillText('人預警',130,390);ctx.fillText(step===7?'人超標':'人已通知',605,390);ctx.font='27px sans-serif';ctx.fillText(STEP_LABELS[step],70,515);}
 screenTexture.needsUpdate=true;
 }
 function update(time,{reducedMotion=false}={}){const step=punch?punchStep(time):contract?contractStep(time):leave?leaveStep(time):dispatch?dispatchStep(time):overtimeStep(time);const nodding=(leave||contract||punch)?(step===4||step===5):dispatch?(step===5||step===7):(step===3||step===6);robot.update(time,{action:'typing',reducedMotion:reducedMotion||nodding,intensity:.8});if(nodding&&!reducedMotion)robot.joints.head.rotation.x=.07+(1-Math.cos((time-(punch?PUNCH_STARTS:contract?CONTRACT_STARTS:leave?LEAVE_STARTS:dispatch?DISPATCH_STARTS:STEP_STARTS)[step])*3.4))*.07;const animateScreen=punch?(step<=2):(leave||contract)?(step===1||step===5):dispatch?(step===1||step===4||step===7):(step===1||step===2);const frame=animateScreen?Math.floor(time*30):step*100000;if(frame!==lastPaint){paint(time,step);lastPaint=frame;}keys.forEach((k,i)=>k.position.y=1.12-(reducedMotion?0:Math.max(0,Math.sin(time*15+i*.8))*.003));return step;}
 update(0);
 return {scene,robot,update,setLanguage(next){if(lang===next)return false;lang=next;lastPaint=-1;return true;},dispose(){robot.dispose();textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
