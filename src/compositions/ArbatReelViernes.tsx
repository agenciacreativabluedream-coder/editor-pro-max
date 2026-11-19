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
import {C, Sparkle, StrokeText, Tape, useFonts} from "./ArbatCarrusel";

/**
 * Arbat Panadería — Reel "El antojo no espera al fin de semana" (Viernes 13/11/2026)
 * Microhistoria de pausa en el trabajo. 1080x1920 · 30 fps · ~19 s.
 * Un solo plano continuo (DJI) editado en 5 momentos con fundidos cortos. Sin audio original:
 * voz en off profunda con IA (ElevenLabs, voz "Marco") que lee los textos + música lo-fi jazz (ElevenLabs Music).
 * Clip (carpeta "7" de Drive): public/assets/arbat/reel7/c0519.mp4
 * Render: npx remotion render ArbatReelViernes out/arbat/reel-viernes.mp4
 */

export const VIERNES_FPS = 30;
const f = (s: number) => Math.round(s * VIERNES_FPS);
const XF = 8;
const SRC = staticFile("assets/arbat/reel7/c0519.mp4");

type Seg = {from: number; to: number; rate?: number; zoom?: [number, number]};
const SEGS: Seg[] = [
  {from: 0.8, to: 3.6, zoom: [1.04, 1.08]}, // trabajando en la laptop
  {from: 4.9, to: 7.2, zoom: [1.04, 1.06]}, // cierra la laptop
  {from: 8.4, to: 14.6, rate: 1.5, zoom: [1.04, 1.08]}, // toma la campechana
  {from: 15.2, to: 21.2, rate: 1.2, zoom: [1.06, 1.1]}, // la sopea en el café
  {from: 28.0, to: 33.0, zoom: [1.0, 1.05]}, // final: café + campechanas
];
const durOf = (s: Seg) => Math.round(f(s.to - s.from) / (s.rate ?? 1));
const STARTS: number[] = [];
let acc = 0;
SEGS.forEach((s, i) => {
  STARTS.push(acc);
  acc += durOf(s) - (i < SEGS.length - 1 ? XF : 0);
});
export const VIERNES_FRAMES = acc;

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

/** Foto tipo polaroid del empaque, pegada con cinta junto al café. */
const PackPolaroid: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 110}});
  return (
    <div
      style={{
        position: "absolute",
        left: 46,
        top: 470,
        width: 290,
        height: 370,
        background: "#FFFDF8",
        padding: "16px 16px 64px",
        boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
        transform: `rotate(${-8 + (1 - s) * -10}deg) scale(${0.7 + 0.3 * s})`,
        opacity: Math.min(1, s * 1.4),
      }}
    >
      <div style={{width: "100%", height: "100%", overflow: "hidden"}}>
        <Img src={staticFile("assets/arbat/bolsa-5.jpg")} style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%", transform: "scale(1.75)", transformOrigin: "52% 52%"}} />
      </div>
      <div style={{position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontFamily: "'Grandstander', sans-serif", fontWeight: 800, fontSize: 30, color: C.vino}}>
        viernes 4 pm ☕
      </div>
      <Tape x={75} y={-22} w={140} rot={-6} />
    </div>
  );
};

const DIP_TEXT_AT = STARTS[3] + 12;
const QUESTION_AT = STARTS[SEGS.length - 1] + 10 + 14;
const VO = [
  {src: "vo1.wav", at: 6, dur: 5.08}, // "Viernes, cuatro de la tarde. Tu café necesita compañía."
  {src: "vo2.wav", at: DIP_TEXT_AT, dur: 2.46}, // "El antojo no revisa el calendario."
  {src: "vo3.wav", at: QUESTION_AT, dur: 2.0}, // "¿A qué hora te llega el antojo?"
];

export const ArbatReelViernes: React.FC = () => {
  useFonts();
  const last = STARTS[SEGS.length - 1];
  const dipStart = STARTS[3];
  return (
    <AbsoluteFill style={{background: "#000", fontVariantNumeric: "lining-nums"}}>
      {SEGS.map((s, i) => (
        <Sequence key={i} from={STARTS[i]} durationInFrames={durOf(s)}>
          <SegClip s={s} first={i === 0} />
        </Sequence>
      ))}

      {/* Música lo-fi de fondo, baja cuando habla la voz */}
      <Audio
        src={staticFile("assets/arbat/reel7/musica-lofi.mp3")}
        volume={(fr) => {
          const env = interpolate(fr, [0, 12, VIERNES_FRAMES - 36, VIERNES_FRAMES], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
          const talking = VO.some((v) => fr >= v.at - 6 && fr <= v.at + f(v.dur) + 6);
          return env * (talking ? 0.13 : 0.3);
        }}
      />
      {/* Voz en off (IA, ElevenLabs) */}
      {VO.map((v) => (
        <Sequence key={v.src} from={v.at} durationInFrames={f(v.dur) + 4}>
          <Audio src={staticFile(`assets/arbat/reel7/${v.src}`)} volume={1} />
        </Sequence>
      ))}

      {/* Hook */}
      <Sequence from={0} durationInFrames={6 + f(5.08) + 8}>
        <Fade at={2} out={6 + f(5.08) + 8}>
          <StrokeText size={80} stroke={16} style={{left: 50, top: 230, width: 980, textAlign: "center"}}>
            Viernes, 4 de la tarde.
          </StrokeText>
          <StrokeText size={66} stroke={14} style={{left: 50, top: 340, width: 980, textAlign: "center"}}>
            Tu café necesita compañía. ☕
          </StrokeText>
        </Fade>
      </Sequence>

      {/* Mientras sopea */}
      <Sequence from={dipStart + 12} durationInFrames={durOf(SEGS[3]) - 12}>
        <Fade at={0} out={durOf(SEGS[3]) - 12}>
          <StrokeText size={70} stroke={14} style={{left: 50, top: 240, width: 980, textAlign: "center"}}>
            El antojo no revisa
            <br />
            el calendario.
          </StrokeText>
        </Fade>
      </Sequence>

      {/* Final: empaque junto al café + pregunta */}
      <Sequence from={last + 10} durationInFrames={durOf(SEGS[4]) - 10}>
        <PackPolaroid />
        <Sparkle x={360} y={470} s={52} />
        <Fade at={14}>
          <StrokeText size={70} stroke={15} style={{left: 40, top: 150, width: 1000, textAlign: "center"}}>
            ¿A qué hora te llega el antojo?
          </StrokeText>
        </Fade>
        <Fade at={22}>
          <div style={{position: "absolute", left: 0, right: 0, top: 1560, display: "flex", justifyContent: "center"}}>
            <div style={{width: 140, height: 140, borderRadius: "50%", background: "#FFF6E6", boxShadow: "0 8px 22px rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center"}}>
              <Img src={staticFile("assets/arbat/logo-vino.png")} style={{width: 120, height: 120}} />
            </div>
          </div>
        </Fade>
      </Sequence>
    </AbsoluteFill>
  );
};
