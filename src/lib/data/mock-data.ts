import { MockAnalysis, ReplayBranch, VerificationHabit } from "../types";
import { analyzeMessage } from "../engine/analyzer";
import { DEFAULT_LOCALE, type Locale } from "../i18n/types";

export const sampleMessage = `Dear Investor,

I am Rajesh, a SEBI registered investment advisor with 15 years of experience.

I am sharing an exclusive opportunity in the stock market. This is a guaranteed opportunity with 96% accuracy. Our team of experts has insider information about upcoming stock movements.

Act before 6 PM today — this offer is only for today. Limited seats available.

Everyone in our group is earning ₹50,000+ monthly. We have over 10,000 members who are already profiting.

Don't tell anyone about this. This is a secret tip.

Send ₹10,000 to UPI ID: rajesh@upi to get started. Double your money in 30 days.

Best regards,
Rajesh Kumar
SEBI Registered Advisor
Contact: +91 98765 43210`;

/**
 * Run the deterministic engine over arbitrary text.
 *
 * This is the single entry point every screen should use, so that what is on
 * screen always corresponds to the text the user actually submitted.
 * `locale` selects the language used for rule explanations.
 */
export function buildAnalysis(rawText: string, locale: Locale = DEFAULT_LOCALE): MockAnalysis {
  const result = analyzeMessage(rawText, locale);

  return {
    id: result.id,
    claims: result.claims,
    signals: result.signals,
    extractedFacts: result.extractedFacts,
    recommendedActions: result.recommendedActions,
    replay: replayData,
    habits: habitsData,
    riskLevel: result.overallRisk,
    riskSummary: result.riskSummary,
    claimsDetected: result.claimsDetected,
    signalsDetected: result.signalsDetected,
    overallRisk: result.overallRisk,
    riskScore: result.riskScore,
    riskBreakdown: result.riskBreakdown,
  };
}

/**
 * Analysis of the built-in sample message.
 *
 * Fallback for deep links and demo mode, where nothing has been submitted yet.
 * Never use this in place of the user's own text.
 */
export function generateMockAnalysis(): MockAnalysis {
  return buildAnalysis(sampleMessage);
}

const replayData: ReplayBranch[] = [
  {
    id: "branch-1",
    title: "If you send the money",
    description: "What typically happens when someone sends money to an unverified advisor",
    outcomes: [
      {
        id: "outcome-1a",
        label: "Most likely",
        scenario:
          "You send ₹10,000 via UPI. The 'advisor' stops responding within 24-48 hours. The UPI ID is untraceable. Your money is gone.",
        probability: "high",
        timeframe: "24-48 hours",
        emotionalImpact:
          "Panic, regret, shame. Many victims don't report because they feel embarrassed.",
      },
      {
        id: "outcome-1b",
        label: "Possible",
        scenario:
          "You receive a small 'return' of ₹2,000 to build trust. Then you're asked to invest ₹50,000 for a 'bigger opportunity'. You lose everything.",
        probability: "medium",
        timeframe: "1-2 weeks",
        emotionalImpact:
          "False hope followed by deeper loss. The initial 'return' makes you trust the scammer more.",
      },
      {
        id: "outcome-1c",
        label: "Worst case",
        scenario:
          "Your UPI details are used for further fraud. You receive fake calls from 'bank officials' asking for OTPs. More money is stolen from your account.",
        probability: "low",
        timeframe: "1-4 weeks",
        emotionalImpact:
          "Severe financial and emotional distress. Recovery can take months or years.",
      },
    ],
  },
  {
    id: "branch-2",
    title: "If you verify independently",
    description: "What happens when you check before acting",
    outcomes: [
      {
        id: "outcome-2a",
        label: "Most likely",
        scenario:
          "You search for the SEBI registration number — it doesn't exist. You search the phone number — it's linked to multiple complaints. You avoid the scam entirely.",
        probability: "high",
        timeframe: "15-30 minutes",
        emotionalImpact:
          "Relief and confidence. You've protected yourself and your family.",
      },
      {
        id: "outcome-2b",
        label: "Possible",
        scenario:
          "You ask a trusted friend or family member. They help you see the red flags. You report the number to the National Cyber Crime portal.",
        probability: "medium",
        timeframe: "30-60 minutes",
        emotionalImpact:
          "Empowerment. You've not only protected yourself but potentially others too.",
      },
    ],
  },
];

const habitsData: VerificationHabit[] = [
  {
    id: "habit-1",
    title: "Verify independently",
    description:
      "Always check SEBI registration on the official website. Never rely on the sender's own claims or documents.",
    icon: "search-check",
  },
  {
    id: "habit-2",
    title: "Don't rely on urgency",
    description:
      "If an opportunity is real, it will still be there tomorrow. Time pressure is a manipulation tool, not a feature.",
    icon: "timer-off",
  },
  {
    id: "habit-3",
    title: "Separate claims from evidence",
    description:
      "Anyone can make a claim. Ask: 'What proof can I independently verify?' If there's none, walk away.",
    icon: "scale",
  },
  {
    id: "habit-4",
    title: "Don't use sender's links as verification",
    description:
      "Links and contact details provided by the sender are not independent verification. Find official sources yourself.",
    icon: "link-2-off",
  },
];

export const investigationSteps = [
  { id: 1, label: "Reading the submitted text", duration: 250 },
  { id: 2, label: "Matching known pressure patterns", duration: 400 },
  { id: 3, label: "Grouping the matched signals", duration: 300 },
  { id: 4, label: "Preparing safe next steps", duration: 250 },
];
