#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
ANDROID_ASSETS="$ROOT_DIR/android/app/src/main/assets/www"

mkdir -p "$ANDROID_ASSETS/css" "$ANDROID_ASSETS/js" "$ANDROID_ASSETS/assets"

cp "$ROOT_DIR/index.html" "$ANDROID_ASSETS/index.html"
cp "$ROOT_DIR/css/style.css" "$ANDROID_ASSETS/css/style.css"
cp "$ROOT_DIR/js/app.js" "$ANDROID_ASSETS/js/app.js"
cp "$ROOT_DIR/js/courses.js" "$ANDROID_ASSETS/js/courses.js"
cp "$ROOT_DIR/assets/iitp-seal.png" "$ANDROID_ASSETS/assets/iitp-seal.png"
cp "$ROOT_DIR/assets/cet-logo.png" "$ANDROID_ASSETS/assets/cet-logo.png"
