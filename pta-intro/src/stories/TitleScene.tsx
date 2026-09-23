import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp, figtree, ORANGE, snappy } from "./shared";

// "Estrutura de" entrando letra por letra.
export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const letters = "Estrutura de".split("");

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          fontFamily: figtree,
          fontWeight: 600,
          fontSize: 260,
          letterSpacing: -6,
          color: ORANGE,
          display: "flex",
          whiteSpace: "pre",
          scale: interpolate(frame, [0, 80], [1, 1.06]),
        }}
      >
        {letters.map((l, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(frame - i * 2, [0, 8], [0, 1], clamp),
              translate: `0px ${interpolate(frame - i * 2, [0, 14], [120, 0], { ...clamp, easing: snappy })}px`,
              filter: `blur(${interpolate(frame - i * 2, [0, 10], [12, 0], clamp)}px)`,
            }}
          >
            {l}
          </span>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          top: 720,
          height: 10,
          borderRadius: 5,
          backgroundColor: ORANGE,
          width: interpolate(frame, [24, 44], [0, 900], { ...clamp, easing: snappy }),
        }}
      />
    </AbsoluteFill>
  );
};
