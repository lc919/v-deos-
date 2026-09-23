import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";

const oswald = "Oswald";
const figtree = "Figtree";
loadFont({ family: oswald, url: staticFile("fonts/Oswald.woff2"), weight: "200 700" });
loadFont({ family: figtree, url: staticFile("fonts/Figtree.woff2"), weight: "300 900" });

const RED = "#D7232A";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = Easing.bezier(0.45, 0, 0.2, 1);
const snappy = Easing.bezier(0.16, 1, 0.3, 1);

// Dimensões do livro (proporção da capa original).
const W = 560;
const H = 823;
const D = 64;

// Rede de linhas e pontos, como a arte da capa.
const Network: React.FC = () => {
  const frame = useCurrentFrame();
  const points = new Array(26).fill(true).map((_, i) => ({
    x: random(`nx-${i}`) * 2100 - 90 + Math.sin(frame / 60 + i) * 20,
    y: random(`ny-${i}`) * 1260 - 90 + Math.cos(frame / 70 + i) * 20,
  }));
  const lines: { a: number; b: number; d: number }[] = [];
  points.forEach((p, a) =>
    points.forEach((q, b) => {
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (a < b && d < 420) lines.push({ a, b, d });
    }),
  );

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {lines.map(({ a, b, d }) => (
        <line
          key={`${a}-${b}`}
          x1={points[a].x}
          y1={points[a].y}
          x2={points[b].x}
          y2={points[b].y}
          stroke="rgba(110,170,255,1)"
          strokeWidth={1.5}
          opacity={(1 - d / 420) * 0.45}
        />
      ))}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="rgba(150,200,255,0.8)" />
      ))}
    </svg>
  );
};

// Livro em 3D montado com transformações CSS.
const Book: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Capa */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateZ(${D / 2}px)`,
          borderRadius: "4px 10px 10px 4px",
          overflow: "hidden",
          backfaceVisibility: "hidden",
        }}
      >
        <Img src={staticFile("livro-capa.jpg")} style={{ width: "100%", height: "100%", maxWidth: "none" }} />
        {/* Vinco da lombada */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.45) 0px, rgba(255,255,255,0.12) 14px, rgba(0,0,0,0.25) 24px, transparent 44px)",
          }}
        />
        {/* Reflexo de luz */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.35) 48%, transparent 60%)",
            translate: `${interpolate(frame, [70, 110, 230, 270], [-900, 900, -900, 900], clamp)}px 0px`,
          }}
        />
      </div>
      {/* Contracapa */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotateY(180deg) translateZ(${D / 2}px)`,
          background: "linear-gradient(135deg, #10254f, #07122b)",
          borderRadius: "10px 4px 4px 10px",
        }}
      />
      {/* Lombada */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: W / 2 - D / 2,
          width: D,
          height: H,
          transform: `rotateY(-90deg) translateZ(${W / 2}px)`,
          background: "linear-gradient(90deg, #07122b, #16336b 50%, #07122b)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            rotate: "90deg",
            whiteSpace: "nowrap",
            fontFamily: oswald,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: 2,
            color: "white",
          }}
        >
          BIOMECÂNICA APLICADA À REABILITAÇÃO <span style={{ color: RED }}>DE LESÕES</span>
        </div>
      </div>
      {/* Miolo (páginas) lateral */}
      <div
        style={{
          position: "absolute",
          top: 6,
          left: W / 2 - (D - 6) / 2,
          width: D - 6,
          height: H - 12,
          transform: `rotateY(90deg) translateZ(${W / 2 - 6}px)`,
          background: "repeating-linear-gradient(90deg, #f4f1ea 0px, #f4f1ea 2px, #d9d4c8 3px)",
        }}
      />
      {/* Miolo superior */}
      <div
        style={{
          position: "absolute",
          left: 6,
          top: H / 2 - (D - 6) / 2,
          width: W - 12,
          height: D - 6,
          transform: `rotateX(90deg) translateZ(${H / 2 - 6}px)`,
          background: "repeating-linear-gradient(0deg, #f4f1ea 0px, #f4f1ea 2px, #d9d4c8 3px)",
        }}
      />
      {/* Miolo inferior */}
      <div
        style={{
          position: "absolute",
          left: 6,
          top: H / 2 - (D - 6) / 2,
          width: W - 12,
          height: D - 6,
          transform: `rotateX(-90deg) translateZ(${H / 2 - 6}px)`,
          background: "repeating-linear-gradient(0deg, #e8e4da 0px, #e8e4da 2px, #c9c3b6 3px)",
        }}
      />
    </div>
  );
};

export const LivroBiomecanica: React.FC = () => {
  const frame = useCurrentFrame();

  const rotY = interpolate(frame, [0, 70, 160, 200, 300], [-540, -28, 22, -18, -12], {
    ...clamp,
    easing: smooth,
  });
  const rotX = interpolate(frame, [0, 70, 300], [25, 8, 6], { ...clamp, easing: smooth });
  const z = interpolate(frame, [0, 70], [-2600, 0], { ...clamp, easing: snappy });
  const x = interpolate(frame, [160, 200], [0, 380], { ...clamp, easing: smooth });
  const bob = Math.sin(frame / 22) * 12;
  const textIn = (delay: number) => ({
    opacity: interpolate(frame - delay, [0, 12], [0, 1], clamp),
    translate: `${interpolate(frame - delay, [0, 18], [-60, 0], { ...clamp, easing: snappy })}px 0px`,
  });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 60% 45%, #123a86 0%, #0a1d47 45%, #040a1c 100%)",
        overflow: "hidden",
      }}
    >
      <Network />
      {/* Brilho vermelho atrás do livro (referência ao destaque da lesão na capa) */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(215,35,42,0.35), transparent 30%)",
          translate: `${x}px 0px`,
          opacity: interpolate(frame, [40, 90], [0, 1], clamp),
        }}
      />
      {/* Sombra no chão */}
      <div
        style={{
          position: "absolute",
          left: 960 - 330 + x,
          top: 940,
          width: 660,
          height: 70,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.6), transparent 70%)",
          opacity: interpolate(frame, [30, 70], [0, 1], clamp),
          scale: 1 - bob / 200,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          perspective: 2200,
        }}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `translate3d(${x}px, ${bob - 20}px, ${z}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(0.95)`,
          }}
        >
          <Book />
        </div>
      </AbsoluteFill>
      {/* Texto de apoio */}
      <div style={{ position: "absolute", left: 150, top: 300, width: 820 }}>
        <div
          style={{
            fontFamily: figtree,
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: 10,
            color: "rgba(255,255,255,0.85)",
            ...textIn(180),
          }}
        >
          ANDRÉ ALBUQUERQUE
        </div>
        <div
          style={{
            fontFamily: oswald,
            fontWeight: 700,
            fontSize: 104,
            lineHeight: 1.02,
            color: "white",
            marginTop: 18,
            ...textIn(188),
          }}
        >
          BIOMECÂNICA APLICADA À REABILITAÇÃO
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 14,
            backgroundColor: RED,
            color: "white",
            fontFamily: oswald,
            fontWeight: 700,
            fontSize: 110,
            lineHeight: 1,
            padding: "6px 24px",
            clipPath: `inset(0 ${interpolate(frame, [198, 214], [100, 0], { ...clamp, easing: snappy })}% 0 0)`,
          }}
        >
          DE LESÕES
        </div>
        <div
          style={{
            fontFamily: figtree,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: 6,
            whiteSpace: "nowrap",
            color: "rgba(255,255,255,0.8)",
            marginTop: 30,
            ...textIn(214),
          }}
        >
          COLUNA, JOELHO, OMBRO E QUADRIL
        </div>
      </div>
      <AbsoluteFill
        style={{
          backgroundColor: "white",
          opacity: interpolate(frame, [62, 66, 76], [0, 0.35, 0], clamp),
        }}
      />
    </AbsoluteFill>
  );
};
