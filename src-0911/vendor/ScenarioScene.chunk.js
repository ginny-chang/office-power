/* VENDORED — the HR scenario 3D scenes, taken verbatim from the
   office-power-hr-preview build (assets/ScenarioScene-BXAcwXTR.js).
   Only the two import specifiers are rewritten, so the scenes render
   exactly as they do on the original site. Minified on purpose: this is a
   build artifact, not hand-maintained source. Do not edit by hand. */
import{r as p,R as e,u as q}from"./scenario-runtime.js";import{R as Me,I as _e,F as oe,a as Z,b as I,W as ze,B as K,S as he,V as z,c as Ae,U as ie,d as se,e as Ee,M as Le,f as W,L as Ue,g as Re,h as T,u as D,Q as ge,_ as J,i as ee,C as Be,j as Pe,H as V,k as d,A as Oe,D as Te,l as Ce,m as De,n as Ie,s as We,o as He,O as Ne}from"./scenario-three.chunk.js";const ve=parseInt(Me.replace(/\D+/g,"")),ye=ve>=125?"uv1":"uv2",le=new K,N=new z;class te extends _e{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const n=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],r=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],o=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(o),this.setAttribute("position",new oe(n,3)),this.setAttribute("uv",new oe(r,2))}applyMatrix4(n){const r=this.attributes.instanceStart,o=this.attributes.instanceEnd;return r!==void 0&&(r.applyMatrix4(n),o.applyMatrix4(n),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(n){let r;n instanceof Float32Array?r=n:Array.isArray(n)&&(r=new Float32Array(n));const o=new Z(r,6,1);return this.setAttribute("instanceStart",new I(o,3,0)),this.setAttribute("instanceEnd",new I(o,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(n,r=3){let o;n instanceof Float32Array?o=n:Array.isArray(n)&&(o=new Float32Array(n));const t=new Z(o,r*2,1);return this.setAttribute("instanceColorStart",new I(t,r,0)),this.setAttribute("instanceColorEnd",new I(t,r,r)),this}fromWireframeGeometry(n){return this.setPositions(n.attributes.position.array),this}fromEdgesGeometry(n){return this.setPositions(n.attributes.position.array),this}fromMesh(n){return this.fromWireframeGeometry(new ze(n.geometry)),this}fromLineSegments(n){const r=n.geometry;return this.setPositions(r.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new K);const n=this.attributes.instanceStart,r=this.attributes.instanceEnd;n!==void 0&&r!==void 0&&(this.boundingBox.setFromBufferAttribute(n),le.setFromBufferAttribute(r),this.boundingBox.union(le))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new he),this.boundingBox===null&&this.computeBoundingBox();const n=this.attributes.instanceStart,r=this.attributes.instanceEnd;if(n!==void 0&&r!==void 0){const o=this.boundingSphere.center;this.boundingBox.getCenter(o);let t=0;for(let a=0,s=n.count;a<s;a++)N.fromBufferAttribute(n,a),t=Math.max(t,o.distanceToSquared(N)),N.fromBufferAttribute(r,a),t=Math.max(t,o.distanceToSquared(N));this.boundingSphere.radius=Math.sqrt(t),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(n){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(n)}}class be extends te{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(n){const r=n.length-3,o=new Float32Array(2*r);for(let t=0;t<r;t+=3)o[2*t]=n[t],o[2*t+1]=n[t+1],o[2*t+2]=n[t+2],o[2*t+3]=n[t+3],o[2*t+4]=n[t+4],o[2*t+5]=n[t+5];return super.setPositions(o),this}setColors(n,r=3){const o=n.length-r,t=new Float32Array(2*o);if(r===3)for(let a=0;a<o;a+=r)t[2*a]=n[a],t[2*a+1]=n[a+1],t[2*a+2]=n[a+2],t[2*a+3]=n[a+3],t[2*a+4]=n[a+4],t[2*a+5]=n[a+5];else for(let a=0;a<o;a+=r)t[2*a]=n[a],t[2*a+1]=n[a+1],t[2*a+2]=n[a+2],t[2*a+3]=n[a+3],t[2*a+4]=n[a+4],t[2*a+5]=n[a+5],t[2*a+6]=n[a+6],t[2*a+7]=n[a+7];return super.setColors(t,r),this}fromLine(n){const r=n.geometry;return this.setPositions(r.attributes.position.array),this}}class ne extends Ae{constructor(n){super({type:"LineMaterial",uniforms:ie.clone(ie.merge([se.common,se.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new Ee(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${ve>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(r){this.uniforms.diffuse.value=r}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(r){r===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(r){this.uniforms.linewidth.value=r}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(r){!!r!="USE_DASH"in this.defines&&(this.needsUpdate=!0),r===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(r){this.uniforms.dashScale.value=r}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(r){this.uniforms.dashSize.value=r}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(r){this.uniforms.dashOffset.value=r}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(r){this.uniforms.gapSize.value=r}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(r){this.uniforms.opacity.value=r}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(r){this.uniforms.resolution.value.copy(r)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(r){!!r!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),r===!0?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(n)}}const Q=new W,ce=new z,fe=new z,w=new W,x=new W,B=new W,$=new z,X=new Re,M=new Ue,ue=new z,F=new K,G=new he,P=new W;let O,C;function me(i,n,r){return P.set(0,0,-n,1).applyMatrix4(i.projectionMatrix),P.multiplyScalar(1/P.w),P.x=C/r.width,P.y=C/r.height,P.applyMatrix4(i.projectionMatrixInverse),P.multiplyScalar(1/P.w),Math.abs(Math.max(P.x,P.y))}function Fe(i,n){const r=i.matrixWorld,o=i.geometry,t=o.attributes.instanceStart,a=o.attributes.instanceEnd,s=Math.min(o.instanceCount,t.count);for(let u=0,l=s;u<l;u++){M.start.fromBufferAttribute(t,u),M.end.fromBufferAttribute(a,u),M.applyMatrix4(r);const c=new z,f=new z;O.distanceSqToSegment(M.start,M.end,f,c),f.distanceTo(c)<C*.5&&n.push({point:f,pointOnLine:c,distance:O.origin.distanceTo(f),object:i,face:null,faceIndex:u,uv:null,[ye]:null})}}function Ge(i,n,r){const o=n.projectionMatrix,a=i.material.resolution,s=i.matrixWorld,u=i.geometry,l=u.attributes.instanceStart,c=u.attributes.instanceEnd,f=Math.min(u.instanceCount,l.count),m=-n.near;O.at(1,B),B.w=1,B.applyMatrix4(n.matrixWorldInverse),B.applyMatrix4(o),B.multiplyScalar(1/B.w),B.x*=a.x/2,B.y*=a.y/2,B.z=0,$.copy(B),X.multiplyMatrices(n.matrixWorldInverse,s);for(let h=0,y=f;h<y;h++){if(w.fromBufferAttribute(l,h),x.fromBufferAttribute(c,h),w.w=1,x.w=1,w.applyMatrix4(X),x.applyMatrix4(X),w.z>m&&x.z>m)continue;if(w.z>m){const E=w.z-x.z,v=(w.z-m)/E;w.lerp(x,v)}else if(x.z>m){const E=x.z-w.z,v=(x.z-m)/E;x.lerp(w,v)}w.applyMatrix4(o),x.applyMatrix4(o),w.multiplyScalar(1/w.w),x.multiplyScalar(1/x.w),w.x*=a.x/2,w.y*=a.y/2,x.x*=a.x/2,x.y*=a.y/2,M.start.copy(w),M.start.z=0,M.end.copy(x),M.end.z=0;const _=M.closestPointToPointParameter($,!0);M.at(_,ue);const S=T.lerp(w.z,x.z,_),U=S>=-1&&S<=1,H=$.distanceTo(ue)<C*.5;if(U&&H){M.start.fromBufferAttribute(l,h),M.end.fromBufferAttribute(c,h),M.start.applyMatrix4(s),M.end.applyMatrix4(s);const E=new z,v=new z;O.distanceSqToSegment(M.start,M.end,v,E),r.push({point:v,pointOnLine:E,distance:O.origin.distanceTo(v),object:i,face:null,faceIndex:h,uv:null,[ye]:null})}}}class Se extends Le{constructor(n=new te,r=new ne({color:Math.random()*16777215})){super(n,r),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const n=this.geometry,r=n.attributes.instanceStart,o=n.attributes.instanceEnd,t=new Float32Array(2*r.count);for(let s=0,u=0,l=r.count;s<l;s++,u+=2)ce.fromBufferAttribute(r,s),fe.fromBufferAttribute(o,s),t[u]=u===0?0:t[u-1],t[u+1]=t[u]+ce.distanceTo(fe);const a=new Z(t,2,1);return n.setAttribute("instanceDistanceStart",new I(a,1,0)),n.setAttribute("instanceDistanceEnd",new I(a,1,1)),this}raycast(n,r){const o=this.material.worldUnits,t=n.camera;t===null&&!o&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const a=n.params.Line2!==void 0&&n.params.Line2.threshold||0;O=n.ray;const s=this.matrixWorld,u=this.geometry,l=this.material;C=l.linewidth+a,u.boundingSphere===null&&u.computeBoundingSphere(),G.copy(u.boundingSphere).applyMatrix4(s);let c;if(o)c=C*.5;else{const m=Math.max(t.near,G.distanceToPoint(O.origin));c=me(t,m,l.resolution)}if(G.radius+=c,O.intersectsSphere(G)===!1)return;u.boundingBox===null&&u.computeBoundingBox(),F.copy(u.boundingBox).applyMatrix4(s);let f;if(o)f=C*.5;else{const m=Math.max(t.near,F.distanceToPoint(O.origin));f=me(t,m,l.resolution)}F.expandByScalar(f),O.intersectsBox(F)!==!1&&(o?Fe(this,r):Ge(this,t,r))}onBeforeRender(n){const r=this.material.uniforms;r&&r.resolution&&(n.getViewport(Q),this.material.uniforms.resolution.value.set(Q.z,Q.w))}}class ke extends Se{constructor(n=new be,r=new ne({color:Math.random()*16777215})){super(n,r),this.isLine2=!0,this.type="Line2"}}const re=p.forwardRef(function({children:n,follow:r=!0,lockX:o=!1,lockY:t=!1,lockZ:a=!1,...s},u){const l=p.useRef(null),c=p.useRef(null),f=new ge;return D(({camera:m})=>{if(!r||!c.current)return;const h=l.current.rotation.clone();c.current.updateMatrix(),c.current.updateWorldMatrix(!1,!1),c.current.getWorldQuaternion(f),m.getWorldQuaternion(l.current.quaternion).premultiply(f.invert()),o&&(l.current.rotation.x=h.x),t&&(l.current.rotation.y=h.y),a&&(l.current.rotation.z=h.z)}),p.useImperativeHandle(u,()=>c.current,[]),p.createElement("group",J({ref:c},s),p.createElement("group",{ref:l},n))}),je=p.forwardRef(function({points:n,color:r=16777215,vertexColors:o,linewidth:t,lineWidth:a,segments:s,dashed:u,...l},c){var f,m;const h=ee(U=>U.size),y=p.useMemo(()=>s?new Se:new ke,[s]),[b]=p.useState(()=>new ne),_=(o==null||(f=o[0])==null?void 0:f.length)===4?4:3,S=p.useMemo(()=>{const U=s?new te:new be,H=n.map(E=>{const v=Array.isArray(E);return E instanceof z||E instanceof W?[E.x,E.y,E.z]:E instanceof Ee?[E.x,E.y,0]:v&&E.length===3?[E[0],E[1],E[2]]:v&&E.length===2?[E[0],E[1],0]:E});if(U.setPositions(H.flat()),o){r=16777215;const E=o.map(v=>v instanceof Be?v.toArray():v);U.setColors(E.flat(),_)}return U},[n,s,o,_]);return p.useLayoutEffect(()=>{y.computeLineDistances()},[n,y]),p.useLayoutEffect(()=>{u?b.defines.USE_DASH="":delete b.defines.USE_DASH,b.needsUpdate=!0},[u,b]),p.useEffect(()=>()=>{S.dispose(),b.dispose()},[S]),p.createElement("primitive",J({object:y,ref:c},l),p.createElement("primitive",{object:S,attach:"geometry"}),p.createElement("primitive",J({object:b,attach:"material",color:r,vertexColors:!!o,resolution:[h.width,h.height],linewidth:(m=t??a)!==null&&m!==void 0?m:1,dashed:u,transparent:_===4},l)))});function g({at:i=[0,0,0],scale:n=[1,1,1],color:r,rotation:o=[0,0,0],roughness:t=.8}){return e.createElement("mesh",{position:i,scale:n,rotation:o},e.createElement("sphereGeometry",{args:[1,40,28]}),e.createElement("meshPhysicalMaterial",{color:r,roughness:t,clearcoat:.03,clearcoatRoughness:.5}))}function L({points:i,color:n,radius:r=.012,roughness:o=.5}){const t=p.useMemo(()=>new Pe(i.map(a=>new z(...a))),[i]);return e.createElement("mesh",null,e.createElement("tubeGeometry",{args:[t,24,r,8,!1]}),e.createElement("meshStandardMaterial",{color:n,roughness:o}))}function Ve({person:i,index:n}){const r=n===0?"#303139":n===1?"#46342e":"#414049",o=i.skin;return e.createElement("group",{position:[0,-.015,.05]},e.createElement(g,{at:[0,-.35,.14],scale:[.355,.19,.18],color:i.color}),e.createElement(g,{at:[0,-.205,.17],scale:[.085,.13,.08],color:o}),n===0?e.createElement(e.Fragment,null,e.createElement(g,{at:[0,-.28,.125],scale:[.185,.16,.11],color:"#537ba1"}),e.createElement(g,{at:[0,-.305,.27],scale:[.12,.07,.025],color:"#e5e8ec"}),[-1,1].map(t=>e.createElement(e.Fragment,{key:t},e.createElement(L,{points:[[t*.08,-.23,.245],[t*.16,-.275,.26],[t*.12,-.37,.285]],color:"#6288af",radius:.038}),e.createElement(L,{points:[[t*.09,-.33,.31],[t*.085,-.41,.306],[t*.09,-.49,.27]],color:"#e7e5e0",radius:.009})))):e.createElement(e.Fragment,null,e.createElement(g,{at:[0,-.35,.291],scale:[.1,.135,.017],color:"#f3eee6"}),[-1,1].map(t=>e.createElement(g,{key:t,at:[t*.1,-.315,.29],scale:[.068,.135,.026],rotation:[0,0,t*-.37],color:n===1?"#c38677":"#82749e"})),n===2&&e.createElement(e.Fragment,null,e.createElement(g,{at:[0,-.292,.315],scale:[.025,.025,.015],color:"#594f73"}),e.createElement(g,{at:[0,-.386,.315],scale:[.024,.079,.014],color:"#65587f"}))),n===1&&e.createElement(g,{at:[0,.075,.09],scale:[.265,.335,.16],color:r}),[-1,1].map(t=>e.createElement(e.Fragment,{key:t},e.createElement(g,{at:[t*.225,.04,.205],scale:[.047,.083,.042],color:o}),e.createElement(g,{at:[t*.242,.035,.238],scale:[.021,.045,.012],color:"#c99581"}))),e.createElement(g,{at:[0,.045,.19],scale:[n===2?.225:.218,.285,.172],color:o}),e.createElement(g,{at:[0,.002,.351],scale:[.024,.038,.019],color:o}),[-1,1].map(t=>e.createElement("group",{key:t},e.createElement(g,{at:[t*.087,.078,.343],scale:[.012,.019,.006],color:"#383236",roughness:.6}),e.createElement(g,{at:[t*.085,.084,.349],scale:[.003,.004,.002],color:"#f6eee7"}),e.createElement(L,{points:[[t*.05,.145,.332],[t*.086,.157,.328],[t*.122,.143,.316]],color:r,radius:.007}),n===1&&e.createElement(L,{points:[[t*.091,.089,.347],[t*.107,.102,.339],[t*.113,.11,.334]],color:r,radius:.003}))),e.createElement(L,{points:[[-.067,-.078,.327],[-.035,-.097,.338],[0,-.103,.339],[.035,-.097,.338],[.067,-.078,.327]],color:"#926b5a",radius:.004}),e.createElement(L,{points:[[-.045,-.09,.335],[0,-.103,.341],[.045,-.09,.335]],color:"#f6eade",radius:.003}),n===0?e.createElement(e.Fragment,null,e.createElement(g,{at:[0,.259,.14],scale:[.228,.116,.163],color:r,roughness:.36}),e.createElement(g,{at:[-.03,.303,.23],scale:[.216,.095,.102],rotation:[0,0,.15],color:r,roughness:.36}),e.createElement(g,{at:[.12,.32,.192],scale:[.106,.07,.11],rotation:[0,0,.35],color:r}),[-1,1].map(t=>e.createElement(g,{key:t,at:[t*.203,.161,.16],scale:[.027,.139,.09],color:r})),[0,1,2].map(t=>e.createElement(L,{key:t,points:[[-.17,.31+t*.012,.22],[-.07,.353+t*.008,.237],[.07,.35+t*.008,.235],[.17,.332+t*.004,.203]],color:"#42434a",radius:.004}))):e.createElement(e.Fragment,null,e.createElement(g,{at:[-.095,.274,.179],scale:[.156,.104,.13],rotation:[0,0,.28],color:r}),e.createElement(g,{at:[.12,.255,.165],scale:[.125,.101,.128],rotation:[0,0,-.25],color:r}),[-1,1].map(t=>e.createElement(g,{key:t,at:[t*.205,n===1?.04:.16,.115],scale:[n===1?.05:.025,n===1?.244:.13,.095],color:r})),[0,1,2].map(t=>e.createElement(L,{key:t,points:[[-.185,.23,.23],[-.14,.303+t*.008,.258],[-.045,.328+t*.006,.257],[.028,.286,.252]],color:n===1?"#655047":"#575660",radius:.004}))),n===1&&e.createElement(e.Fragment,null,e.createElement(L,{points:[[-.255,.015,.18],[-.26,.21,.15],[-.15,.367,.13],[0,.396,.11],[.2,.3,.12],[.265,.02,.18]],color:"#535e69",radius:.014}),e.createElement(g,{at:[.26,.025,.211],scale:[.035,.074,.041],color:"#4f5c69"}),e.createElement(g,{at:[.27,.025,.246],scale:[.019,.05,.015],color:"#a5b1bc"}),e.createElement(L,{points:[[.271,-.007,.239],[.239,-.073,.3],[.147,-.089,.353],[.102,-.085,.37]],color:"#4f5c69",radius:.009}),e.createElement(g,{at:[.098,-.085,.37],scale:[.019,.013,.012],color:"#394654"}),e.createElement(g,{at:[-.239,-.035,.245],scale:[.012,.019,.013],color:"#d1b779",roughness:.28})),n===2&&e.createElement(e.Fragment,null,[-1,1].map(t=>e.createElement(L,{key:t,points:[[t*.025,.108,.389],[t*.08,.124,.391],[t*.151,.105,.372],[t*.149,.046,.375],[t*.081,.034,.397],[t*.029,.052,.395],[t*.025,.108,.389]],color:"#4f4959",radius:.009})),e.createElement(L,{points:[[-.026,.092,.396],[0,.106,.404],[.026,.092,.396]],color:"#4f4959",radius:.009}),[-1,1].map(t=>e.createElement(L,{key:t,points:[[t*.15,.097,.374],[t*.212,.12,.267],[t*.23,.1,.216]],color:"#4f4959",radius:.009}))))}const j=[{name:"柏宇",role:"工程師",color:"#769fc8",skin:"#e8c4a8",hair:"#3f495a",at:[-1.65,2.55,.45],hours:"44h"},{name:"佳穎",role:"客服",color:"#d69b87",skin:"#efcdb6",hair:"#715442",at:[-.05,3.15,.2],hours:"41.5h"},{name:"陳經理",role:"主管",color:"#9c8abd",skin:"#dbb493",hair:"#55535c",at:[1.65,2.65,.4],hours:null}];function we({person:i,index:n,time:r,reduced:o,appearAt:t=6+n*.65,completed:a,showHours:s=!0,badge:u="!",badgeClass:l="",badgeLabel:c,detailLayer:f=[5,0],badgeLayer:m=[20,15],detailPosition:h=[0,-.72,.6],children:y}){const b=p.useRef(),_=a??r>=16;return D(()=>{const S=o?1:Math.min(1,Math.max(0,(r-t)/.8));b.current.scale.setScalar(Math.max(.001,S)),b.current.visible=S>0,b.current.position.y=i.at[1]+(!o&&r<16?Math.sin(r*1.6+n)*.035:0)}),e.createElement("group",{ref:b,position:i.at},e.createElement(re,null,e.createElement("mesh",null,e.createElement("circleGeometry",{args:[.59,48]}),e.createElement("meshStandardMaterial",{color:n===0?"#dce8f3":n===1?"#f1dfd6":"#e6dfef",roughness:.7})),e.createElement("mesh",{position:[0,0,.025]},e.createElement("torusGeometry",{args:[.57,.018,12,64]}),e.createElement("meshStandardMaterial",{color:i.color})),e.createElement(Ve,{person:i,index:n}),(o||r>=t)&&e.createElement(e.Fragment,null,e.createElement(V,{position:[.4,.46,.6],center:!0,zIndexRange:m},e.createElement("div",{className:`ot-alert-badge${_?" is-done":l}`,role:"img","aria-label":c||(_?"已通知確認":"工時預警")},_?"✓":u)),e.createElement(V,{position:h,center:!0,zIndexRange:f},y||e.createElement("div",{className:"ot-person-label"},e.createElement("strong",null,i.name),e.createElement("span",{className:i.hours?"ot-hours":""},i.hours||i.role),s&&i.hours&&e.createElement("em",null,"+",n===0?"4":"1.5","h"))))))}function qe({to:i,color:n,index:r,time:o,reduced:t}){const a=p.useRef(),s=[-.45,1.55,-.5];return D(()=>{const u=o>=9&&o<15,l=o>=15&&o<18;a.current.visible=u||l;const c=t?.5:((o-(u?9:15))*.6+r*.23)%1,f=l?1-c:c;a.current.position.set(...s.map((m,h)=>m+(i[h]-m)*f))}),e.createElement(e.Fragment,null,e.createElement(je,{points:[s,i],color:n,lineWidth:1,transparent:!0,opacity:o>=9?.38:0}),e.createElement("mesh",{ref:a},e.createElement("sphereGeometry",{args:[.065,12,8]}),e.createElement("meshBasicMaterial",{color:n})))}function Ye({reduced:i}){const{time:n}=q();return e.createElement("group",null,j.map((r,o)=>e.createElement(e.Fragment,{key:r.name},e.createElement(we,{person:r,index:o,time:n,reduced:i}),e.createElement(qe,{to:r.at,color:r.color,index:o,time:n,reduced:i}))))}const Qe=[{date:"09/02",issue:"下班缺卡",expected:"18:00",sentAt:7,doneAt:14},{date:"09/04",issue:"上班缺卡",expected:"09:00",sentAt:8.5,doneAt:18},{date:"09/05",issue:"下班缺卡",expected:"18:00",sentAt:10,doneAt:1/0}];function xe(i){const n=i<4?"manual":i<7?"scan":i<12?"send":"track",r=Qe.map(o=>({...o,sent:i>=o.sentAt,done:i>=o.doneAt}));return{phase:n,rows:r,pending:r.filter(o=>!o.done).length,completed:r.filter(o=>o.done).length}}function de({column:i,summary:n=!1,faceWidth:r=90,target:o,children:t}){const a=p.useRef(),s=p.useMemo(()=>({anchor:new z,world:new z,edge:new z,scale:new z,rotation:new ge}),[]);return D(({camera:u,size:l})=>{const c=a.current,f=c.parent,m=l.width<=650;f.updateWorldMatrix(!0,!1);const h=m?Math.min(100,l.width*.28):Math.min(142,l.width*.17),y=m?8:16,_=((m?l.width*.5:Math.min(l.width*.72,l.width-h*1.5-y-16))+(n?0:(i-1)*(h+y)))/l.width,S=n?m?.64:.23:m?.77:.43;s.anchor.set(0,2.9,.4),f.localToWorld(s.anchor),s.anchor.project(u),s.world.set(_*2-1,1-S*2,s.anchor.z).unproject(u),s.edge.set(_*2-1+2/l.width,1-S*2,s.anchor.z).unproject(u);const U=s.world.distanceTo(s.edge);f.worldToLocal(s.world),c.position.copy(s.world),f.getWorldQuaternion(s.rotation),c.quaternion.copy(s.rotation.invert()).multiply(u.quaternion),f.getWorldScale(s.scale),c.scale.setScalar(U*r/1.18/s.scale.x),o&&o.at.splice(0,3,...c.position.toArray())}),e.createElement("group",{ref:a},t)}function $e(){return e.createElement("svg",{viewBox:"0 0 24 24",fill:"none","aria-hidden":"true"},e.createElement("path",{d:"M20 10.5c0 4-3.6 7-8 7H9l-4 3v-5C3 14 2 12.5 2 10.5 2 6.5 6 3 11 3s9 3.5 9 7.5Z",fill:"currentColor"}),e.createElement("path",{d:"M7 9h8M7 12h5",stroke:"white",strokeWidth:"1.5",strokeLinecap:"round"}))}function Xe({person:i,row:n,time:r,reduced:o}){const t=p.useRef(),a=p.useRef(),s=p.useMemo(()=>new Float32Array(6),[]),u=[-.45,1.9,-1.1];return D(()=>{const l=a.current.geometry.attributes.position;l.setXYZ(0,...u),l.setXYZ(1,...i.at),l.needsUpdate=!0,a.current.visible=r>=n.sentAt-1.2;const c=r>=n.sentAt-1.2&&r<n.sentAt,f=Number.isFinite(n.doneAt)&&r>=n.doneAt-1.2&&r<n.doneAt;t.current.visible=!o&&(c||f);const m=Math.min(1,Math.max(0,(r-((c?n.sentAt:n.doneAt)-1.2))/1.2)),h=f?1-m:m;t.current.position.set(...u.map((y,b)=>y+(i.at[b]-y)*h))}),e.createElement(e.Fragment,null,e.createElement("line",{ref:a,frustumCulled:!1},e.createElement("bufferGeometry",null,e.createElement("bufferAttribute",{attach:"attributes-position",args:[s,3]})),e.createElement("lineBasicMaterial",{color:n.done?"#67ad85":i.color,transparent:!0,opacity:.4})),e.createElement("group",{ref:t},e.createElement(re,null,e.createElement(d,{size:[.23,.16,.035],color:"#77c997",radius:.03}),e.createElement(d,{at:[0,.015,.025],size:[.13,.018,.01],color:"#fff"}),e.createElement(d,{at:[-.025,-.03,.025],size:[.08,.015,.01],color:"#fff"}))))}function Ze({time:i}){return i>=4?null:e.createElement("group",{position:[-.4,2.4,.4]},e.createElement(re,null,[0,1,2].map(n=>e.createElement("group",{key:n,position:[(n-1)*.55,n===1?.12:0,n*.045],rotation:[0,0,(n-1)*-.13]},e.createElement(d,{size:[.62,.84,.025],color:"#f6f2ea"}),[0,1,2,3].map(r=>e.createElement(e.Fragment,{key:r},e.createElement(d,{at:[-.19,.24-r*.15,.025],size:[.065,.065,.01],color:"#dba85e"}),e.createElement(d,{at:[.045,.24-r*.15,.025],size:[.3,.025,.01],color:"#aeb7c1"}))))),e.createElement(V,{center:!0,position:[0,-.72,.3],zIndexRange:[8,6]},e.createElement("div",{className:"dispatch-manual"},e.createElement("span",null,"◷"),e.createElement("strong",null,"2–3 天"),e.createElement("small",null,"印清單 · 逐一催回覆")))))}function Je({reduced:i}){const{time:n}=q(),r=xe(n),{size:o}=ee(),t=o.width<=650,a=t?Math.min(64,o.width*.2):Math.min(100,o.width*.12),s=t?Math.min(100,o.width*.28):Math.min(142,o.width*.17),u=-.59-(t?58:68)*1.18/a,l=p.useMemo(()=>j.map(c=>({...c,at:[...c.at]})),[]);return e.createElement("group",null,e.createElement(Ze,{time:n}),n>=4&&e.createElement(de,{summary:!0},e.createElement(V,{center:!0,zIndexRange:[9,6]},e.createElement("div",{className:"dispatch-summary"},e.createElement("span",null,r.phase==="scan"?"掃描缺卡":r.phase==="send"?"LINE 自動派件":"HR 待處理"),e.createElement("strong",null,r.pending,e.createElement("small",null,"人")),e.createElement("i",null,r.completed,"/3 已處理"),r.phase==="track"&&e.createElement("b",null,j.filter((c,f)=>!r.rows[f].done).map(c=>c.name).join(" · "))))),j.map((c,f)=>{const m=r.rows[f];return e.createElement(e.Fragment,{key:c.name},e.createElement(de,{column:f,faceWidth:a,target:l[f]},e.createElement(we,{person:{...c,at:[0,0,0]},detailPosition:[0,u,0],detailLayer:f===2?[60,60]:[40,40],badgeLayer:f===2?[80,80]:[70,70],index:f,time:n,reduced:i,appearAt:4+f*.4,completed:m.done,showHours:!1,badge:m.sent?e.createElement($e,null):"!",badgeClass:m.sent?" is-line":"",badgeLabel:m.done?"缺卡已處理":m.sent?"LINE 已派件，待處理":"已發現缺卡"},e.createElement("div",{style:{width:s},className:`dispatch-detail${m.done?" is-done":""}`},e.createElement("header",null,e.createElement("strong",null,c.name),e.createElement("span",null,m.done?"✓ 已處理":m.sent?"LINE":"缺卡明細")),e.createElement("div",{className:"dispatch-detail-row"},e.createElement("span",null,m.date),e.createElement("b",null,m.issue)),e.createElement("div",{className:"dispatch-detail-row"},e.createElement("span",null,m.expected),e.createElement("i",null,m.done?"已補登":"— —")),e.createElement("footer",null,m.done?"回覆已同步 HR":m.sent?"待處理":"準備自動派件")))),e.createElement(Xe,{person:l[f],row:m,time:n,reduced:i}))}))}const Ke={overtime:"#cca575",dispatch:"#90abc5",leave:"#9db4a1",contract:"#a99bb8",punch:"#8bb7af"};function pe({at:i,scale:n=1}){return e.createElement("group",{position:i,scale:n},e.createElement("mesh",{position:[0,.22,0],castShadow:!0},e.createElement("cylinderGeometry",{args:[.25,.19,.44,24]}),e.createElement("meshStandardMaterial",{color:"#d4c6b5",roughness:.8})),[0,1,2,3,4].map(r=>e.createElement("group",{key:r,rotation:[0,r*1.25,0]},e.createElement(d,{at:[0,.65,0],size:[.025,.85,.025],color:"#869283"}),e.createElement("mesh",{position:[.15,.65+r*.09,0],rotation:[0,0,-.65],scale:[.14,.33,.06],castShadow:!0},e.createElement("sphereGeometry",{args:[1,16,12]}),e.createElement("meshStandardMaterial",{color:r%2?"#99aa95":"#7f947d",roughness:.8})))))}function et({kind:i}){const{time:n}=q(),r=p.useMemo(()=>{const o=document.createElement("canvas");o.width=640,o.height=400;const t=o.getContext("2d");if(t.fillStyle="#263342",t.fillRect(0,0,640,400),t.fillStyle="#9cafc3",t.font="18px sans-serif",t.fillText("PEOPLE / HR WORKSPACE",30,40),t.fillStyle="#f0f3f6",t.font="32px sans-serif",t.fillText({overtime:"Overtime monitor",dispatch:"Attendance inbox",leave:"Leave planner",contract:"Contract timeline",punch:"Attendance verified"}[i],30,92),i==="overtime")[.36,.56,.72,.91].forEach((s,u)=>{t.fillStyle=u===3?"#cca575":"#94acc5",t.fillRect(45+u*135,335-s*210,85,s*210)}),t.strokeStyle="#e0bd90",t.setLineDash([7,5]),t.beginPath(),t.moveTo(30,151),t.lineTo(610,151),t.stroke();else if(i==="leave")for(let s=0;s<21;s++)t.fillStyle=s>14?"#9db4a1":"#485969",t.fillRect(30+s%7*84,125+Math.floor(s/7)*70,67,50);else for(let s=0;s<4;s++)t.fillStyle="#39495b",t.fillRect(30,125+s*61,580,45),t.fillStyle=Ke[i],t.fillRect(45,140+s*61,16,16),t.fillStyle="#ced8e2",t.font="18px sans-serif",t.fillText((i==="punch"?["09:05  Entry record","Attendance matched","Summary prepared","Sent for review"]:i==="contract"?["Probation review","Contract renewal","30-day reminder","Manager notified"]:["Assigned to employee","11 completed","4 pending","LINE delivered"])[s],80,157+s*61);const a=new Ce(o);return a.colorSpace=De,a},[i]);return p.useEffect(()=>()=>r.dispose(),[r]),p.useEffect(()=>{if(i==="dispatch"){const a=r.image.getContext("2d"),s=xe(n);a.fillStyle="#263342",a.fillRect(0,0,640,400),a.fillStyle="#afc3d8",a.font="22px sans-serif",a.fillText(n<4?"月結 · 人工催收":"月結 · 異常儀表板",30,43),a.fillStyle="#f5c16b",a.font="bold 64px sans-serif",a.fillText(n<4?"2–3":String(s.pending),35,120),a.fillStyle="#d2dce7",a.font="22px sans-serif",a.fillText(n<4?"天":"人待處理",160,112),a.fillStyle="#425568",a.fillRect(32,143,572,9),a.fillStyle="#7dc898",a.fillRect(32,143,572*s.completed/3,9),["柏宇","佳穎","陳經理"].forEach((u,l)=>{const c=s.rows[l],f=183+l*69;a.fillStyle=c.done?"#304b45":"#354658",a.fillRect(30,f,580,56),a.fillStyle=["#769fc8","#d69b87","#9c8abd"][l],a.beginPath(),a.arc(56,f+18,8,0,Math.PI*2),a.fill(),a.fillRect(44,f+29,24,13),a.fillStyle="#edf2f7",a.font="22px sans-serif",a.fillText(u,85,f+33),a.fillStyle="#bac7d5",a.font="19px sans-serif",a.fillText(c.date+" "+c.issue,190,f+33),a.fillStyle=c.done?"#94ddad":"#f5c16b",a.font="bold 21px sans-serif",a.fillText(c.done?"✓ 已處理":n<4?"待催收":c.sent?"待處理":"待派件",490,f+33)}),r.needsUpdate=!0;return}if(i!=="overtime")return;const o=r.image,t=o.getContext("2d");t.fillStyle="#263342",t.fillRect(0,0,640,400),t.strokeStyle="#b9c8d9",t.lineWidth=3,t.beginPath(),t.arc(48,43,19,0,Math.PI*2),t.stroke(),t.beginPath(),t.moveTo(48,28),t.lineTo(48,43),t.lineTo(34,43),t.stroke(),t.fillStyle="#c8d5e2",t.font="22px sans-serif",t.fillText("09:00",82,51);for(let a=0;a<18;a++)t.fillStyle=n>=18?"#88ad97":"#7e94aa",t.beginPath(),t.arc(310+a%9*32,30+Math.floor(a/9)*27,5,0,Math.PI*2),t.fill(),t.fillRect(304+a%9*32,36+Math.floor(a/9)*27,12,5);if(n>=5){t.fillStyle="#f5ad241c",t.fillRect(25,105,550,64),[27,33,41.5,44].forEach((u,l)=>{const c=u*Math.min(1,Math.max(0,(n-5-l*.45)/.8)),f=45+l*132,m=353-c/50*230;t.fillStyle=c>40?"#d3a45b":"#829ab5",t.fillRect(f,m,68,c/50*230),c>40&&(t.save(),t.shadowColor="#ffb52e",t.shadowBlur=15,t.fillStyle="#ffc247",t.fillRect(f,m,68,(c-40)/50*230),t.restore(),t.strokeStyle="#ffe5a2",t.lineWidth=2,t.strokeRect(f,m,68,(c-40)/50*230)),t.font="bold 23px sans-serif",t.fillStyle=u>40?"#ffd477":"#f1f3f7",t.fillText(u+"h",f,380),c>40&&(t.font="bold 22px sans-serif",t.fillText("+"+(u-40)+"h",f,108))}),t.strokeStyle="#ffc247",t.lineWidth=4,t.setLineDash([10,5]),t.beginPath(),t.moveTo(25,169),t.lineTo(575,169),t.stroke(),t.setLineDash([]),t.fillStyle="#ffc247",t.fillRect(555,152,80,34),t.fillStyle="#263342",t.font="bold 23px sans-serif",t.fillText("40h",565,177),t.strokeStyle="#a98790",t.lineWidth=1;const s=353-46/50*230;t.beginPath(),t.moveTo(25,s),t.lineTo(575,s),t.stroke(),t.fillStyle="#c2a6ae",t.font="16px sans-serif",t.fillText("46h",583,s+5)}else for(let a=0;a<24;a++)t.fillStyle=a<n*5?"#a3bead":"#465a70",t.beginPath(),t.arc(60+a%8*74,160+Math.floor(a/8)*70,12,0,Math.PI*2),t.fill(),t.fillRect(44+a%8*74,178+Math.floor(a/8)*70,32,16);r.needsUpdate=!0},[i,n,r]),e.createElement("group",{position:[-.45,1.96,-1.25]},e.createElement(d,{size:[1.8,1.18,.12],color:"#a8b2be",radius:.06}),e.createElement("mesh",{position:[0,.02,.07]},e.createElement("planeGeometry",{args:[1.65,1.03]}),e.createElement("meshBasicMaterial",{map:r,toneMapped:!1})),e.createElement(d,{at:[0,-.68,0],size:[.09,.3,.1],color:"#9da8b6"}),e.createElement(d,{at:[0,-.83,.1],size:[.6,.045,.38],color:"#a6b1be"}))}function tt({kind:i="overtime",reduced:n=!1}){const{time:r}=q(),o=p.useRef(),t=p.useRef(),a=p.useRef(),s=p.useRef(),u=p.useRef();return D(()=>{const l=n?0:r;t.current.position.y=i==="contract"?1.33+Math.max(0,Math.sin(l*2.6))*.48:1.36,s.current.visible=i==="punch",s.current.position.y=2.28+Math.sin(l*2)*.07,u.current.visible=i==="leave",u.current.scale.setScalar(1+Math.sin(l*2)*.07),a.current.visible=i==="overtime"||i==="dispatch"&&r>=4&&r<7,a.current.position.y=2.43-Math.min(1,Math.max(0,(r-2)/3))*.91,o.current.rotation.x=i==="overtime"&&r>=15&&r<17&&!n?Math.sin((r-15)*Math.PI*2)*.09:0}),e.createElement("group",null,i==="overtime"&&e.createElement(Ye,{reduced:n}),i==="dispatch"&&e.createElement(Je,{reduced:n}),e.createElement(d,{at:[0,-.14,0],size:[6,.24,5.2],color:"#d5d9dd",radius:.06}),Array.from({length:12},(l,c)=>e.createElement(d,{key:c,at:[-2.75+c*.5,-.011,0],size:[.475,.015,5],color:c%2?"#d9dcdf":"#e1e2e3",radius:.005})),e.createElement(d,{at:[0,1.9,-2.55],size:[6,3.85,.12],color:"#e9e8e4"}),e.createElement(d,{at:[-2.95,1.9,0],size:[.12,3.85,5.2],color:"#e0e2e4"}),e.createElement("group",{position:[-2.86,2.45,-.3],rotation:[0,Math.PI/2,0]},e.createElement(d,{size:[2.35,1.8,.08],color:"#faf8f1"}),e.createElement(d,{at:[0,0,.05],size:[2.15,1.6,.04],color:"#c6d2dc"}),[-.7,0,.7].map(l=>e.createElement(d,{key:l,at:[l,0,.09],size:[.045,1.65,.05],color:"#f5f2eb"})),e.createElement(d,{at:[0,-.87,.15],size:[2.5,.09,.35],color:"#eae5da"}),e.createElement(d,{at:[0,.72,.13],size:[2.35,.25,.1],color:"#d0c8bc"})),e.createElement(d,{at:[-.55,1.18,-1],size:[3.55,.14,1.3],color:"#c5b9a7",radius:.07}),[-2,.88].map(l=>e.createElement(d,{key:l,at:[l,.57,-1],size:[.08,1.13,1.07],color:"#9fa7ae"})),e.createElement(et,{kind:i}),e.createElement(d,{at:[-.58,1.28,-.65],size:[1.05,.045,.35],color:"#eef0ef"}),e.createElement(d,{at:[.12,1.28,-.6],size:[.18,.05,.26],color:"#e6e8e8",radius:.06}),e.createElement("group",{ref:a,position:[-.45,1.8,-1.16]},e.createElement(d,{size:[1.61,.022,.015],color:"#e0bd90"})),e.createElement("group",{ref:o,position:[-.8,.23,.2],rotation:[0,.1,0]},e.createElement(Oe,{at:[0,0,0],reduced:n,active:i!=="overtime"||r>=9&&r<12})),e.createElement(d,{at:[-.8,.21,.2],size:[.85,.13,.75],color:"#a7b1bd",radius:.1}),e.createElement(d,{at:[-.8,.035,.6],size:[2.8,.035,2.45],color:"#c3c9cf",radius:.15}),e.createElement("group",{position:[.95,1.67,-1.18],rotation:[0,-.2,-.1]},e.createElement(d,{size:[.4,.67,.055],color:"#566474",radius:.04}),e.createElement(d,{at:[0,0,.035],size:[.34,.57,.015],color:i==="punch"?"#b9d7ca":"#c7d2dc"}),[0,1,2].map(l=>e.createElement(d,{key:l,at:[0,.15-l*.14,.05],size:[.25,.045,.012],color:"#769484"}))),e.createElement("group",{ref:s,position:[1.03,2.28,-1.15]},e.createElement(d,{size:[.82,.37,.075],color:"#bbd6cb",radius:.08}),[-.22,0,.22].map(l=>e.createElement(d,{key:l,at:[l,0,.047],size:[.06,.06,.02],color:"#5c8b78"}))),e.createElement("group",{ref:u,position:[.05,2.9,-2.37]},e.createElement(d,{size:[1.28,1.02,.025],color:"#a0b899"}),e.createElement(d,{at:[0,0,.023],size:[1.16,.9,.025],color:"#e8eee4"}),Array.from({length:12},(l,c)=>e.createElement(d,{key:c,at:[-.36+c%4*.24,.2-Math.floor(c/4)*.2,.045],size:[.15,.12,.02],color:c>5?"#829b7e":"#c1cbbd"}))),e.createElement("group",{position:[1.75,0,-1.7]},e.createElement(d,{at:[0,.58,0],size:[1.3,1.15,.8],color:"#b5b9b9"}),[.28,.62,.95].map(l=>e.createElement("group",{key:l},e.createElement(d,{at:[0,l,.41],size:[1.17,.28,.035],color:"#d7d8d5"}),e.createElement(d,{at:[0,l,.44],size:[.28,.025,.025],color:"#87929f"}))),[1.7,2.45,3.2].map((l,c)=>e.createElement("group",{key:l},e.createElement(d,{at:[0,l,0],size:[1.45,.07,.65],color:"#b9ad99"}),[0,1,2].map(f=>e.createElement(d,{key:f,at:[-.45+f*.19,l+.22,-.12],size:[.13,.4,.35],color:["#9baabb","#bab0a7","#9faf9f"][(f+c)%3],rotation:[0,0,f===2?-.12:0]})))),[-.67,.67].map(l=>e.createElement(d,{key:l,at:[l,2.15,-.22],size:[.045,2.45,.045],color:"#89939e"}))),e.createElement("group",{position:[.05,2.95,-2.45]},e.createElement(d,{size:[1.1,.85,.08],color:"#b8bfc5"}),e.createElement(d,{at:[0,-.1,.05],size:[.95,.55,.025],color:"#eeede8"}),Array.from({length:12},(l,c)=>e.createElement(d,{key:c,at:[-.32+c%4*.21,.08-Math.floor(c/4)*.17,.07],size:[.12,.09,.016],color:i==="overtime"&&c%4===0?"#d0ae78":i==="leave"&&c>5?"#8da58e":"#c3cbd0"})),e.createElement(d,{at:[0,.28,.06],size:[.95,.14,.025],color:i==="leave"?"#a1b6a2":"#a6b0bc"})),e.createElement("group",{position:[-1.75,2.9,-2.44]},e.createElement("mesh",{rotation:[Math.PI/2,0,0]},e.createElement("cylinderGeometry",{args:[.37,.37,.065,40]}),e.createElement("meshStandardMaterial",{color:"#f5f3ee"})),e.createElement(d,{at:[0,.1,.05],size:[.025,.21,.02],color:"#6f7c8d"}),e.createElement(d,{at:[-.08,0,.05],size:[.17,.025,.02],color:"#6f7c8d"})),e.createElement("group",{position:[.55,1.28,-.83],rotation:[-Math.PI/2,0,-.2]},e.createElement(d,{size:[.47,.6,.018],color:"#f4f2ed"}),[0,1,2].map(l=>e.createElement(d,{key:l,at:[0,.13-l*.1,.014],size:[.3,.02,.005],color:i==="contract"?"#aa9ab8":"#b5bdc5"}))),e.createElement("group",{ref:t,position:[.6,1.36,-.84]},e.createElement(d,{size:[.22,.06,.19],color:"#a194ad"}),e.createElement(d,{at:[0,.11,0],size:[.08,.2,.08],color:"#697583"})),e.createElement(pe,{at:[2.2,0,1.6],scale:1.2}),e.createElement(pe,{at:[-2.13,1.26,-1.32],scale:.38}),e.createElement("group",{position:[-2.35,0,1.38]},e.createElement("mesh",{position:[0,.05,0]},e.createElement("cylinderGeometry",{args:[.3,.3,.07,32]}),e.createElement("meshStandardMaterial",{color:"#8f98a2"})),e.createElement(d,{at:[0,1.12,0],size:[.035,2.2,.035],color:"#8c96a0"}),e.createElement("mesh",{position:[0,2.24,0]},e.createElement("cylinderGeometry",{args:[.28,.42,.38,32,1,!0]}),e.createElement("meshStandardMaterial",{color:"#f2eee3",side:Te}))))}const k=[{p:[-.5,2.55,4.9],t:[-2.95,.78,1]},{p:[.4,2.4,3.7],t:[-2.65,.72,1.12]},{p:[-1.8,2,5.6],t:[-2.85,1.02,.88]},{p:[-.8,4.3,3.8],t:[-2.6,.57,1.05]},{p:[-1.15,2.1,3.6],t:[-2.55,.7,1.12]}],nt=["overtime","dispatch","leave","contract","punch"];function rt({kind:i,entry:n,progress:r,reduced:o,onReadyChange:t}){const{camera:a,size:s,invalidate:u}=ee(),l=p.useRef(),c=p.useRef([]),f=p.useRef(r.current);return p.useEffect(()=>(t==null||t(!0),()=>t==null?void 0:t(!1)),[t]),p.useEffect(()=>{const m=new Set;l.current.traverse(h=>{if(h.material)for(const y of Array.isArray(h.material)?h.material:[h.material])m.add(y)}),c.current=[...m].map(h=>({m:h,opacity:h.opacity}))},[]),p.useEffect(()=>{u()},[i,o,s.width,s.height,u]),D((m,h)=>{const y=o?1:T.smoothstep(n.current,.05,1),b=1-T.smoothstep(y,.05,.9);l.current.visible=b>.005,c.current.forEach(({m:A,opacity:R})=>{A.transparent=!0,A.opacity=R*b,A.depthWrite=b>.95}),f.current=o?r.current:T.damp(f.current,r.current,6,h);const _=o?nt.indexOf(i):f.current,S=Math.min(3,Math.floor(_)),U=T.smoothstep(_-S,.18,.82),H=k[S].p.map((A,R)=>T.lerp(A,k[S+1].p[R],U)),E=k[S].t.map((A,R)=>T.lerp(A,k[S+1].t[R],U)),v=We(1);v.position=v.position.map((A,R)=>v.target[R]+(A-v.target[R])*2.15),a.position.set(...v.position.map((A,R)=>T.lerp(A,H[R],y))),a.lookAt(...v.target.map((A,R)=>T.lerp(A,E[R],y)));const Y=s.width<=650,ae=s.width/s.height;a.zoom=Y?ae/1.22*Math.min(.9,Math.max(.55,(s.height-420)/430)):.82*Math.min(1,ae/1.6),a.setViewOffset(s.width,s.height,-s.width*(Y?0:.23),-s.height*(Y?.27:0),s.width,s.height),a.updateProjectionMatrix()}),e.createElement(e.Fragment,null,e.createElement("color",{attach:"background",args:["#e6e8ed"]}),e.createElement(He,null),e.createElement(Ne,{reduced:o,hrCorner:e.createElement(tt,{kind:i,reduced:o}),surroundingsRef:l}),e.createElement("mesh",{rotation:[-Math.PI/2,0,0],position:[0,-.46,0],receiveShadow:!0},e.createElement("planeGeometry",{args:[200,200]}),e.createElement("meshStandardMaterial",{color:"#e6e8ed",roughness:.8})))}function it(i){return e.createElement(Ie,{shadows:!0,dpr:[1,1.5],frameloop:i.reduced?"demand":"always",camera:{position:[9,8,12],fov:36},gl:{antialias:!0}},e.createElement(rt,{...i}))}export{it as default};
