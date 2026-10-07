// Re-copies the self-hosted OCR runtime from node_modules into public/ocr.
// Run after upgrading tesseract.js:  npm run vendor:ocr
// (eng.traineddata is not copied: it is the language model and is committed as-is.)
import { copyFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";

const root = resolve(import.meta.dirname, "..");
const out = join(root, "public/ocr");
mkdirSync(out, { recursive: true });
const js = join(root, "node_modules/tesseract.js/dist");
const core = join(root, "node_modules/tesseract.js-core");
for (const f of ["tesseract.min.js", "worker.min.js"]) copyFileSync(join(js, f), join(out, f));
for (const f of ["tesseract-core-lstm.wasm.js", "tesseract-core-simd-lstm.wasm.js", "tesseract-core-relaxedsimd-lstm.wasm.js"])
  copyFileSync(join(core, f), join(out, f));
console.log("Vendored OCR runtime into public/ocr");
