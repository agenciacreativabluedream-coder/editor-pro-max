import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {C, HAND, PaperNote, StrokeText, useFonts} from "./ArbatCarrusel";

/**
 * Arbat Panadería — Reel "POV: se arregla en edición" (Jueves 12/11/2026)
 * Réplica de la estructura del reel de referencia (DV4cvRKCe0p) con campechanas.
 * Al final: transición de "interferencia" → bloopers en blanco y negro separados por un beep.
 * 1080x1920 · 30 fps. Diálogo original + jingle comercial (ElevenLabs) durante el "comercial".
 * Clips (carpeta "10" de Drive): public/assets/arbat/reel10/
 * Render: npx remotion render ArbatReelEdicion out/arbat/reel-edicion.mp4
 */

export const EDICION_FPS = 30;
const A = (p: string) => staticFile(`assets/arbat/reel10/${p}`);
const f = (s: number) => Math.round(s * EDICION_FPS);

const look: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  filter: "contrast(1.05) saturate(1.1) brightness(1.02)",
};
const bw: React.CSSProperties = {...look, filter: "grayscale(1) contrast(1.18) brightness(1.04)"};

type Shot = {src: string; from: number; to: number; blooper?: boolean};
const SHOTS = {
  bts: {src: "IMG_2120", from: 1.7, to: 9.0},
  presenta: {src: "IMG_2121", from: 2.1, to: 9.5},
  b1: {src: "IMG_2122", from: 1.2, to: 1.9}, // ella abre la boca
  b2: {src: "IMG_2124", from: 3.2, to: 4.6}, // él muerde
  b3: {src: "IMG_2123", from: 2.4, to: 4.1}, // ella: "¡Mmm!"
  b4: {src: "IMG_2122", from: 6.6, to: 7.3},
  b5: {src: "IMG_2124", from: 7.7, to: 9.0},
  b6: {src: "IMG_2123", from: 5.2, to: 6.8},
  cierre: {src: "IMG_2122", from: 4.0, to: 6.5}, // "El sabor del pueblo hasta tu casa"
  blooper1: {src: "IMG_2121", from: 12.2, to: 15.0, blooper: true}, // carcajada
  blooper2: {src: "IMG_2124_blooper", from: 4.2, to: 11.1, blooper: true}, // "Yo no quiero, pero me están obligando"
} satisfies Record<string, Shot>;
type Key = keyof typeof SHOTS;
const ORDER: Key[] = ["bts", "presenta", "b1", "b2", "b3", "b4", "b5", "b6", "cierre", "blooper1", "blooper2"];

const BEEP_F = 12; // tarjeta de barras + beep entre bloopers
const START = {} as Record<Key, number>;
let acc = 0;
for (const k of ORDER) {
  if (k === "blooper2") acc += BEEP_F;
  START[k] = acc;
  acc += f(SHOTS[k].to - SHOTS[k].from);
}
export const EDICION_FRAMES = acc;
const BEEP_AT = START.blooper2 - BEEP_F;

const Clip: React.FC<{k: Key}> = ({k}) => {
  const s: Shot = SHOTS[k];
  return (
    <Sequence from={START[k]} durationInFrames={f(s.to - s.from)}>
      <OffthreadVideo src={A(`${s.src}.mp4`)} trimBefore={f(s.from)} style={s.blooper ? bw : look} />
      {s.blooper ? <Grain /> : null}
    </Sequence>
  );
};

/** Grano sutil de película para los bloopers. */
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: 0.16, mixBlendMode: "overlay", pointerEvents: "none"}}>
      <svg width="100%" height="100%">
        <filter id={`g${frame}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 50} />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Interferencia de TV: estática, franjas desplazadas y líneas de color. */
const Interference: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const strength = interpolate(frame, [0, 3, dur - 6, dur], [0.6, 1, 0.85, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const bands = Array.from({length: 9}, (_, i) => {
    const r = (n: number) => random(`band-${frame}-${i}-${n}`);
    return {top: r(1) * 1920, h: 20 + r(2) * 160, x: (r(3) - 0.5) * 260, tint: r(4) > 0.5 ? "rgba(255,40,60,0.35)" : "rgba(40,220,255,0.35)"};
  });
  return (
    <AbsoluteFill style={{opacity: strength}}>
      <AbsoluteFill style={{background: "#111"}} />
      <svg width="100%" height="100%" style={{position: "absolute", inset: 0}}>
        <filter id={`n${frame}`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed={frame} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="3.2" intercept="-1.1" />
            <feFuncG type="linear" slope="3.2" intercept="-1.1" />
            <feFuncB type="linear" slope="3.2" intercept="-1.1" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter={`url(#n${frame})`} />
      </svg>
      {bands.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x,
            top: b.top,
            width: 1080 + 300,
            height: b.h,
            background: `repeating-linear-gradient(0deg, rgba(255,255,255,0.25) 0 2px, rgba(0,0,0,0.35) 2px 5px), ${b.tint}`,
            mixBlendMode: "screen",
          }}
        />
      ))}
      <AbsoluteFill style={{background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0 2px, transparent 2px 6px)"}} />
    </AbsoluteFill>
  );
};

/** Barras de color de TV durante el beep. */
const ColorBars: React.FC = () => {
  const cols = ["#C0C0C0", "#C0C000", "#00C0C0", "#00C000", "#C000C0", "#C00000", "#0000C0"];
  return (
    <AbsoluteFill style={{background: "#000"}}>
      <div style={{display: "flex", height: "72%"}}>
        {cols.map((c) => (
          <div key={c} style={{flex: 1, background: c}} />
        ))}
      </div>
      <div style={{display: "flex", height: "8%"}}>
        {["#0000C0", "#111", "#C000C0", "#111", "#00C0C0", "#111", "#C0C0C0"].map((c, i) => (
          <div key={i} style={{flex: 1, background: c}} />
        ))}
      </div>
      <div style={{display: "flex", height: "20%"}}>
        {["#00214C", "#FFFFFF", "#32006A", "#131313", "#090909", "#131313", "#1D1D1D"].map((c, i) => (
          <div key={i} style={{flex: 1, background: c}} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Pop: React.FC<{children: React.ReactNode; at: number; out?: number}> = ({children, at, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 11, stiffness: 200}});
  const o = out ? interpolate(frame, [out - 5, out], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) : 1;
  return (
    <AbsoluteFill style={{opacity: Math.min(1, s * 1.5) * o, transform: `scale(${0.8 + 0.2 * s})`, transformOrigin: "50% 20%"}}>
      {children}
    </AbsoluteFill>
  );
};

const Ingredient: React.FC<{children: React.ReactNode; top: number; at: number}> = ({children, top, at}) => (
  <Pop at={at}>
    <StrokeText size={60} stroke={13} style={{left: 40, top, width: 1000, textAlign: "center"}}>
      {children}
    </StrokeText>
  </Pop>
);

const BlooperTag: React.FC = () => (
  <Pop at={2}>
    <PaperNote x={300} y={190} w={480} h={130} rot={-4} size={72} seed={77}>
      Blooper 😂
    </PaperNote>
    <StrokeText size={40} stroke={10} style={{left: 0, top: 345, width: 1080, textAlign: "center"}}>
      fuera de escena
    </StrokeText>
  </Pop>
);

export const ArbatReelEdicion: React.FC = () => {
  useFonts();
  const pres = START.presenta;
  const w = (t: number) => f(t - SHOTS.presenta.from);
  const b2 = (t: number) => f(t - SHOTS.blooper2.from); // tiempo en el clip → frame dentro del blooper 2
  const GLITCH_FROM = START.blooper1 - 6;
  const GLITCH_DUR = 22;
  return (
    <AbsoluteFill style={{background: "#000", fontVariantNumeric: "lining-nums"}}>
      {ORDER.map((k) => (
        <Clip key={k} k={k} />
      ))}

      {/* Jingle: solo durante el "comercial" */}
      <Sequence from={pres} durationInFrames={GLITCH_FROM - pres}>
        <Audio
          src={A("jingle.mp3")}
          volume={(fr) => interpolate(fr, [0, 10, GLITCH_FROM - pres - 8, GLITCH_FROM - pres], [0, 0.16, 0.16, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}
        />
      </Sequence>

      {/* 1 · Hook */}
      <Sequence from={0} durationInFrames={pres}>
        <Pop at={2}>
          <StrokeText size={82} stroke={16} style={{left: 40, top: 210, width: 1000, textAlign: "center"}}>
            POV: se arregla
            <br />
            en edición
          </StrokeText>
        </Pop>
      </Sequence>

      {/* 2 · Presentación con textos al ritmo de lo que dice */}
      <Sequence from={pres} durationInFrames={f(SHOTS.presenta.to - SHOTS.presenta.from)}>
        <Pop at={w(4.0)}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 190,
              textAlign: "center",
              fontFamily: HAND,
              fontWeight: 900,
              fontSize: 96,
              color: "#F2A541",
              WebkitTextStroke: `14px ${C.vinoOscuro}`,
              paintOrder: "stroke fill",
              filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.45))",
            }}
          >
            CAMPECHANAS
          </div>
        </Pop>
        <Ingredient top={330} at={w(6.8)}>
          Paquete de 5
        </Ingredient>
        <Ingredient top={410} at={w(7.8)}>
          de 15
        </Ingredient>
        <Ingredient top={490} at={w(8.65)}>
          y de 30 piezas
        </Ingredient>
      </Sequence>

      {/* 4 · Cierre */}
      <Sequence from={START.cierre} durationInFrames={f(SHOTS.cierre.to - SHOTS.cierre.from)}>
        <Pop at={8}>
          <div style={{position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center"}}>
            <div style={{width: 190, height: 190, borderRadius: "50%", background: "#FFF6E6", boxShadow: "0 8px 22px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center"}}>
              <Img src={staticFile("assets/arbat/logo-vino.png")} style={{width: 162, height: 162}} />
            </div>
          </div>
        </Pop>
      </Sequence>

      {/* 5 · Bloopers */}
      <Sequence from={START.blooper1} durationInFrames={f(SHOTS.blooper1.to - SHOTS.blooper1.from)}>
        <BlooperTag />
      </Sequence>
      <Sequence from={START.blooper2} durationInFrames={f(SHOTS.blooper2.to - SHOTS.blooper2.from)}>
        <BlooperTag />
        <Sequence from={b2(4.35)} durationInFrames={b2(7.5) - b2(4.35)}>
          <Pop at={0} out={b2(7.5) - b2(4.35)}>
            <StrokeText size={62} stroke={13} style={{left: 50, top: 1330, width: 980, textAlign: "center"}}>
              "Yo no quiero… pero me están obligando" 😩
            </StrokeText>
          </Pop>
        </Sequence>
        <Sequence from={b2(8.2)} durationInFrames={b2(11.1) - b2(8.2)}>
          <Pop at={0}>
            <StrokeText size={62} stroke={13} style={{left: 50, top: 1330, width: 980, textAlign: "center"}}>
              "Ya llevo como tres paquetes… una charola" 🤣
            </StrokeText>
          </Pop>
        </Sequence>
      </Sequence>

      {/* Interferencia: termina el reel, empieza lo "fuera de escena" */}
      <Sequence from={GLITCH_FROM} durationInFrames={GLITCH_DUR}>
        <Interference dur={GLITCH_DUR} />
        <Audio src={A("interferencia.wav")} volume={0.55} />
      </Sequence>

      {/* Beep con barras de color entre bloopers */}
      <Sequence from={BEEP_AT} durationInFrames={BEEP_F}>
        <ColorBars />
        <Audio src={A("beep.wav")} volume={0.6} />
      </Sequence>
    </AbsoluteFill>
  );
};
