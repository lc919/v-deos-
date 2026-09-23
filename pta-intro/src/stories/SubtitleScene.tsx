import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp, figtree, snappy } from "./shared";

// "stories semanal" com barras de progresso de stories no topo.
export const SubtitleScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 160,
          right: 160,
          display: "flex",
          gap: 14,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: "rgba(255,255,255,0.25)",
              overflow: "hidden",
              opacity: interpolate(frame, [0, 8], [0, 1], clamp),
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "white",
                width: `${interpolate(frame - 4 - i * 8, [0, 8], [0, 100], clamp)}%`,
              }}
            />
          </div>
        ))}
      </div>
      <div
        style={{
          fontFamily: figtree,
          fontWeight: 300,
          fontSize: 170,
          letterSpacing: 14,
          color: "rgba(255,255,255,0.9)",
          display: "flex",
          gap: 60,
        }}
      >
        {["stories", "semanal"].map((word, i) => (
          <div
            key={word}
            style={{
              opacity: interpolate(frame - 6 - i * 10, [0, 10], [0, 1], clamp),
              translate: `${interpolate(frame - 6 - i * 10, [0, 18], [i === 0 ? -160 : 160, 0], { ...clamp, easing: snappy })}px 0px`,
              letterSpacing: interpolate(frame - 6 - i * 10, [0, 24], [40, 14], { ...clamp, easing: snappy }),
            }}
          >
            {word}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
