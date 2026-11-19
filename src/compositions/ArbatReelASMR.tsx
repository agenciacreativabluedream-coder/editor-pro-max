import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {StrokeText, useFonts} from "./ArbatCarrusel";

/**
 * Arbat Panadería — Reel ASMR "No subas el volumen si tienes hambre 🔊" (Martes 10/11/2026)
 * 1080x1920 · 30 fps · ~15 s. Sonido directo; música suave solo al inicio y al final, silencio en el crujido.
 * Clips (carpeta "1" de Drive, audio realzado): public/assets/arbat/reel1/c04xx.mp4
 * Música: public/assets/arbat/reel1/musica.mp3 (ElevenLabs Music)
 * Render: npx remotion render ArbatReelASMR out/arbat/reel-asmr.mp4
 */

export const ASMR_FPS = 30;
export const ASMR_FRAMES = 447;

const clip = (f: string) => staticFile(`assets/arbat/reel1/${f}.mp4`);
const MUSIC = staticFile("assets/arbat/reel1/musica.mp3");

const look: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  filter: "contrast(1.08) saturate(1.15) brightness(1.03)",
};

const Pop: React.FC<{children: React.ReactNode; delay?: number; out?: number}> = ({children, delay = 0, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 180}});
  const o = out ? interpolate(frame, [out - 6, out], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) : 1;
  return <AbsoluteFill style={{opacity: Math.min(1, s * 1.4) * o, transform: `scale(${0.85 + 0.15 * s})`}}>{children}</AbsoluteFill>;
};

/** Clip con zoom lento (y un "golpe" opcional en el frame del crujido). */
const Shot: React.FC<{src: string; trim: number; from?: number; to?: number; punchAt?: number; origin?: string}> = ({
  src,
  trim,
  from = 1,
  to = 1.06,
  punchAt,
  origin = "50% 50%",
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  let scale = interpolate(frame, [0, durationInFrames], [from, to], {extrapolateRight: "clamp"});
  if (punchAt !== undefined) {
    scale += interpolate(frame, [punchAt, punchAt + 3, punchAt + 12], [0, 0.07, 0.02], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: origin}}>
      <OffthreadVideo src={src} trimBefore={trim} style={look} />
    </AbsoluteFill>
  );
};

const EndBrand: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 6, fps, config: {damping: 14, stiffness: 120}});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: "linear-gradient(180deg, rgba(40,12,10,0) 62%, rgba(40,12,10,0.7) 100%)", opacity: s}} />
      <div style={{position: "absolute", left: 0, right: 0, top: 1300, display: "flex", flexDirection: "column", alignItems: "center", opacity: s, transform: `translateY(${(1 - s) * 30}px)`}}>
        <div style={{width: 210, height: 210, borderRadius: "50%", background: "#FFF6E6", boxShadow: "0 8px 24px rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center"}}>
          <Img src={staticFile("assets/arbat/logo-vino.png")} style={{width: 180, height: 180}} />
        </div>
      </div>
      <Pop delay={10}>
        <StrokeText size={64} stroke={13} style={{left: 40, top: 1530, width: 1000, textAlign: "center"}}>
          Suavemente crujientes.
        </StrokeText>
      </Pop>
    </AbsoluteFill>
  );
};

export const ArbatReelASMR: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: "#000", fontVariantNumeric: "lining-nums"}}>
      {/* Música suave: inicio (se apaga antes del crujido) */}
      <Sequence from={0} durationInFrames={200}>
        <Audio src={MUSIC} volume={(f) => interpolate(f, [0, 8, 120, 196], [0, 0.32, 0.22, 0], {extrapolateRight: "clamp"})} />
      </Sequence>
      {/* Música suave: final */}
      <Sequence from={372} durationInFrames={75}>
        <Audio src={MUSIC} trimBefore={300} volume={(f) => interpolate(f, [0, 18, 62, 75], [0, 0.3, 0.3, 0], {extrapolateRight: "clamp"})} />
      </Sequence>

      {/* Toma 1 · Hook: la bolsa de cerca (crujido del plástico) */}
      <Sequence from={0} durationInFrames={60}>
        <Shot src={clip("c0460")} trim={102} from={1.05} to={1.12} />
        <Pop delay={2}>
          <StrokeText size={84} stroke={16} style={{left: 40, top: 230, width: 1000, textAlign: "center"}}>
            No subas el volumen
            <br />
            si tienes hambre 🔊
          </StrokeText>
        </Pop>
      </Sequence>

      {/* Toma 1b · Abrir la bolsa (vista cenital) */}
      <Sequence from={60} durationInFrames={78}>
        <Shot src={clip("c0459")} trim={330} from={1.02} to={1.1} />
      </Sequence>

      {/* Toma 2 · Macro: brillo del azúcar */}
      <Sequence from={138} durationInFrames={60}>
        <Shot src={clip("c0461")} trim={0} from={1.05} to={1.3} origin="45% 50%" />
        <Pop delay={22}>
          <StrokeText size={72} stroke={14} style={{left: 40, top: 1380, width: 1000, textAlign: "center"}}>
            Ok… ahora sí, súbele 🎧
          </StrokeText>
        </Pop>
      </Sequence>

      {/* Toma 3 · EL CRUJIDO (sin música) */}
      <Sequence from={198} durationInFrames={108}>
        <Shot src={clip("c0463")} trim={90} from={1.08} to={1.16} punchAt={62} origin="50% 45%" />
      </Sequence>
      <Sequence from={306} durationInFrames={66}>
        <Shot src={clip("c0461")} trim={228} from={1.12} to={1.2} punchAt={9} origin="55% 55%" />
      </Sequence>

      {/* Toma 4 · Cierre: partida junto al empaque + logo */}
      <Sequence from={372} durationInFrames={75}>
        <Shot src={clip("c0465")} trim={66} from={1.0} to={1.05} origin="50% 40%" />
        <EndBrand />
      </Sequence>
    </AbsoluteFill>
  );
};
