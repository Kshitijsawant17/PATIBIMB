# PRATIBIMB

> **See the manipulation before you trust the message.**

PRATIBIMB is an investor-resilience tool built for the SANGYAN Investor Resilience Hackathon. It helps first-time investors from Tier-2/3 Indian cities examine suspicious financial messages, recognize manipulation patterns, and build safer decision-making habits.

**PRATIBIMB does NOT give stock tips, buy/sell recommendations, price predictions, or investment advice.**

---

## How It Works

```
Suspicious WhatsApp message
        ↓
    Paste message
        ↓
   Investigation
        ↓
  Claim Decomposition
        ↓
  Manipulation Map
        ↓
  Evidence Assessment
        ↓
   Reality Replay
        ↓
    Teach-Back
        ↓
  Resilience Result
```

## Features

### 1. Investigation Engine
- Deterministic rule-based analysis (no AI, no APIs)
- One-click fictional sample demo; paste your own message to run the same flow
- Screenshot upload, drag/drop and clipboard image OCR using locally bundled Tesseract.js
- Public web-page URL extraction through a safety-bounded server route
- 31 manipulation pattern detection rules
- 8 signal categories: authority, urgency, social-proof, unrealistic-outcome, guaranteed-language, impersonation, payment-pressure, withdrawal-pressure
- Evidence status assessment for each claim
- Transparent risk score: each detected tactic is counted **once** at its strongest severity, and the results screen shows exactly which tactics contributed how much

### 2. Image + URL Extraction
- Screenshot OCR runs locally in the browser with bundled English, Hindi and Marathi language data
- Images are preprocessed for contrast before OCR
- URL mode extracts readable HTML/text on the server with size, redirect and private-network guards
- Extracted text is always shown to the user before investigation

### 3. Cited Evidence
Every signal carries a stable rule ID (`R01`…`R31`) and the **exact character range** of its match in the submitted message.
- Quoted words are highlighted in context, not paraphrased
- Offsets are verifiable: the highlight always matches the text you pasted
- Context windows are surrogate-safe, so emoji and Indic scripts are not split
- "How this works" explains the whole pipeline on the results screen

### 4. Structured Extraction
A second, independent set of patterns copies out literal details from the message:
- Amounts (`₹10,000`, `Rs 25000`), percentages, deadlines/urgency phrases, and possible payment handles
- Each extraction keeps its own source anchor, so it is traceable to the original text
- Labelled as **extraction, not verification** — a stated figure is not a true one
- A payment-handle pattern must sit near payment wording, so an ordinary support email is not mislabelled

### 5. Signal-Driven Recommendations
- Next steps are generated only from the categories that actually matched
- Each recommendation cites the phrases and extracted details that triggered it, with working in-page links
- Fixed safety guidance (pause, verify independently, report). Not investment advice, and never a fraud verdict

### 6. Manipulation Map
- Interactive visualization of detected signals
- Click each signal to understand what it does
- Rule ID and surrounding message text shown for the selected signal
- Simple-language explanations for Tier-2/3 users
- Clear distinction: "detected signal" vs "verified fact"

### 7. Reality Replay
- Cinematic step-by-step simulation
- Branching scenarios based on detected signals
- "SIMULATION — NOT A PREDICTION" disclaimer
- Pattern recognition at the end

### 8. Teach-Back Analysis
- Keyword-based reasoning detection
- Identifies why the message felt trustworthy
- Interactive verification checklist
- "Can you verify that claim independently?" prompt

### 9. Recovery Mode
- Evidence preservation checklist (8 items)
- Auto-generated incident timeline
- Printable incident summary report that carries the analysed message forward
- Official reporting channel links

### 10. Demo Mode
- One-click guided journey for judges
- Persistent step navigation (01 INPUT → 02 INVESTIGATE → 03 UNDERSTAND → 04 REPLAY → 05 LEARN)
- Trust indicators: "No investment advice" + "Your decision stays yours"

## Architecture

```
Message text
   |
   +--> PATTERNS (31 rules) --> signals: ruleId + exact match range + context
   |                                     |
   |                                     +--> risk score (one weight per category)
   |                                     +--> recommended actions (cited to signals)
   |
   +--> FACT_RULES ---------> extracted facts: amounts, %, deadlines, payment handles
                                               |
   Results screen: cited matches | extracted details | traceable next steps
```

| Module | Responsibility |
|--------|----------------|
| `lib/engine/patterns.ts` | Manipulation rules and category metadata |
| `lib/engine/evidence.ts` | Bounded, surrogate-safe match anchoring |
| `lib/engine/extractor.ts` | Literal detail extraction with source anchors |
| `lib/engine/recommendations.ts` | Rule-driven action plan that cites its triggers |
| `lib/engine/analyzer.ts` | Orchestration and scoring |
| `lib/analysis/AnalysisContext.tsx` | Session-scoped analysis state |

### Why there is no AI API call
The core problem is a **verification** problem: a first-time investor needs to know which words in the message are the warning signs and what to do next. That is answered by traceable rules and citations, not by a model that would hide its reasoning, require an API key, and forward a user's financial message to a third party. A remote LLM call would make the product slower, less private and *less* explainable, while adding a failure mode and a running cost.

The result is an analysis a judge can audit in seconds: every claim links back to a rule ID and an exact span of the text that was pasted.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5 |
| Icons | lucide-react |
| State | React Context + sessionStorage |
| Backend | None — fully client-side |

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/Kshitijsawant17/pratibimb.git
cd pratibimb
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
pratibimb/
├── src/
│   ├── app/                    # 9 screens (App Router)
│   │   ├── page.tsx            # Landing
│   │   ├── investigate/        # Input screen
│   │   ├── analyzing/          # Investigation animation
│   │   ├── result/             # Claims analysis
│   │   ├── manipulation/       # Manipulation map
│   │   ├── replay/             # Reality replay simulation
│   │   ├── teachback/          # Teach-back analysis
│   │   ├── resilience/         # Resilience checkpoint
│   │   └── recovery/           # Recovery mode
│   ├── components/
│   │   ├── ui/                 # Button, Card, Badge, ProgressBar
│   │   └── layout/             # Header, DemoNav, Footer
│   └── lib/
│       ├── engine/             # Analyzer, Simulator, Patterns
│       ├── data/               # Mock data
│       ├── demo/               # Demo context
│       └── types/              # TypeScript interfaces
├── package.json
└── README.md
```

## Key Principles

| Principle | Implementation |
|-----------|---------------|
| **No stock tips** | Engine only flags patterns, never suggests actions |
| **No predictions** | Replay shows possible outcomes with probabilities |
| **Transparency** | Every score shows its basis; confidence levels on all extractions |
| **Tier-2/3 friendly** | Simple language, mobile-first, low bandwidth |
| **No data harvesting** | All processing client-side, sessionStorage only |
| **One command** | `npm install && npm run dev` |
| **Public good** | Free, open, no monetization, no broker links |

## Screens

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, trust badges, CTA |
| `/investigate` | Input screen (paste text or load the fictional sample) |
| `/analyzing` | Animated investigation sequence |
| `/result` | Claims analysis with expandable cards |
| `/manipulation` | Interactive manipulation map |
| `/replay` | Cinematic reality replay simulation |
| `/teachback` | Teach-back analysis with checklist |
| `/resilience` | Resilience checkpoint with patterns learned |
| `/recovery` | Recovery mode with evidence checklist |

## License

MIT

## Disclaimer

PRATIBIMB is an educational tool. It does not provide investment advice, legal advice, or guarantee recovery of funds. Always consult a SEBI-registered advisor for financial decisions.
