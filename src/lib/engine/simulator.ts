import { AnalysisResult, ClaimCategory } from "../types";

export interface SimulationStep {
  id: string;
  stepNumber: number;
  message: string;
  sender: string;
  whatIsHappening: string;
  whyItMatters: string;
  whatYouCanVerify: string;
  signalType?: ClaimCategory;
}

export interface SimulationBranch {
  id: string;
  title: string;
  description: string;
  steps: SimulationStep[];
  pattern: string[];
}

export interface Simulation {
  id: string;
  title: string;
  disclaimer: string;
  branches: SimulationBranch[];
}

/**
 * Generate a simulation based on detected signals.
 * This is an educational simulation, NOT a prediction.
 */
export function generateSimulation(analysis: AnalysisResult): Simulation {
  const detectedCategories = new Set(analysis.signals.map((s) => s.type));

  const branches: SimulationBranch[] = [];

  // Branch 1: If urgency or guaranteed-language detected → urgency escalation
  if (
    detectedCategories.has("urgency") ||
    detectedCategories.has("guaranteed-language") ||
    detectedCategories.has("unrealistic-outcome")
  ) {
    branches.push({
      id: "branch-urgency",
      title: "The urgency escalation",
      description: "One possible pattern when urgency and unrealistic outcome language is used",
      steps: [
        {
          id: "step-1",
          stepNumber: 1,
          message: "Sir, your first trade generated ₹18,400 profit.",
          sender: "Advisor",
          whatIsHappening:
            "An initial 'profit' is shown to build trust. This may be fabricated or from a different account.",
          whyItMatters:
            "Early 'profits' are designed to lower your guard and make you believe the system works.",
          whatYouCanVerify:
            "Check if the profit is real by asking for a withdrawal — real profits can be withdrawn.",
          signalType: "unrealistic-outcome",
        },
        {
          id: "step-2",
          stepNumber: 2,
          message: "To unlock withdrawal, complete verification.",
          sender: "System",
          whatIsHappening:
            "A verification step is introduced. This is a common pattern to create a barrier before you can access your money.",
          whyItMatters:
            "Legitimate platforms do not require 'verification' to withdraw your own money.",
          whatYouCanVerify:
            "Check the platform's official withdrawal policy — it should not require additional verification.",
          signalType: "withdrawal-pressure",
        },
        {
          id: "step-3",
          stepNumber: 3,
          message: "Verification requires a small processing payment.",
          sender: "System",
          whatIsHappening:
            "A payment is requested to 'verify' your account. This is an advance-fee fraud pattern.",
          whyItMatters:
            "Legitimate platforms do not charge you to withdraw your own money. This payment is likely the actual target.",
          whatYouCanVerify:
            "Remember: if you need to pay to get your money, it is likely a scam.",
          signalType: "payment-pressure",
        },
        {
          id: "step-4",
          stepNumber: 4,
          message: "Your account has been upgraded.",
          sender: "System",
          whatIsHappening:
            "You receive confirmation that your account is 'upgraded'. This creates a false sense of progress.",
          whyItMatters:
            "The 'upgrade' is designed to make you feel invested and more likely to continue.",
          whatYouCanVerify:
            "Check if the upgrade actually provides any real benefit or if it is just a status change.",
          signalType: "guaranteed-language",
        },
        {
          id: "step-5",
          stepNumber: 5,
          message: "Additional payment required for premium withdrawal.",
          sender: "System",
          whatIsHappening:
            "Another payment is requested. The goalposts keep moving — this is a hallmark of advance-fee fraud.",
          whyItMatters:
            "Each payment is designed to extract more money. The 'withdrawal' keeps getting further away.",
          whatYouCanVerify:
            "Ask: 'If I pay this, will I definitely be able to withdraw?' Get the answer in writing.",
          signalType: "payment-pressure",
        },
        {
          id: "step-6",
          stepNumber: 6,
          message: "Withdrawal unavailable. Contact support.",
          sender: "System",
          whatIsHappening:
            "The withdrawal is now blocked. Support may be unresponsive or ask for more payments.",
          whyItMatters:
            "At this point, the pattern is clear: payments are being extracted with no intention of returning your money.",
          whatYouCanVerify:
            "Report to the National Cyber Crime Portal (cybercrime.gov.in) and your bank immediately.",
          signalType: "withdrawal-pressure",
        },
      ],
      pattern: ["Authority", "Trust", "Urgency", "Commitment", "Additional Payment", "Withdrawal Pressure"],
    });
  }

  // Branch 2: If authority or impersonation detected → identity verification pattern
  if (
    detectedCategories.has("authority") ||
    detectedCategories.has("impersonation")
  ) {
    branches.push({
      id: "branch-authority",
      title: "The identity verification pattern",
      description: "One possible pattern when authority claims are used",
      steps: [
        {
          id: "step-1",
          stepNumber: 1,
          message: "I am calling from SEBI. Your account needs verification.",
          sender: "SEBI Officer",
          whatIsHappening:
            "The sender claims to be from a regulatory authority. SEBI does not call individuals to verify accounts.",
          whyItMatters:
            "Impersonating authority figures creates fear and compliance. People are less likely to question 'official' requests.",
          whatYouCanVerify:
            "SEBI never calls individuals asking for account verification. Hang up and call SEBI directly.",
          signalType: "authority",
        },
        {
          id: "step-2",
          stepNumber: 2,
          message: "Your bank account will be frozen if you don't act now.",
          sender: "SEBI Officer",
          whatIsHappening:
            "A threat is used to create urgency. This is a common social engineering tactic.",
          whyItMatters:
            "Fear of losing access to your account bypasses rational thinking.",
          whatYouCanVerify:
            "Contact your bank directly through official channels — they will confirm no such action is pending.",
          signalType: "urgency",
        },
        {
          id: "step-3",
          stepNumber: 3,
          message: "Share your OTP to complete verification.",
          sender: "SEBI Officer",
          whatIsHappening:
            "You are asked to share an OTP. This is the actual goal — OTPs give access to your accounts.",
          whyItMatters:
            "Never share OTPs with anyone. Banks and regulators never ask for OTPs.",
          whatYouCanVerify:
            "Remember: OTPs are for your use only. No legitimate organization will ask for them.",
          signalType: "payment-pressure",
        },
      ],
      pattern: ["Authority", "Fear", "Urgency", "OTP Request", "Account Access"],
    });
  }

  // Branch 3: If social-proof detected → bandwagon pattern
  if (detectedCategories.has("social-proof")) {
    branches.push({
      id: "branch-social",
      title: "The bandwagon pattern",
      description: "One possible pattern when social proof is used",
      steps: [
        {
          id: "step-1",
          stepNumber: 1,
          message: "Join 50,000+ investors already earning with us.",
          sender: "Group Admin",
          whatIsHappening:
            "Large numbers are used to create a bandwagon effect. The claim is unverifiable.",
          whyItMatters:
            "When 'everyone' is doing it, it feels safer. But the numbers may be fabricated.",
          whatYouCanVerify:
            "Ask: 'Can I speak to any of these 50,000 members independently?'",
          signalType: "social-proof",
        },
        {
          id: "step-2",
          stepNumber: 2,
          message: "Here's a screenshot of my profit: ₹2,00,000 this month.",
          sender: "Group Member",
          whatIsHappening:
            "A 'member' shares a profit screenshot. This may be fabricated or from a different context.",
          whyItMatters:
            "Seeing 'proof' from someone in the group creates trust. But screenshots can be easily faked.",
          whatYouCanVerify:
            "Ask: 'Can I verify this profit independently? Can I withdraw my money anytime?'",
          signalType: "unrealistic-outcome",
        },
        {
          id: "step-3",
          stepNumber: 3,
          message: "Limited spots left. Join now to secure your position.",
          sender: "Group Admin",
          whatIsHappening:
            "Scarcity is used to pressure you into joining quickly.",
          whyItMatters:
            "Time pressure prevents you from doing research or asking questions.",
          whatYouCanVerify:
            "Ask: 'If this opportunity is real, why is it limited? Why are you sharing it with me?'",
          signalType: "urgency",
        },
      ],
      pattern: ["Social Proof", "Fake Proof", "Scarcity", "Pressure", "Commitment"],
    });
  }

  // Default branch if no specific patterns matched
  if (branches.length === 0) {
    branches.push({
      id: "branch-default",
      title: "The general manipulation pattern",
      description: "A common pattern seen in financial manipulation",
      steps: [
        {
          id: "step-1",
          stepNumber: 1,
          message: "You've been selected for an exclusive investment opportunity.",
          sender: "Unknown",
          whatIsHappening:
            "You are told you are 'special' or 'selected'. This creates a sense of privilege.",
          whyItMatters:
            "Feeling special makes you less likely to question the opportunity.",
          whatYouCanVerify:
            "Ask: 'Why was I selected? How did you get my contact information?'",
          signalType: "other",
        },
        {
          id: "step-2",
          stepNumber: 2,
          message: "This opportunity is only available for a limited time.",
          sender: "Unknown",
          whatIsHappening:
            "Time pressure is applied to prevent research.",
          whyItMatters:
            "Urgency bypasses rational decision-making.",
          whatYouCanVerify:
            "Ask: 'What happens if I wait? Is the opportunity still available tomorrow?'",
          signalType: "urgency",
        },
      ],
      pattern: ["Exclusivity", "Urgency", "Pressure"],
    });
  }

  return {
    id: `sim-${Date.now()}`,
    title: "Reality Replay",
    disclaimer:
      "We're showing one possible continuation based on common manipulation patterns. Your situation may be different.",
    branches,
  };
}
