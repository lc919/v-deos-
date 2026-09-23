import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Icon, TextLine } from "../AberturaScala";
import { clamp } from "./shared";

// Reaproveita a animação peça a peça da logo Mentoria Scala Fitness.
export const ScalaLogoScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ scale: interpolate(frame, [0, 90], [1.15, 1.25]) }}>
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 90,
          width: 1600,
          height: 900,
          filter: `drop-shadow(0 0 ${interpolate(frame, [36, 50], [0, 24], clamp)}px rgba(255,90,46,0.6))`,
        }}
      >
        <Icon />
        <TextLine top={340} height={100} delay={26} />
        <TextLine top={458} height={100} delay={33} />
      </div>
    </AbsoluteFill>
  );
};
