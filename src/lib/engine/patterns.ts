import { ClaimCategory, Severity } from "../types";

export interface Pattern {
  regex: RegExp;
  category: ClaimCategory;
  severity: Severity;
  claimText: string;
  explanation: string;
  verificationNeeded: string;
  /**
   * Optional stable key used to look up translated copy in the locale
   * dictionaries. Defaults to a slug of `claimText` when absent.
   */
  copyKey?: string;
}

/**
 * Deterministic key for a rule's translated copy.
 * Keeps translations addressable without hand-maintaining a parallel id list.
 */
export function patternCopyKey(pattern: Pattern): string {
  return (
    pattern.copyKey ??
    pattern.claimText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );
}

export const PATTERNS: Pattern[] = [
  // Authority
  {
    regex: /sebi\s*(registered|approved|certified|licensed)/i,
    category: "authority",
    severity: "high",
    claimText: "SEBI registered",
    explanation:
      "The message claims SEBI registration. SEBI registration can be verified independently on the SEBI website (sebi.gov.in). Without a registration number, this claim cannot be confirmed.",
    verificationNeeded: "Ask for the SEBI registration number and verify it on sebi.gov.in",
  },
  {
    regex: /rbi\s*(approved|licensed|authorized)/i,
    category: "authority",
    severity: "high",
    claimText: "RBI approved",
    explanation:
      "The message claims RBI approval. RBI does not approve individual investment schemes. This may be an attempt to borrow legitimacy from a regulator.",
    verificationNeeded: "Check if the scheme is listed on RBI's official website or caution list",
  },
  {
    regex: /government\s*(approved|backed|scheme|guaranteed)/i,
    category: "authority",
    severity: "high",
    claimText: "Government approved",
    explanation:
      "The message implies government backing. Government-backed schemes have specific names and are announced through official channels.",
    verificationNeeded: "Verify the scheme name on official government portals (pib.gov.in, india.gov.in)",
  },

  // Urgency
  {
    regex: /act\s*(now|fast|quick|immediately)/i,
    category: "urgency",
    severity: "high",
    claimText: "Act now",
    explanation:
      "Time pressure is a classic manipulation tactic. It discourages independent verification and due diligence.",
    verificationNeeded: "Legitimate opportunities do not require immediate action within hours",
  },
  {
    regex: /today\s*only/i,
    category: "urgency",
    severity: "high",
    claimText: "Today only",
    explanation:
      "Artificial scarcity creates pressure to act without thinking. Real investment opportunities are not limited to a single day.",
    verificationNeeded: "Check if the opportunity is still available after 24 hours",
  },
  {
    regex: /limited\s*(time|seat|slot|offer|period)/i,
    category: "urgency",
    severity: "medium",
    claimText: "Limited time",
    explanation:
      "Scarcity language is used to create fear of missing out (FOMO) and bypass rational decision-making.",
    verificationNeeded: "Ask: 'Is this opportunity real, or is it designed to make me act without thinking?'",
  },
  {
    regex: /offer\s*(ends?|expires?|closing)/i,
    category: "urgency",
    severity: "medium",
    claimText: "Offer ending",
    explanation:
      "Deadline pressure is designed to prevent you from consulting others or doing research.",
    verificationNeeded: "Verify the deadline independently — legitimate offers have clear, verifiable terms",
  },
  {
    regex: /last\s*(chance|opportunity|call)/i,
    category: "urgency",
    severity: "high",
    claimText: "Last chance",
    explanation:
      "'Last chance' language is a high-pressure tactic. It implies you will lose out forever if you don't act immediately.",
    verificationNeeded: "Ask: 'If this is truly the last chance, why is the sender sharing it with me?'",
  },
  {
    regex: /before\s*\d+\s*(pm|am|o'?clock)/i,
    category: "urgency",
    severity: "high",
    claimText: "Time-bound deadline",
    explanation:
      "Specific time deadlines create artificial urgency. They are designed to stop you from verifying the claim.",
    verificationNeeded: "Check if the deadline is real by waiting — legitimate opportunities don't expire in hours",
  },

  // Social proof
  {
    // Allows a few words between the subject and the verb, so phrasings like
    // "Everyone in our group is earning…" are caught instead of only the
    // literal "Everyone is earning". The gap is bounded and cannot cross a
    // sentence boundary, which keeps this from over-matching unrelated text.
    regex:
      /everyone\b[^.!?\n]{0,30}?\b(?:is|are|has|have)\s+(?:been\s+)?(?:earning|making|profiting|investing)/i,
    category: "social-proof",
    severity: "medium",
    claimText: "Everyone is earning",
    explanation:
      "Vague social proof claims are unverifiable. 'Everyone' is not a specific, checkable reference.",
    verificationNeeded: "Ask for specific, verifiable references — not vague claims about 'everyone'",
  },
  {
    regex: /(lakhs?|thousands?|crores?|millions?)\s*(of\s*(people|members|investors|users|customers))/i,
    category: "social-proof",
    severity: "medium",
    claimText: "Large member count",
    explanation:
      "Large numbers sound impressive but are meaningless without verifiable details. They cannot be independently confirmed.",
    verificationNeeded: "Ask: 'Can I independently verify these numbers? Where is the public record?'",
  },
  {
    // Accepts a quantity claim with or without a trailing "+", and with common
    // magnitude prefixes: "over 10,000 members", "10,000+ members".
    regex:
      /(?:over|more than|above|upto|up to)?\s*(10,?000|50,?000|1,?00,?000|2,?00,?000)\s*\+?\s*(members|investors|users|people|traders)/i,
    category: "social-proof",
    severity: "medium",
    claimText: "Thousands of members",
    explanation:
      "Specific-sounding numbers can be fabricated. Without a verifiable source, these are just claims.",
    verificationNeeded: "Check if the platform has a public, verifiable track record",
  },

  // Unrealistic outcome
  {
    // Only fires on implausibly high percentages (90%+) anywhere, or on any
    // percentage attached to an accuracy/success claim. A plain "12% return"
    // is an ordinary statement and must not be scored as critical.
    regex: /\b(?:9\d|100)\s*%|\d{2,3}\s*%\s*(?:accuracy|success\s*rate)/i,
    category: "unrealistic-outcome",
    severity: "critical",
    claimText: "High accuracy claim",
    explanation:
      "No investment strategy can guarantee high accuracy. Markets are inherently unpredictable. Claims of 90%+ accuracy are not credible.",
    verificationNeeded: "Ask: 'If this accuracy is real, why is it being shared publicly?'",
  },
  {
    regex: /double\s*(your|money|investment|capital)/i,
    category: "unrealistic-outcome",
    severity: "critical",
    claimText: "Double your money",
    explanation:
      "Promises of doubling money are a hallmark of investment fraud. Legitimate investments do not guarantee specific returns.",
    verificationNeeded: "Remember: all investments carry risk. No one can guarantee returns.",
  },
  {
    regex: /triple\s*(your|money|investment|capital)/i,
    category: "unrealistic-outcome",
    severity: "critical",
    claimText: "Triple your money",
    explanation:
      "Promises of tripling money are a hallmark of investment fraud. Legitimate investments do not guarantee specific returns.",
    verificationNeeded: "Remember: all investments carry risk. No one can guarantee returns.",
  },
  {
    // Multiplier claims are only implausible at 5x or above; "2x" can describe
    // a legitimate recovery after a drawdown.
    regex: /(?:[5-9]|\d{2,})x\s*(?:return|profit|money|investment)/i,
    category: "unrealistic-outcome",
    severity: "critical",
    claimText: "Multiplier return claim",
    explanation:
      "Multiplier claims (5x, 10x, etc.) are not credible for legitimate investments. They are designed to trigger greed.",
    verificationNeeded: "Ask: 'What is the source of these returns? Can I verify them independently?'",
  },
  {
    regex: /risk[\s-]?free/i,
    category: "unrealistic-outcome",
    severity: "critical",
    claimText: "Risk-free claim",
    explanation:
      "All investments carry risk. 'Risk-free' claims are contradictory and a major red flag.",
    verificationNeeded: "Remember: if it sounds too good to be true, it probably is.",
  },

  // Guaranteed language
  {
    regex: /guaranteed?\s*(return|profit|income|outcome|result)/i,
    category: "guaranteed-language",
    severity: "critical",
    claimText: "Guaranteed returns",
    explanation:
      "The word 'guaranteed' in investment context is a major red flag. No legitimate investment can guarantee returns.",
    verificationNeeded: "SEBI regulations prohibit guaranteed return claims. Report such claims to SEBI.",
  },
  {
    regex: /guaranteed?\s*(opportunity|profit|money|success)/i,
    category: "guaranteed-language",
    severity: "critical",
    claimText: "Guaranteed opportunity",
    explanation:
      "Guarantee language is designed to remove skepticism. Legitimate advisors do not use this language.",
    verificationNeeded: "Ask: 'If this is guaranteed, what is the risk? Who bears it?'",
  },
  {
    regex: /fixed\s*(return|income|profit|interest)/i,
    category: "guaranteed-language",
    severity: "high",
    claimText: "Fixed returns",
    explanation:
      "Fixed return claims are common in Ponzi and pyramid schemes. Legitimate market-linked investments do not offer fixed returns.",
    verificationNeeded: "Check if the returns are market-linked or fixed — fixed returns are a red flag",
  },
  {
    regex: /assured\s*(return|profit|income)/i,
    category: "guaranteed-language",
    severity: "high",
    claimText: "Assured returns",
    explanation:
      "'Assured' is a softer form of 'guaranteed' but carries the same risk. It implies certainty where none exists.",
    verificationNeeded: "Ask: 'What happens if the investment performs poorly? Who absorbs the loss?'",
  },

  // Impersonation
  {
    regex: /(dear\s*(investor|customer|user|friend))/i,
    category: "impersonation",
    severity: "medium",
    claimText: "Generic greeting",
    explanation:
      "Generic greetings like 'Dear Investor' are used in mass-targeted scams. Legitimate advisors address you by name.",
    verificationNeeded: "Check if the sender knows your name — generic greetings suggest mass targeting",
  },
  {
    regex: /(whatsapp|telegram|signal)\s*(group|channel|message)/i,
    category: "impersonation",
    severity: "low",
    claimText: "Messaging app origin",
    explanation:
      "Investment advice shared via messaging apps is often unregulated. Legitimate advisors do not solicit via WhatsApp/Telegram.",
    verificationNeeded: "Verify if the advisor is SEBI-registered — check sebi.gov.in",
  },

  // Payment pressure
  {
    regex: /send\s*(money|amount|rs\.?|₹|payment)/i,
    category: "payment-pressure",
    severity: "high",
    claimText: "Send money request",
    explanation:
      "Requests to send money via UPI or other methods are a direct payment pressure signal. Legitimate investments do not require sending money to personal accounts.",
    verificationNeeded: "Never send money to personal UPI IDs. Legitimate investments use registered platforms.",
  },
  {
    regex: /upi\s*(id|number|to|address)/i,
    category: "payment-pressure",
    severity: "high",
    claimText: "UPI payment request",
    explanation:
      "UPI payments to personal IDs are untraceable and irreversible. This is a common fraud pattern.",
    verificationNeeded: "Legitimate investments never ask for UPI payments to personal accounts",
  },
  {
    // Matches "pay to", "payment via", "transfer to us", etc. The previous
    // `pay\s*(to|via|...)` form missed "Payment via net banking", which is the
    // phrasing used in real advance-fee messages.
    regex: /(?:pay|payment|transfer|remit|wire)\s*(?:to|via|through|now|us|in)/i,
    category: "payment-pressure",
    severity: "medium",
    claimText: "Payment instruction",
    explanation:
      "Direct payment instructions are designed to move money quickly before you can verify the claim.",
    verificationNeeded: "Always verify the recipient's identity through independent channels",
  },
  {
    // Asking for money to a personal account, however it is phrased.
    regex: /(?:to|in)\s+(?:my|our)\s+(?:personal|own|private)\s+(?:account|upi|wallet|bank)/i,
    category: "payment-pressure",
    severity: "high",
    claimText: "Personal account payment",
    explanation:
      "Legitimate investments are never paid into a personal bank account, UPI ID, or wallet. Registered platforms use their own account with a proper invoice.",
    verificationNeeded: "Refuse to pay a personal account. Registered intermediaries have their own SEBI-registered entity account.",
  },
  {
    regex: /deposit\s*(now|immediately|today|amount)/i,
    category: "payment-pressure",
    severity: "high",
    claimText: "Deposit demand",
    explanation:
      "Urgent deposit demands are a hallmark of advance-fee fraud. Legitimate investments do not pressure for immediate deposits.",
    verificationNeeded: "Ask: 'Why is there urgency around the deposit? What happens if I wait?'",
  },

  // Withdrawal pressure
  {
    regex: /withdrawal\s*(fee|charge|tax|penalty)/i,
    category: "withdrawal-pressure",
    severity: "critical",
    claimText: "Withdrawal fee",
    explanation:
      "Withdrawal fees or penalties are a classic advance-fee fraud pattern. You pay to 'unlock' your money, then more fees appear.",
    verificationNeeded: "Legitimate investments do not charge withdrawal fees. Report such schemes immediately.",
  },
  {
    regex: /(unlock|release|withdraw)\s*(your|money|fund|profit)/i,
    category: "withdrawal-pressure",
    severity: "high",
    claimText: "Unlock your money",
    explanation:
      "Language about 'unlocking' or 'releasing' funds implies your money is being held hostage. This is a common fraud pattern.",
    verificationNeeded: "Ask: 'Why can I not withdraw my money freely? What is the lock?'",
  },
  {
    regex: /processing\s*(fee|charge|cost)/i,
    category: "withdrawal-pressure",
    severity: "high",
    claimText: "Processing fee",
    explanation:
      "Processing fees to release funds are a hallmark of advance-fee fraud. The fees keep increasing.",
    verificationNeeded: "Legitimate investments do not charge processing fees for withdrawals",
  },
];

export const CATEGORY_LABELS: Record<ClaimCategory, string> = {
  authority: "Authority Claim",
  urgency: "Urgency Signal",
  "social-proof": "Social Proof",
  "unrealistic-outcome": "Unrealistic Outcome",
  "guaranteed-language": "Guaranteed Language",
  impersonation: "Impersonation",
  "payment-pressure": "Payment Pressure",
  "withdrawal-pressure": "Withdrawal Pressure",
  other: "Other",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};
