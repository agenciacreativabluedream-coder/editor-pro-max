#!/usr/bin/env bash
# Limpieza "de estudio" para audio ASMR de comida (usada en el reel ASMR de Arbat).
# Uso: scripts/arbat/limpiar_audio_asmr.sh entrada.wav salida.wav [fuerte]
# 1) Antes, quitar voces con Demucs (2 pasadas):  python3 -m demucs -n htdemucs --two-stems=vocals ...
# 2) Esta cadena: filtro de retumbe (coches) -> reducción de ruido -> expansor suave -> EQ de estudio -> compresión -> loudness.
set -euo pipefail
IN=$1; OUT=$2; MODE=${3:-normal}
if [ "$MODE" = "fuerte" ]; then
  HP="highpass=f=160:poles=2,highpass=f=160:poles=2,highpass=f=160:poles=2"; NR="afftdn=nr=28:nf=-42:tn=1,afftdn=nr=10:nf=-50:tn=1"; GATE="agate=mode=downward:range=0.18:threshold=0.02:ratio=2.5:attack=3:release=200"
else
  HP="highpass=f=110:poles=2,highpass=f=110:poles=2"; NR="afftdn=nr=18:nf=-45:tn=1"; GATE="agate=mode=downward:range=0.25:threshold=0.012:ratio=2:attack=3:release=220"
fi
EQ="equalizer=f=300:t=q:w=1:g=-3,equalizer=f=4200:t=q:w=1.4:g=2.5,treble=g=2.5:f=10000"
ffmpeg -v error -y -i "$IN" -af "$HP,lowpass=f=16000,$NR,$GATE,$EQ,acompressor=threshold=-24dB:ratio=3:attack=4:release=120:makeup=2,loudnorm=I=-20:TP=-2:LRA=8" -ar 48000 -ac 2 "$OUT"
# Master final del video (nivelación + -15 LUFS + limitador):
# acompressor=threshold=-28dB:ratio=2.5:attack=8:release=250,dynaudnorm=f=300:g=15:p=0.8:m=10:s=6,loudnorm=I=-15:TP=-2:LRA=6,lowpass=f=15500,aresample=192000,alimiter=limit=0.63:attack=1:release=50:level=false,aresample=48000
