# PRATIBIMB — Submission-Ready Notes

## One-line pitch
PRATIBIMB is an explainable investor-resilience system that helps people see how a suspicious financial message manipulates them, then turns that insight into a safer verification habit.

## The demo in 3 minutes
1. Open **Investigate** and use the built-in fictional message, or upload a screenshot.
2. If using a screenshot, PRATIBIMB performs local OCR in the browser and loads the extracted text for review.
3. Run the investigation.
4. Show **Claim vs Evidence** and the exact phrases that triggered each signal.
5. Open **Manipulation Replay** and reveal authority → urgency → social proof → pressure.
6. Complete **Teach-Back**: explain why the message felt trustworthy.
7. Complete the **Resilience Checkpoint**.
8. If relevant, show **Recovery Mode** for evidence preservation and incident preparation.

## What makes it different
- **Manipulation Replay:** educationally reconstructs the persuasion sequence instead of only returning a scam label.
- **Teach-Back:** converts the user's own reasoning into a reusable verification habit.
- **Traceability:** every rule-based signal points to the exact words that triggered it.
- **Uncertainty-aware:** a detected signal is not presented as proof of fraud.
- **Privacy-first:** text and image OCR are processed locally; no OTPs, passwords, brokerage credentials, or banking credentials are requested.
- **Bharat-ready:** simple language with English, Hindi and Marathi content support.

## Inputs
### Text
Paste a suspicious message directly.

### Screenshot
Upload, drag/drop, or paste a copied screenshot. OCR runs locally using bundled Tesseract.js language data. Images are not uploaded to a third-party OCR service.

### URL
Enter a public HTTP/HTTPS page. The server extracts readable HTML/text and sends only the extracted text into the same investigation engine. Login-only pages and image-only URLs should be submitted as screenshots instead.

## Safety positioning
PRATIBIMB is an educational resilience tool. It does not provide buy/sell recommendations, stock tips, price predictions, or guarantees of recovery. It separates detected persuasion signals from verified facts and tells users what requires independent verification.

## Local run
```bash
npm install
npm run dev
```

## Production validation
```bash
npm run lint
npm run build
npm start
```

The final environment must have Node.js 20+ and network access during `npm install` so Next.js can install its platform-specific SWC binary.
