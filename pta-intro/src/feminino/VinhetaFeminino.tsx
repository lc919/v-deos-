import { loadFont } from "@remotion/fonts";
import { Audio, Video } from "@remotion/media";
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

const montserrat = "Montserrat";
loadFont({ family: montserrat, url: staticFile("fonts/Montserrat.woff2"), weight: "300 900" });

const FPS = 30;
const PINK = "#E0266F";
const WINE = "#2A0718";
const SRC = "vinheta-feminino.mp4";
const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const snappy = Easing.bezier(0.16, 1, 0.3, 1);
const overshoot = Easing.bezier(0.34, 1.56, 0.64, 1);

// Plano do vídeo original a partir de `at` segundos, com zoom contínuo e câmera lenta leve.
const Shot: React.FC<{
  at: number;
  from?: number;
  to?: number;
  dur: number;
  x?: number;
  ox?: number;
  rate?: number;
}> = ({ at, from = 1.08, to = 1.18, dur, x = 0, ox = 0, rate = 0.9 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
      <Video
        src={staticFile(SRC)}
        trimBefore={s(at)}
        playbackRate={rate}
        muted
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          scale: interpolate(frame, [0, dur], [from, to]),
          translate: `${ox + interpolate(frame, [0, dur], [0, x])}px 0px`,
          filter: "contrast(1.12) saturate(1.1) brightness(0.95)",
        }}
      />
    </AbsoluteFill>
  );
};

// Palavra-chave com entrada letra a letra.
const Word: React.FC<{
  text: string;
  color?: string;
  size?: number;
  top?: number;
  left?: number;
  kicker?: string;
}> = ({ text, color = "white", size = 150, top = 700, left = 120, kicker }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", top, left }}>
      {kicker ? (
        <div
          style={{
            fontFamily: montserrat,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: 12,
            color: PINK,
            marginBottom: 8,
            opacity: interpolate(frame, [2, 10], [0, 1], clamp),
          }}
        >
          {kicker}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          fontFamily: montserrat,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: 4,
          color,
          textShadow: "0 10px 40px rgba(0,0,0,0.6)",
        }}
      >
        {text.split("").map((ch, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(frame - i * 1.5, [0, 6], [0, 1], clamp),
              translate: `0px ${interpolate(frame - i * 1.5, [0, 12], [60, 0], { ...clamp, easing: snappy })}px`,
              filter: `blur(${interpolate(frame - i * 1.5, [0, 8], [10, 0], clamp)}px)`,
            }}
          >
            {ch}
          </span>
        ))}
      </div>
      <div
        style={{
          marginTop: 16,
          height: 8,
          backgroundColor: PINK,
          width: interpolate(frame, [8, 26], [0, 220], { ...clamp, easing: snappy }),
        }}
      />
    </div>
  );
};

// Vazamento de luz rosa nos cortes.
const LightLeak: React.FC<{ from?: "left" | "right" }> = ({ from = "left" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at ${from === "left" ? "10%" : "90%"} 50%, rgba(255,90,150,0.9), rgba(224,38,111,0.5) 30%, transparent 65%)`,
        mixBlendMode: "screen",
        opacity: interpolate(frame, [0, 3, 12], [0, 1, 0], clamp),
      }}
    />
  );
};

// Três painéis que se abrem em sequência.
const Triptych: React.FC = () => {
  const frame = useCurrentFrame();
  const shots = [
    { at: 10.65, rate: 0.2 },
    { at: 11.15, rate: 0.2 },
    { at: 11.63, rate: 0.12 },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: WINE }}>
      {shots.map(({ at, rate }, i) => (
        <div
          key={at}
          style={{
            position: "absolute",
            top: 0,
            left: i * 646,
            width: 628,
            height: 1080,
            overflow: "hidden",
            clipPath: `inset(${interpolate(frame - i * 12, [0, 10], [50, 0], { ...clamp, easing: snappy })}% 0 ${interpolate(frame - i * 12, [0, 10], [50, 0], { ...clamp, easing: snappy })}% 0)`,
          }}
        >
          <Shot at={at} from={1.25} to={1.1} dur={72} rate={rate} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

// Tela dividida em dois planos.
const Split: React.FC<{ left: number; right: number }> = ({ left, right }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: PINK }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          clipPath: "polygon(0 0, 58% 0, 42% 100%, 0 100%)",
          translate: `${interpolate(frame, [0, 10], [-900, 0], { ...clamp, easing: snappy })}px 0px`,
        }}
      >
        <Shot at={left} dur={75} rate={0.7} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          clipPath: "polygon(59% 0, 100% 0, 100% 100%, 43% 100%)",
          translate: `${interpolate(frame, [4, 14], [900, 0], { ...clamp, easing: snappy })}px 0px`,
        }}
      >
        <Shot at={right} dur={75} rate={0.68} />
      </div>
    </AbsoluteFill>
  );
};

// Nebulosa animada da cartela final.
const Nebula: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#07030a", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          inset: -300,
          background:
            "radial-gradient(ellipse at 70% 60%, rgba(224,38,111,0.55), transparent 45%), radial-gradient(ellipse at 85% 75%, rgba(150,20,70,0.7), transparent 40%), radial-gradient(ellipse at 40% 20%, rgba(120,20,90,0.35), transparent 45%), radial-gradient(ellipse at 20% 80%, rgba(90,10,50,0.4), transparent 50%)",
          filter: "blur(30px)",
          rotate: `${interpolate(frame, [0, 140], [-4, 4])}deg`,
          scale: interpolate(frame, [0, 140], [1.05, 1.15]),
        }}
      />
      {new Array(90).fill(true).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${random(`sx-${i}`) * 100}%`,
            top: `${random(`sy-${i}`) * 100}%`,
            width: 1 + random(`ss-${i}`) * 3,
            height: 1 + random(`ss-${i}`) * 3,
            borderRadius: "50%",
            backgroundColor: "white",
            opacity: 0.3 + 0.7 * Math.abs(Math.sin(frame / 15 + i)),
            translate: `${-frame * random(`sv-${i}`) * 0.6}px 0px`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Cartela final: explosão de luz, professor e logo animada.
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Nebula />
      {/* Estrela/flare que acende e explode */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "radial-gradient(circle, white, rgba(255,160,190,0.9) 30%, transparent 70%)",
            scale: interpolate(frame, [0, 18, 26, 34], [0.2, 1.5, 40, 60], clamp),
            opacity: interpolate(frame, [0, 6, 26, 38], [0, 1, 1, 0], clamp),
          }}
        />
      </AbsoluteFill>
      {/* Professor */}
      <Img
        src={staticFile("professor-feminino.png")}
        style={{
          position: "absolute",
          left: 20,
          bottom: 0,
          height: 1030,
          maxWidth: "none",
          opacity: interpolate(frame, [28, 36], [0, 1], clamp),
          translate: `${interpolate(frame, [28, 48], [-260, 0], { ...clamp, easing: snappy })}px 0px`,
          scale: interpolate(frame, [28, 135], [1.04, 1]),
          filter: "drop-shadow(0 0 40px rgba(224,38,111,0.35))",
        }}
      />
      {/* Símbolo da logo */}
      <Img
        src={staticFile("logo-feminino-simbolo.png")}
        style={{
          position: "absolute",
          left: 700,
          top: 588,
          height: 292,
          maxWidth: "none",
          transformOrigin: "50% 60%",
          scale: interpolate(frame, [36, 52], [0, 1], { ...clamp, easing: overshoot }),
          rotate: interpolate(frame, [36, 52], ["-25deg", "0deg"], { ...clamp, easing: snappy }),
          filter: `drop-shadow(0 0 ${interpolate(frame, [50, 70], [0, 18], clamp)}px rgba(255,120,170,0.8))`,
        }}
      />
      {/* Texto da logo revelado por máscara */}
      <div
        style={{
          position: "absolute",
          left: 1092,
          top: 588,
          height: 292,
          width: 686,
          overflow: "hidden",
          clipPath: `inset(0 ${interpolate(frame, [46, 66], [100, 0], { ...clamp, easing: snappy })}% 0 0)`,
        }}
      >
        <Img
          src={staticFile("logo-feminino-texto.png")}
          style={{ height: 292, maxWidth: "none" }}
        />
        {/* Brilho atravessando o texto */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)",
            mixBlendMode: "overlay",
            translate: `${interpolate(frame, [80, 105], [-900, 900], clamp)}px 0px`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Tarjas de cinema que abrem no início e somem na cartela final.
const Letterbox: React.FC = () => {
  const frame = useCurrentFrame();
  const h = interpolate(frame, [0, 20, s(27.2), s(27.7)], [540, 70, 70, 0], {
    ...clamp,
    easing: snappy,
  });
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: h, backgroundColor: "black" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: h, backgroundColor: "black" }} />
    </>
  );
};

// Cortes alinhados aos da vinheta original (sincronizados com a trilha).
const cuts = [2.5, 5.1, 7.8, 10.5, 12.9, 15.5, 18.0, 20.6, 21.0, 23.0, 25.5, 26.2, 27.4];

export const VinhetaFeminino: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Audio src={staticFile(SRC)} />
      <Sequence name="Abertura" durationInFrames={s(2.5)}>
        <Shot at={1.3} from={1.6} to={1.45} dur={s(2.5)} ox={-230} rate={0.45} />
        <Word text="PÓS-GRADUAÇÃO" size={60} top={880} left={120} />
      </Sequence>
      <Sequence name="Leg press" from={s(2.5)} durationInFrames={s(2.6)}>
        <Shot at={2.6} dur={s(2.6)} x={-40} />
        <Word text="TREINAMENTO" size={130} top={720} />
      </Sequence>
      <Sequence name="Terra romeno" from={s(5.1)} durationInFrames={s(2.7)}>
        <Shot at={5.45} dur={s(2.7)} x={40} rate={0.85} />
        <Word text="FEMININO" color={PINK} size={170} top={690} />
      </Sequence>
      <Sequence name="Agachamento close" from={s(7.8)} durationInFrames={s(2.7)}>
        <Shot at={7.9} from={1.3} to={1.08} dur={s(2.7)} />
      </Sequence>
      <Sequence name="Tríptico" from={s(10.5)} durationInFrames={s(2.4)}>
        <Triptych />
      </Sequence>
      <Sequence name="Agachamento orientado" from={s(12.9)} durationInFrames={s(2.6)}>
        <Shot at={12.95} dur={s(2.6)} />
        <Word text="EMAGRECIMENTO" size={120} top={740} />
      </Sequence>
      <Sequence name="Estúdio" from={s(15.5)} durationInFrames={s(2.5)}>
        <Shot at={15.6} dur={s(2.5)} x={-50} rate={0.85} />
        <Word text="ESTÉTICA" size={170} top={690} left={1000} />
      </Sequence>
      <Sequence name="Academia tijolinho" from={s(18.0)} durationInFrames={s(2.6)}>
        <Shot at={18.05} dur={s(2.6)} />
      </Sequence>
      <Sequence name="Pilha de carga" from={s(20.6)} durationInFrames={s(0.4)}>
        <Shot at={20.62} from={1.35} to={1.2} dur={s(0.4)} rate={0.6} />
      </Sequence>
      <Sequence name="Supino halter" from={s(21.0)} durationInFrames={s(2.0)}>
        <Shot at={21.05} dur={s(2.0)} />
        <Word text="PERFORMANCE" color={PINK} size={140} top={720} />
      </Sequence>
      <Sequence name="Tela dividida" from={s(23.0)} durationInFrames={s(2.5)}>
        <Split left={23.5} right={13.8} />
      </Sequence>
      <Sequence name="Turma" from={s(25.5)} durationInFrames={s(0.7)}>
        <Shot at={25.55} from={1.0} to={1.15} dur={s(0.7)} />
      </Sequence>
      <Sequence name="Terra em aula" from={s(26.2)} durationInFrames={s(1.2)}>
        <Shot at={26.25} dur={s(1.2)} />
      </Sequence>
      <Sequence name="Cartela final" from={s(27.4)}>
        <EndCard />
      </Sequence>
      {cuts.map((c, i) => (
        <Sequence key={c} name="Luz" from={s(c) - 2} durationInFrames={14}>
          <LightLeak from={i % 2 === 0 ? "left" : "right"} />
        </Sequence>
      ))}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55))",
        }}
      />
      <Letterbox />
    </AbsoluteFill>
  );
};
