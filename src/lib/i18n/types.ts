/**
 * Locale contract for PRATIBIMB.
 *
 * `en` is the source of truth and defines the shape. `hi` and `mr` must supply
 * every key, which TypeScript enforces: a missing or misspelled translation is
 * a build error rather than a blank label on a user's phone.
 */

export const LOCALES = ["en", "hi", "mr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_META: Record<
  Locale,
  { label: string; nativeLabel: string; htmlLang: string; speechTag: string }
> = {
  en: { label: "English", nativeLabel: "English", htmlLang: "en-IN", speechTag: "en-IN" },
  hi: { label: "Hindi", nativeLabel: "हिन्दी", htmlLang: "hi-IN", speechTag: "hi-IN" },
  mr: { label: "Marathi", nativeLabel: "मराठी", htmlLang: "mr-IN", speechTag: "mr-IN" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Copy attached to a single manipulation rule. */
export interface PatternCopy {
  /** Short name of the claim, e.g. "SEBI registered". */
  claimText: string;
  /** One or two short sentences explaining the risk. */
  explanation: string;
  /** A concrete verification step the reader can take. */
  verificationNeeded: string;
}

/** Copy for one step of the educational replay. */
export interface ReplayStepCopy {
  message: string;
  whatIsHappening: string;
  whyItMatters: string;
  whatYouCanVerify: string;
  /** Optional signal category key used to colour the chip. */
  signalType?: string;
}

export interface ReplayBranchCopy {
  title: string;
  description: string;
  pattern: string[];
  steps: ReplayStepCopy[];
}

/** Copy for one row of the recovery evidence checklist. */
export interface RecoveryItemCopy {
  label: string;
  description: string;
}

/** Replaces `{token}` placeholders in a template string. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

/** Copy for one recommended next step. */
export interface ActionCopy {
  title: string;
  instruction: string;
}

export interface Dictionary {
  meta: {
    appName: string;
    tagline: string;
    disclaimerShort: string;
  };

  /** Shared app chrome: header, footer, landmarks and button labels. */
  ui: {
    /** `aria-label` for the primary navigation landmark. */
    navMain: string;
    /** `aria-label` for the logo link back to the landing page. */
    brandHome: string;
    /** Primary navigation link labels, in order. */
    navLinks: {
      investigate: string;
      replay: string;
      learn: string;
      recover: string;
    };
    startInvestigation: string;
    openMenu: string;
    closeMenu: string;
    selectLanguage: string;
    languageGroup: string;
    demoSteps: string;
    /** Labels for the four steps of the guided demo rail. */
    demoLabels: {
      investigate: string;
      results: string;
      replay: string;
      learn: string;
    };
    footerProduct: string;
    footerKeepInMind: string;
    /** Heading above the external reporting links. */
    footerOfficialHelp: string;
    footerBlurb: string;
    footerReminder: string;
    /** Names of the official reporting bodies. These stay recognisable. */
    channels: {
      cybercrime: string;
      cybercrimeDesc: string;
      helpline: string;
      helplineDesc: string;
      sebi: string;
      sebiDesc: string;
      rbiSachet: string;
      rbiSachetDesc: string;
    };
  };

  nav: {
    home: string;
    investigate: string;
    checkAMessage: string;
    demo: string;
    offlineReady: string;
  };

  common: {
    back: string;
    next: string;
    previous: string;
    retry: string;
    loading: string;
    cancel: string;
    stop: string;
    close: string;
    yes: string;
    no: string;
    notAdvice: string;
    decisionYours: string;
    privacyFirst: string;
    noHarvesting: string;
    hackathonCredit: string;
    stepOf: string;
  };

  language: {
    heading: string;
    subtitle: string;
    changeLabel: string;
    readAloud: string;
    readAloudStop: string;
    lowBandwidth: string;
    lowBandwidthOn: string;
    lowBandwidthOff: string;
    lowBandwidthHint: string;
  };

  landing: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    demoCta: string;
    ownCta: string;
    reassurance: string;
    trustLocal: string;
    trustNoAdvice: string;
    trustNoData: string;
    howTitle: string;
    howSubtitle: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    step3Title: string;
    step3Body: string;
    ctaTitle: string;
    ctaBody: string;
    /** Sums the rule count sentence with the active rule count. */
    ruleSummary: string;

    /** Hero eyebrow shown above the H1. */
    eyebrow: string;
    /**
     * The H1 is split into three parts so the accented word can carry the
     * gradient without knowing where it falls in the sentence. Concatenate
     * them in order; they already carry the spaces.
     */
    heroTitleBefore: string;
    heroTitleAccent: string;
    heroTitleAfter: string;
    /** Secondary hero CTA: scrolls to the "how it works" section. */
    howCta: string;

    /** Labels inside the fictional message card in the hero. */
    consoleTitle: string;
    consoleNote: string;
    consoleSignals: string;
    consoleLocal: string;

    /** The fictional message body, one line per manipulation category. */
    consoleLines: {
      urgency: string;
      "guaranteed-language": string;
      "social-proof": string;
      authority: string;
      "payment-pressure": string;
    };

    citedNote: string;
    whyExistsEyebrow: string;
    whyExistsBody: string;
    /** Split so the gradient can land on the middle phrase in any language. */
    whyExistsBefore: string;
    whyExistsAccent: string;
    whyExistsAfter: string;
    costAuthorityTitle: string;
    costAuthorityBody: string;
    costUrgencyTitle: string;
    costUrgencyBody: string;
    costOutcomeTitle: string;
    costOutcomeBody: string;

    distinctionEyebrow: string;
    distinctionTitle: string;
    /** `distinctionEmphasis` is set in bold between these two halves. */
    distinctionBody: string;
    distinctionEmphasis: string;
    distinctionEmphasisTail: string;
    claimExample: string;
    evidenceExample: string;
    authorityNote: string;
    authorityVerify: string;
    realAnalysisCta: string;

    replayBadge: string;
    replayBody: string;
    replayPoint1: string;
    replayPoint2: string;
    replayPoint3: string;
    replayStages: {
      one: { title: string; line: string; effect: string };
      two: { title: string; line: string; effect: string };
      three: { title: string; line: string; effect: string };
      four: { title: string; line: string; effect: string };
    };

    teachbackEyebrow: string;
    teachbackBody: string;
    teachReaction: string;
    teachReactionBody: string;
    teachRecognition: string;
    teachRecognitionBody: string;
    teachHabit: string;
    teachHabitBody: string;

    recoveryTeaser: string;

    /** Short labels for the five-step flow shown in \"how it works\". */
    howFlow: {
      one: string;
      two: string;
      three: string;
      four: string;
      five: string;
    };
  };

  input: {
    demoBadge: string;
    normalBadge: string;
    title: string;
    subtitle: string;
    step1: string;
    step2: string;
    step3: string;
    label: string;
    placeholder: string;
    helpText: string;
    errorEmpty: string;
    errorTooLong: string;
    /** Shown when the pasted text is present but too short to analyse. */
    errorTooShort: string;
    loadSample: string;
    sampleNoticeTitle: string;
    sampleNoticeBody: string;
    submit: string;
    submitting: string;
    privacyTitle: string;
    privacyBody: string;
    micStart: string;
    micStop: string;
    micListening: string;
    micUnsupported: string;
    micDenied: string;
    micNoSpeech: string;
    stepsReading: string;
    /** Aria label for the three-step "what happens next" list. */
    stepsReadingLabel: string;

    /** `aria-label` for the text / screenshot / URL radio group. */
    modeLabel: string;
    /** The three input tabs, in tab order. */
    modes: {
      text: { label: string; desc: string };
      screenshot: { label: string; desc: string };
      url: { label: string; desc: string };
    };
    dropHint: string;
    uploadScreenshot: string;
    screenshotHint: string;
    chooseFile: string;
    fetchFromUrl: string;
    urlHint: string;
    analyzeUrl: string;
    privacyHeading: string;
    privacyNoCredentials: string;
    previewTitle: string;
    previewSubtitle: string;
    nothingUploaded: string;
    nothingUploadedPoint2: string;
    /** The five rows of the "what happens when you submit" preview. */
    previewSteps: {
      one: { label: string; detail: string };
      two: { label: string; detail: string };
      three: { label: string; detail: string };
      four: { label: string; detail: string };
      five: { label: string; detail: string };
    };
  };

  analyzing: {
    checkingUser: string;
    checkingSample: string;
    subtitle: string;
    userPreview: string;
    samplePreview: string;
    percentWithMatches: string;
    steps: { reading: string; matching: string; grouping: string; preparing: string };
    /** Bold stage name shown above `steps`. */
    stageDesc: {
      one: string;
      two: string;
      three: string;
      four: string;
    };
    /** Live marker beside the stage that is currently running. */
    running: string;
    /** Shown in a quiet panel: what this scan is and is not. */
    disclaimer: string;
  };

  result: {
    badge: string;
    noMatchTitle: string;
    /** `{count}` and `{plural}` are substituted. */
    matchTitle: string;
    matchSubtitleUser: string;
    matchSubtitleSample: string;
    noMatchSubtitle: string;
    /** `{count}` and `{plural}` ("s" when count is not 1) are substituted. */
    matchCount: string;
    nextHeading: string;
    nextPaymentLead: string;
    nextGenericLead: string;
    seePhrases: string;
    needHelp: string;
    editMessage: string;
    openReplay: string;
    showMessage: string;
    yourMessage: string;
    sampleMessage: string;
    matchedHeading: string;
    matchedSubtitleUser: string;
    matchedSubtitleSample: string;
    exactMatches: string;
    /** `{rule}` is the rule ID, e.g. "R14". */
    ruleExactMatch: string;
    whatCanIVerify: string;
    howScoreCalculated: string;
    confidencePrefix: string;
    factsHeading: string;
    factsSubtitle: string;
    /** `{severity}` is the localized severity word. */
    severityPattern: string;
    priorityFirst: string;
    priorityNext: string;
    priorityBaseline: string;
    /** Shown when nothing matched, above the baseline advice. */
    noMatchStillVerify: string;

    /** Labels for the claim / evidence split. */
    claimLabel: string;
    evidenceLabel: string;
    claimVersusEvidence: string;
    notProofLine: string;
    /** `aria-label` for the copy-to-clipboard control on an evidence quote. */
    copyPhrase: string;
    /** Shown for two seconds after a successful copy. */
    copied: string;
    /** Expand / collapse the surrounding context on a long quote. */
    showMore: string;
    showLess: string;
    /** Exact-match badge on a quoted phrase. */
    exactMatch: string;
    /** `{start}` and `{end}` are substituted into the position badge. */
    position: string;
    /** Headline of the risk score panel. */
    totalScore: string;
    /** Explains how the numeric score is derived. */
    scoreExplainer: string;
  };

  empty: {
    title: string;
    body: string;
    warningTitle: string;
    warningBody: string;
    tryAnother: string;
  };

  loading: {
    result: string;
    resultDetail: string;
    map: string;
    replay: string;
    resilience: string;
    recovery: string;
    analyzing: string;
  };

  actions: {
    paymentPauseTitle: string;
    paymentPauseInstruction: string;
    withdrawalPauseTitle: string;
    withdrawalPauseInstruction: string;
    deadlineTitle: string;
    deadlineInstruction: string;
    identityTitle: string;
    identityInstruction: string;
    claimsTitle: string;
    claimsInstruction: string;
    socialTitle: string;
    socialInstruction: string;
    reviewTitle: string;
    reviewInstruction: string;
    /** `{examples}` is the quoted phrases that triggered the step. */
    rationale: string;
  };

  riskHeadline: {
    low: string;
    medium: string;
    high: string;
    critical: string;
  };

  explain: {
    howThisWorks: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step1Body: string;
    step2Body: string;
    step3Body: string;
    step4Body: string;
    /** `{count}` is replaced with the live rule count. */
    ruleCount: string;
    /** Short form used in compact headers. `{count}` is substituted. */
    ruleCountShort: string;
  };

  categories: Record<string, string>;
  severities: { low: string; medium: string; high: string; critical: string };

  facts: {
    amount: string;
    percentage: string;
    deadline: string;
    paymentHandle: string;
    account: string;
    contact: string;
    url: string;
  };

  map: {
    title: string;
    /** `{signals}`, `{signalPlural}`, `{tactics}`, `{tacticPlural}` are substituted. */
    subtitle: string;
    whyItMatters: string;
    whereItAppears: string;
    important: string;
    importantBody: string;
    backToClaims: string;
    openReplay: string;
  };

  replay: {
    disclaimer: string;
    title: string;
    subtitle: string;
    previous: string;
    nextStep: string;
    complete: string;
    restart: string;
    backToMap: string;
    whatIsHappening: string;
    whyItMatters: string;
    whatYouCanVerify: string;
    /** `{current}` and `{total}` are substituted. */
    stepOf: string;
    /** Aria label for the scenario switcher. */
    branchLabel: string;
    noticeTitle: string;
    noticeBody: string;
    keyInsight: string;
    keyInsightBody: string;
    understood: string;
  };

  teachback: {
    badge: string;
    demoBadge: string;
    title: string;
    subtitle: string;
    emotionHeading: string;
    /** Heading above the selectable reasons a message felt trustworthy. */
    reasonHeading: string;
    /** Keys must match `teachback.reasons`. */
    reasons: Record<string, string>;
    reasonHelp: string;
    /** Heading above the concrete habit to use next time. */
    nextTimeHeading: string;
    textareaLabel: string;
    placeholder: string;
    voiceComingSoon: string;
    seeExample: string;
    analyzeResponse: string;
    completeBadge: string;
    resultTitle: string;
    resultSubtitle: string;
    reasoningHeading: string;
    yourResponse: string;
    askYourself: string;
    keyQuestion: string;
    checklistHeading: string;
    continue: string;
    emotions: Record<string, string>;
    /** Shown under the answer box: why honesty helps. */
    honestLine: string;
    /** Label for the optional free-text follow-up field. */
    optionalLabel: string;
    /** A pre-filled sample answer, so the user can see the shape of a good one. */
    exampleResponse: string;
    /** The habit to build, keyed by the reasoning the user actually showed. */
    nextTimeAdvice: Record<
      | "authority"
      | "urgency"
      | "social-proof"
      | "guaranteed-language"
      | "payment-pressure"
      | "withdrawal-pressure",
      string
    >;
    /** Used when nothing matched, so every path still ends with something actionable. */
    defaultAdvice: string;
  };

  resilience: {
    badge: string;
    title: string;
    subtitle: string;
    habitsTitle: string;
    goalLine1: string;
    goalLine2: string;
    goalBody: string;
    sentMoney: string;
    another: string;
    backHome: string;
    disclaimer: string;

    /** Checkpoint heading. */
    checkpointTitle: string;
    checkpointSubtitle: string;
    /** Keys must match the `choice` keys used by the page. */
    choice: Record<string, string>;
    choiceHelp: string;
    choiceSafer: string;
    choiceRiskier: string;
    choiceNeutral: string;
    /** Heading for the progress section. */
    progressTitle: string;
    progressSubtitle: string;
    /** Labels for the four progress rows. */
    progressLabels: Record<string, string>;
    progressNotYet: string;
    /** Word shown against a habit the reader has already practised. */
    recognised: string;
  };

  recovery: {
    badge: string;
    title: string;
    subtitle: string;
    importantTitle: string;
    importantBody: string;
    checklistTitle: string;
    /** Ordered action titles. Keys are `one` … `five`. */
    steps: Record<string, string>;
    stepsHeading: string;
    /** `{kept}` and `{total}` are replaced with live counts. */
    preservedCount: string;
    timelineTitle: string;
    timelineNote: string;
    generate: string;
    reportTitle: string;
    print: string;
    summaryHeading: string;
    summaryIntro: string;
    /** `{claims}`, `{tactics}`, `{plural}` and `{categoryPlural}` are substituted. */
    summaryRisk: string;
    /** `{tactics}` is the list of matched categories. */
    summaryTactics: string;
    summaryMoney: string;
    summaryEnd: string;
    /** `{kind}` is replaced with "your text" or "fictional sample". */
    messageHeading: string;
    timelineInReport: string;
    claimsHeading: string;
    claimsEmpty: string;
    evidenceHeading: string;
    nextStepsHeading: string;
    channelsTitle: string;
    notAloneTitle: string;
    notAloneBody: string;
    another: string;
    backHome: string;
    disclaimer: string;
    stepBank: string;
    stepCyber: string;
    stepSebi: string;
    stepPreserve: string;
    stepStop: string;
    /** The one sentence most people act on. */
    noMoreMoney: string;
  };

  error: {
    title: string;
    body: string;
    tryAgain: string;
    startOver: string;
    notFoundTitle: string;
    notFoundBody: string;
    investigate: string;
    home: string;
    /** Reassurance that nothing left the device. */
    stayedLocal: string;
  };
}

/** Copy for one verification habit card. */
export interface HabitCopy {
  title: string;
  description: string;
}

/** Copy for one teach-back reasoning label and checklist row. */
export interface TeachbackCopy {
  labels: Record<string, string>;
  checklist: Record<string, string>;
  /** Example answer shown behind the "see an example" control. */
  exampleResponse: string;
}

/**
 * Copy contributed by data files (rules, replay scripts, recovery checklist,
 * habits, teach-back prompts). English is used inline at the definition site;
 * other locales live here, with a fallback to English on any missing key.
 */
export interface ContentDictionary {
  patterns: Record<string, PatternCopy>;
  replay: Record<string, ReplayBranchCopy>;
  recoveryItems: Record<string, RecoveryItemCopy>;
  recoveryTimeline: Record<string, string>;
  habits: Record<string, HabitCopy>;
  teachback: TeachbackCopy;
}
