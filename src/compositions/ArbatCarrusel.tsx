import React, {useEffect, useState} from "react";
import {AbsoluteFill, Img, continueRender, delayRender, staticFile} from "remotion";

/**
 * Arbat Panadería — Carrusel "¿5, 15 o 30?" (Jueves 05/11/2026)
 * 5 láminas 1080x1440 (3:4), estilo "papel + cinta + doodles" de la marca. Sin precios.
 * Fotos retocadas con: python3 scripts/arbat/enhance_photos.py
 * Render: npx remotion still ArbatL1 out/arbat/L1.png  (ArbatL1 … ArbatL5)
 */

export const W = 1080;
export const H = 1440;

export const C = {
  vino: "#6B1A1F",
  vinoOscuro: "#4E1216",
  crema: "#FFF6E6",
  papel: "#F1E6D3",
  dorado: "#E2A53B",
  cinta: "rgba(201,163,112,0.86)",
};

const HAND = "'Grandstander', 'Comic Sans MS', sans-serif";
const NOTE = "'Mali', 'Grandstander', sans-serif";

const pro = (f: string) => staticFile(`assets/arbat/pro/${f}`);

/* ---------------- Fuentes ---------------- */
const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Grandstander:wght@600;700;800;900&family=Mali:wght@600;700&display=block";

const useFonts = () => {
  const [handle] = useState(() => delayRender("Fuentes Arbat"));
  useEffect(() => {
    const done = () => continueRender(handle);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_CSS;
    link.onload = () =>
      Promise.all(
        [`800 60px Grandstander`, `900 60px Grandstander`, `700 60px Grandstander`, `700 60px Mali`].map((f) =>
          document.fonts.load(f),
        ),
      ).then(done, done);
    link.onerror = done;
    document.head.appendChild(link);
  }, [handle]);
};

/* ---------------- Utilidades de papel ---------------- */
const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

/** Borde rasgado: polígono irregular en px. */
const torn = (w: number, h: number, seed: number, amp = 7, step = 16) => {
  const r = rng(seed);
  const pts: string[] = [];
  for (let x = 0; x <= w; x += step) pts.push(`${x}px ${r() * amp}px`);
  for (let y = 0; y <= h; y += step) pts.push(`${w - r() * amp * 0.6}px ${y}px`);
  for (let x = w; x >= 0; x -= step) pts.push(`${x}px ${h - r() * amp}px`);
  for (let y = h; y >= 0; y -= step) pts.push(`${r() * amp * 0.6}px ${y}px`);
  return `polygon(${pts.join(",")})`;
};

const Tape: React.FC<{x: number; y: number; w?: number; rot?: number}> = ({x, y, w = 150, rot = -20}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: 46,
      transform: `rotate(${rot}deg)`,
      background: `linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0) 40%), ${C.cinta}`,
      clipPath:
        "polygon(0 8%,4% 0,8% 10%,12% 0,100% 0,96% 12%,100% 25%,96% 40%,100% 55%,96% 70%,100% 85%,96% 100%,0 100%,4% 88%,0 75%,4% 60%,0 45%,4% 30%)",
      boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
      opacity: 0.95,
    }}
  />
);

/** Tira vino rasgada con texto crema y cintas en las esquinas. */
const TornLabel: React.FC<{
  text: string;
  x: number;
  y: number;
  w: number;
  h?: number;
  rot?: number;
  size?: number;
  seed?: number;
}> = ({text, x, y, w, h = 120, rot = -2, size = 56, seed = 3}) => (
  <div style={{position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`}}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: C.vino,
        clipPath: torn(w, h, seed, 9, 14),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: C.crema,
        fontFamily: NOTE,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 0.5,
        filter: "drop-shadow(0 6px 8px rgba(60,20,20,0.25))",
      }}
    >
      {text}
    </div>
    <Tape x={-40} y={-18} rot={-22} />
    <Tape x={w - 110} y={-22} rot={18} />
  </div>
);

/** Nota de papel crema (para fotos) con texto vino. */
const PaperNote: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  w: number;
  h: number;
  rot?: number;
  size?: number;
  seed?: number;
}> = ({children, x, y, w, h, rot = -3, size = 64, seed = 11}) => (
  <div style={{position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`}}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(170deg, #FFFCF5 0%, #F8EFDF 100%)",
        clipPath: torn(w, h, seed, 8, 14),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: C.vino,
        fontFamily: HAND,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.35))",
      }}
    >
      {children}
    </div>
    <Tape x={w / 2 - 75} y={-24} rot={-4} />
  </div>
);

/** Texto crema con contorno vino (para fotos). */
const StrokeText: React.FC<{
  children: React.ReactNode;
  size: number;
  stroke?: number;
  style?: React.CSSProperties;
  fill?: string;
}> = ({children, size, stroke = 16, style, fill = C.crema}) => {
  const base: React.CSSProperties = {
    fontFamily: HAND,
    fontWeight: 800,
    fontSize: size,
    lineHeight: 1.04,
    letterSpacing: 0.5,
  };
  return (
    <div style={{position: "absolute", ...style}}>
      <div
        aria-hidden
        style={{
          ...base,
          position: "absolute",
          inset: 0,
          color: C.vinoOscuro,
          WebkitTextStroke: `${stroke}px ${C.vinoOscuro}`,
          filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.45))",
        }}
      >
        {children}
      </div>
      <div style={{...base, position: "relative", color: fill}}>{children}</div>
    </div>
  );
};

/* ---------------- Doodles dorados ---------------- */
const stroke = {fill: "none", stroke: C.dorado, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const};

const Doodle: React.FC<{x: number; y: number; w: number; h: number; rot?: number; children: React.ReactNode; vb?: string}> = ({
  x,
  y,
  w,
  h,
  rot = 0,
  children,
  vb,
}) => (
  <svg
    width={w}
    height={h}
    viewBox={vb ?? `0 0 ${w} ${h}`}
    style={{position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, overflow: "visible", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.18))"}}
  >
    {children}
  </svg>
);

const Sparkle: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 60, rot = 0}) => (
  <Doodle x={x - s / 2} y={y - s / 2} w={s} h={s} rot={rot} vb="-32 -32 64 64">
    <path d="M0,-28 C3,-7 7,-3 28,0 C7,3 3,7 0,28 C-3,7 -7,3 -28,0 C-7,-3 -3,-7 0,-28Z" {...stroke} strokeWidth={5} />
  </Doodle>
);

const Heart: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 70, rot = -12}) => (
  <Doodle x={x - s / 2} y={y - s / 2} w={s} h={s} rot={rot} vb="-32 -32 64 64">
    <path d="M0,22 C-30,2 -28,-24 -10,-24 C-3,-24 0,-16 0,-12 C0,-16 4,-24 11,-24 C29,-24 30,2 0,22Z" {...stroke} strokeWidth={5.5} />
  </Doodle>
);

const Rays: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 70, rot = 0}) => (
  <Doodle x={x} y={y} w={s} h={s} rot={rot} vb="0 0 70 70">
    <path d="M8 40 L30 34 M14 16 L34 26 M38 4 L42 22" {...stroke} strokeWidth={6} />
  </Doodle>
);

const Arrow: React.FC<{d: string; head: string; x?: number; y?: number; w?: number; h?: number}> = ({d, head, x = 0, y = 0, w = W, h = H}) => (
  <Doodle x={x} y={y} w={w} h={h}>
    <path d={d} {...stroke} />
    <path d={head} {...stroke} />
  </Doodle>
);

/** Óvalo hecho a mano (doble trazo, abierto) alrededor de un producto. */
const Loop: React.FC<{cx: number; cy: number; rx: number; ry: number; rot?: number}> = ({cx, cy, rx, ry, rot = -6}) => {
  const p = (k: number, a0: number, a1: number) => {
    const pts: string[] = [];
    for (let a = a0; a <= a1; a += 0.08) {
      pts.push(`${cx + Math.cos(a) * rx * k},${cy + Math.sin(a) * ry * (2 - k)}`);
    }
    return `M${pts.join(" L")}`;
  };
  return (
    <svg width={W} height={H} style={{position: "absolute", left: 0, top: 0, overflow: "visible", transform: `rotate(${rot}deg)`, transformOrigin: `${cx}px ${cy}px`}}>
      <path d={p(1, -1.2, Math.PI * 2 - 1.5)} {...stroke} strokeWidth={6} />
      <path d={p(1.035, -1.0, Math.PI * 2 - 2.1)} {...stroke} strokeWidth={4.5} opacity={0.9} />
    </svg>
  );
};

const Squiggle: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => {
  const seg = 46;
  let d = `M0 10`;
  for (let i = 0; i < w; i += seg) d += ` q ${seg / 4} -10 ${seg / 2} 0 t ${seg / 2} 0`;
  return (
    <Doodle x={x} y={y} w={w} h={40}>
      <path d={d} {...stroke} strokeWidth={8} />
      <path d={`M${w * 0.08} 30 Q ${w / 2} 22 ${w * 0.92} 28`} {...stroke} strokeWidth={6} />
    </Doodle>
  );
};

/* ---------------- Fondos ---------------- */
const Paper: React.FC<{children: React.ReactNode}> = ({children}) => {
  useFonts();
  return (
    <AbsoluteFill style={{background: C.papel, fontVariantNumeric: "lining-nums"}}>
      <Img src={pro("papel.jpg")} style={{width: "100%", height: "100%"}} />
      {children}
    </AbsoluteFill>
  );
};

const Photo: React.FC<{src: string; children: React.ReactNode}> = ({src, children}) => {
  useFonts();
  return (
    <AbsoluteFill style={{background: "#2a1512", fontVariantNumeric: "lining-nums"}}>
      <Img src={src} style={{width: "100%", height: "100%", objectFit: "cover"}} />
      <AbsoluteFill style={{background: "linear-gradient(180deg, rgba(40,12,10,0.35) 0%, rgba(40,12,10,0) 32%, rgba(40,12,10,0) 70%, rgba(40,12,10,0.35) 100%)"}} />
      {children}
    </AbsoluteFill>
  );
};

const BigInk: React.FC<{children: React.ReactNode; top: number; size?: number; style?: React.CSSProperties}> = ({
  children,
  top,
  size = 96,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      left: 50,
      right: 50,
      top,
      textAlign: "center",
      fontFamily: HAND,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.04,
      color: C.vino,
      textShadow: "0 2px 0 rgba(255,255,255,0.35)",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------------- Producto sobre papel ---------------- */
// Coordenadas en tres-bolsas.jpg original (1376x768); la versión pro es 2x.
const SRC_W = 1376;
const SRC_H = 768;
const BOLSA = {
  5: {x0: 38, y0: 175, x1: 308, y1: 645},
  15: {x0: 282, y0: 288, x1: 682, y1: 655},
  30: {x0: 688, y0: 190, x1: 1338, y1: 640},
} as const;

type Place = {scale: number; left: number; top: number};
const at = (p: Place, x: number, y: number) => ({x: p.left + x * p.scale, y: p.top + y * p.scale});

const Bolsas: React.FC<{p: Place; focus?: {cx: number; cy: number; rx: number; ry: number}}> = ({p, focus}) => {
  const mask = focus
    ? `radial-gradient(ellipse ${focus.rx}px ${focus.ry}px at ${focus.cx - p.left}px ${focus.cy - p.top}px, #000 62%, rgba(0,0,0,0.18) 86%, transparent 100%)`
    : undefined;
  return (
    <Img
      src={pro("tres-bolsas.jpg")}
      style={{
        position: "absolute",
        left: p.left,
        top: p.top,
        width: SRC_W * p.scale,
        height: SRC_H * p.scale,
        mixBlendMode: "multiply",
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    />
  );
};

/* ================= L1 · Portada ================= */
export const ArbatL1: React.FC = () => {
  const p: Place = {scale: 0.8, left: -2, top: 710};
  const tag = (n: 5 | 15 | 30, rot: number, dy = 0) => {
    const b = BOLSA[n];
    const c = at(p, (b.x0 + b.x1) / 2, b.y0);
    return (
      <PaperNote key={n} x={c.x - 80} y={c.y - 128 + dy} w={160} h={96} rot={rot} size={60} seed={n * 7}>
        {n}
      </PaperNote>
    );
  };
  return (
    <Paper>
      <TornLabel text="El verdadero problema" x={150} y={90} w={780} rot={-2} size={58} />
      <BigInk top={262} size={84}>
        no es cuál comprar…
        <br />
        <span style={{fontSize: 112}}>¡es cuántas</span>
        <br />
        <span style={{fontSize: 112}}>compartir!</span>
      </BigInk>
      <Squiggle x={300} y={592} w={480} />
      <Rays x={880} y={250} rot={10} />
      <Sparkle x={70} y={470} s={54} />
      <Sparkle x={960} y={520} s={44} rot={15} />

      <Bolsas p={p} />
      {tag(5, -6, -10)}
      {tag(15, 4, 4)}
      {tag(30, -3)}

      <div
        style={{
          position: "absolute",
          right: 150,
          bottom: 70,
          fontFamily: HAND,
          fontWeight: 800,
          fontSize: 52,
          color: C.vino,
          transform: "rotate(-4deg)",
        }}
      >
        desliza
      </div>
      <Arrow d="M935 1335 Q 985 1320 1020 1280" head="M990 1272 L1022 1278 L1018 1310" />
      <Sparkle x={560} y={1340} s={46} rot={10} />
      <Heart x={110} y={1330} s={60} />
    </Paper>
  );
};

/* ================= L2 · 5 piezas (foto) ================= */
export const ArbatL2: React.FC = () => (
  <Photo src={pro("antojo-cafe.jpg")}>
    <PaperNote x={80} y={110} w={340} h={116} rot={-4} size={68}>
      5 piezas
    </PaperNote>
    <Rays x={430} y={70} rot={20} />
    <Arrow d="M440 200 Q 540 170 590 260" head="M560 245 L592 264 L604 230" />
    <Sparkle x={110} y={330} s={52} />

    <StrokeText size={100} stroke={18} style={{left: 40, top: 1010, width: 1000, textAlign: "center"}}>
      Para tu antojo
      <br />
      de la tarde…
    </StrokeText>
    <StrokeText size={64} stroke={13} style={{left: 40, top: 1250, width: 1000, textAlign: "center"}}>
      …o para ti y alguien más.
    </StrokeText>
    <Heart x={80} y={1000} s={74} rot={-16} />
    <Heart x={1000} y={1270} s={58} rot={14} />
    <Sparkle x={1000} y={1020} s={50} rot={15} />
  </Photo>
);

/* ================= L3 · 15 piezas (foto profesional) ================= */
export const ArbatL3: React.FC = () => (
  <Photo src={pro("quince-manos.jpg")}>
    <PaperNote x={70} y={80} w={360} h={116} rot={-4} size={66}>
      15 piezas
    </PaperNote>
    <Rays x={440} y={50} rot={18} />
    <StrokeText size={104} stroke={18} style={{left: 40, top: 230, width: 1000, textAlign: "center"}}>
      Para la familia…
    </StrokeText>
    <Loop cx={505} cy={680} rx={340} ry={300} rot={-4} />
    <Sparkle x={930} y={520} s={60} />
    <Sparkle x={110} y={960} s={48} rot={20} />
    <Heart x={960} y={900} s={70} rot={14} />
    <StrokeText size={96} stroke={18} style={{left: 40, top: 1170, width: 1000, textAlign: "center"}}>
      ¡o la oficina!
    </StrokeText>
    <Arrow d="M700 1160 Q 780 1080 740 1000" head="M716 1022 L740 996 L768 1020" />
  </Photo>
);

/* ================= L4 · 30 piezas (foto de reunión) ================= */
export const ArbatL4: React.FC = () => (
  <Photo src={pro("fiesta-charola.jpg")}>
    <AbsoluteFill style={{background: "linear-gradient(180deg, rgba(40,12,10,0.55) 0%, rgba(40,12,10,0.15) 38%, rgba(40,12,10,0) 50%)"}} />
    <PaperNote x={650} y={70} w={360} h={116} rot={4} size={66} seed={31}>
      30 piezas
    </PaperNote>
    <StrokeText size={96} stroke={18} style={{left: 50, top: 220, width: 1000}}>
      Para la reunión,
      <br />
      la posada…
    </StrokeText>
    <StrokeText size={104} stroke={18} style={{left: 0, top: 1270, width: 1080, textAlign: "center"}}>
      ¡o la fiesta!
    </StrokeText>
    <Loop cx={528} cy={950} rx={420} ry={290} rot={-5} />
    <Sparkle x={980} y={560} s={58} />
    <Sparkle x={70} y={640} s={46} rot={18} />
    <Rays x={880} y={1250} rot={70} />
    <Rays x={90} y={1250} rot={200} />
    <Heart x={90} y={140} s={64} rot={-12} />
  </Photo>
);

/* ================= L5 · Cierre: las tres presentaciones (papel) ================= */
const FLAT = {w: 1010, h: 1380};
export const ArbatL5: React.FC = () => {
  const h = 1030;
  const w = (FLAT.w / FLAT.h) * h;
  const x0 = (W - w) / 2;
  const y0 = 330;
  const at2 = (fx: number, fy: number) => ({x: x0 + fx * w, y: y0 + fy * h});
  const tag = (n: number, fx: number, fy: number, rot: number) => {
    const p = at2(fx, fy);
    return (
      <PaperNote key={n} x={p.x - 85} y={p.y - 50} w={170} h={100} rot={rot} size={64} seed={50 + n}>
        {n}
      </PaperNote>
    );
  };
  return (
    <Paper>
      <BigInk top={50} size={110}>
        ¿Cuál es la tuya?
      </BigInk>
      <TornLabel text="Coméntalo: ¿5, 15 o 30?" x={170} y={200} w={740} h={104} size={50} seed={9} rot={-1.5} />
      <Img
        src={pro("tres-presentaciones.jpg")}
        style={{
          position: "absolute",
          left: x0,
          top: y0,
          width: w,
          height: h,
          mixBlendMode: "multiply",
        }}
      />
      {tag(30, 0.36, 0.3, -5)}
      {tag(5, 0.75, 0.3, 6)}
      {tag(15, 0.75, 0.8, -4)}
      {tag(5, 0.27, 0.8, 4)}
      <Sparkle x={90} y={520} s={60} />
      <Heart x={1000} y={560} s={66} rot={14} />
      <Sparkle x={1010} y={1000} s={46} rot={20} />
      <Rays x={40} y={1100} rot={190} />
      <Img src={staticFile("assets/arbat/logo-vino.png")} style={{position: "absolute", right: 30, bottom: 30, width: 150, height: 150}} />
    </Paper>
  );
};

/* ================= L5 (alternativa) · Manos compartiendo (papel) ================= */
export const ArbatL5b: React.FC = () => (
  <Paper>
    <Img src={pro("manos-compartir.jpg")} style={{position: "absolute", inset: 0, width: W, height: H, mixBlendMode: "multiply"}} />
    <BigInk top={60} size={110}>
      ¿Cuál es la tuya?
    </BigInk>
    <div style={{position: "absolute", left: 0, right: 0, top: 1110, display: "flex", justifyContent: "center", gap: 36}}>
      {[5, 15, 30].map((n, i) => (
        <div key={n} style={{position: "relative", width: 170, height: 100}}>
          <PaperNote x={0} y={0} w={170} h={100} rot={[-6, 3, -2][i]} size={64} seed={60 + n}>
            {n}
          </PaperNote>
        </div>
      ))}
    </div>
    <TornLabel text="Cuéntanos en los comentarios" x={150} y={1270} w={780} h={100} size={46} seed={13} rot={1.5} />
    <Sparkle x={140} y={300} s={56} />
    <Heart x={950} y={330} s={66} rot={14} />
    <Rays x={880} y={980} rot={60} />
    <Img src={staticFile("assets/arbat/logo-vino.png")} style={{position: "absolute", left: 30, bottom: 30, width: 130, height: 130}} />
  </Paper>
);
