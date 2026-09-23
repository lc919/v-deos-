import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { NAVY } from "./shared";

// Fundo da thumb: azul-marinho com "cortina" vertical e brilhos laranja.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(0,0,0,0.12) 110px, rgba(255,255,255,0.025) 220px)",
        }}
      />
      <AbsoluteFill
        style={{
          inset: -200,
          background:
            "radial-gradient(ellipse at 10% 10%, rgba(255,90,46,0.95), rgba(255,90,46,0.35) 25%, transparent 50%)",
          translate: `${interpolate(frame, [0, 400], [-60, 40])}px ${interpolate(frame, [0, 400], [-40, 20])}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(0deg, rgba(255,90,46,0.95) 0%, rgba(255,90,46,0.35) 12%, transparent 30%)",
          opacity: interpolate(frame, [0, 60, 200, 400], [0.5, 0.9, 0.7, 1]),
        }}
      />
    </AbsoluteFill>
  );
};
