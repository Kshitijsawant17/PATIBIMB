# PRATIBIMB Hackathon UI / UX Update

This build preserves the existing analysis engine and product journey while strengthening the judge-facing experience.

## Included
- Premium dark fintech/cyber visual system already present across the app.
- End-to-end journey: Investigate → Result → Manipulation Replay → Teach-Back → Resilience → Recovery.
- Claim vs Evidence presentation.
- Deterministic, explainable risk-signal engine with uncertainty-aware wording.
- English / Hindi / Marathi content support.
- Demo navigation rail and preloaded fictional sample flow.
- Screenshot OCR upgraded from a placeholder into an actual Tesseract-powered extraction flow.
- OCR states for processing, success, and graceful failure.
- Screenshot text is passed into the existing analysis engine rather than creating fake results.

## Validation
- TypeScript: passes `tsc --noEmit`.
- ESLint: 0 errors; existing React/Next setState-in-effect warnings remain.
- Next production build could not complete in this isolated environment because the bundled Next SWC binary attempted to download from npm and outbound network access was unavailable. This is an environment limitation, not a TypeScript compilation failure.
