import React from "react";
import { Easing, interpolate, random } from "remotion";

// Efeitos de leite: gotas fundidas por um filtro "goo" (desfoque + limiar de
// alfa) e sombreadas na borda para dar volume de líquido.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Blob = { x: number; y: number; r: number };

export const MilkLayer: React.FC<{
  id: string;
  blobs?: Blob[];
  blur?: number;
  opacity?: number;
  children?: React.ReactNode;
}> = ({ id, blobs = [], blur = 9, opacity = 1, children }) => (
  <svg
    width={1920}
    height={1080}
    style={{ position: "absolute", inset: 0, overflow: "visible", opacity }}
  >
    <defs>
      <filter
        id={id}
        filterUnits="userSpaceOnUse"
        x={-300}
        y={-300}
        width={2520}
        height={1680}
        colorInterpolationFilters="sRGB"
      >
        <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="0 0 0 0 0.99  0 0 0 0 0.995  0 0 0 0 1  0 0 0 26 -11"
          result="goo"
        />
        {/* Sombra da borda inferior-direita: volume do líquido. */}
        <feGaussianBlur in="goo" stdDeviation={8} result="soft" />
        <feOffset in="soft" dx={-7} dy={-11} result="shift" />
        <feComposite in="goo" in2="shift" operator="out" result="rim" />
        <feFlood floodColor="#8aa6bf" floodOpacity={0.5} />
        <feComposite in2="rim" operator="in" result="rimShade" />
        {/* Sombra projetada no fundo azul. */}
        <feGaussianBlur in="goo" stdDeviation={14} result="drop" />
        <feOffset in="drop" dy={16} result="dropShift" />
        <feFlood floodColor="#003a66" floodOpacity={0.28} />
        <feComposite in2="dropShift" operator="in" result="shadow" />
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="goo" />
          <feMergeNode in="rimShade" />
        </feMerge>
      </filter>
    </defs>
    <g filter={`url(#${id})`}>
      {blobs.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#fff" />
      ))}
      {children}
    </g>
  </svg>
);

// Um jato balístico: partículas emitidas ao longo do tempo formam uma língua
// de leite que sobe, faz arco e cai.
export type Emitter = {
  x: number;
  y: number;
  angle: number; // graus, 90 = para cima
  speed: number;
  start: number;
  emit: number;
  r: number;
  g?: number;
  step?: number;
  life?: number;
  floor?: number;
  clip?: (x: number, y: number) => boolean;
};

export const emitterBlobs = (frame: number, e: Emitter): Blob[] => {
  const out: Blob[] = [];
  const step = e.step ?? 0.25;
  const g = e.g ?? 1.4;
  const life = e.life ?? 42;
  const a = (e.angle * Math.PI) / 180;
  const end = Math.min(frame, e.start + e.emit);
  for (let te = e.start; te <= end; te += step) {
    const age = frame - te;
    const frac = (te - e.start) / e.emit;
    const sp = e.speed * (1 - 0.55 * frac);
    const x = e.x + Math.cos(a) * sp * age;
    const y = e.y - Math.sin(a) * sp * age + 0.5 * g * age * age;
    const r = e.r * (1 - 0.7 * frac) * Math.max(0, 1 - age / life);
    if (r < 1.2) continue;
    if (e.floor !== undefined && y > e.floor) continue;
    if (e.clip && e.clip(x, y)) continue;
    out.push({ x, y, r });
  }
  return out;
};

// Coroa de respingo em leque a partir de uma base.
export const crownBlobs = (
  frame: number,
  c: {
    x: number;
    y: number;
    width: number;
    start: number;
    seed: string;
    count?: number;
    aMin?: number;
    aMax?: number;
    sMin?: number;
    sMax?: number;
    r?: number;
    emit?: number;
    g?: number;
    floor?: number;
  },
): Blob[] => {
  if (frame < c.start) return [];
  const count = c.count ?? 16;
  const aMin = c.aMin ?? 20;
  const aMax = c.aMax ?? 160;
  const out: Blob[] = [];
  for (let i = 0; i < count; i++) {
    const angle =
      aMin + ((aMax - aMin) * (i + random(`${c.seed}-a${i}`))) / count;
    const rad = (angle * Math.PI) / 180;
    out.push(
      ...emitterBlobs(frame, {
        x: c.x + Math.cos(rad) * c.width,
        y: c.y,
        angle,
        speed:
          (c.sMin ?? 16) +
          random(`${c.seed}-s${i}`) * ((c.sMax ?? 30) - (c.sMin ?? 16)),
        start: c.start + random(`${c.seed}-t${i}`) * 3,
        emit: c.emit ?? 12,
        r: (c.r ?? 20) * (0.7 + random(`${c.seed}-r${i}`) * 0.6),
        g: c.g ?? 1.5,
        floor: c.floor,
      }),
    );
  }
  return out;
};

// Poça que se espalha na base e depois recolhe.
export const poolBlobs = (
  frame: number,
  p: { x: number; y: number; width: number; start: number; hold?: number },
): Blob[] => {
  const hold = p.hold ?? 40;
  const w = interpolate(
    frame,
    [p.start, p.start + 10, p.start + hold, p.start + hold + 20],
    [0, p.width, p.width * 0.9, 0],
    { ...clamp, easing: Easing.out(Easing.cubic) },
  );
  if (w <= 2) return [];
  const out: Blob[] = [];
  const n = 36;
  for (let i = 0; i < n; i++) {
    const u = (i / (n - 1)) * 2 - 1;
    out.push({
      x: p.x + u * w,
      y: p.y + Math.sin(frame / 4 + i * 0.7) * 3 + Math.abs(u) * 6,
      r: 36 * (1 - Math.abs(u) * 0.6),
    });
  }
  return out;
};

// Gota que voa em direção à câmera (perspectiva) até bater na tela.
export type Flyer = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  launch: number;
  dur: number;
  r0: number;
};

const S_END = 12.5;

export const flyerState = (frame: number, f: Flyer) => {
  const t = (frame - f.launch) / f.dur;
  if (t < 0 || t >= 1) return null;
  const s = 1 / (1 - 0.92 * t);
  const k = (s - 1) / (S_END - 1);
  return {
    x: f.x0 + (f.x1 - f.x0) * k,
    y: f.y0 + (f.y1 - f.y0) * k,
    r: f.r0 * s,
    blur: Math.min(12, Math.max(0, (s - 2.5) * 0.9)),
  };
};

export const FlyerDrops: React.FC<{ frame: number; flyers: Flyer[] }> = ({
  frame,
  flyers,
}) => (
  <>
    {flyers.map((f, i) => {
      const st = flyerState(frame, f);
      if (!st) return null;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: st.x - st.r,
            top: st.y - st.r,
            width: st.r * 2,
            height: st.r * 2,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 36% 30%, #ffffff 0%, #fbfcfd 42%, #dfe8ef 74%, #b7cad8 100%)",
            boxShadow: "0 10px 30px rgba(0,50,90,0.28)",
            filter: `blur(${st.blur}px)`,
          }}
        />
      );
    })}
  </>
);

// Respingo "grudado" na tela, com escorridos.
export type Splat = { x: number; y: number; R: number; hit: number; seed: string };

export const splatBlobs = (frame: number, s: Splat): Blob[] => {
  if (frame < s.hit) return [];
  const k = interpolate(frame, [s.hit, s.hit + 5], [0.4, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const slide = interpolate(frame, [s.hit + 12, s.hit + 120], [0, s.R * 0.9], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  const fade = interpolate(frame, [s.hit + 55, s.hit + 105], [1, 0], clamp);
  if (fade <= 0.02) return [];
  const out: Blob[] = [];
  const cy = s.y + slide;
  out.push({ x: s.x, y: cy, r: s.R * k * Math.sqrt(fade) });
  for (let i = 0; i < 11; i++) {
    const ang = random(`${s.seed}-ang${i}`) * Math.PI * 2;
    const dist = s.R * (1.05 + random(`${s.seed}-d${i}`) * 0.95) * k;
    const rr = s.R * (0.07 + random(`${s.seed}-rr${i}`) * 0.2) * fade;
    const sx = s.x + Math.cos(ang) * dist;
    const sy = cy + Math.sin(ang) * dist;
    out.push({ x: sx, y: sy, r: rr });
    for (let j = 1; j <= 4; j++) {
      const t = j / 5;
      out.push({
        x: s.x + (sx - s.x) * t,
        y: cy + (sy - cy) * t,
        r: (s.R * 0.42 * (1 - t) + rr * 0.8 * t) * fade,
      });
    }
  }
  for (let d = 0; d < 2; d++) {
    const dx = (random(`${s.seed}-dx${d}`) - 0.5) * s.R * 1.1;
    const len = interpolate(
      frame,
      [s.hit + 8, s.hit + 95],
      [0, s.R * (1.6 + random(`${s.seed}-len${d}`) * 1.8)],
      { ...clamp, easing: Easing.in(Easing.quad) },
    );
    const y0 = cy + s.R * 0.55;
    for (let yy = 0; yy < len; yy += 5) {
      out.push({ x: s.x + dx, y: y0 + yy, r: s.R * 0.13 * fade });
    }
    out.push({ x: s.x + dx, y: y0 + len, r: s.R * 0.21 * fade });
  }
  return out;
};

// Onda de leite que atravessa a tela inteira (transição entre cenas).
// t = 0..36; cobre a tela toda em t = 16.
export const MilkWave: React.FC<{ t: number; dir: 1 | -1; id: string }> = ({
  t,
  dir,
  id,
}) => {
  if (t < 0 || t > 38) return null;
  const front = interpolate(t, [0, 16], [-320, 2240], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const tail = interpolate(t, [17, 37], [-320, 2240], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  const blobs: Blob[] = [];
  for (let y = -80; y <= 1160; y += 34) {
    const i = y + 80;
    blobs.push({
      x:
        front +
        50 * Math.sin(y / 120 + t * 0.45) +
        (random(`${id}-f${i}`) - 0.5) * 50,
      y,
      r: 40 + random(`${id}-fr${i}`) * 34,
    });
    blobs.push({
      x: tail + 46 * Math.sin(y / 100 - t * 0.4) + (random(`${id}-t${i}`) - 0.5) * 40,
      y,
      r: 36 + random(`${id}-tr${i}`) * 30,
    });
  }
  // Gotas à frente da onda.
  for (let i = 0; i < 34; i++) {
    const lead = 40 + random(`${id}-l${i}`) * 300;
    const vis = interpolate(t, [0, 3, 14, 17], [0, 1, 1, 0], clamp);
    blobs.push({
      x: front + lead * vis,
      y: random(`${id}-ly${i}`) * 1080 + Math.sin(t / 3 + i) * 20,
      r: (6 + random(`${id}-lr${i}`) * 22) * vis,
    });
  }
  const mirror = dir === -1 ? "translate(1920 0) scale(-1 1)" : undefined;
  return (
    <MilkLayer id={id} blur={10}>
      <g transform={mirror}>
        {front > tail ? (
          <rect x={tail} y={-200} width={front - tail} height={1480} fill="#fff" />
        ) : null}
        {blobs.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={Math.max(0, b.r)} fill="#fff" />
        ))}
      </g>
    </MilkLayer>
  );
};
