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
 * Versión pausada: tomas largas, fundidos suaves, sin golpes de zoom.
 * Audio: sonido directo SIN VOCES (separado con Demucs); música suave solo al inicio y al final.
 * Clips (carpeta "1" de Drive): public/assets/arbat/reel1/c04xx.mp4
 * Render: npx remotion render ArbatReelASMR out/arbat/reel-asmr.mp4
 */

export const ASMR_FPS = 30;
const XF = 18; // fundido entre escenas (frames)

const clip = (f: string) => staticFile(`assets/arbat/reel1/${f}.mp4`);
const MUSIC = staticFile("assets/arbat/reel1/musica.mp3");

type Scene = {src: string; from: number; to: number; zoom?: [number, number]; origin?: string};

// Tiempos en segundos dentro de cada clip original.
const SCENES: Scene[] = [
  {src: "c0460", from: 2.0, to: 8.5, zoom: [1.04, 1.1]}, // la bolsa de cerca (hook)
  {src: "c0460", from: 15.5, to: 32.5, zoom: [1.02, 1.08]}, // abrir el empaque y sacar la campechana
  {src: "c0461", from: 0.0, to: 14.8, zoom: [1.06, 1.14], origin: "45% 50%"}, // macro + primer crujido
  {src: "c0463", from: 0.3, to: 10.8, zoom: [1.06, 1.12], origin: "50% 45%"}, // segundo crujido
  {src: "c0464", from: 0.3, to: 10.6, zoom: [1.04, 1.1]}, // tercer crujido
  {src: "c0465", from: 0.0, to: 17.0, zoom: [1.0, 1.05], origin: "50% 40%"}, // cierre: comer, junto al empaque
];

const f = (s: number) => Math.round(s * ASMR_FPS);
const starts: number[] = [];
let acc = 0;
for (const s of SCENES) {
  starts.push(acc);
  acc += f(s.to - s.from) - XF;
}
export const ASMR_FRAMES = acc + XF;

const look: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  filter: "contrast(1.07) saturate(1.14) brightness(1.03)",
};

const SceneClip: React.FC<{s: Scene; first: boolean; last: boolean}> = ({s, first, last}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const [z0, z1] = s.zoom ?? [1, 1.06];
  const scale = interpolate(frame, [0, durationInFrames], [z0, z1]);
  const opacity = first ? 1 : interpolate(frame, [0, XF], [0, 1], {extrapolateRight: "clamp"});
  const vol = (fr: number) => {
    const fin = first ? 1 : interpolate(fr, [0, XF], [0, 1], {extrapolateRight: "clamp"});
    const fout = last ? 1 : interpolate(fr, [durationInFrames - XF, durationInFrames], [1, 0], {extrapolateLeft: "clamp"});
    return fin * fout;
  };
  return (
    <AbsoluteFill style={{opacity}}>
      <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: s.origin ?? "50% 50%"}}>
        <OffthreadVideo src={clip(s.src)} trimBefore={f(s.from)} volume={vol} style={look} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Fade: React.FC<{children: React.ReactNode; inAt?: number; outAt?: number}> = ({children, inAt = 0, outAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - inAt, fps, config: {damping: 18, stiffness: 90}});
  const o = outAt ? interpolate(frame, [outAt - 15, outAt], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) : 1;
  return <AbsoluteFill style={{opacity: s * o, transform: `translateY(${(1 - s) * 18}px)`}}>{children}</AbsoluteFill>;
};

const EndBrand: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 18, stiffness: 80}});
  return (
    <AbsoluteFill style={{opacity: s}}>
      <AbsoluteFill style={{background: "linear-gradient(180deg, rgba(40,12,10,0) 60%, rgba(40,12,10,0.65) 100%)"}} />
      <div style={{position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center", transform: `translateY(${(1 - s) * 24}px)`}}>
        <div style={{width: 210, height: 210, borderRadius: "50%", background: "#FFF6E6", boxShadow: "0 8px 24px rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center"}}>
          <Img src={staticFile("assets/arbat/logo-vino.png")} style={{width: 180, height: 180}} />
        </div>
      </div>
      <StrokeText size={64} stroke={13} style={{left: 40, top: 1530, width: 1000, textAlign: "center"}}>
        Suavemente crujientes.
      </StrokeText>
    </AbsoluteFill>
  );
};

export const ArbatReelASMR: React.FC = () => {
  useFonts();
  const crunchStart = starts[2];
  return (
    <AbsoluteFill style={{background: "#000", fontVariantNumeric: "lining-nums"}}>
      {SCENES.map((s, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={f(s.to - s.from)}>
          <SceneClip s={s} first={i === 0} last={i === SCENES.length - 1} />
        </Sequence>
      ))}

      {/* Música suave al inicio: se apaga antes de abrir el empaque */}
      <Sequence from={0} durationInFrames={f(9)}>
        <Audio src={MUSIC} volume={(fr) => interpolate(fr, [0, 15, f(5), f(9)], [0, 0.22, 0.16, 0], {extrapolateRight: "clamp"})} />
      </Sequence>
      {/* Música suave al final, muy baja bajo el sonido de comer */}
      <Sequence from={ASMR_FRAMES - f(10)} durationInFrames={f(10)}>
        <Audio
          src={MUSIC}
          trimBefore={f(5)}
          volume={(fr) => interpolate(fr, [0, f(3), f(8.5), f(10)], [0, 0.14, 0.14, 0], {extrapolateRight: "clamp"})}
        />
      </Sequence>

      {/* Hook */}
      <Sequence from={0} durationInFrames={f(5)}>
        <Fade inAt={4} outAt={f(5)}>
          <StrokeText size={84} stroke={16} style={{left: 40, top: 230, width: 1000, textAlign: "center"}}>
            No subas el volumen
            <br />
            si tienes hambre 🔊
          </StrokeText>
        </Fade>
      </Sequence>

      {/* Antes del primer crujido */}
      <Sequence from={crunchStart + f(1)} durationInFrames={f(4)}>
        <Fade inAt={0} outAt={f(4)}>
          <StrokeText size={72} stroke={14} style={{left: 40, top: 1380, width: 1000, textAlign: "center"}}>
            Ok… ahora sí, súbele 🎧
          </StrokeText>
        </Fade>
      </Sequence>

      {/* Cierre con marca (últimos ~4.5 s) */}
      <Sequence from={ASMR_FRAMES - f(4.5)} durationInFrames={f(4.5)}>
        <EndBrand />
      </Sequence>
    </AbsoluteFill>
  );
};
