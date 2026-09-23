import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  Easing,
  Interactive,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";

type Props = {};

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  return {};
};

export const MyComposition = () => {
  return (
    <Composition
      id="PTA"
      component={MyComponent}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      calculateMetadata={calculateMetadata}
    />
  );
};

const stars = new Array(140).fill(true).map((_, i) => ({
  x: random(`x-${i}`) * 100,
  y: random(`y-${i}`) * 100,
  size: 1 + random(`s-${i}`) * 2.5,
  phase: random(`p-${i}`) * Math.PI * 2,
}));

const Starfield: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {stars.map((star, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: "50%",
            backgroundColor: "white",
            boxShadow: "0 0 6px rgba(180, 210, 255, 0.9)",
            opacity: 0.35 + 0.65 * Math.abs(Math.sin(frame / 18 + star.phase)),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Letter: React.FC<{ letter: string; delay: number }> = ({
  letter,
  delay,
}) => {
  const frame = useCurrentFrame() - delay;

  return (
    <div
      style={{
        fontFamily: "Helvetica Neue, Arial, sans-serif",
        fontSize: 320,
        fontWeight: 900,
        color: "white",
        lineHeight: 1,
        textShadow:
          "0 0 30px rgba(120, 180, 255, 0.9), 0 0 80px rgba(60, 120, 255, 0.7)",
        opacity: interpolate(frame, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        filter: `blur(${interpolate(frame, [0, 18], [24, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}px)`,
        translate: interpolate(frame, [0, 24], ["0px 140px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        scale: interpolate(frame, [0, 24], [1.6, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      {letter}
    </div>
  );
};

export const MyComponent: React.FC<Props> = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: "#020a24", overflow: "hidden" }}>
      <Interactive.Div
        name="Nebula"
        style={{
          position: "absolute",
          inset: -200,
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(40, 110, 255, 0.65), transparent 55%), radial-gradient(ellipse at 70% 60%, rgba(110, 60, 230, 0.55), transparent 50%), radial-gradient(ellipse at 55% 25%, rgba(0, 190, 255, 0.4), transparent 45%), radial-gradient(ellipse at 20% 80%, rgba(20, 60, 180, 0.6), transparent 50%)",
          filter: "blur(40px)",
          rotate: interpolate(frame, [0, 150], ["0deg", "8deg"]),
          scale: interpolate(frame, [0, 150], [1, 1.12]),
        }}
      />
      <Starfield />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          gap: 60,
        }}
      >
        <Letter letter="P" delay={10} />
        <Letter letter="T" delay={35} />
        <Letter letter="A" delay={60} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
