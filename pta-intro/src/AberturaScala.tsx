import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

const ORANGE = "#FE4D2B";
const FPS = 30;
const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
const snappy = Easing.bezier(0.16, 1, 0.3, 1);
const overshoot = Easing.bezier(0.34, 1.56, 0.64, 1);

// Trecho do vídeo de depoimentos, começando em `at` segundos.
const Clip: React.FC<{ at: number; zoomFrom?: number; zoomTo?: number; dur?: number }> = ({
  at,
  zoomFrom = 1.15,
  zoomTo = 1,
  dur = 45,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
      <Video
        src={staticFile("depoimentos.mp4")}
        trimBefore={Math.round(at * FPS)}
        muted
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          scale: interpolate(frame, [0, dur], [zoomFrom, zoomTo], {
            ...clamp,
            easing: snappy,
          }),
        }}
      />
    </AbsoluteFill>
  );
};

// Flash branco/laranja de 1–3 frames nos cortes.
const Flash: React.FC<{ color?: string }> = ({ color = "white" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity: interpolate(frame, [0, 4], [0.85, 0], clamp),
      }}
    />
  );
};

// Faixas de luz laranja atravessando a tela.
const Streaks: React.FC = () => {
  const frame = useCurrentFrame();
  const bars = [
    { y: 300, h: 14, delay: 0, speed: 14 },
    { y: 520, h: 60, delay: 3, speed: 12 },
    { y: 610, h: 6, delay: 5, speed: 10 },
    { y: 780, h: 26, delay: 8, speed: 13 },
  ];

  return (
    <AbsoluteFill>
      {bars.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: b.y,
            left: 0,
            height: b.h,
            width: 1400,
            background: `linear-gradient(90deg, transparent, ${ORANGE} 70%, #ffd2c4)`,
            boxShadow: `0 0 40px ${ORANGE}`,
            translate: `${interpolate(frame - b.delay, [0, b.speed], [-1500, 2000], clamp)}px 0px`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Três painéis verticais que entram alternando de cima e de baixo.
const Triptych: React.FC = () => {
  const frame = useCurrentFrame();
  const panels = [
    { at: 1, from: -1100 },
    { at: 18.5, from: 1100 },
    { at: 61, from: -1100 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: ORANGE }}>
      {panels.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: i * 646,
            width: 628,
            height: 1080,
            overflow: "hidden",
            translate: `0px ${interpolate(frame - i * 4, [0, 14], [p.from, 0], {
              ...clamp,
              easing: snappy,
            })}px`,
          }}
        >
          <Clip at={p.at} zoomFrom={1.3} zoomTo={1.05} dur={48} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

// Cartela de resultado em tela cheia com "soco" de zoom.
const Punch: React.FC<{ at: number; fromScale: number }> = ({ at, fromScale }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        scale: interpolate(frame, [0, 8], [fromScale, 1], { ...clamp, easing: snappy }),
        rotate: interpolate(frame, [0, 8], ["-3deg", "0deg"], { ...clamp, easing: snappy }),
      }}
    >
      <Clip at={at} zoomFrom={1.05} zoomTo={1.12} dur={20} />
    </AbsoluteFill>
  );
};

// Grade 2x2 com peças que surgem em sequência + selo central.
const Grid: React.FC = () => {
  const frame = useCurrentFrame();
  const tiles = [
    { at: 43.5, x: 0, y: 0 },
    { at: 127, x: 1, y: 0 },
    { at: 3, x: 0, y: 1 },
    { at: 75, x: 1, y: 1 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: ORANGE,
        scale: interpolate(frame, [0, 48], [1.08, 1], clamp),
      }}
    >
      {tiles.map((t, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: t.x * 966,
            top: t.y * 546,
            width: 954,
            height: 534,
            overflow: "hidden",
            scale: interpolate(frame - i * 4, [0, 12], [0, 1], { ...clamp, easing: overshoot }),
          }}
        >
          <Clip at={t.at} zoomFrom={1.25} zoomTo={1} dur={40} />
        </div>
      ))}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            backgroundColor: ORANGE,
            color: "white",
            fontFamily: "Helvetica Neue, Arial, sans-serif",
            fontWeight: 900,
            fontSize: 96,
            letterSpacing: 4,
            padding: "18px 48px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            translate: `${interpolate(frame, [16, 28], [-2200, 0], { ...clamp, easing: snappy })}px 0px`,
          }}
        >
          HISTÓRIAS REAIS
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Painel laranja que varre a tela na transição para a logo.
const Wipe: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: ORANGE,
        rotate: "-8deg",
        scale: 1.4,
        translate: `${interpolate(frame, [0, 10, 12, 22], [-2400, 0, 0, 2400], {
          ...clamp,
          easing: Easing.bezier(0.7, 0, 0.3, 1),
        })}px 0px`,
      }}
    />
  );
};

// Partículas quadradas (referência aos quadrados do símbolo) subindo.
const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(40).fill(true).map((_, i) => {
        const size = 6 + random(`ps-${i}`) * 18;
        const speed = 1 + random(`pv-${i}`) * 3;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${random(`px-${i}`) * 100}%`,
              top: 1080 + 40 - ((random(`py-${i}`) * 1200 + frame * speed) % 1200),
              width: size,
              height: size,
              borderRadius: size / 5,
              backgroundColor: ORANGE,
              opacity: 0.15 + random(`po-${i}`) * 0.35,
              rotate: `${frame * speed}deg`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Símbolo da Mentoria Scala Fitness redesenhado em vetor (unidades da logo original).
const Icon: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <svg
      viewBox="0 0 282 283"
      width={282}
      height={283}
      style={{ position: "absolute", left: 266, top: 308, overflow: "visible" }}
    >
      {/* Quadrado de trás */}
      <path
        d="M101 0 H252 A30 30 0 0 1 282 30 V212 H71 V30 A30 30 0 0 1 101 0 Z"
        fill={ORANGE}
        style={{
          transformOrigin: "71px 212px",
          scale: interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: overshoot }),
          rotate: interpolate(frame, [0, 14], ["-90deg", "0deg"], { ...clamp, easing: snappy }),
        }}
      />
      {/* Quadrado da frente */}
      <path
        d="M30 130 H152 V283 H0 V160 A30 30 0 0 1 30 130 Z"
        fill={ORANGE}
        style={{
          opacity: interpolate(frame, [6, 10], [0, 1], clamp),
          translate: `${interpolate(frame, [6, 20], [-260, 0], { ...clamp, easing: snappy })}px ${interpolate(frame, [6, 20], [120, 0], { ...clamp, easing: snappy })}px`,
        }}
      />
      {/* Encaixe entre os quadrados */}
      <g
        style={{
          transformOrigin: "111px 171px",
          scale: interpolate(frame, [16, 24], [0, 1], { ...clamp, easing: overshoot }),
        }}
      >
        <rect x={71} y={130} width={81} height={82} fill="black" />
        <path d="M94 154 H119 A10 10 0 0 1 129 164 V189 H94 Z" fill={ORANGE} />
      </g>
      {/* Haste da seta */}
      <line
        x1={131}
        y1={144}
        x2={226}
        y2={58}
        stroke="black"
        strokeWidth={23}
        strokeDasharray={130}
        strokeDashoffset={interpolate(frame, [20, 30], [130, 0], { ...clamp, easing: snappy })}
      />
      {/* Ponta da seta */}
      <path
        d="M153 48 H236 V130 H212 V70 H153 Z"
        fill="black"
        style={{
          transformOrigin: "236px 48px",
          opacity: interpolate(frame, [27, 29], [0, 1], clamp),
          scale: interpolate(frame, [27, 36], [0.2, 1], { ...clamp, easing: overshoot }),
          translate: `${interpolate(frame, [27, 36], [-40, 0], { ...clamp, easing: snappy })}px ${interpolate(frame, [27, 36], [40, 0], { ...clamp, easing: snappy })}px`,
        }}
      />
    </svg>
  );
};

// Linha do texto da logo, recortada da arte original e revelada com máscara.
const TextLine: React.FC<{ top: number; height: number; delay: number }> = ({
  top,
  height,
  delay,
}) => {
  const frame = useCurrentFrame() - delay;

  return (
    <div
      style={{
        position: "absolute",
        left: 576,
        top,
        width: 764,
        height,
        overflow: "hidden",
        clipPath: `inset(0 ${interpolate(frame, [0, 16], [100, 0], { ...clamp, easing: snappy })}% 0 0)`,
        translate: `${interpolate(frame, [0, 16], [-60, 0], { ...clamp, easing: snappy })}px 0px`,
      }}
    >
      <Img
        src={staticFile("logo-texto.png")}
        style={{
          position: "absolute",
          left: 0,
          top: 340 - top,
          width: 764,
          height: 218,
          maxWidth: "none",
        }}
      />
    </div>
  );
};

const Logo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(254,77,43,0.35), transparent 60%)`,
          opacity: interpolate(frame, [0, 30, 60, 120], [0, 0.6, 1, 0.7], clamp),
          scale: interpolate(frame, [0, 120], [0.6, 1.2], clamp),
        }}
      />
      <Particles />
      {/* Onda de choque quando a seta termina */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 300,
            height: 300,
            borderRadius: 40,
            border: `8px solid ${ORANGE}`,
            translate: "-491px 0px",
            scale: interpolate(frame, [34, 60], [0.8, 4], { ...clamp, easing: snappy }),
            opacity: interpolate(frame, [34, 36, 60], [0, 0.8, 0], clamp),
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          scale: interpolate(frame, [0, 120], [1.22, 1.32]),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 160,
            top: 90,
            width: 1600,
            height: 900,
            filter: `drop-shadow(0 0 ${interpolate(frame, [36, 50, 120], [0, 28, 14], clamp)}px rgba(254,77,43,0.8))`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "407px 450px",
              scale: interpolate(frame, [34, 38, 46], [1, 1.08, 1], clamp),
            }}
          >
            <Icon />
          </div>
          <TextLine top={340} height={100} delay={26} />
          <TextLine top={458} height={100} delay={33} />
        </div>
      </AbsoluteFill>
      {/* Brilho que atravessa a logo */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)",
          mixBlendMode: "overlay",
          translate: `${interpolate(frame, [62, 84], [-1900, 1900], clamp)}px 0px`,
        }}
      />
      <Flash color={ORANGE} />
    </AbsoluteFill>
  );
};

export const AberturaScala: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence name="Faixas de luz" durationInFrames={24}>
        <Streaks />
      </Sequence>
      <Sequence name="Três depoimentos" from={18} durationInFrames={48}>
        <Triptych />
      </Sequence>
      <Sequence name="5 Presenciais" from={66} durationInFrames={18}>
        <Punch at={39.2} fromScale={1.5} />
        <Flash />
      </Sequence>
      <Sequence name="Grade de depoimentos" from={84} durationInFrames={48}>
        <Grid />
        <Flash color={ORANGE} />
      </Sequence>
      <Sequence name="R$10.500" from={132} durationInFrames={16}>
        <Punch at={54.2} fromScale={0.7} />
        <Flash />
      </Sequence>
      <Sequence name="1.500 vendas" from={148} durationInFrames={24}>
        <Punch at={115.2} fromScale={1.5} />
        <Flash />
      </Sequence>
      <Sequence name="Logo" from={176} durationInFrames={124}>
        <Logo />
      </Sequence>
      <Sequence name="Transição" from={166} durationInFrames={24}>
        <Wipe />
      </Sequence>
    </AbsoluteFill>
  );
};
