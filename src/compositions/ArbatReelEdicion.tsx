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
import {C, HAND, PaperNote, StrokeText, useFonts} from "./ArbatCarrusel";

/**
 * Arbat Panadería — Reel "POV: se arregla en edición" (Jueves 12/11/2026)
 * Réplica de la estructura del reel de referencia (DV4cvRKCe0p) con campechanas.
 * 1080x1920 · 30 fps · ~29 s. Diálogo original + jingle comercial (ElevenLabs) desde la presentación.
 * Clips (carpeta "10" de Drive): public/assets/arbat/reel10/IMG_212x.mp4
 * Render: npx remotion render ArbatReelEdicion out/arbat/reel-edicion.mp4
 */

export const EDICION_FPS = 30;
const clip = (f: string) => staticFile(`assets/arbat/reel10/${f}.mp4`);
const MUSIC = staticFile("assets/arbat/reel10/jingle.mp3");
const f = (s: number) => Math.round(s * EDICION_FPS);

const look: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  filter: "contrast(1.05) saturate(1.1) brightness(1.02)",
};

type Shot = {src: string; from: number; to: number};
// Orden de la referencia: detrás de cámaras → presentación → mordidas "arregladas" → cierre → blooper
const SHOTS: Record<string, Shot> = {
  bts: {src: "IMG_2120", from: 1.7, to: 9.0},
  presenta: {src: "IMG_2121", from: 2.1, to: 9.5},
  b1: {src: "IMG_2122", from: 1.2, to: 1.9}, // ella abre la boca
  b2: {src: "IMG_2124", from: 3.2, to: 4.6}, // él muerde
  b3: {src: "IMG_2123", from: 2.4, to: 4.1}, // ella: "¡Mmm!"
  b4: {src: "IMG_2122", from: 6.6, to: 7.3},
  b5: {src: "IMG_2124", from: 7.7, to: 9.0},
  b6: {src: "IMG_2123", from: 5.2, to: 6.8},
  cierre: {src: "IMG_2122", from: 4.0, to: 6.5}, // "El sabor del pueblo hasta tu casa"
  blooper: {src: "IMG_2121", from: 12.2, to: 15.0},
};
const ORDER = ["bts", "presenta", "b1", "b2", "b3", "b4", "b5", "b6", "cierre", "blooper"] as const;

const START: Record<string, number> = {};
let acc = 0;
for (const k of ORDER) {
  START[k] = acc;
  acc += f(SHOTS[k].to - SHOTS[k].from);
}
export const EDICION_FRAMES = acc;

const Clip: React.FC<{k: (typeof ORDER)[number]}> = ({k}) => {
  const s = SHOTS[k];
  return (
    <Sequence from={START[k]} durationInFrames={f(s.to - s.from)}>
      <OffthreadVideo src={clip(s.src)} trimBefore={f(s.from)} style={look} />
    </Sequence>
  );
};

/** Texto que aparece con un pequeño rebote y se queda. */
const Pop: React.FC<{children: React.ReactNode; at: number}> = ({children, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 11, stiffness: 200}});
  return <AbsoluteFill style={{opacity: Math.min(1, s * 1.5), transform: `scale(${0.8 + 0.2 * s})`, transformOrigin: "50% 20%"}}>{children}</AbsoluteFill>;
};

const Ingredient: React.FC<{children: React.ReactNode; top: number; at: number}> = ({children, top, at}) => (
  <Pop at={at}>
    <StrokeText size={60} stroke={13} style={{left: 40, top, width: 1000, textAlign: "center"}}>
      {children}
    </StrokeText>
  </Pop>
);

export const ArbatReelEdicion: React.FC = () => {
  useFonts();
  const pres = START.presenta;
  const w = (t: number) => f(t - SHOTS.presenta.from); // tiempo de palabra → frame dentro de la presentación
  return (
    <AbsoluteFill style={{background: "#000", fontVariantNumeric: "lining-nums"}}>
      {ORDER.map((k) => (
        <Clip key={k} k={k} />
      ))}

      {/* Jingle comercial: entra con la presentación, se apaga en el blooper */}
      <Sequence from={pres} durationInFrames={START.blooper - pres + 12}>
        <Audio
          src={MUSIC}
          volume={(fr) =>
            interpolate(fr, [0, 10, START.blooper - pres - 10, START.blooper - pres + 12], [0, 0.16, 0.16, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
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

      {/* 4 · Cierre: logo discreto mientras dice el slogan */}
      <Sequence from={START.cierre} durationInFrames={f(SHOTS.cierre.to - SHOTS.cierre.from)}>
        <Pop at={8}>
          <div style={{position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center"}}>
            <div style={{width: 190, height: 190, borderRadius: "50%", background: "#FFF6E6", boxShadow: "0 8px 22px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center"}}>
              <Img src={staticFile("assets/arbat/logo-vino.png")} style={{width: 162, height: 162}} />
            </div>
          </div>
        </Pop>
      </Sequence>

      {/* 5 · Blooper */}
      <Sequence from={START.blooper} durationInFrames={f(SHOTS.blooper.to - SHOTS.blooper.from)}>
        <Pop at={2}>
          <PaperNote x={300} y={200} w={480} h={130} rot={-4} size={72} seed={77}>
            Blooper 😂
          </PaperNote>
        </Pop>
      </Sequence>
    </AbsoluteFill>
  );
};
