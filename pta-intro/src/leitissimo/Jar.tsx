import React from "react";
import { Img, staticFile } from "remotion";

// Pote Leitíssimo desenhado em SVG, com a arte (tampa, rótulo, marca e vaca)
// recortada da foto do produto. O giro (yaw) desliza o rótulo pela superfície
// cilíndrica e gira a tampa, enquanto a luz fica parada — dá a leitura de 3D.

export type Sabor = "integral" | "desnatado" | "zero";

export const PRODUTOS: Record<
  Sabor,
  {
    tampa: string;
    rotulo: string;
    rotuloW: number;
    rotuloAspect: number;
    rim: [string, string];
    cor: string;
  }
> = {
  integral: {
    tampa: "leitissimo/tampa-integral.png",
    rotulo: "leitissimo/rotulo-integral.png",
    rotuloW: 320,
    rotuloAspect: 504 / 168,
    rim: ["#121a26", "#2c3a52"],
    cor: "#1F2B45",
  },
  desnatado: {
    tampa: "leitissimo/tampa-desnatado.png",
    rotulo: "leitissimo/rotulo-desnatado.png",
    rotuloW: 395,
    rotuloAspect: 624 / 195,
    rim: ["#b3950f", "#ecd247"],
    cor: "#F2D43A",
  },
  zero: {
    tampa: "leitissimo/tampa-zero.png",
    rotulo: "leitissimo/rotulo-zero.png",
    rotuloW: 320,
    rotuloAspect: 504 / 228,
    rim: ["#8e0a36", "#d8195b"],
    cor: "#D3134F",
  },
};

export const JAR_W = 600;
export const JAR_H = 760;

const BODY =
  "M 70 220 C 20 270, 10 360, 14 440 C 18 560, 34 652, 72 702 C 150 758, 450 758, 528 702 C 566 652, 582 560, 586 440 C 590 360, 580 270, 530 220 Z";
const RIM =
  "M 15 120 L 15 152 A 285 112 0 0 0 585 152 L 585 120 A 285 112 0 0 1 15 120 Z";

const LID_TOP = 8;
const LID_H = 224;
const LID_W = 570;

export const Jar: React.FC<{
  sabor: Sabor;
  yaw: number; // graus
  style?: React.CSSProperties;
}> = ({ sabor, yaw, style }) => {
  const p = PRODUTOS[sabor];
  const rad = (yaw * Math.PI) / 180;
  const shift = Math.sin(rad) * 255;
  const squeeze = Math.cos(rad);
  const id = `jar-${sabor}`;

  return (
    <div
      style={{
        position: "absolute",
        width: JAR_W,
        height: JAR_H,
        ...style,
      }}
    >
      {/* Corpo */}
      <svg width={JAR_W} height={JAR_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id={`${id}-body`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#d7dce0" />
            <stop offset="0.12" stopColor="#f3f4f4" />
            <stop offset="0.34" stopColor="#ffffff" />
            <stop offset="0.62" stopColor="#fafaf8" />
            <stop offset="0.88" stopColor="#e9ebed" />
            <stop offset="1" stopColor="#c3cad1" />
          </linearGradient>
          <linearGradient id={`${id}-glass`} x1="0" x2="1">
            <stop offset="0" stopColor="#9aa5ad" stopOpacity="0.9" />
            <stop offset="0.35" stopColor="#eef3f5" stopOpacity="0.95" />
            <stop offset="0.7" stopColor="#c9d2d8" stopOpacity="0.9" />
            <stop offset="1" stopColor="#8d99a2" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <ellipse cx={300} cy={728} rx={250} ry={34} fill="rgba(0,40,70,0.35)" style={{ filter: "blur(14px)" }} />
        <path d={BODY} fill={`url(#${id}-body)`} />
      </svg>

      {/* Rótulo impresso: desliza com o giro */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `path("${BODY}")`,
          mixBlendMode: "multiply",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateX(${shift}px) scaleX(${squeeze})`,
            transformOrigin: "300px 0",
          }}
        >
          <Img
            src={staticFile(p.rotulo)}
            style={{
              position: "absolute",
              width: p.rotuloW,
              left: 300 - p.rotuloW / 2,
              top: 350 - p.rotuloW / p.rotuloAspect / 2,
            }}
          />
          <Img
            src={staticFile("leitissimo/marca.png")}
            style={{ position: "absolute", width: 392, left: 300 - 196, top: 475 - 58 }}
          />
          <Img
            src={staticFile("leitissimo/vaca.png")}
            style={{ position: "absolute", width: 330, left: 340 - 165, top: 626 - 91 }}
          />
        </div>
      </div>

      {/* Luz e sombra por cima do rótulo */}
      <svg width={JAR_W} height={JAR_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id={`${id}-shade`} x1="0" x2="1">
            <stop offset="0" stopColor="#3a5268" stopOpacity="0.26" />
            <stop offset="0.14" stopColor="#3a5268" stopOpacity="0" />
            <stop offset="0.27" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.31" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.36" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.8" stopColor="#3a5268" stopOpacity="0" />
            <stop offset="1" stopColor="#3a5268" stopOpacity="0.34" />
          </linearGradient>
          <linearGradient id={`${id}-vshade`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0.29" stopColor="#1d2c3a" stopOpacity="0.14" />
            <stop offset="0.37" stopColor="#1d2c3a" stopOpacity="0" />
            <stop offset="0.88" stopColor="#1d2c3a" stopOpacity="0" />
            <stop offset="1" stopColor="#1d2c3a" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id={`${id}-rim`} x1="0" x2="1">
            <stop offset="0" stopColor={p.rim[0]} />
            <stop offset="0.35" stopColor={p.rim[1]} />
            <stop offset="0.7" stopColor={p.rim[1]} />
            <stop offset="1" stopColor={p.rim[0]} />
          </linearGradient>
        </defs>
        <path d={BODY} fill={`url(#${id}-shade)`} />
        <path d={BODY} fill={`url(#${id}-vshade)`} />
        {/* Anel de vidro entre tampa e pote */}
        <ellipse cx={300} cy={246} rx={248} ry={34} fill={`url(#${id}-glass)`} />
        <path d={RIM} fill={`url(#${id}-rim)`} />
      </svg>

      {/* Face da tampa: disco que gira, achatado em perspectiva */}
      <div
        style={{
          position: "absolute",
          left: 15,
          top: LID_TOP,
          width: LID_W,
          height: LID_H,
          borderRadius: "50%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: LID_W,
            height: LID_W,
            transform: `scaleY(${LID_H / LID_W})`,
            transformOrigin: "0 0",
          }}
        >
          <Img
            src={staticFile(p.tampa)}
            style={{
              width: LID_W,
              height: LID_W,
              transform: `rotate(${-yaw}deg)`,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 32% 28%, rgba(255,255,255,0.28), rgba(255,255,255,0) 55%), radial-gradient(ellipse at 70% 90%, rgba(0,0,0,0.18), rgba(0,0,0,0) 60%)",
          }}
        />
      </div>
    </div>
  );
};
