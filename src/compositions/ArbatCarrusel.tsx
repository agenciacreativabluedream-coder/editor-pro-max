import React, {useEffect, useState} from "react";
import {AbsoluteFill, Img, continueRender, delayRender, staticFile} from "remotion";

/**
 * Arbat Panadería — Carrusel "¿5, 15 o 30?" (Jueves 05/11/2026)
 * 5 láminas 1080x1350 (Instagram 4:5). Sin precios.
 * Render: npx remotion still ArbatL1 out/arbat/L1.png  (ArbatL1 … ArbatL5)
 */

export const ARBAT = {
  vino: "#79160D", // rojo del logotipo
  vinoOscuro: "#3B1112", // banda del empaque
  crema: "#F6EFE4",
  papel: "#FFFDF9",
  kraft: "#A8744A",
  tinta: "#2A1A17",
};

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

export const W = 1080;
export const H = 1350;

/* ---------- Fuentes (espera a que carguen antes de capturar) ---------- */
const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,500;1,600&family=Montserrat:wght@500;600;700&display=block";

const useBrandFonts = () => {
  const [handle] = useState(() => delayRender("Cargando fuentes Arbat"));
  useEffect(() => {
    const done = () => continueRender(handle);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_CSS;
    link.onload = () => {
      Promise.all(
        [
          `400 40px "Playfair Display"`,
          `700 40px "Playfair Display"`,
          `800 40px "Playfair Display"`,
          `italic 500 40px "Playfair Display"`,
          `italic 600 40px "Playfair Display"`,
          `600 40px "Montserrat"`,
          `700 40px "Montserrat"`,
        ].map((f) => document.fonts.load(f)),
      ).then(done, done);
    };
    link.onerror = done;
    document.head.appendChild(link);
  }, [handle]);
};

/* ---------- Elementos de marca ---------- */

/** Banda vino con festón, como la etiqueta del empaque. */
const Feston: React.FC<{color?: string}> = ({color = ARBAT.vinoOscuro}) => (
  <div style={{position: "absolute", top: 0, left: 0, right: 0}}>
    <div style={{height: 18, background: color}} />
    <div
      style={{
        height: 13,
        backgroundImage: `radial-gradient(circle at 13px 0, ${color} 11px, transparent 12px)`,
        backgroundSize: "26px 13px",
        backgroundRepeat: "repeat-x",
      }}
    />
  </div>
);

const Paper: React.FC<{children: React.ReactNode}> = ({children}) => {
  useBrandFonts();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 90% at 50% 30%, ${ARBAT.papel} 0%, ${ARBAT.crema} 70%, #EFE4D3 100%)`,
        fontFamily: SANS,
        color: ARBAT.tinta,
        fontVariantNumeric: "lining-nums",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Eyebrow: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({
  children,
  color = ARBAT.kraft,
  style,
}) => (
  <div
    style={{
      fontFamily: SANS,
      fontWeight: 700,
      fontSize: 22,
      letterSpacing: 5,
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

const Footer: React.FC<{index: number; dark?: boolean}> = ({index, dark}) => {
  const c = dark ? "rgba(246,239,228,0.85)" : ARBAT.vino;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: 52,
        display: "flex",
        alignItems: "center",
        gap: 20,
        color: c,
      }}
    >
      <div style={{fontFamily: SERIF, fontStyle: "italic", fontSize: 28, fontWeight: 500}}>
        Arbat · Suavemente crujientes
      </div>
      <div style={{flex: 1, height: 2, background: c, opacity: 0.35}} />
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: 3}}>
        {String(index).padStart(2, "0")} / 05
      </div>
    </div>
  );
};

const cardShadow = "0 24px 60px rgba(59,17,18,0.16), 0 4px 14px rgba(59,17,18,0.08)";

/* ---------- Foto de las 3 presentaciones con "foco" en una ---------- */
// Coordenadas de cada bolsa en tres-bolsas.jpg (1376x768).
const TRES_BOLSAS = {w: 1376, h: 768};
const BOLSAS: Record<5 | 15 | 30, {x0: number; y0: number; x1: number; y1: number}> = {
  5: {x0: 38, y0: 175, x1: 308, y1: 645},
  15: {x0: 282, y0: 288, x1: 682, y1: 655},
  30: {x0: 688, y0: 190, x1: 1338, y1: 640},
};

const Spotlight: React.FC<{size: 15 | 30; cardW: number; cardH: number}> = ({size, cardW, cardH}) => {
  const s = Math.max(cardW / TRES_BOLSAS.w, cardH / TRES_BOLSAS.h);
  const iw = TRES_BOLSAS.w * s;
  const ih = TRES_BOLSAS.h * s;
  const b = BOLSAS[size];
  const center = ((b.x0 + b.x1) / 2) * s;
  const offX = Math.min(0, Math.max(cardW - iw, cardW / 2 - center));
  const offY = (cardH - ih) / 2;
  const pad = 16;
  const hx = b.x0 * s + offX - pad;
  const hy = b.y0 * s + offY - pad;
  const hw = (b.x1 - b.x0) * s + pad * 2;
  const hh = (b.y1 - b.y0) * s + pad * 2;
  return (
    <>
      <Img
        src={staticFile("assets/arbat/tres-bolsas.jpg")}
        style={{position: "absolute", left: offX, top: offY, width: iw, height: ih}}
      />
      <svg width={cardW} height={cardH} style={{position: "absolute", inset: 0}}>
        <defs>
          <mask id={`hole-${size}`}>
            <rect width={cardW} height={cardH} fill="white" />
            <rect x={hx} y={hy} width={hw} height={hh} rx={26} fill="black" />
          </mask>
        </defs>
        <rect width={cardW} height={cardH} fill="rgba(250,245,237,0.78)" mask={`url(#hole-${size})`} />
        <rect
          x={hx}
          y={hy}
          width={hw}
          height={hh}
          rx={26}
          fill="none"
          stroke={ARBAT.vino}
          strokeWidth={5}
        />
      </svg>
    </>
  );
};

/* ---------- Plantilla de presentación (L2–L4) ---------- */
type PresentacionProps = {
  index: number;
  piezas: 5 | 15 | 30;
  titulo: string;
  remate: string;
  foto: React.ReactNode;
};

const CARD = {x: 60, y: 78, w: 960, h: 800};

const Presentacion: React.FC<PresentacionProps> = ({index, piezas, titulo, remate, foto}) => (
  <Paper>
    <Feston />
    <div
      style={{
        position: "absolute",
        left: CARD.x,
        top: CARD.y,
        width: CARD.w,
        height: CARD.h,
        borderRadius: 30,
        overflow: "hidden",
        background: "#fff",
        boxShadow: cardShadow,
      }}
    >
      {foto}
    </div>

    {/* Sello con el número de piezas */}
    <div
      style={{
        position: "absolute",
        left: 92,
        top: CARD.y + CARD.h - 128,
        width: 250,
        height: 250,
        borderRadius: "50%",
        background: ARBAT.vino,
        border: `8px solid ${ARBAT.crema}`,
        boxShadow: "0 14px 34px rgba(59,17,18,0.28)",
        color: ARBAT.crema,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: piezas >= 10 ? 118 : 132, lineHeight: 0.95}}>
        {piezas}
      </div>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 21, letterSpacing: 6, marginTop: 6}}>
        PIEZAS
      </div>
    </div>

    <Eyebrow style={{position: "absolute", left: 372, top: CARD.y + CARD.h + 34}}>
      Presentación de {piezas} piezas
    </Eyebrow>

    <div style={{position: "absolute", left: 72, right: 72, top: 1012}}>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 66,
          lineHeight: 1.08,
          color: ARBAT.vinoOscuro,
          letterSpacing: -0.5,
        }}
      >
        {titulo}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 50,
          lineHeight: 1.15,
          color: ARBAT.vino,
          marginTop: 10,
        }}
      >
        {remate}
      </div>
    </div>

    <Footer index={index} />
  </Paper>
);

/* ---------- L1 · Portada ---------- */
export const ArbatL1: React.FC = () => (
  <Paper>
    <Feston />
    <Img
      src={staticFile("assets/arbat/logo-vino.png")}
      style={{position: "absolute", left: (W - 170) / 2, top: 66, width: 170, height: 170}}
    />
    <div style={{position: "absolute", left: 70, right: 70, top: 270, textAlign: "center"}}>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: 54,
          lineHeight: 1.18,
          color: ARBAT.tinta,
        }}
      >
        El verdadero problema
        <br />
        no es cuál comprar…
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: 92,
          lineHeight: 1.05,
          color: ARBAT.vino,
          marginTop: 18,
          letterSpacing: -1,
        }}
      >
        es cuántas compartir.
      </div>
    </div>

    <div
      style={{
        position: "absolute",
        left: 60,
        top: 600,
        width: 960,
        height: 536,
        borderRadius: 30,
        overflow: "hidden",
        background: "#fff",
        boxShadow: cardShadow,
      }}
    >
      <Img
        src={staticFile("assets/arbat/tres-bolsas.jpg")}
        style={{width: "100%", height: "100%", objectFit: "cover"}}
      />
    </div>

    {/* Chips 5 · 15 · 30 */}
    <div
      style={{
        position: "absolute",
        top: 1104,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 22,
      }}
    >
      {[5, 15, 30].map((n) => (
        <div
          key={n}
          style={{
            background: ARBAT.vino,
            color: ARBAT.crema,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: 40,
            width: 118,
            height: 64,
            borderRadius: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `5px solid ${ARBAT.crema}`,
            boxShadow: "0 8px 20px rgba(59,17,18,0.25)",
          }}
        >
          {n}
        </div>
      ))}
    </div>

    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Eyebrow color={ARBAT.kraft}>Conoce nuestras presentaciones</Eyebrow>
      <div style={{display: "flex", alignItems: "center", gap: 14, color: ARBAT.vino}}>
        <Eyebrow color={ARBAT.vino}>Desliza</Eyebrow>
        <svg width="54" height="22" viewBox="0 0 54 22">
          <path d="M0 11h48M38 2l11 9-11 9" stroke={ARBAT.vino} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  </Paper>
);

/* ---------- L2 · 5 piezas ---------- */
export const ArbatL2: React.FC = () => (
  <Presentacion
    index={2}
    piezas={5}
    titulo="Para tu antojo de la tarde…"
    remate="o para ti y alguien más."
    foto={
      <Img
        src={staticFile("assets/arbat/antojo-cafe.jpg")}
        style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 42%"}}
      />
    }
  />
);

/* ---------- L3 · 15 piezas ---------- */
export const ArbatL3: React.FC = () => (
  <Presentacion
    index={3}
    piezas={15}
    titulo="Para la familia…"
    remate="o para compartir en la oficina."
    foto={<Spotlight size={15} cardW={CARD.w} cardH={CARD.h} />}
  />
);

/* ---------- L4 · 30 piezas ---------- */
export const ArbatL4: React.FC = () => (
  <Presentacion
    index={4}
    piezas={30}
    titulo="Para la reunión, la posada…"
    remate="o la fiesta."
    foto={<Spotlight size={30} cardW={CARD.w} cardH={CARD.h} />}
  />
);

/* ---------- L5 · Cierre ---------- */
export const ArbatL5: React.FC = () => {
  useBrandFonts();
  return (
    <AbsoluteFill style={{background: ARBAT.vinoOscuro, fontFamily: SANS, fontVariantNumeric: "lining-nums"}}>
      <Img
        src={staticFile("assets/arbat/anaquel-mano.jpg")}
        style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 60%"}}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(59,17,18,0.93) 0%, rgba(59,17,18,0.86) 55%, rgba(59,17,18,0.96) 100%)`,
        }}
      />
      <Feston color={ARBAT.crema} />

      <Img
        src={staticFile("assets/arbat/logo-crema.png")}
        style={{position: "absolute", left: (W - 260) / 2, top: 110, width: 260, height: 260}}
      />

      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 450,
          textAlign: "center",
          color: ARBAT.crema,
        }}
      >
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 116, lineHeight: 1.02, letterSpacing: -1}}>
          ¿Cuál es
          <br />
          <span style={{fontStyle: "italic", fontWeight: 600}}>la tuya?</span>
        </div>

        <div style={{display: "flex", justifyContent: "center", gap: 34, marginTop: 64}}>
          {[5, 15, 30].map((n) => (
            <div
              key={n}
              style={{
                width: 170,
                height: 170,
                borderRadius: "50%",
                border: `4px solid ${ARBAT.crema}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 76, lineHeight: 1}}>{n}</div>
              <div style={{fontWeight: 700, fontSize: 16, letterSpacing: 5, marginTop: 6}}>PIEZAS</div>
            </div>
          ))}
        </div>

        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 46,
            lineHeight: 1.25,
            marginTop: 64,
          }}
        >
          Cuéntanos en los comentarios:
          <br />
          <span style={{fontStyle: "normal", fontWeight: 700}}>¿5, 15 o 30?</span>
        </div>
      </div>

      <Footer index={5} dark />
    </AbsoluteFill>
  );
};
