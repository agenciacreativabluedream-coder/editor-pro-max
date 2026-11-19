import React from "react";
import {
  AbsoluteFill,
  Freeze,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {C, HAND, Heart, Rays, Sparkle, StrokeText, TornLabel, pro, useFonts} from "./ArbatCarrusel";

/**
 * Arbat Panadería — Reel "La última campechana" (Lunes 09/11/2026)
 * 1080x1920 · 30 fps · 21.6 s · audio original (agregar música en Instagram).
 * Clips: public/assets/arbat/reel2/IMG_2106.mp4, IMG_2104.mp4, IMG_2103.mp4 (carpeta "2" de Drive).
 * Render: npx remotion render ArbatReelUltima out/arbat/reel-ultima-campechana.mp4
 */

export const REEL_FPS = 30;
export const REEL_FRAMES = 648;

const clip = (f: string) => staticFile(`assets/arbat/reel2/${f}.mp4`);
const look: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  filter: "contrast(1.06) saturate(1.12) brightness(1.02)",
};

/** Texto que entra con un pequeño "pop" y sale rápido. */
const Pop: React.FC<{children: React.ReactNode; delay?: number; out?: number}> = ({children, delay = 0, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 180}});
  const outO = out ? interpolate(frame, [out - 5, out], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) : 1;
  return (
    <AbsoluteFill style={{opacity: Math.min(1, s * 1.4) * outO, transform: `scale(${0.85 + 0.15 * s})`}}>{children}</AbsoluteFill>
  );
};

const Caption: React.FC<{children: React.ReactNode; top: number; size?: number}> = ({children, top, size = 76}) => (
  <StrokeText size={size} stroke={15} style={{left: 50, top, width: 980, textAlign: "center"}}>
    {children}
  </StrokeText>
);

/* ---------- Congelado "Ahora sí todos quieren" ---------- */
const FreezeShot: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 39], [1, 1.07], {extrapolateRight: "clamp"});
  const flash = interpolate(frame, [0, 4], [0.7, 0], {extrapolateRight: "clamp"});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Freeze frame={0}>
          <OffthreadVideo src={clip("IMG_2104")} trimBefore={82} muted style={look} />
        </Freeze>
      </AbsoluteFill>
      <AbsoluteFill style={{background: "#fff", opacity: flash}} />
    </AbsoluteFill>
  );
};

/* ---------- Cierre ---------- */
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  return (
    <AbsoluteFill style={{background: C.papel}}>
      <Img src={pro("papel.jpg")} style={{position: "absolute", inset: 0, width: 1080, height: 1920, objectFit: "cover"}} />
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: 150,
          textAlign: "center",
          fontFamily: HAND,
          fontWeight: 800,
          fontSize: 92,
          lineHeight: 1.05,
          color: C.vino,
          opacity: s,
          transform: `translateY(${(1 - s) * 30}px)`,
        }}
      >
        La última siempre
        <br />
        tiene dueño.
      </div>
      <Img
        src={pro("manos-compartir.jpg")}
        style={{
          position: "absolute",
          left: 172,
          top: 360,
          width: 735,
          height: 980,
          mixBlendMode: "multiply",
          transform: `scale(${0.94 + 0.06 * s})`,
        }}
      />
      <Sparkle x={130} y={520} s={60} />
      <Heart x={960} y={560} s={70} rot={14} />
      <Rays x={900} y={1180} rot={60} />
      <TornLabel text="Etiqueta a ese amigo 👀" x={110} y={1355} w={860} h={110} size={54} seed={17} rot={-1.5} />
      <Img src={staticFile("assets/arbat/logo-vino.png")} style={{position: "absolute", left: 470, top: 1490, width: 140, height: 140}} />
    </AbsoluteFill>
  );
};

/* ---------- Reel ---------- */
export const ArbatReelUltima: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{background: "#000", fontVariantNumeric: "lining-nums"}}>
      {/* 1 · Hook: ofrece, "no quiero"… hasta que abre la bolsa (IMG_2103 0.8–8.4 s) */}
      <Sequence from={0} durationInFrames={228}>
        <OffthreadVideo src={clip("IMG_2103")} trimBefore={24} style={{...look, transform: "scale(1.18)", transformOrigin: "0% 50%"}} />
        <Sequence from={0} durationInFrames={138}>
          <Pop delay={4} out={138}>
            <Caption top={200}>
              Cuando todos dicen
              <br />
              que no quieren…
            </Caption>
          </Pop>
        </Sequence>
        <Sequence from={138} durationInFrames={90}>
          <Pop delay={2}>
            <Caption top={200} size={82}>
              …hasta que queda una.
            </Caption>
          </Pop>
        </Sequence>
      </Sequence>

      {/* 2 · Se acercan las manos (IMG_2104 1.6–2.8 s) */}
      <Sequence from={228} durationInFrames={36}>
        <OffthreadVideo src={clip("IMG_2104")} trimBefore={48} style={look} />
      </Sequence>

      {/* 3 · Congelado */}
      <Sequence from={264} durationInFrames={39}>
        <FreezeShot />
        <Pop delay={1}>
          <Caption top={1300} size={88}>
            ¡Ahora sí
            <br />
            todos quieren!
          </Caption>
          <Rays x={110} y={1270} rot={200} />
          <Rays x={900} y={1270} rot={70} />
        </Pop>
      </Sequence>

      {/* 4 · Manotazo (cámara lenta) y escape */}
      <Sequence from={303} durationInFrames={6}>
        <OffthreadVideo src={clip("IMG_2104")} trimBefore={82} style={look} />
      </Sequence>
      <Sequence from={309} durationInFrames={42}>
        <OffthreadVideo src={clip("IMG_2104")} trimBefore={88} playbackRate={0.5} style={look} />
        <Pop delay={6} out={42}>
          <Sparkle x={330} y={700} s={70} />
          <Rays x={760} y={640} s={90} rot={30} />
        </Pop>
      </Sequence>
      <Sequence from={351} durationInFrames={72}>
        <OffthreadVideo src={clip("IMG_2104")} trimBefore={109} style={look} />
      </Sequence>

      {/* 5 · La ganadora protege su bolsa (IMG_2103 10.0–12.6 s) */}
      <Sequence from={423} durationInFrames={78}>
        <OffthreadVideo
          src={clip("IMG_2103")}
          trimBefore={300}
          style={{...look, transform: "scale(1.18)", transformOrigin: "0% 50%"}}
          volume={(f) => interpolate(f, [64, 78], [1, 0.4], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}
        />
        <Pop delay={4}>
          <Caption top={210}>
            Todos tenemos
            <br />a ese amigo 👀
          </Caption>
        </Pop>
      </Sequence>

      {/* 6 · Final: los demás se quedan sin campechana (IMG_2106) */}
      <Sequence from={501} durationInFrames={81}>
        <OffthreadVideo src={clip("IMG_2106")} style={look} />
      </Sequence>

      {/* 7 · Cierre con marca y CTA */}
      <Sequence from={582} durationInFrames={66}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};

