import * as THREE from 'three';

// Units are metres. +Z is forward. Feet rest on Y=0.
// No image cutouts or textures: all visible parts are independent 3D meshes.
export function createHRHelper() {
  const root = new THREE.Group(); root.name = 'HRHelper';
  const geometries = new Set(), materials = new Set();
  const mat = (color, props={}) => { const m=new THREE.MeshPhysicalMaterial({color,roughness:.32,metalness:.06,clearcoat:.4,...props});materials.add(m);return m; };
  const shell=mat('#f2f0e9'), joint=mat('#aeb3b5',{roughness:.4,metalness:.55}), seam=mat('#bcbfbd'), glass=mat('#101419',{roughness:.18,metalness:.24,clearcoat:1}), light=mat('#fffbed',{emissive:'#fffbed',emissiveIntensity:.65});
  function mesh(geo,material,parent=root,position=[0,0,0],name='') { geometries.add(geo);const m=new THREE.Mesh(geo,material);m.position.fromArray(position);m.castShadow=true;m.receiveShadow=true;m.name=name;parent.add(m);return m; }
  function rounded(w,h,d,r) {
    r=Math.min(r,w/2-.001,h/2-.001,d/2-.001);
    const g=new THREE.BoxGeometry(w,h,d,16,16,16),p=g.attributes.position,n=g.attributes.normal;
    const core=new THREE.Vector3(w/2-r,h/2-r,d/2-r),v=new THREE.Vector3(),q=new THREE.Vector3(),normal=new THREE.Vector3();
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);q.set(Math.max(-core.x,Math.min(core.x,v.x)),Math.max(-core.y,Math.min(core.y,v.y)),Math.max(-core.z,Math.min(core.z,v.z)));normal.copy(v).sub(q).normalize();v.copy(q).addScaledVector(normal,r);p.setXYZ(i,v.x,v.y,v.z);n.setXYZ(i,normal.x,normal.y,normal.z);}
    return g;
  }
  const box=(size,r,material,parent,position,name)=>mesh(rounded(...size,r),material,parent,position,name);
  const sphere=(radius,material,parent,position,name)=>mesh(new THREE.SphereGeometry(radius,24,16),material,parent,position,name);
  const torso=new THREE.Group();torso.name='Torso';root.add(torso);
  // Cut a single continuous rounded shell at the waist so the seam follows its silhouette.
  function shellSlice(low,high,offset=0){const g=rounded(1.08,1.48,.81,.29),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,Math.max(low,Math.min(high,p.getY(i)+1.06))-offset);g.computeBoundingBox();g.computeBoundingSphere();return g;}
  mesh(shellSlice(.32,.944),shell,torso,[0,0,0],'LowerShell');
  mesh(shellSlice(.944,.952),seam,torso,[0,0,0],'WaistSeam');
  for(const side of [-1,1])box([.45,.3,.66],.12,shell,root,[side*.27,.16,.08],side<0?'LeftFoot':'RightFoot');
  box([.34,.11,.026],.012,seam,torso,[0,.6,.402],'ServicePanelBorder');
  box([.315,.087,.028],.012,shell,torso,[0,.6,.413],'ServicePanel');
  const neck=sphere(.43,shell,torso,[0,.95,0],'InternalNeck');neck.scale.set(1,.3,.8);
  const head=new THREE.Group();head.position.set(0,.95,0);head.name='HeadPivot';torso.add(head);
  mesh(shellSlice(.952,1.8,.95),shell,head,[0,0,0],'HeadShell');
  box([.77,.66,.18],.085,glass,head,[0,.42,.411],'Faceplate');
  const eyes=[];
  for(const side of [-1,1]){const e=mesh(new THREE.CapsuleGeometry(.043,.16,8,24),light,head,[side*.12,.40,.508],side<0?'LeftEye':'RightEye');e.scale.z=.22;eyes.push(e);}
  for(const side of [-1,1]){
    const ear=new THREE.Group();ear.position.set(side*.34,.79,0);ear.rotation.z=-side*.36;ear.name=side<0?'LeftAntenna':'RightAntenna';head.add(ear);
    mesh(new THREE.CylinderGeometry(.147,.16,.1,40),shell,ear,[0,.045,0]);
    mesh(new THREE.CylinderGeometry(.108,.108,.08,40),joint,ear,[0,.115,0]);
    mesh(new THREE.CylinderGeometry(.137,.137,.32,48),shell,ear,[0,.3,0]);
    mesh(new THREE.CylinderGeometry(.119,.119,.012,48),shell,ear,[0,.467,0]);
  }
  const arms=[];
  for(const side of [-1,1]){
    const shoulder=new THREE.Vector3(side*.51,1.15,.12);
    sphere(.13,shell,root,shoulder.toArray(),`${side}Shoulder`);
    const upper=mesh(new THREE.CapsuleGeometry(.16,1,8,24),shell,root,[0,0,0],`${side}UpperArm`);
    const elbow=sphere(.16,shell,root,[0,0,0],`${side}Elbow`);
    const lower=mesh(new THREE.CapsuleGeometry(.185,1,8,24),shell,root,[0,0,0],`${side}Forearm`);
    const palm=new THREE.Group();palm.name=side<0?'LeftWrist':'RightWrist';root.add(palm);
    box([.30,.17,.22],.078,shell,palm,[0,0,.03],'Palm');
    const fingers=[];
    for(let i=0;i<3;i++){const finger=new THREE.Group();finger.position.set((i-1)*.083,-.014,.115);palm.add(finger);box([.083,.095,.11],.041,shell,finger,[0,0,.025],`Finger${i}`);fingers.push(finger);}
    box([.105,.12,.11],.048,shell,palm,[-side*.15,-.006,.028],'Thumb');
    arms.push({side,shoulder,upper,elbow,lower,palm,fingers});
  }
  const axisY=new THREE.Vector3(0,1,0),a=new THREE.Vector3(),b=new THREE.Vector3(),pole=new THREE.Vector3();
  function link(obj,start,end,radius){a.subVectors(end,start);const length=a.length();obj.position.copy(start).add(end).multiplyScalar(.5);obj.quaternion.setFromUnitVectors(axisY,a.normalize());obj.scale.set(1,length/(1+radius*2),1);}
  function poseArm(arm,target){
    // Two-bone IK keeps arm lengths constant and the elbow away from the shell.
    const L1=.34,L2=.36,origin=arm.shoulder,direction=target.clone().sub(origin),d=Math.min(.699,direction.length());direction.normalize();
    const along=(L1*L1-L2*L2+d*d)/(2*d),height=Math.sqrt(Math.max(0,L1*L1-along*along));
    pole.set(arm.side,-.5,-.05);pole.addScaledVector(direction,-pole.dot(direction)).normalize();
    const elbow=origin.clone().addScaledVector(direction,along).addScaledVector(pole,height);
    arm.elbow.position.copy(elbow);link(arm.upper,origin,elbow,.16);link(arm.lower,elbow,target,.185);arm.palm.position.copy(target);
  }
  let disposed=false;
  function update(time=0,{action='typing',reducedMotion=false,intensity=1}={}){
    if(disposed)return;
    const t=reducedMotion?0:time, work=action==='typing', nod=action==='nod';
    torso.position.y=reducedMotion?0:Math.sin(t*1.8)*.003;
    head.rotation.x=work?.075+(reducedMotion?0:Math.sin(t*2)*.018):nod?(reducedMotion?.12:(1-Math.cos(t*3.4))*.105):Math.sin(t*.7)*.018;
    head.rotation.y=work?Math.sin(t*.75)*.018:0;
    const blink=reducedMotion?1:((t%4.9)>4.68?Math.max(.08,Math.abs((t%4.9)-4.79)/.11):1);eyes.forEach(e=>e.scale.y=blink);
    for(const arm of arms){
      const beat=Math.sin(t*15+arm.side*1.65),tap=reducedMotion?0:Math.max(0,beat)*.055*intensity;
      const target=work?new THREE.Vector3(arm.side*.35,1.225+tap,.70):new THREE.Vector3(arm.side*.64,.48,.15);
      poseArm(arm,target);arm.palm.rotation.set(work?-.1+tap*.7:0,0,work?arm.side*.04:arm.side*.12);
      arm.fingers.forEach((finger,i)=>{finger.rotation.x=work&&!reducedMotion?Math.max(0,Math.sin(t*15+arm.side*1.65+i*.85))*.24:0;});
    }
  }
  update(0);
  return {object:root,joints:{head,torso,arms},update,dispose(){if(disposed)return;disposed=true;geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());},setWireframe(value){materials.forEach(m=>m.wireframe=value);}};
}
