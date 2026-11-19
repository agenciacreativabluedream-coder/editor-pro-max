import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {C, HAND, Heart, Rays, Sparkle, Squiggle, StrokeText, TornLabel, pro, useFonts} from "./ArbatCarrusel";

/**
 * Arbat Panadería — Reel "El antojo no espera al fin de semana" (Viernes 13/11/2026)
 * Microhistoria de pausa en el trabajo. 1080x1920 · 30 fps · ~19.5 s · SIN AUDIO.
 * Un solo plano continuo (DJI) editado en 5 momentos con fundidos cortos; el video se desvanece
 * a una tarjeta final con estilo Arbat y la pregunta en grande.
 * Clip (carpeta "7" de Drive): public/assets/arbat/reel7/c0519.mp4
 * Render: npx remotion render ArbatReelViernes out/arbat/reel-viernes.mp4 --muted
 */

export const VIERNES_FPS = 30;
const f = (s: number) => Math.round(s * VIERNES_FPS);
const XF = 8; // fundido entre momentos
const END_XF = 18; // desvanecido hacia la tarjeta final
const END_DUR = f(3.4); // duración de la tarjeta final
const SRC = staticFile("assets/arbat/reel7/c0519.mp4");

type Seg = {from: number; to: number; rate?: number; zoom?: [number, number]};
const SEGS: Seg[] = [
  {from: 0.8, to: 3.6, zoom: [1.04, 1.08]}, // trabajando en la laptop
  {from: 4.9, to: 7.2, zoom: [1.04, 1.06]}, // cierra la laptop
  {from: 8.4, to: 14.6, rate: 1.5, zoom: [1.04, 1.08]}, // toma la campechana
  {from: 15.2, to: 21.2, rate: 1.2, zoom: [1.06, 1.1]}, // la sopea en el café
  {from: 28.0, to: 31.8, zoom: [1.0, 1.05]}, // café + campechanas
];
const durOf = (s: Seg) => Math.round(f(s.to - s.from) / (s.rate ?? 1));
const STARTS: number[] = [];
let acc = 0;
SEGS.forEach((s, i) => {
  STARTS.push(acc);
  acc += durOf(s) - (i < SEGS.length - 1 ? XF : 0);
});
const END_AT = acc - END_XF; // la tarjeta entra encima de los últimos frames del video
export const VIERNES_FRAMES = END_AT + END_DUR;

const look: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  filter: "contrast(1.06) saturate(1.12) brightness(1.03) sepia(0.06)",
};

const SegClip: React.FC<{s: Seg; first: boolean}> = ({s, first}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const [z0, z1] = s.zoom ?? [1, 1.05];
  const scale = interpolate(frame, [0, durationInFrames], [z0, z1]);
  const opacity = first ? 1 : interpolate(frame, [0, XF], [0, 1], {extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{opacity}}>
      <AbsoluteFill style={{transform: `scale(${scale})`}}>
        <OffthreadVideo src={SRC} trimBefore={f(s.from)} playbackRate={s.rate ?? 1} muted style={look} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Fade: React.FC<{children: React.ReactNode; at?: number; out?: number}> = ({children, at = 0, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 16, stiffness: 120}});
  const o = out ? interpolate(frame, [out - 10, out], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) : 1;
  return <AbsoluteFill style={{opacity: s * o, transform: `translateY(${(1 - s) * 20}px)`}}>{children}</AbsoluteFill>;
};

/** Tarjeta final: papel Arbat, etiqueta rasgada, pregunta grande, doodles y logo. */
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bg = interpolate(frame, [0, END_XF], [0, 1], {extrapolateRight: "clamp"});
  const q = spring({frame: frame - END_XF + 4, fps, config: {damping: 13, stiffness: 110}});
  const logo = spring({frame: frame - END_XF - 14, fps, config: {damping: 14, stiffness: 100}});
  return (
    <AbsoluteFill style={{opacity: bg}}>
      <AbsoluteFill style={{background: C.papel}}>
        <Img src={pro("papel.jpg")} style={{width: "100%", height: "100%", objectFit: "cover"}} />
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: q, transform: `translateY(${(1 - q) * 30}px)`}}>
        <TornLabel text="Viernes · 4:00 pm ☕" x={180} y={540} w={720} h={116} size={54} seed={23} rot={-2} />
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 60,
            top: 720,
            textAlign: "center",
            fontFamily: HAND,
            fontWeight: 800,
            fontSize: 142,
            lineHeight: 1.02,
            color: C.vino,
            textShadow: "0 2px 0 rgba(255,255,255,0.35)",
          }}
        >
          ¿A qué hora
          <br />
          te llega el
          <br />
          antojo?
        </div>
        <Squiggle x={320} y={1175} w={440} />
        <Sparkle x={110} y={780} s={66} />
        <Sparkle x={975} y={1090} s={52} rot={18} />
        <Rays x={895} y={630} rot={14} />
        <Heart x={140} y={1190} s={72} rot={-14} />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1300,
          display: "flex",
          justifyContent: "center",
          opacity: logo,
          transform: `scale(${0.85 + 0.15 * logo})`,
        }}
      >
        <Img src={staticFile("assets/arbat/logo-vino.png")} style={{width: 240, height: 240}} />
      </div>
    </AbsoluteFill>
  );
};

export const ArbatReelViernes: React.FC = () => {
  useFonts();
  const dipStart = STARTS[3];
  return (
    <AbsoluteFill style={{background: "#000", fontVariantNumeric: "lining-nums"}}>
      {SEGS.map((s, i) => (
        <Sequence key={i} from={STARTS[i]} durationInFrames={durOf(s)}>
          <SegClip s={s} first={i === 0} />
        </Sequence>
      ))}

      {/* Hook */}
      <Sequence from={0} durationInFrames={f(4.4)}>
        <Fade at={2} out={f(4.4)}>
          <StrokeText size={80} stroke={16} style={{left: 50, top: 230, width: 980, textAlign: "center"}}>
            Viernes, 4 de la tarde.
          </StrokeText>
          <StrokeText size={66} stroke={14} style={{left: 50, top: 340, width: 980, textAlign: "center"}}>
            Tu café necesita compañía. ☕
          </StrokeText>
        </Fade>
      </Sequence>

      {/* Respuesta al hook mientras la sopea en el café */}
      <Sequence from={dipStart + 10} durationInFrames={durOf(SEGS[3]) - 10}>
        <Fade at={0} out={durOf(SEGS[3]) - 10}>
          <StrokeText size={72} stroke={15} style={{left: 50, top: 230, width: 980, textAlign: "center"}}>
            Y no hay mejor compañía
            <br />
            que una campechana. ✨
          </StrokeText>
        </Fade>
      </Sequence>

      {/* Desvanecido a la tarjeta final con la pregunta */}
      <Sequence from={END_AT} durationInFrames={END_DUR}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};
