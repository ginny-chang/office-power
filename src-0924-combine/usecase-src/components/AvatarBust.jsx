import React,{useMemo} from 'react';
import * as THREE from 'three';
function Form({at=[0,0,0],scale=[1,1,1],color,rotation=[0,0,0],roughness=.8}){
 return <mesh position={at} scale={scale} rotation={rotation} ><sphereGeometry args={[1,40,28]}/><meshPhysicalMaterial color={color} roughness={roughness} clearcoat={.03} clearcoatRoughness={.5}/></mesh>;
}
function Stroke({points,color,radius=.012,roughness=.5}){
 const curve=useMemo(()=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),[points]);
 return <mesh><tubeGeometry args={[curve,24,radius,8,false]}/><meshStandardMaterial color={color} roughness={roughness}/></mesh>;
}
export default function AvatarBust({person,index}){
 const hair=index===0?'#303139':index===1?'#46342e':'#414049';
 const skin=person.skin;
 return <group position={[0,-.015,.05]}>
  {/* Rounded shoulders and a separate neck give the bust a sculpted silhouette. */}
  <Form at={[0,-.35,.14]} scale={[.355,.19,.18]} color={person.color}/>
  <Form at={[0,-.205,.17]} scale={[.085,.13,.08]} color={skin}/>
  {index===0?<>
   <Form at={[0,-.28,.125]} scale={[.185,.16,.11]} color="#537ba1"/>
   <Form at={[0,-.305,.27]} scale={[.12,.07,.025]} color="#e5e8ec"/>
   {[-1,1].map(side=><React.Fragment key={side}><Stroke points={[[side*.08,-.23,.245],[side*.16,-.275,.26],[side*.12,-.37,.285]]} color="#6288af" radius={.038}/><Stroke points={[[side*.09,-.33,.31],[side*.085,-.41,.306],[side*.09,-.49,.27]]} color="#e7e5e0" radius={.009}/></React.Fragment>)}
  </>:<>
   <Form at={[0,-.35,.291]} scale={[.1,.135,.017]} color="#f3eee6"/>
   {[-1,1].map(side=><Form key={side} at={[side*.1,-.315,.29]} scale={[.068,.135,.026]} rotation={[0,0,side*-.37]} color={index===1?'#c38677':'#82749e'}/>)}
   {index===2&&<><Form at={[0,-.292,.315]} scale={[.025,.025,.015]} color="#594f73"/><Form at={[0,-.386,.315]} scale={[.024,.079,.014]} color="#65587f"/></>}
  </>}
  {/* Hair sits behind the cheeks; ears remain visible instead of merging into the head. */}
  {index===1&&<Form at={[0,.075,.09]} scale={[.265,.335,.16]} color={hair}/>}
  {[-1,1].map(side=><React.Fragment key={side}><Form at={[side*.225,.04,.205]} scale={[.047,.083,.042]} color={skin}/><Form at={[side*.242,.035,.238]} scale={[.021,.045,.012]} color="#c99581"/></React.Fragment>)}
  <Form at={[0,.045,.19]} scale={[index===2?.225:.218,.285,.172]} color={skin}/>
  {/* Features hug the smooth face: no separate cheek or chin volumes. */}
  <Form at={[0,.002,.351]} scale={[.024,.038,.019]} color={skin}/>
  {[-1,1].map(side=><group key={side}>
   <Form at={[side*.087,.078,.343]} scale={[.012,.019,.006]} color="#383236" roughness={.6}/>
   <Form at={[side*.085,.084,.349]} scale={[.003,.004,.002]} color="#f6eee7"/>
   <Stroke points={[[side*.05,.145,.332],[side*.086,.157,.328],[side*.122,.143,.316]]} color={hair} radius={.007}/>
   {index===1&&<Stroke points={[[side*.091,.089,.347],[side*.107,.102,.339],[side*.113,.11,.334]]} color={hair} radius={.003}/>}
  </group>)}
  <Stroke points={[[-.067,-.078,.327],[-.035,-.097,.338],[0,-.103,.339],[.035,-.097,.338],[.067,-.078,.327]]} color="#926b5a" radius={.004}/>
  <Stroke points={[[-.045,-.09,.335],[0,-.103,.341],[.045,-.09,.335]]} color="#f6eade" radius={.003}/>
  {index===0?<>
   <Form at={[0,.259,.14]} scale={[.228,.116,.163]} color={hair} roughness={.36}/>
   <Form at={[-.03,.303,.23]} scale={[.216,.095,.102]} rotation={[0,0,.15]} color={hair} roughness={.36}/>
   <Form at={[.12,.32,.192]} scale={[.106,.07,.11]} rotation={[0,0,.35]} color={hair}/>
   {[-1,1].map(side=><Form key={side} at={[side*.203,.161,.16]} scale={[.027,.139,.09]} color={hair}/>)}
   {[0,1,2].map(i=><Stroke key={i} points={[[-.17,.31+i*.012,.22],[-.07,.353+i*.008,.237],[.07,.35+i*.008,.235],[.17,.332+i*.004,.203]]} color="#42434a" radius={.004}/>)}
  </>:<>
   <Form at={[-.095,.274,.179]} scale={[.156,.104,.13]} rotation={[0,0,.28]} color={hair}/>
   <Form at={[.12,.255,.165]} scale={[.125,.101,.128]} rotation={[0,0,-.25]} color={hair}/>
   {[-1,1].map(side=><Form key={side} at={[side*.205,index===1?.04:.16,.115]} scale={[index===1?.05:.025,index===1?.244:.13,.095]} color={hair}/>)}
   {[0,1,2].map(i=><Stroke key={i} points={[[-.185,.23,.23],[-.14,.303+i*.008,.258],[-.045,.328+i*.006,.257],[.028,.286,.252]]} color={index===1?'#655047':'#575660'} radius={.004}/>)}
  </>}
  {index===1&&<>
   <Stroke points={[[-.255,.015,.18],[-.26,.21,.15],[-.15,.367,.13],[0,.396,.11],[.2,.3,.12],[.265,.02,.18]]} color="#535e69" radius={.014}/>
   <Form at={[.26,.025,.211]} scale={[.035,.074,.041]} color="#4f5c69"/><Form at={[.27,.025,.246]} scale={[.019,.05,.015]} color="#a5b1bc"/>
   <Stroke points={[[.271,-.007,.239],[.239,-.073,.3],[.147,-.089,.353],[.102,-.085,.37]]} color="#4f5c69" radius={.009}/>
   <Form at={[.098,-.085,.37]} scale={[.019,.013,.012]} color="#394654"/>
   <Form at={[-.239,-.035,.245]} scale={[.012,.019,.013]} color="#d1b779" roughness={.28}/>
  </>}
  {index===2&&<>
   {[-1,1].map(side=><Stroke key={side} points={[[side*.025,.108,.389],[side*.08,.124,.391],[side*.151,.105,.372],[side*.149,.046,.375],[side*.081,.034,.397],[side*.029,.052,.395],[side*.025,.108,.389]]} color="#4f4959" radius={.009}/>)}
   <Stroke points={[[-.026,.092,.396],[0,.106,.404],[.026,.092,.396]]} color="#4f4959" radius={.009}/>
   {[-1,1].map(side=><Stroke key={side} points={[[side*.15,.097,.374],[side*.212,.12,.267],[side*.23,.1,.216]]} color="#4f4959" radius={.009}/>)}
  </>}
 </group>;
}
