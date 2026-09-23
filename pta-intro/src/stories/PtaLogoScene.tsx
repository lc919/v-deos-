import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp, outfit, overshoot, snappy } from "./shared";

// Logo da Personal Trainer Academy redesenhada em vetor.
export const PtaLogoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cut = interpolate(frame, [14, 30], [0, 1], { ...clamp, easing: snappy });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 56,
      }}
    >
      <svg
        viewBox="-10 -10 210 240"
        width={300}
        height={343}
        style={{
          scale: interpolate(frame, [0, 16], [0, 1], { ...clamp, easing: overshoot }),
          rotate: interpolate(frame, [0, 16], ["-120deg", "0deg"], { ...clamp, easing: snappy }),
        }}
      >
        <defs>
          <mask id="pta-cuts">
            <polygon
              points="95,0 190,55 190,165 95,220 0,165 0,55"
              fill="white"
              stroke="white"
              strokeWidth={14}
              strokeLinejoin="round"
            />
            <g
              stroke="black"
              strokeWidth={6}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - cut}
            >
              <line x1={95} y1={-10} x2={95} y2={230} pathLength={1} />
              <line x1={-10} y1={57} x2={200} y2={57} pathLength={1} />
              <line x1={-4} y1={166} x2={95} y2={57} pathLength={1} />
              <line x1={194} y1={166} x2={95} y2={57} pathLength={1} />
            </g>
          </mask>
        </defs>
        <rect x={-10} y={-10} width={210} height={240} fill="white" mask="url(#pta-cuts)" />
      </svg>
      <div
        style={{
          fontFamily: outfit,
          fontWeight: 500,
          fontSize: 112,
          lineHeight: 0.95,
          color: "white",
          letterSpacing: -1,
        }}
      >
        {["personal trainer", "academy"].map((line, i) => (
          <div
            key={line}
            style={{
              clipPath: `inset(0 ${interpolate(frame - 18 - i * 6, [0, 18], [100, 0], { ...clamp, easing: snappy })}% 0 0)`,
              translate: `${interpolate(frame - 18 - i * 6, [0, 18], [-50, 0], { ...clamp, easing: snappy })}px 0px`,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
