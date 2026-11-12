import { useEffect, useRef, useState } from 'react';

/**
 * A photo that bends and stretches with the speed of the scroll, in a two-tone colour wash.
 * Hovering it brings the real colours back. Drawn with WebGL only while it is on screen.
 */

// One shared reading of how fast the page is scrolling, in pixels per frame.
let velocity = 0;
let listening = false;
function listen() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  let last = window.scrollY;
  const tick = () => {
    const y = window.scrollY;
    velocity += (y - last - velocity) * 0.25;
    last = y;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const VERT = `attribute vec2 p; varying vec2 v; void main(){ v = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }`;
const FRAG = `precision highp float;
uniform sampler2D t; uniform float k; uniform float hover; uniform float blur; uniform vec2 res; uniform vec2 img; uniform vec3 dark; uniform vec3 light;
varying vec2 v;
vec2 cover(vec2 u){
  float ra = res.x / res.y, ia = img.x / img.y;
  vec2 sc = ra > ia ? vec2(1., ia / ra) : vec2(ra / ia, 1.);
  return (u - .5) * sc + .5;
}
void main(){
  vec2 u = v;
  // the middle of the photo lags behind its edges, like a sheet pulled through water
  u.y += sin(u.x * 3.14159) * k * .14;
  u.y = (u.y - .5) / (1. + abs(k) * .3) + .5;
  if (u.y < 0. || u.y > 1.) { gl_FragColor = vec4(0.); return; }
  vec2 o = vec2(0., k * .014);
  // camera motion blur: average samples along the direction of travel, longer when faster
  vec3 c = vec3(0.);
  float span = k * .06 * blur;
  for (int i = 0; i < 12; i++) {
    float f = float(i) / 11. - .5;
    vec2 s = u + vec2(0., f * span);
    c += vec3(texture2D(t, cover(s + o)).r, texture2D(t, cover(s)).g, texture2D(t, cover(s - o)).b);
  }
  c /= 12.;
  float l = dot(c, vec3(.299, .587, .114));
  vec3 duo = mix(dark, light, smoothstep(.04, .96, l));
  gl_FragColor = vec4(mix(duo, c, hover), 1.);
}`;

const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);

export default function WarpImage({ src, alt = '', className = '', dark = '#1c1238', light = '#ffc58a', blur = 1, tint = false }: { src: string; alt?: string; className?: string; dark?: string; light?: string; /** Motion blur strength while scrolling, 0 for none. */ blur?: number; /** A two-tone colour wash that hover removes. Off by default. */ tint?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [gl, setGl] = useState(true);
  // 1 shows the photo's real colours; the two-tone wash is only used when tint is on.
  const hover = useRef(tint ? 0 : 1);
  const target = useRef(tint ? 0 : 1);

  useEffect(() => {
    listen();
    const el = box.current;
    if (!el) return;
    // A fresh canvas every time: a context that was released cannot be used again.
    const cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.className = 'absolute inset-0 h-full w-full';
    el.appendChild(cv);
    const ctx = cv.getContext('webgl', { premultipliedAlpha: false, alpha: true, antialias: true });
    if (!ctx) {
      cv.remove();
      return setGl(false);
    }
    const g = ctx;
    const sh = (type: number, s: string) => {
      const x = g.createShader(type)!;
      g.shaderSource(x, s);
      g.compileShader(x);
      return x;
    };
    const prog = g.createProgram()!;
    g.attachShader(prog, sh(g.VERTEX_SHADER, VERT));
    g.attachShader(prog, sh(g.FRAGMENT_SHADER, FRAG));
    g.linkProgram(prog);
    g.useProgram(prog);
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(prog, 'p');
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const U = (n: string) => g.getUniformLocation(prog, n);
    const u = { k: U('k'), blur: U('blur'), hover: U('hover'), res: U('res'), img: U('img'), dark: U('dark'), light: U('light') };
    g.uniform3fv(u.dark, hex(dark));
    g.uniform1f(u.blur, blur);
    g.uniform3fv(u.light, hex(light));
    g.clearColor(0, 0, 0, 0);

    let ready = false;
    let visible = false;
    let raf = 0;
    let k = 0;
    let drawn = { k: 99, h: 99 };
    const image = new Image();
    image.onload = () => {
      const tex = g.createTexture();
      g.bindTexture(g.TEXTURE_2D, tex);
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, image);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
      g.uniform2f(u.img, image.naturalWidth, image.naturalHeight);
      ready = true;
      drawn = { k: 99, h: 99 };
    };
    image.src = src;

    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.max(1, Math.round(el.clientWidth * dpr));
      cv.height = Math.max(1, Math.round(el.clientHeight * dpr));
      g.viewport(0, 0, cv.width, cv.height);
      g.uniform2f(u.res, el.clientWidth, el.clientHeight);
      drawn = { k: 99, h: 99 };
    };
    size();

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || !ready) return;
      const want = reduce ? 0 : Math.max(-1, Math.min(1, velocity / 45));
      k += (want - k) * 0.12;
      hover.current += (target.current - hover.current) * 0.1;
      // Only draw when something has visibly changed.
      if (Math.abs(k - drawn.k) < 0.002 && Math.abs(hover.current - drawn.h) < 0.002) return;
      drawn = { k, h: hover.current };
      g.uniform1f(u.k, k);
      g.uniform1f(u.hover, hover.current);
      g.clear(g.COLOR_BUFFER_BIT);
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
    };
    loop();

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    const ro = new ResizeObserver(size);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      g.getExtension('WEBGL_lose_context')?.loseContext();
      cv.remove();
    };
  }, [src, dark, light, blur]);

  return (
    <div ref={box} className={`relative overflow-hidden ${className}`} onPointerEnter={() => tint && (target.current = 1)} onPointerLeave={() => tint && (target.current = 0)}>
      {/* the plain photo underneath: shown if WebGL is missing, and read by screen readers */}
      <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover ${gl ? 'opacity-0' : ''}`} style={gl || !tint ? undefined : { filter: 'sepia(.5) saturate(1.2)' }} />
    </div>
  );
}
