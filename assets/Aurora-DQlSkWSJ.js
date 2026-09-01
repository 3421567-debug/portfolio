import{a as e}from"./rolldown-runtime-CNC7AqOf.js";import{d as t}from"./icons-BsSbffme.js";import{t as n}from"./react-vendor-DUnE84Ps.js";import{a as r,i,n as a,r as o,t as s}from"./ogl-NWK9lPYx.js";var c=e(t(),1),l=n(),u=`#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`,d=`#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {                int index = 0;                                              for (int i = 0; i < 2; i++) {                                    ColorStop currentColor = colors[i];                         bool isInBetween = currentColor.position <= factor;         index = int(mix(float(index), float(i), float(isInBetween)));   }                                                           ColorStop currentColor = colors[index];                     ColorStop nextColor = colors[index + 1];                    float range = nextColor.position - currentColor.position;   float lerpFactor = (factor - currentColor.position) / range;   finalColor = mix(currentColor.color, nextColor.color, lerpFactor); }

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 auroraColor = intensity * rampColor;

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;function f(e){let{colorStops:t=[`#5227FF`,`#7cff67`,`#5227FF`],amplitude:n=1,blend:f=.5}=e,p=(0,c.useRef)(e);p.current=e;let m=(0,c.useRef)(null);return(0,c.useEffect)(()=>{let e=m.current;if(!e)return;let c;try{c=new i({alpha:!0,premultipliedAlpha:!0,antialias:!0})}catch(e){console.warn(`Aurora: WebGL 不可用，已跳过极光背景。`,e);return}let l=c.gl;l.clearColor(0,0,0,0),l.enable(l.BLEND),l.blendFunc(l.ONE,l.ONE_MINUS_SRC_ALPHA),l.canvas.style.backgroundColor=`transparent`;let h;function g(){if(!e)return;let t=e.offsetWidth,n=e.offsetHeight;c.setSize(t,n),h&&(h.uniforms.uResolution.value=[t,n])}window.addEventListener(`resize`,g);let _=new s(l);_.attributes.uv&&delete _.attributes.uv;let v=t.map(e=>{let t=new a(e);return[t.r,t.g,t.b]});h=new r(l,{vertex:u,fragment:d,uniforms:{uTime:{value:0},uAmplitude:{value:n},uColorStops:{value:v},uResolution:{value:[e.offsetWidth,e.offsetHeight]},uBlend:{value:f}}});let y=new o(l,{geometry:_,program:h});e.appendChild(l.canvas);let b=0,x=e=>{b=requestAnimationFrame(x);let{time:n=e*.01,speed:r=1}=p.current;h.uniforms.uTime.value=n*r*.1,h.uniforms.uAmplitude.value=p.current.amplitude??1,h.uniforms.uBlend.value=p.current.blend??f;let i=p.current.colorStops??t;h.uniforms.uColorStops.value=i.map(e=>{let t=new a(e);return[t.r,t.g,t.b]}),c.render({scene:y})};return b=requestAnimationFrame(x),g(),()=>{cancelAnimationFrame(b),window.removeEventListener(`resize`,g),e&&l.canvas.parentNode===e&&e.removeChild(l.canvas),l.getExtension(`WEBGL_lose_context`)?.loseContext()}},[n]),(0,l.jsx)(`div`,{ref:m,className:`aurora-container`})}export{f as default};