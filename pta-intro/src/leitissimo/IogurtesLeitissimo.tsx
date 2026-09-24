import React from "react";
import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { JAR_H, JAR_W, Jar, PRODUTOS, Sabor } from "./Jar";
import {
  Blob,
  Flyer,
  FlyerDrops,
  MilkLayer,
  MilkWave,
  Splat,
  crownBlobs,
  emitterBlobs,
  poolBlobs,
  splatBlobs,
} from "./Milk";

const lato = "Lato";
loadFont({ family: lato, url: staticFile("fonts/Lato-Regular.woff2"), weight: "400" });
loadFont({ family: lato, url: staticFile("fonts/Lato-Bold.woff2"), weight: "700" });
loadFont({ family: lato, url: staticFile("fonts/Lato-Black.woff2"), weight: "900" });

const BLUE = "#01B0EF";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const snappy = Easing.bezier(0.16, 1, 0.3, 1);

// Linha do tempo (30 fps). Cada corte fica escondido por uma onda de leite.
const CUTS = [70, 235, 400, 565];
export const DURACAO = 810;

const Fundo: React.FC<{ luzX: number }> = ({ luzX }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at ${luzX}px 48%, #5fd8ff 0%, ${BLUE} 36%, #0090d4 100%)`,
    }}
  />
);

// Pote que cai no leite, amassa um pouco no impacto e segue girando.
const jarTransform = (f: number, land: number, S: number, kick = -1) => {
  const y = interpolate(f, [land - 16, land], [-1000, 0], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  const d = f - land;
  const sq = d >= 0 ? 0.08 * Math.exp(-d / 5) * Math.cos(d * 0.75) : 0;
  const k = kick >= 0 && f >= kick ? Math.exp(-(f - kick) / 9) * Math.sin((f - kick) / 2.2) : 0;
  return {
    transform: `translateY(${y}px) rotate(${k * 3}deg) scale(${S * (1 + sq * 0.6)}, ${S * (1 - sq)})`,
    transformOrigin: "50% 97%",
  };
};

const jarYaw = (f: number, land: number, base: number, kick = -1) => {
  const settle = f < land ? interpolate(f, [land - 16, land], [-45, -10], clamp) : 22 * Math.sin((f - land) / 26 - 0.47);
  const k = kick >= 0 && f >= kick ? 7 * Math.exp(-(f - kick) / 8) * Math.sin((f - kick) / 2) : 0;
  return base + settle + k;
};

const Revela: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at,
  children,
  style,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ overflow: "hidden", paddingBottom: 8, ...style }}>
      <div
        style={{
          transform: `translateY(${interpolate(f, [at, at + 16], [110, 0], { ...clamp, easing: snappy })}%)`,
          opacity: interpolate(f, [at, at + 6], [0, 1], clamp),
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      background: "#fff",
      color: "#0a86c2",
      fontFamily: lato,
      fontWeight: 900,
      fontSize: 34,
      letterSpacing: "0.06em",
      padding: "12px 28px",
      borderRadius: 999,
      boxShadow: "0 8px 24px rgba(0,60,110,0.25)",
    }}
  >
    {children}
  </div>
);

// Respingos na "lente": gotas voando até a tela + manchas que escorrem.
const Lente: React.FC<{ id: string; flyers: Flyer[]; splats: Splat[] }> = ({ id, flyers, splats }) => {
  const f = useCurrentFrame();
  const blobs: Blob[] = splats.flatMap((s) => splatBlobs(f, s));
  return (
    <>
      <FlyerDrops frame={f} flyers={flyers} />
      <MilkLayer id={id} blobs={blobs} blur={7} opacity={0.96} />
    </>
  );
};

// Gera gotas para a lente: as que têm alvo viram manchas ao bater.
const gotas = (
  seed: string,
  origem: { x: number; y: number },
  launch: number,
  alvos: { x: number; y: number; R: number }[],
  extras: number,
) => {
  const flyers: Flyer[] = [];
  const splats: Splat[] = [];
  alvos.forEach((a, i) => {
    const dur = 16 + Math.round(random(`${seed}-dur${i}`) * 8);
    flyers.push({ x0: origem.x, y0: origem.y, x1: a.x, y1: a.y, launch: launch + i * 3, dur, r0: a.R / 11 });
    splats.push({ x: a.x, y: a.y, R: a.R, hit: launch + i * 3 + dur, seed: `${seed}-sp${i}` });
  });
  for (let i = 0; i < extras; i++) {
    const ang = random(`${seed}-xa${i}`) * Math.PI * 2;
    flyers.push({
      x0: origem.x + (random(`${seed}-xo${i}`) - 0.5) * 200,
      y0: origem.y - random(`${seed}-yo${i}`) * 150,
      x1: 960 + Math.cos(ang) * 1500,
      y1: 540 + Math.sin(ang) * 1100,
      launch: launch + Math.round(random(`${seed}-xl${i}`) * 8),
      dur: 14 + Math.round(random(`${seed}-xd${i}`) * 10),
      r0: 5 + random(`${seed}-xr${i}`) * 7,
    });
  }
  return { flyers, splats };
};

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const back = [
    ...crownBlobs(f, { x: 960, y: 930, width: 260, start: 2, seed: "intro", count: 22, aMin: 35, aMax: 145, sMin: 14, sMax: 27, r: 30, emit: 14, g: 1.2 }),
    ...poolBlobs(f, { x: 960, y: 940, width: 460, start: 2, hold: 70 }),
  ];
  const { flyers, splats } = gotas("intro", { x: 960, y: 640 }, 10, [{ x: 1640, y: 200, R: 110 }], 5);
  const s = interpolate(f, [4, 22], [0.55, 1], { ...clamp, easing: snappy });

  return (
    <AbsoluteFill>
      <Fundo luzX={960} />
      <MilkLayer id="intro-back" blobs={back} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Img
          src={staticFile("leitissimo/marca.png")}
          style={{
            width: 980,
            filter: "invert(1) drop-shadow(0 10px 24px rgba(0,50,90,0.35))",
            transform: `scale(${s}) translateY(-40px)`,
            opacity: interpolate(f, [4, 12], [0, 1], clamp),
          }}
        />
        <Revela at={16} style={{ marginTop: 10 }}>
          <div
            style={{
              fontFamily: lato,
              fontWeight: 700,
              fontSize: 58,
              letterSpacing: "0.22em",
              color: "#fff",
              textShadow: "0 6px 20px rgba(0,50,90,0.3)",
            }}
          >
            OS IOGURTES NATURAIS 170g
          </div>
        </Revela>
      </AbsoluteFill>
      <Lente id="intro-lente" flyers={flyers} splats={splats} />
    </AbsoluteFill>
  );
};

const CenaProduto: React.FC<{
  sabor: Sabor;
  lado: "esq" | "dir";
  numero: string;
  titulo: string[];
  selo?: string;
}> = ({ sabor, lado, numero, titulo, selo }) => {
  const f = useCurrentFrame();
  const esq = lado === "esq";
  const JX = esq ? 560 : 1360;
  const JY = 555;
  const S = 0.92;
  const base = JY + (740 - 380) * S;
  const LAND = 22;
  const JET = 44;
  const dir = esq ? 1 : -1; // o jato vem da borda mais próxima do pote
  const jetY = JY + 120;
  const edge = JX - dir * 258;
  const IMPACT = JET + 8;
  const cor = PRODUTOS[sabor].cor;

  const back = crownBlobs(f, {
    x: JX,
    y: base - 10,
    width: 200,
    start: LAND,
    seed: `${sabor}-coroa`,
    count: 18,
    aMin: 25,
    aMax: 155,
    sMin: 12,
    sMax: 25,
    r: 26,
    floor: base + 30,
  });
  const front = [
    ...poolBlobs(f, { x: JX, y: base + 6, width: 330, start: LAND, hold: 55 }),
    ...crownBlobs(f, { x: JX, y: base, width: 240, start: LAND, seed: `${sabor}-baixo-e`, count: 5, aMin: 150, aMax: 178, sMin: 10, sMax: 18, r: 16, emit: 9 }),
    ...crownBlobs(f, { x: JX, y: base, width: 240, start: LAND, seed: `${sabor}-baixo-d`, count: 5, aMin: 2, aMax: 30, sMin: 10, sMax: 18, r: 16, emit: 9 }),
    ...emitterBlobs(f, {
      x: esq ? -160 : 2080,
      y: jetY,
      angle: esq ? 4 : 176,
      speed: 60,
      start: JET,
      emit: 16,
      r: 32,
      g: 0.35,
      step: 0.3,
      life: 90,
      clip: (x) => dir * (x - edge) > 0,
    }),
    ...crownBlobs(f, {
      x: edge,
      y: jetY - 10,
      width: 20,
      start: IMPACT,
      seed: `${sabor}-jato`,
      count: 13,
      aMin: esq ? 92 : 8,
      aMax: esq ? 172 : 88,
      sMin: 12,
      sMax: 28,
      r: 19,
      emit: 16,
      g: 1.4,
    }),
  ];

  const alvos1 = esq
    ? [{ x: 170, y: 190, R: 100 }]
    : [{ x: 1760, y: 180, R: 100 }];
  const alvos2 = esq
    ? [{ x: 1790, y: 930, R: 115 }, { x: 110, y: 860, R: 80 }]
    : [{ x: 140, y: 920, R: 115 }, { x: 1820, y: 820, R: 80 }];
  const g1 = gotas(`${sabor}-g1`, { x: JX, y: base - 120 }, LAND, alvos1, 6);
  const g2 = gotas(`${sabor}-g2`, { x: edge, y: jetY - 40 }, IMPACT + 2, alvos2, 5);

  const textoX = esq ? 1030 : 120;

  return (
    <AbsoluteFill>
      <Fundo luzX={JX} />
      <div
        style={{
          position: "absolute",
          left: textoX - 40,
          top: 60,
          fontFamily: lato,
          fontWeight: 900,
          fontSize: 520,
          lineHeight: 1,
          color: "rgba(255,255,255,0.08)",
          transform: `translateX(${interpolate(f, [0, 165], [30, -30])}px)`,
        }}
      >
        {numero}
      </div>

      <MilkLayer id={`${sabor}-back`} blobs={back} />
      <Jar
        sabor={sabor}
        yaw={jarYaw(f, LAND, 0, IMPACT)}
        style={{ left: JX - JAR_W / 2, top: JY - JAR_H / 2, ...jarTransform(f, LAND, S, IMPACT) }}
      />
      <MilkLayer id={`${sabor}-front`} blobs={front} />

      <div style={{ position: "absolute", left: textoX, top: 250, width: 800 }}>
        <Revela at={26}>
          <Img src={staticFile("leitissimo/marca.png")} style={{ width: 300, filter: "invert(1)" }} />
        </Revela>
        <Revela at={30}>
          <div style={{ fontFamily: lato, fontWeight: 400, fontSize: 58, color: "#fff", letterSpacing: "0.04em" }}>
            Iogurte natural
          </div>
        </Revela>
        {titulo.map((linha, i) => (
          <Revela key={linha} at={35 + i * 5}>
            <div
              style={{
                fontFamily: lato,
                fontWeight: 900,
                fontSize: titulo.length > 1 ? 112 : 136,
                lineHeight: 1.02,
                color: "#fff",
                textShadow: "0 8px 26px rgba(0,50,90,0.25)",
              }}
            >
              {linha}
            </div>
          </Revela>
        ))}
        <div
          style={{
            marginTop: 22,
            height: 14,
            borderRadius: 7,
            background: cor,
            boxShadow: "0 4px 14px rgba(0,40,80,0.25)",
            width: interpolate(f, [44, 64], [0, 260], { ...clamp, easing: snappy }),
          }}
        />
        <div style={{ display: "flex", gap: 18, marginTop: 34 }}>
          {["170g", "ZERO AÇÚCAR", ...(selo ? [selo] : [])].map((c, i) => (
            <div
              key={c}
              style={{
                transform: `scale(${interpolate(f, [52 + i * 5, 64 + i * 5], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) })})`,
              }}
            >
              <Chip>{c}</Chip>
            </div>
          ))}
        </div>
      </div>

      <Lente id={`${sabor}-lente`} flyers={[...g1.flyers, ...g2.flyers]} splats={[...g1.splats, ...g2.splats]} />
    </AbsoluteFill>
  );
};

// Arco de leite (como a arte original) que vira o palco do final.
const arcoBlobs = (f: number): { R: number; blobs: Blob[] } => {
  const R = interpolate(f, [2, 24], [0, 1560], { ...clamp, easing: Easing.out(Easing.cubic) });
  const blobs: Blob[] = [];
  if (R <= 0) return { R, blobs };
  for (let a = -84; a <= 84; a += 2.2) {
    const th = (a * Math.PI) / 180;
    const w = 16 * Math.sin(th * 11 + f / 5) + 8 * Math.sin(th * 23 - f / 3);
    blobs.push({ x: -560 + Math.cos(th) * (R - 14 + w), y: 640 + Math.sin(th) * (R - 14 + w), r: 36 });
  }
  return { R, blobs };
};

const FINAL_JARS: { sabor: Sabor; x: number; y: number; s: number; land: number; yaw: number }[] = [
  { sabor: "zero", x: 612, y: 330, s: 0.7, land: 30, yaw: 6 },
  { sabor: "desnatado", x: 290, y: 588, s: 0.72, land: 38, yaw: -8 },
  { sabor: "integral", x: 724, y: 708, s: 0.72, land: 46, yaw: 4 },
];

const SeloZeroAcucar: React.FC = () => (
  <div
    style={{
      width: 250,
      height: 250,
      borderRadius: "50%",
      background: "#111",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 16px 40px rgba(0,40,80,0.35)",
    }}
  >
    <div
      style={{
        width: 222,
        height: 222,
        borderRadius: "50%",
        border: "3px dashed rgba(255,255,255,0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: lato,
        fontWeight: 900,
        fontSize: 40,
        lineHeight: 1.05,
        textAlign: "center",
      }}
    >
      <svg width={46} height={46} viewBox="0 0 46 46" style={{ marginBottom: 6 }}>
        <rect x={10} y={4} width={26} height={7} rx={3} fill="none" stroke="#fff" strokeWidth={3.5} />
        <path d="M13 12 C 4 18, 5 38, 13 42 L 33 42 C 41 38, 42 18, 33 12" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinejoin="round" />
      </svg>
      ZERO
      <br />
      AÇÚCAR
    </div>
  </div>
);

const Final: React.FC = () => {
  const f = useCurrentFrame();
  const { blobs: arco, R } = arcoBlobs(f);
  const crowns = FINAL_JARS.flatMap((j, i) =>
    crownBlobs(f, {
      x: j.x,
      y: j.y + 360 * j.s - 10,
      width: 150,
      start: j.land,
      seed: `final-${i}`,
      count: 12,
      sMin: 12,
      sMax: 24,
      r: 16,
      floor: j.y + 360 * j.s + 20,
    }),
  );
  const g = gotas("final", { x: 600, y: 520 }, 50, [], 8);
  const itens: { texto: string; sabor: Sabor }[] = [
    { texto: "Iogurte natural Integral", sabor: "integral" },
    { texto: "Iogurte natural parcialmente Desnatado", sabor: "desnatado" },
    { texto: "Iogurte natural Integral Zero Lactose", sabor: "zero" },
  ];
  const selo = interpolate(f, [104, 122], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });

  return (
    <AbsoluteFill>
      <Fundo luzX={1400} />
      <MilkLayer id="final-arco" blobs={arco} blur={10}>
        <circle cx={-560} cy={640} r={Math.max(0, R - 20)} fill="#fff" />
      </MilkLayer>
      <MilkLayer id="final-coroas" blobs={crowns} />
      <Img
        src={staticFile("leitissimo/marca.png")}
        style={{
          position: "absolute",
          left: 70,
          top: 50,
          width: 300,
          opacity: interpolate(f, [70, 86], [0, 1], clamp),
        }}
      />
      {FINAL_JARS.map((j) => (
        <Jar
          key={j.sabor}
          sabor={j.sabor}
          yaw={j.yaw + (f < j.land ? interpolate(f, [j.land - 16, j.land], [-40, 0], clamp) : 12 * Math.sin((f - j.land) / 30))}
          style={{ left: j.x - JAR_W / 2, top: j.y - JAR_H / 2, ...jarTransform(f, j.land, j.s) }}
        />
      ))}

      <div style={{ position: "absolute", right: 60, top: 70, textAlign: "right" }}>
        {["OS IOGURTES", "NATURAIS 170g"].map((l, i) => (
          <Revela key={l} at={54 + i * 6}>
            <div
              style={{
                fontFamily: lato,
                fontWeight: 400,
                fontSize: 116,
                lineHeight: 1.05,
                color: "#fff",
                textShadow: "0 8px 26px rgba(0,50,90,0.25)",
              }}
            >
              {l}
            </div>
          </Revela>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 1010,
          top: 390,
          width: 850,
          padding: "30px 44px",
          borderRadius: 40,
          background: "#F4F1EC",
          boxShadow: "0 20px 50px rgba(0,50,90,0.3)",
          transform: `translateX(${interpolate(f, [66, 86], [120, 0], { ...clamp, easing: snappy })}px)`,
          opacity: interpolate(f, [66, 76], [0, 1], clamp),
        }}
      >
        {itens.map((it, i) => (
          <div
            key={it.texto}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "20px 0",
              borderTop: i ? "2px solid #d6d0c7" : undefined,
              opacity: interpolate(f, [78 + i * 8, 88 + i * 8], [0, 1], clamp),
              transform: `translateX(${interpolate(f, [78 + i * 8, 92 + i * 8], [40, 0], { ...clamp, easing: snappy })}px)`,
            }}
          >
            <div style={{ width: 22, height: 22, borderRadius: 11, background: PRODUTOS[it.sabor].cor, flexShrink: 0 }} />
            <div style={{ fontFamily: lato, fontWeight: 400, fontSize: 38, color: "#333" }}>{it.texto}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 1600,
          top: 790,
          transform: `scale(${selo}) rotate(${(1 - selo) * -40}deg)`,
        }}
      >
        <SeloZeroAcucar />
      </div>

      <Lente id="final-lente" flyers={g.flyers} splats={g.splats} />
    </AbsoluteFill>
  );
};

const Ondas: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {CUTS.map((c, i) => (
        <MilkWave key={c} id={`onda-${i}`} t={f - (c - 16)} dir={i % 2 === 0 ? 1 : -1} />
      ))}
    </>
  );
};

export const IogurtesLeitissimo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BLUE }}>
      <Sequence durationInFrames={CUTS[0]}>
        <Intro />
      </Sequence>
      <Sequence from={CUTS[0]} durationInFrames={CUTS[1] - CUTS[0]}>
        <CenaProduto sabor="integral" lado="esq" numero="01" titulo={["Integral"]} />
      </Sequence>
      <Sequence from={CUTS[1]} durationInFrames={CUTS[2] - CUTS[1]}>
        <CenaProduto sabor="desnatado" lado="dir" numero="02" titulo={["Parcialmente", "Desnatado"]} />
      </Sequence>
      <Sequence from={CUTS[2]} durationInFrames={CUTS[3] - CUTS[2]}>
        <CenaProduto sabor="zero" lado="esq" numero="03" titulo={["Integral", "Zero Lactose"]} />
      </Sequence>
      <Sequence from={CUTS[3]}>
        <Final />
      </Sequence>
      <Ondas />
    </AbsoluteFill>
  );
};
