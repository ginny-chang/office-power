/* =====================================================================
   Liquid metal — a dispersion shader, composited for a light surface.

   A scalar field V is painted through a soft plateau, evaluated once per
   spectral wavelength at a slightly different height in V, so every ribbon
   edge opens into a prism of width dispersion / |grad V|.  V is a family of
   parallel curves — one swooping valley repeated up the pill at a density
   that varies along its length — which keeps the ribbons laminar.

   The original renders additive light on black.  Here the same field tints a
   near-white sheet instead: unlit regions fall to a soft grey, lit ones pick
   up pastel chroma, and the travelling rim is drawn as a saturated *dark*
   edge, because a white one would vanish against the page.
   ===================================================================== */

const VERT = `#version 300 es
in vec2 position; void main(){ gl_Position = vec4(position,0.,1.); }`;

const HEAD = `#version 300 es
precision highp float;
out vec4 o;

uniform vec2  uC;        // pill centre, device px
uniform vec2  uHalf;     // pill half-extent, device px
uniform float uT;        // seconds
uniform float uHover;    // 0..1
uniform float uPress;    // 0..1, eased
uniform vec4  uRip[3];   // xy centre (button heights, +y down), z start, w live
uniform vec4  uRipK;     // speed, ring width, decay, amplitude
uniform vec4  uRipK2;    // facet depth, facet count, crest sharpness, emission
uniform vec4  uPtr;      // xy trailing cursor, z strength, w normalised speed
uniform vec4  uPtrK;     // radius, base amplitude, speed amplitude, rim lift

#define PI 3.14159265

float sdPill(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x,q.y),0.) + length(max(q,0.)) - r;
}

/* Expanding ring from each press, in button-height units.  Three slots so a
   quick double-tap overlaps instead of cutting the first one off.  The
   wavefront is faceted and its crest is a cusp, so it lands as a crease in
   sheet metal rather than a water ripple. */
float ripple(vec2 p, float t){
  float sum = 0.;
  for(int i = 0; i < 3; i++){
    if(uRip[i].w < 0.5) continue;
    float age = t - uRip[i].z;
    if(age < 0. || age > 4.) continue;
    vec2  rp = p - uRip[i].xy;
    float facet = 1. + uRipK2.x * cos(uRipK2.y * atan(rp.y, rp.x) + age * 2.1 + float(i) * 2.4);
    float x = (length(rp) - age * uRipK.x * facet) / uRipK.y;
    sum += exp(-pow(abs(x) + 1e-4, uRipK2.z)) * exp(-age * uRipK.z);
  }
  return sum;
}

/* A soft well under the cursor.  It lags the real pointer and swells with
   speed, so moving across drags the metal instead of sliding a blob over it. */
float pointerW(vec2 p){
  if(uPtr.z < 0.001) return 0.;
  float d = length(p - uPtr.xy) / uPtrK.x;
  return exp(-d*d) * uPtr.z;
}
vec2 pointerWarp(vec2 p){
  float w = pointerW(p);
  if(w <= 0.) return vec2(0.);
  return normalize(p - uPtr.xy + vec2(1e-5)) * w * (uPtrK.y + uPtrK.z * uPtr.w);
}
`;

const FRAG_RIM = HEAD + `
uniform float uBw;       // stroke half-width, device px
uniform float uE[8];     // base, hot, chroma-across, chroma-along, speed,
                         // topBias, press lift, ripple lift

/* Arc-length position around the pill, 0..1, so a highlight travels at a
   constant speed instead of stalling on the caps. */
float perim(vec2 d, float a, float r){
  float P = 4.*a + 2.*PI*r;
  float s;
  if(d.x >= a){
    float th = atan(d.y, d.x - a); if(th < 0.) th += 2.*PI;
    s = (th <= PI*0.5) ? r*th : P - r*(2.*PI - th);
  } else if(d.x <= -a){
    float th = atan(d.y, d.x + a); if(th < 0.) th += 2.*PI;
    s = r*PI*0.5 + 2.*a + r*(th - PI*0.5);
  } else if(d.y >= 0.){
    s = r*PI*0.5 + (a - d.x);
  } else {
    s = r*PI*1.5 + 2.*a + (d.x + a);
  }
  return s / P;
}
float pb(float u, float w){ u = fract(u); float x = min(u, 1.-u); return exp(-(x*x)/(w*w)); }
float rimHot(float s, float t){
  float v = uE[0];
  v += 0.62 * pb(s - t*uE[4],             0.075);
  v += 0.44 * pb(s + t*uE[4]*0.63 + 0.41, 0.135);
  v += 0.30 * pb(s - t*uE[4]*0.34 + 0.73, 0.200);
  return v;
}
float rimBand(float sd, float off){ return 1. - smoothstep(0., uBw*1.05, abs(sd + uBw*0.55 + off)); }

void main(){
  vec2  d  = gl_FragCoord.xy - uC;
  float sd = sdPill(d, uHalf, uHalf.y);
  if(sd > uBw*2.5 || sd < -uBw*3.5){ o = vec4(0.); return; }

  float a = max(uHalf.x - uHalf.y, 0.);
  float s = perim(d, a, uHalf.y);
  float top = mix(1., 0.5 + 0.5 * (d.y / uHalf.y), uE[5]);

  vec2  p   = vec2(d.x, -d.y) / (uHalf.y * 2.);
  float lift = 1. + uPress * uE[6] + ripple(p, uT) * uE[7]
             + pointerW(p) * uPtrK.w;

  o = vec4(vec3(
    rimBand(sd,  uE[2]) * rimHot(s + uE[3], uT),
    rimBand(sd,  0.   ) * rimHot(s,         uT),
    rimBand(sd, -uE[2]) * rimHot(s - uE[3], uT)
  ) * uE[1] * top * lift, 1.);
}`;

const FRAG_SCENE = HEAD + `
uniform float uP[21];

float h21(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vn(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.-2.*f);
  float a = h21(i), b = h21(i+vec2(1,0)), c = h21(i+vec2(0,1)), d = h21(i+vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y) * 2. - 1.;
}
float fbm(vec2 p, float g){
  float s = 0., a = 1., n = 0.;
  for(int i=0;i<4;i++){ s += a*vn(p); n += a; p = p*2.03 + 11.7; a *= g; }
  return s / n;
}
float fbm(vec2 p){ return fbm(p, 0.5); }

float wig(float x, float t, float seed){
  return vn(vec2(x,          t*0.150 + seed)) * 0.60
       + vn(vec2(x*2.07 + 4., t*0.105 + seed)) * 0.27
       + vn(vec2(x*4.30 - 7., t*0.080 + seed)) * 0.13;
}
float valleyAt(vec2 p, float t){ return wig(p.x*uP[0], t, 0.0) * uP[1]; }
float densAt  (vec2 p, float t){ return uP[2] * exp(uP[3] * wig(p.x*uP[4] + 9.0, t, 2.7)); }

float surface(vec2 p, float t){
  float V = (p.y - valleyAt(p,t)) * densAt(p,t);
  V += uP[5] * fbm(p*vec2(0.8, 1.7)*uP[6] + vec2(t*0.05, -t*0.03), uP[17]);
  return V - uP[7];
}
float tone(float v){
  float u = fract(v);
  float e = uP[9], W = uP[10] * 0.5;
  return smoothstep(0.5-W-e, 0.5-W, u) * (1. - smoothstep(0.5+W, 0.5+W+e, u));
}
vec3 spec(float t){ return clamp(vec3(1.5) - abs(4.*t - vec3(3.,2.,1.)), 0., 1.); }

void main(){
  vec2  d  = gl_FragCoord.xy - uC;
  float sd = sdPill(d, uHalf, uHalf.y);
  float pill = 1. - smoothstep(-1., 1., sd);
  float S = uHalf.y * 2.;
  float t = uT;

  if(uHover <= 0.0015 || pill <= 0.0015){ o = vec4(0., 0., 0., pill); return; }

  vec2  p = vec2(d.x, -d.y) / S;
  vec2  q = p + pointerWarp(p);

  float h0 = surface(q, t);
  vec2  gp = vec2(dFdx(h0), -dFdy(h0)) * S;
  float V  = surface(q - gp * uP[8] / max(uP[2], .001), t);

  vec2  gd = normalize(gp + vec2(1e-5));
  V += uP[13] * fbm(vec2(dot(q,gd)*uP[14], dot(q, vec2(-gd.y,gd.x))*uP[14]*0.04) + vec2(0., t*0.06));

  float rip  = ripple(p, t);
  float well = pointerW(p);
  V += rip * uRipK.w;

  const int N = 21;
  float mid = 1. - pow(0.5, uP[12]);
  vec3 col = vec3(0.), wsum = vec3(0.);
  for(int i=0;i<N;i++){
    float k = float(i)/float(N-1);
    vec3  w = spec(k);
    col  += w * tone(V + ((1. - pow(1. - k, uP[12])) - mid) * uP[11]);
    wsum += w;
  }
  col /= wsum;
  col = pow(col, vec3(uP[15]));

  float lit = smoothstep(uP[18], uP[19], q.y - valleyAt(q, t));
  lit *= mix(1., lit, 0.55);
  col *= uP[16] * lit;

  col = col * (1. + rip * 1.15 + well * 0.60);

  o = vec4(col * pill * uHover, pill);
}`;

const FRAG_DOWN = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uTex, uTex2;
uniform vec2 uDstTexel;
uniform float uAdd;
void main(){
  vec2 uv = gl_FragCoord.xy * uDstTexel;
  vec2 e = uDstTexel * 0.25;
  vec4 s = texture(uTex, uv + vec2(-e.x,-e.y)) + texture(uTex, uv + vec2( e.x,-e.y))
         + texture(uTex, uv + vec2(-e.x, e.y)) + texture(uTex, uv + vec2( e.x, e.y));
  s *= 0.25;
  if(uAdd > 0.5){
    vec4 r = texture(uTex2, uv + vec2(-e.x,-e.y)) + texture(uTex2, uv + vec2( e.x,-e.y))
           + texture(uTex2, uv + vec2(-e.x, e.y)) + texture(uTex2, uv + vec2( e.x, e.y));
    s.rgb += r.rgb * 0.25;
  }
  o = s;
}`;

const FRAG_BLUR = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uTex; uniform vec2 uTexel; uniform vec2 uDir; uniform float uR;
void main(){
  vec2 uv = gl_FragCoord.xy * uTexel;
  vec2 st = uTexel * uDir * uR;
  vec4 s = texture(uTex, uv) * 0.1964;
  s += (texture(uTex, uv + st*1.4118) + texture(uTex, uv - st*1.4118)) * 0.2969;
  s += (texture(uTex, uv + st*3.2941) + texture(uTex, uv - st*3.2941)) * 0.0944;
  s += (texture(uTex, uv + st*5.1765) + texture(uTex, uv - st*5.1765)) * 0.0104;
  o = s;
}`;

const FRAG_COMP = HEAD + `
uniform sampler2D uSoft, uRim, uGlow;
uniform vec2  uRes;
uniform float uGlowGain, uDim, uPunch;
uniform vec3  uBase;     // resting sheet colour
uniform vec3  uTint;     // brand hue the spectrum is pulled toward
uniform vec4  uLightK;   // shade, chroma, lift, rim ink
uniform float uTintMix;

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2  d    = gl_FragCoord.xy - uC;
  float sd   = sdPill(d, uHalf, uHalf.y);
  float pill = 1. - smoothstep(-1., 1., sd);

  vec4 m = texture(uSoft, uv);
  // Blurring flattens the tonal range; putting the contrast back with a power
  // curve after the blur is what keeps it poured metal rather than soft glow.
  vec3 metal = pow(max(m.rgb / max(m.a, 1e-3), 0.), vec3(uPunch));

  // The crest is added after the blur so the crease stays a hard line, while
  // its displacement of the field still rides inside the softened metal.
  float rip = ripple(vec2(d.x, -d.y) / (uHalf.y * 2.), uT);
  metal += vec3(rip * rip) * uRipK2.w;

  /* Light mode: the field tints a near-white sheet instead of lighting a
     black one.  Coverage drives lightness, the band's own hue drives a pastel
     tint, and unlit stretches fall away into a cool grey. */
  float cov = clamp(max(metal.r, max(metal.g, metal.b)), 0., 1.);
  // Pull the spectrum toward the brand hue so the iridescence stays in palette.
  vec3  hue = mix(metal / max(cov, 1e-3), normalize(uTint + vec3(.55)), uTintMix);
  vec3 sheet = uBase * (1. - uLightK.x * (1. - cov))
             + (hue - vec3(1.)) * uLightK.y * cov
             + vec3(cov) * uLightK.z;

  // A saturated dark edge, because a white rim would vanish against the page.
  vec3  rimC = texture(uRim, uv).rgb;
  float ra   = clamp(max(rimC.r, max(rimC.g, rimC.b)), 0., 1.);
  sheet = mix(sheet, mix(rimC / max(ra, 1e-3), normalize(uTint), uTintMix) * uLightK.w, ra * pill * 0.85);

  // Hold the middle band near the resting colour so the label keeps contrast.
  float veil = 1. - smoothstep(0.16, 0.60, abs(d.y) / uHalf.y);
  sheet = mix(sheet, uBase, veil * uDim);

  // Outside the pill the bloom is a faint tinted haze rather than added light.
  vec3  glow = texture(uGlow, uv).rgb * uGlowGain;
  float ga   = clamp(max(glow.r, max(glow.g, glow.b)), 0., 1.) * (1. - pill);
  vec3  ghue = mix(vec3(.60,.65,.77), glow / max(max(glow.r, max(glow.g, glow.b)), 1e-3), .35);

  // premultiplied
  vec3 rgb = sheet * pill + ghue * ga;
  o = vec4(min(rgb, vec3(1.)), clamp(pill + ga, 0., 1.));
}`;

/* --------------------------------------------------------------- */
// the metal field — uP[0..20]
const P = {
  valFreq: 0.50, valAmp: 0.55, dens: 2.40, densVar: 2.20, densFreq: 0.32,
  wobAmp: 0.12, wobFreq: 1.60, lift: 0.05, refract: 0.18, edge: 0.04,
  width: 0.46, disp: 0.30, skew: 1.50, fineAmp: 0.0, fineFreq: 9.0,
  gamma: 1.00, gain: 1.90, octGain: 0.32, litLo: -0.26, litHi: 0.10, dim: 0.46,
};
const PKEYS = Object.keys(P);

// the animated rim — uE[0..7]
const E = {
  base: 0.20, hot: 0.82, chromA: 0.42, chromS: 0.030, speed: 0.070,
  top: 0.35, press: 0.85, ripple: 1.60,
};
const EKEYS = Object.keys(E);

const C = { glow: 0.85, glowR: 1.30, soften: 0.24, punch: 1.50 };

const R = {
  speed: 1.85, width: 0.20, decay: 1.35, amp: 1.35,
  facet: 0.18, lobes: 6.0, sharp: 1.15, emit: 0.45,
  ptrRad: 0.55, ptrAmp: 0.32, ptrFast: 0.40, ptrRim: 0.80,
  ptrLag: 0.0016, ptrVref: 4.5,
};

// light-mode composite: [shade, chroma, lift, rim ink] and the resting colour
const LIGHT = {
  base: [0.957, 0.966, 0.980],   // the same near-white the glass cards use
  shade: 0.26,                   // unlit stretches fall to a cool grey
  chroma: 0.62,                  // pastel bands, not a full rainbow
  lift: 0.10,
  rimInk: 0.30,                  // saturated dark edge
  tint: [0.16, 0.24, 0.47],      // brand navy the spectrum is pulled toward
  tintMix: 0.28,
};

const GLOW_TEX = 129;

export function attachLiquid(host, opts = {}) {
  const alive = opts.alive ? (opts.aliveLevel ?? 0.86) : 0;
  const canvas = document.createElement('canvas');
  canvas.className = 'liquid-fx';
  canvas.setAttribute('aria-hidden', 'true');
  host.insertBefore(canvas, host.firstChild);
  const drop = () => { canvas.remove(); };

  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
  if (!gl) { host.classList.add('is-plain'); drop(); return () => {}; }
  host.classList.add('is-liquid');

  const sh = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = (fs) => {
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'position');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name.replace('[0]', '')] = gl.getUniformLocation(p, info.name); }
    return { p, u };
  };

  let pScene, pRim, pDown, pBlur, pComp;
  try {
    pScene = prog(FRAG_SCENE); pRim = prog(FRAG_RIM);
    pDown = prog(FRAG_DOWN); pBlur = prog(FRAG_BLUR); pComp = prog(FRAG_COMP);
  } catch (err) {
    console.warn('[liquid] falling back to a plain pill:', err);
    host.classList.remove('is-liquid'); host.classList.add('is-plain'); drop(); return () => {};
  }

  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const hasFloat = !!gl.getExtension('EXT_color_buffer_half_float');
  const makeTarget = () => {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { tex, fbo, w: 0, h: 0 };
  };
  const sizeTarget = (t, w, h) => {
    if (t.w === w && t.h === h) return;
    t.w = w; t.h = h;
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    if (hasFloat) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  };
  const T_core = makeTarget(), T_rim = makeTarget(),
        T_s1 = makeTarget(), T_s2 = makeTarget(),
        T_a = makeTarget(), T_b = makeTarget();

  let W = 0, H = 0, BW = 0, BH = 0, CX = 0, CY = 0, DOWN = 4, needResize = true;

  function resize() {
    const r = canvas.getBoundingClientRect();
    const br = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(2, Math.round(r.width * DPR));
    const h = Math.max(2, Math.round(r.height * DPR));
    if (w !== W || h !== H) { W = w; H = h; canvas.width = W; canvas.height = H; }
    BW = br.width * DPR; BH = br.height * DPR;
    CX = (br.left - r.left) * DPR + BW / 2;
    CY = H - ((br.top - r.top) * DPR + BH / 2);
    sizeTarget(T_core, W, H); sizeTarget(T_rim, W, H);
    const hw = Math.max(2, Math.ceil(W / 2)), hh = Math.max(2, Math.ceil(H / 2));
    sizeTarget(T_s1, hw, hh); sizeTarget(T_s2, hw, hh);
    DOWN = Math.max(1, Math.min(4, Math.round(BH / GLOW_TEX)));
    const dw = Math.max(2, Math.ceil(W / DOWN)), dh = Math.max(2, Math.ceil(H / DOWN));
    sizeTarget(T_a, dw, dh); sizeTarget(T_b, dw, dh);
    needResize = false;
  }
  const ro = new ResizeObserver(() => { needResize = true; wake(); });
  ro.observe(host);

  let onScreen = true;
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; wake(); });
  io.observe(host);

  const drawTo = (t) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, t ? t.fbo : null);
    gl.viewport(0, 0, t ? t.w : W, t ? t.h : H);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const uArr = new Float32Array(PKEYS.length);
  const eArr = new Float32Array(EKEYS.length);
  let hover = alive, hoverTarget = alive, clock = 0, last = performance.now();

  const RIP = [0, 1, 2].map(() => ({ x: 0, y: 0, t: -99, on: 0 }));
  const ripArr = new Float32Array(12);
  let ripNext = 0, press = 0, pressTarget = 0;
  const ptr = { x: 0, y: 0 }, ptrS = { x: 0, y: 0 };
  let ptrAmt = 0, ptrSpeed = 0;
  const on = { over: false, press: false, focus: false };

  const addRipple = (x, y) => {
    const r = RIP[ripNext];
    ripNext = (ripNext + 1) % RIP.length;
    r.x = x; r.y = y; r.t = clock; r.on = 1;
  };
  const localPt = (e) => {
    const b = host.getBoundingClientRect(), s = b.height || 1;
    return [(e.clientX - (b.left + b.width / 2)) / s, (e.clientY - (b.top + b.height / 2)) / s];
  };

  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0, running = false;

  // Idle buttons cost nothing: the loop only spins while something is moving.
  function busy() {
    return onScreen && (alive > 0 || hoverTarget > 0 || hover > 0.002 || press > 0.002 || RIP.some((r) => r.on));
  }
  function wake() { if (!running && busy()) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 1 / 20); last = now;
    if (!calm.matches) clock += dt;

    const k = hoverTarget > hover ? 1 - Math.pow(0.0012, dt) : 1 - Math.pow(0.00012, dt);
    hover += (hoverTarget - hover) * k;
    if (Math.abs(hoverTarget - hover) < 0.0008) hover = hoverTarget;

    const pk = pressTarget > press ? 1 - Math.pow(1e-9, dt) : 1 - Math.pow(0.004, dt);
    press += (pressTarget - press) * pk;
    if (Math.abs(pressTarget - press) < 0.002) press = pressTarget;

    for (let i = 0; i < RIP.length; i++) {
      const r = RIP[i];
      if (r.on && clock - r.t > 4) r.on = 0;
      ripArr[i * 4] = r.x; ripArr[i * 4 + 1] = r.y; ripArr[i * 4 + 2] = r.t; ripArr[i * 4 + 3] = r.on;
    }

    const lag = 1 - Math.pow(R.ptrLag, dt);
    const dx = (ptr.x - ptrS.x) * lag, dy = (ptr.y - ptrS.y) * lag;
    ptrS.x += dx; ptrS.y += dy;
    const inst = Math.min(Math.hypot(dx, dy) / Math.max(dt, 1e-3) / R.ptrVref, 1);
    ptrSpeed += (inst - ptrSpeed) * (1 - Math.pow(inst > ptrSpeed ? 0.001 : 0.02, dt));
    const wantWell = (on.over || on.press) ? 1 : 0;
    ptrAmt += (wantWell - ptrAmt) * (1 - Math.pow(0.004, dt));
    if (Math.abs(wantWell - ptrAmt) < 0.002) ptrAmt = wantWell;

    if (needResize) resize();
    if (!W || !H || !BH) { raf = requestAnimationFrame(frame); return; }

    if (!busy() && hover <= 0.002) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      running = false; return;
    }

    for (let i = 0; i < uArr.length; i++) uArr[i] = P[PKEYS[i]];
    for (let i = 0; i < eArr.length; i++) eArr[i] = E[EKEYS[i]];
    const bw = Math.max(1.2, 3.2 * (BH / 516) * 3.0);

    const common = (pr) => {
      gl.uniform2f(pr.u.uC, CX, CY);
      gl.uniform2f(pr.u.uHalf, BW / 2, BH / 2);
      gl.uniform1f(pr.u.uT, clock);
      gl.uniform1f(pr.u.uPress, press);
      gl.uniform4fv(pr.u.uRip, ripArr);
      gl.uniform4f(pr.u.uRipK, R.speed, R.width, R.decay, R.amp);
      gl.uniform4f(pr.u.uRipK2, R.facet, R.lobes, R.sharp, R.emit);
      gl.uniform4f(pr.u.uPtr, ptrS.x, ptrS.y, ptrAmt, ptrSpeed);
      gl.uniform4f(pr.u.uPtrK, R.ptrRad, R.ptrAmp, R.ptrFast, R.ptrRim);
    };

    gl.useProgram(pScene.p); common(pScene);
    gl.uniform1f(pScene.u.uHover, hover);
    gl.uniform1fv(pScene.u.uP, uArr);
    drawTo(T_core);

    gl.useProgram(pRim.p); common(pRim);
    gl.uniform1f(pRim.u.uBw, bw);
    gl.uniform1fv(pRim.u.uE, eArr);
    drawTo(T_rim);

    gl.useProgram(pDown.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T_core.tex);
    gl.uniform1i(pDown.u.uTex, 0);
    gl.uniform1f(pDown.u.uAdd, 0);
    gl.uniform2f(pDown.u.uDstTexel, 1 / T_s1.w, 1 / T_s1.h);
    drawTo(T_s1);

    gl.useProgram(pBlur.p);
    gl.uniform1i(pBlur.u.uTex, 0);
    gl.uniform2f(pBlur.u.uTexel, 1 / T_s1.w, 1 / T_s1.h);
    const sigTex = C.soften * (BH * 0.5) * 0.95;
    if (sigTex > 0.1) {
      const iters = Math.min(4, Math.max(1, Math.ceil(sigTex / 3.0)));
      gl.uniform1f(pBlur.u.uR, sigTex / Math.sqrt(iters) / 1.95);
      for (let i = 0; i < iters; i++) {
        gl.bindTexture(gl.TEXTURE_2D, T_s1.tex); gl.uniform2f(pBlur.u.uDir, 1, 0); drawTo(T_s2);
        gl.bindTexture(gl.TEXTURE_2D, T_s2.tex); gl.uniform2f(pBlur.u.uDir, 0, 1); drawTo(T_s1);
      }
    }

    gl.useProgram(pDown.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T_s1.tex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, T_rim.tex);
    gl.uniform1i(pDown.u.uTex, 0);
    gl.uniform1i(pDown.u.uTex2, 1);
    gl.uniform1f(pDown.u.uAdd, 1);
    gl.uniform2f(pDown.u.uDstTexel, 1 / T_a.w, 1 / T_a.h);
    drawTo(T_a);

    gl.useProgram(pBlur.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(pBlur.u.uTex, 0);
    gl.uniform2f(pBlur.u.uTexel, 1 / T_a.w, 1 / T_a.h);
    const rs = C.glowR * (BH / DOWN) / GLOW_TEX;
    for (const r of [1.0, 2.3, 5.2, 9.0].map((v) => v * rs)) {
      gl.uniform1f(pBlur.u.uR, r);
      gl.bindTexture(gl.TEXTURE_2D, T_a.tex); gl.uniform2f(pBlur.u.uDir, 1, 0); drawTo(T_b);
      gl.bindTexture(gl.TEXTURE_2D, T_b.tex); gl.uniform2f(pBlur.u.uDir, 0, 1); drawTo(T_a);
    }

    gl.useProgram(pComp.p); common(pComp);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T_s1.tex); gl.uniform1i(pComp.u.uSoft, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, T_rim.tex); gl.uniform1i(pComp.u.uRim, 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, T_a.tex); gl.uniform1i(pComp.u.uGlow, 2);
    gl.uniform2f(pComp.u.uRes, W, H);
    gl.uniform1f(pComp.u.uGlowGain, C.glow);
    gl.uniform1f(pComp.u.uDim, P.dim);
    gl.uniform1f(pComp.u.uPunch, C.punch);
    gl.uniform3fv(pComp.u.uBase, LIGHT.base);
    gl.uniform3fv(pComp.u.uTint, LIGHT.tint);
    gl.uniform1f(pComp.u.uTintMix, LIGHT.tintMix);
    gl.uniform4f(pComp.u.uLightK, LIGHT.shade, LIGHT.chroma, LIGHT.lift, LIGHT.rimInk);
    drawTo(null);

    raf = requestAnimationFrame(frame);
  }

  const sync = () => {
    hoverTarget = (on.over || on.press || on.focus) ? 1 : alive;
    pressTarget = on.press ? 1 : 0;
    host.classList.toggle('is-hot', on.over || on.press || on.focus);
    host.classList.toggle('is-press', on.press);
    wake();
  };

  const enter = (e) => {
    if (e.pointerType !== 'mouse') return;
    [ptr.x, ptr.y] = localPt(e);
    ptrS.x = ptr.x; ptrS.y = ptr.y; ptrSpeed = 0;
    on.over = true; sync();
  };
  const leave = (e) => { if (e.pointerType === 'mouse') { on.over = false; sync(); } };
  const move = (e) => { if (on.over || on.press) [ptr.x, ptr.y] = localPt(e); };
  const down = (e) => { [ptr.x, ptr.y] = localPt(e); on.press = true; sync(); addRipple(ptr.x, ptr.y); };
  const up = () => { on.press = false; sync(); };
  const focus = () => { on.focus = host.matches(':focus-visible'); sync(); };
  const blur = () => { on.focus = false; sync(); };
  const keydown = (e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { on.press = true; sync(); addRipple(0, 0); } };
  const keyup = (e) => { if (e.key === 'Enter' || e.key === ' ') { on.press = false; sync(); } };

  host.addEventListener('pointerenter', enter);
  host.addEventListener('pointerleave', leave);
  window.addEventListener('pointermove', move, { passive: true });
  host.addEventListener('pointerdown', down);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  host.addEventListener('focus', focus);
  host.addEventListener('blur', blur);
  host.addEventListener('keydown', keydown);
  host.addEventListener('keyup', keyup);

  resize();
  wake();

  return () => {
    cancelAnimationFrame(raf); running = false;
    ro.disconnect(); io.disconnect();
    host.removeEventListener('pointerenter', enter);
    host.removeEventListener('pointerleave', leave);
    window.removeEventListener('pointermove', move);
    host.removeEventListener('pointerdown', down);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    host.removeEventListener('focus', focus);
    host.removeEventListener('blur', blur);
    host.removeEventListener('keydown', keydown);
    host.removeEventListener('keyup', keyup);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    host.classList.remove('is-liquid', 'is-hot', 'is-press');
    drop();
  };
}
