import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, figtree, ORANGE, outfit, snappy } from "./shared";

// Foto do professor Rafael Tonietto com o nome ao lado.
export const ProfessorScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          right: 60,
          bottom: 0,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,90,46,0.45), transparent 65%)",
          opacity: interpolate(frame, [4, 30], [0, 1], clamp),
          scale: interpolate(frame, [4, 40], [0.6, 1.1], { ...clamp, easing: snappy }),
        }}
      />
      <Img
        src={staticFile("rafael.png")}
        style={{
          position: "absolute",
          right: 120,
          bottom: -40,
          height: 1080,
          maxWidth: "none",
          opacity: interpolate(frame, [0, 10], [0, 1], clamp),
          translate: `${interpolate(frame, [0, 24], [320, 0], { ...clamp, easing: snappy })}px 0px`,
          scale: interpolate(frame, [0, 120], [1.04, 1]),
        }}
      />
      <div style={{ position: "absolute", left: 180, top: 380 }}>
        <div
          style={{
            fontFamily: figtree,
            fontWeight: 600,
            fontSize: 44,
            letterSpacing: 12,
            color: ORANGE,
            opacity: interpolate(frame, [16, 26], [0, 1], clamp),
            translate: `0px ${interpolate(frame, [16, 30], [30, 0], { ...clamp, easing: snappy })}px`,
          }}
        >
          PROFESSOR
        </div>
        {["Rafael", "Tonietto"].map((name, i) => (
          <div
            key={name}
            style={{
              fontFamily: outfit,
              fontWeight: 700,
              fontSize: 150,
              lineHeight: 1,
              color: "white",
              clipPath: `inset(0 ${interpolate(frame - 22 - i * 6, [0, 18], [100, 0], { ...clamp, easing: snappy })}% 0 0)`,
              translate: `${interpolate(frame - 22 - i * 6, [0, 18], [-60, 0], { ...clamp, easing: snappy })}px 0px`,
            }}
          >
            {name}
          </div>
        ))}
        <div
          style={{
            marginTop: 30,
            height: 10,
            borderRadius: 5,
            backgroundColor: ORANGE,
            width: interpolate(frame, [36, 56], [0, 320], { ...clamp, easing: snappy }),
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
