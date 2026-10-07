// Regression checks for the deterministic engine.
// Run: npm run check:engine   (compiles src/lib to a temp dir with the project's own tsc)
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";

const root = resolve(import.meta.dirname, "..");
const out = mkdtempSync(join(tmpdir(), "pratibimb-engine-"));
const entries = [
  "src/lib/engine/analyzer.ts",
  "src/lib/engine/teachback-analyzer.ts",
  "src/lib/engine/url-inspector.ts",
  "src/lib/data/mock-data.ts",
].filter((f) => {
  try { execFileSync("test", ["-f", join(root, f)]); return true; } catch { return false; }
});

execFileSync(
  process.execPath,
  [
    join(root, "node_modules/typescript/bin/tsc"),
    "--outDir", out, "--rootDir", join(root, "src"),
    "--module", "commonjs", "--moduleResolution", "node", "--target", "es2020",
    "--skipLibCheck", "--esModuleInterop", "--incremental", "false",
    "--baseUrl", join(root, "src"), "--paths", "null",
    ...entries.map((e) => join(root, e)),
  ],
  { stdio: "inherit" }
);
// The project uses "@/..." aliases only in app code; engine files use relative imports.
writeFileSync(join(out, "package.json"), '{"type":"commonjs"}');
const require = createRequire(join(out, "x.js"));
const { analyzeMessage } = require("./lib/engine/analyzer");
const { sampleMessage } = require("./lib/data/mock-data");

let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : "  -> " + detail}`);
  if (!ok) failed++;
};
const has = (r, type, phrase) =>
  r.signals.some((s) => s.type === type && s.phrase.toLowerCase().includes(phrase.toLowerCase()));

// 1. The headline demo message must be detected by the real engine, not just drawn in the hero.
const demo = `URGENT:\nSEBI approved opportunity.\nGuaranteed 32% returns.\nThousands of investors are already earning.\nOnly 3 slots remaining.\nInvest before 6 PM.`;
const d = analyzeMessage(demo);
check("demo: authority 'SEBI approved'", has(d, "authority", "SEBI approved"));
check("demo: guaranteed outcome 'Guaranteed 32% returns'", has(d, "guaranteed-language", "Guaranteed 32% returns"));
check("demo: scarcity 'Only 3 slots remaining'", has(d, "urgency", "Only 3 slots remaining"));
check("demo: deadline 'before 6 PM'", has(d, "urgency", "before 6 PM"));
check("demo: social proof 'Thousands of investors'", has(d, "social-proof", "Thousands of investors"));
const cats = new Set(d.signals.map((s) => s.type));
check("demo: exactly the 4 intended tactic categories", cats.size === 4, [...cats].join(","));

// 2. A phrase is reported once per tactic (no English+Hindi rule double counting).
for (const [name, r] of [["demo", d], ["sample", analyzeMessage(sampleMessage)]]) {
  let overlap = null;
  r.signals.forEach((a, i) => r.signals.slice(i + 1).forEach((b) => {
    if (a.type === b.type && a.evidence.start < b.evidence.end && b.evidence.start < a.evidence.end)
      overlap = `${a.ruleId}/${b.ruleId} "${a.phrase}"`;
  }));
  check(`${name}: no overlapping duplicate signals`, !overlap, overlap ?? "");
}

// 3. Citations must be literal: the highlighted span is exactly the matched phrase.
const bad = d.signals.filter((s) => demo.slice(s.evidence.start, s.evidence.end) !== s.phrase);
check("citations: offsets reproduce the matched phrase", bad.length === 0, bad.map((s) => s.ruleId).join(","));

// 4. Every signal points to a real claim (the claim-vs-evidence panel relies on it).
check("signals link to a claim", d.signals.every((s) => d.claims.some((c) => c.id === s.claimId)));

// 5. Sample message: SEBI claim appears once, claim text is not mislabelled.
const s = analyzeMessage(sampleMessage);
check("sample: 'SEBI registered' reported once", s.signals.filter((x) => /sebi registered/i.test(x.phrase)).length === 1);
check("sample: '96%' is not mislabelled as a '100%' claim", !s.claims.some((c) => /100%/.test(c.text)));

// 6. False-positive guard on ordinary, cautious financial text.
const calm = analyzeMessage("Mutual fund investments are subject to market risks. Please read all scheme related documents carefully. Returns are not guaranteed.");
check("benign: ordinary risk-disclosure text raises no signals", calm.signalsDetected === 0, calm.signals.map((x) => x.phrase).join("|"));

// 7. Optional modules (present once added).
try {
  const { analyzeTeachBack } = require("./lib/engine/teachback-analyzer");
  if (analyzeTeachBack.length !== undefined) {
    const t1 = analyzeTeachBack({ reasonIds: ["official"], text: "" });
    check("teach-back: 'official' chip -> authority (locale independent)", t1.detectedReasoning[0] === "authority");
    const t2 = analyzeTeachBack({ reasonIds: [], text: "I made a small call to my friend" });
    check("teach-back: 'call'/'small' is not read as social proof", !t2.detectedReasoning.includes("social-proof"), t2.detectedReasoning.join(","));
    const t3 = analyzeTeachBack({ reasonIds: ["others", "notime"], text: "" });
    check("teach-back: others+notime -> social-proof & urgency", t3.detectedReasoning.includes("social-proof") && t3.detectedReasoning.includes("urgency"));
  }
} catch (e) { if (!String(e).includes("Cannot find module")) throw e; }

try {
  const { inspectUrl } = require("./lib/engine/url-inspector");
  const hit = (u, id) => inspectUrl(u).findings.some((f) => f.id === id);
  check("url: IP-address host flagged", hit("http://192.168.4.20/join", "ip-host"));
  check("url: plain http flagged", hit("http://example.com/x", "no-https"));
  check("url: shortener flagged", hit("https://bit.ly/abc123", "shortener"));
  check("url: regulator name on a non-official domain flagged", hit("https://sebi-approved-invest.in/join", "regulator-lookalike"));
  check("url: the real regulator domain is NOT flagged as lookalike", !hit("https://www.sebi.gov.in/investors.html", "regulator-lookalike"));
  check("url: invalid input returns an error, not a throw", inspectUrl("not a url ::").ok === false);
  check("url: 'sebi.gov.in.evil.com' (official name as a subdomain of another site) flagged", hit("https://sebi.gov.in.evil.com/x", "regulator-lookalike"));
  check("url: 'https://sebi.gov.in@evil.com' flagged as userinfo trick", hit("https://sebi.gov.in@evil.com/x", "userinfo-trick"));
  check("url: unrelated word containing 'rbi' is not flagged", !hit("https://arbitrage-news.com/", "regulator-lookalike"));
  check("url: scheme-less input is accepted", inspectUrl("bit.ly/abc").ok === true);
  check("url: empty -> reason 'empty'", inspectUrl("  ").ok === false && inspectUrl("  ").reason === "empty");
} catch (e) { if (!String(e).includes("Cannot find module")) throw e; }

console.log(failed ? `\n${failed} check(s) failed` : "\nAll engine checks passed");
process.exit(failed ? 1 : 0);
