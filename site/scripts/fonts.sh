#!/usr/bin/env bash
# Regenerates src/fonts/*.woff2: variable fonts limited to the axes the page
# uses and subset to Basic Latin plus the punctuation we print.
# Needs: pip install fonttools brotli   (run from the site/ folder)
set -euo pipefail
F=node_modules/@fontsource-variable
T=$(mktemp -d)
UNI="U+0020-007E,U+00A0,U+00A9,U+00B7,U+00D7,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2190,U+2192"
fonttools varLib.instancer $F/archivo/files/archivo-latin-wdth-normal.woff2 wght=700:900 wdth=110:125 -o $T/archivo.ttf -q
fonttools varLib.instancer $F/instrument-sans/files/instrument-sans-latin-wght-normal.woff2 wght=400:600 -o $T/instrument.ttf -q
fonttools varLib.instancer $F/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2 wght=400:700 -o $T/mono.ttf -q
for n in archivo instrument mono; do
  fonttools subset $T/$n.ttf --unicodes="$UNI" --layout-features='*' --flavor=woff2 --output-file=src/fonts/$n.woff2
done
