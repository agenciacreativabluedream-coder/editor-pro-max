import React from "react";
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {StrokeText, useFonts} from "./ArbatCarrusel";

/**
 * Arbat Panadería — Reel "Mal día en el trabajo, pero no fumas" (Jueves 19/11/2026) · protagoniza Yadi
 * Réplica del formato del reel de referencia (DavDxNbOgOD): texto fijo arriba + "fumar" una campechana.
 * 1080x1920 · 30 fps · ~20 s · SIN AUDIO (agregar en Instagram el audio en tendencia de la referencia).
 * Clips (carpeta "11" de Drive): public/assets/arbat/reel11/IMG_2116.mp4, IMG_2118.mp4
 * Render: npx remotion render ArbatReelMalDia out/arbat/reel-mal-dia.mp4 --muted
 */

export const MALDIA_FPS = 30;
const f = (s: number) => Math.round(s * MALDIA_FPS);
const clip = (n: string) => staticFile(`assets/arbat/reel11/${n}.mp4`);

type Shot = {src: string; from: number; to: number; zoom: [number, number]; origin?: string};
const SHOTS: Shot[] = [
  {src: "IMG_2116", from: 4.0, to: 12.0, zoom: [1.02, 1.08], origin: "65% 45%"}, // sale y le da "el golpe" a la campechana
  {src: "IMG_2118", from: 8.0, to: 14.4, zoom: [1.0, 1.04], origin: "55% 50%"}, // llega el compañero… y también "fuma"
  {src: "IMG_2118", from: 14.6, to: 20.4, zoom: [1.0, 1.06], origin: "50% 40%"}, // mirada perdida
];
const STARTS: number[] = [];
let acc = 0;
for (const s of SHOTS) {
  STARTS.push(acc);
  acc += f(s.to - s.from);
}
export const MALDIA_FRAMES = acc;

const ShotClip: React.FC<{s: Shot}> = ({s}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], s.zoom);
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: s.origin ?? "50% 50%"}}>
      <OffthreadVideo
        src={clip(s.src)}
        trimBefore={f(s.from)}
        muted
        style={{width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.06) saturate(0.95) brightness(1.02)"}}
      />
    </AbsoluteFill>
  );
};

export const ArbatReelMalDia: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 2, fps, config: {damping: 16, stiffness: 140}});
  return (
    <AbsoluteFill style={{background: "#000", fontVariantNumeric: "lining-nums"}}>
      {SHOTS.map((sh, i) => (
        <Sequence key={i} from={STARTS[i]} durationInFrames={f(sh.to - sh.from)}>
          <ShotClip s={sh} />
        </Sequence>
      ))}
      {/* Texto fijo durante todo el video, como en la referencia */}
      <AbsoluteFill style={{opacity: s, transform: `translateY(${(1 - s) * 16}px)`}}>
        <StrokeText size={66} stroke={14} style={{left: 60, top: 210, width: 960, textAlign: "center"}}>
          Cuando estás teniendo un mal día en el trabajo, pero no fumas:
        </StrokeText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
