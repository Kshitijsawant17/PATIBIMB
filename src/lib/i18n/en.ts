import type { Dictionary } from "./types";

/**
 * English copy.
 *
 * This is the reference wording. Every sentence here is deliberately short
 * (under 15 words) so it can be read aloud or translated without losing meaning.
 */
export const en: Dictionary = {
  meta: {
    appName: "PRATIBIMB",
    tagline: "Check a suspicious investment message",
    disclaimerShort: "Not investment advice.",
  },

  ui: {
    navMain: "Main navigation",
    brandHome: "PRATIBIMB home",
    navLinks: {
      investigate: "Investigate",
      replay: "Replay",
      learn: "Learn",
      recover: "Recover",
    },
    startInvestigation: "Start Investigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    selectLanguage: "Select language",
    languageGroup: "Language selection",
    demoSteps: "Demo steps",
    demoLabels: {
      investigate: "Investigate",
      results: "Results",
      replay: "Replay",
      learn: "Learn",
    },
    footerProduct: "Product",
    footerKeepInMind: "Keep in mind",
    footerOfficialHelp: "Official help",
    footerBlurb:
      "An investor resilience platform. It shows how a message tries to influence you, before you act on it.",
    footerReminder:
      "A match is a warning, not proof. PRATIBIMB cannot confirm whether a sender is genuine — only you can, using an official source you find yourself.",
    channels: {
      cybercrime: "National Cyber Crime Portal",
      cybercrimeDesc: "File a complaint online",
      helpline: "Cyber Crime Helpline",
      helplineDesc: "Call 1930, toll free",
      sebi: "SEBI Investor Complaints",
      sebiDesc: "Report unregistered advisors",
      rbiSachet: "RBI Sachet",
      rbiSachetDesc: "Check whether a scheme is registered",
    },
  },

  nav: {
    home: "Home",
    investigate: "Investigate",
    checkAMessage: "Check a message",
    demo: "Demo",
    offlineReady: "Works offline",
  },

  common: {
    back: "Back",
    next: "Next",
    previous: "Previous",
    retry: "Try again",
    loading: "Loading",
    cancel: "Cancel",
    stop: "Stop",
    close: "Close",
    yes: "Yes",
    no: "No",
    notAdvice: "No investment advice",
    decisionYours: "Your decision stays yours",
    privacyFirst: "Privacy-first",
    noHarvesting: "No data harvesting",
    hackathonCredit:
      "Built for the SANGYAN Investor Resilience Hackathon. Not investment advice.",
    stepOf: "Step {current} of {total}",
  },

  language: {
    heading: "Choose your language",
    subtitle: "Pick a language. The whole app changes.",
    changeLabel: "Change language",
    readAloud: "Read aloud",
    readAloudStop: "Stop reading",
    lowBandwidth: "Low-data mode",
    lowBandwidthOn: "Low-data mode is on",
    lowBandwidthOff: "Low-data mode is off",
    lowBandwidthHint: "Turns off animations and heavy graphics.",
  },

  landing: {
    badge: "Investor Protection Tool",
    titleLine1: "Spot the pressure in an investment message",
    titleLine2: "before you act.",
    subtitle:
      "Paste a WhatsApp, SMS, or Telegram message. PRATIBIMB highlights known pressure tactics and gives you a safe next step.",
    demoCta: "See the 30-second demo",
    ownCta: "Check my message",
    reassurance:
      "No account needed. Your message stays on this device.",
    trustLocal: "Your message stays on this device",
    trustNoAdvice: "No investment advice",
    trustNoData: "We never ask for OTPs or passwords",
    howTitle: "How PRATIBIMB works",
    howSubtitle: "A clear way to check a financial message before you act.",
    step1Title: "Paste the message",
    step1Body: "Copy text from WhatsApp, Telegram, or SMS. It stays on your device.",
    step2Title: "See the pressure tactics",
    step2Body: "Read the exact words that matched known patterns, in plain language.",
    step3Title: "Verify before acting",
    step3Body: "Use an official source you find yourself. A match is a warning, not proof.",
    ctaTitle: "Got a suspicious investment message?",
    ctaBody: "Do not act yet. Let PRATIBIMB show you what the message is doing.",
    ruleSummary:
      "PRATIBIMB checks your message against {count} known scam patterns.",

    eyebrow: "INVESTOR RESILIENCE · AI-ASSISTED",
    heroTitleBefore: "See the ",
    heroTitleAccent: "manipulation",
    heroTitleAfter: " before you trust the message.",
    howCta: "See How It Works",

    consoleTitle: "Unverified message",
    consoleNote: "Fictional example · not a real sender",
    consoleSignals: "Risk signals",
    consoleLocal: "Detected on this device",
    consoleLines: {
      urgency: "URGENT: Your investment account has been selected.",
      "guaranteed-language": "Guaranteed 32% returns.",
      "social-proof": "Only 3 slots left. Others have already joined.",
      authority: "SEBI approved opportunity.",
      "payment-pressure": "Send the minimum amount to join today.",
    },

    citedNote: "Cited to exact characters in your text — not a guess.",
    whyExistsEyebrow: "WHY THIS EXISTS",
    whyExistsBefore: "Financial manipulation happens ",
    whyExistsAccent: "before the loss",
    whyExistsAfter: ".",
    whyExistsBody:
      "By the time money moves, the persuasion already worked. PRATIBIMB targets the moment before you send, not the moment after you regret it.",
    costAuthorityTitle: "Borrowed authority",
    costAuthorityBody:
      "A regulator's name dropped in to make a stranger's offer feel official.",
    costUrgencyTitle: "Manufactured urgency",
    costUrgencyBody:
      "A deadline that exists only to stop you verifying anything.",
    costOutcomeTitle: "Outcome as promise",
    costOutcomeBody:
      "A guaranteed number standing in for evidence you never received.",

    distinctionEyebrow: "THE DISTINCTION THAT MATTERS",
    distinctionTitle: "Persuasive language is not proof.",
    distinctionBody:
      "Most tools stop at “this looks risky.” PRATIBIMB shows the gap between what a message ",
    distinctionEmphasis: "claims",
    distinctionEmphasisTail: " and what you can actually verify.",
    claimExample: "“SEBI approved investment.”",
    evidenceExample: "Independent verification required.",
    authorityNote: "A regulator's name, used as a shortcut to trust.",
    authorityVerify:
      "Look up the registration yourself on the regulator's official site.",
    realAnalysisCta: "See it on a real analysis",

    replayBadge: "EDUCATIONAL SIMULATION",
    replayBody:
      "Step through how a message tries to influence you — one technique at a time, with the effect of each one named.",
    replayPoint1: "Built from the signals actually found in your message",
    replayPoint2: "Educational, not predictive — one possible continuation",
    replayPoint3: "Ends with what you can verify yourself",
    replayStages: {
      one: {
        title: "Authority",
        line: "“SEBI approved opportunity.”",
        effect: "Authority language can make a message feel legitimate before evidence is checked.",
      },
      two: {
        title: "Urgency",
        line: "“Only 3 slots remaining.”",
        effect: "Time pressure discourages careful verification.",
      },
      three: {
        title: "Social proof",
        line: "“Thousands of investors are already earning.”",
        effect: "Popularity can create artificial confidence.",
      },
      four: {
        title: "Pressure",
        line: "“Invest before 6 PM.”",
        effect: "Pressure pushes you toward action before reflection.",
      },
    },

    teachbackEyebrow: "TEACH-BACK",
    teachbackBody:
      "Recognition only sticks when you say it back. PRATIBIMB asks what made the message believable, names the reasoning pattern, and gives you the habit to use next time.",
    teachReaction: "Reaction",
    teachReactionBody: "Name what you felt before deciding anything.",
    teachRecognition: "Recognition",
    teachRecognitionBody: "See the exact pressure technique you responded to.",
    teachHabit: "Habit",
    teachHabitBody: "Leave with one concrete action for next time.",

    recoveryTeaser:
      "Calm, practical steps: preserve evidence, record the timeline, identify the recipient, and reach the right official channels.",

    howFlow: {
      one: "Investigate",
      two: "Understand",
      three: "Replay",
      four: "Teach back",
      five: "Protect",
    },
  },

  input: {
    ocr: {
      preparing: "Getting the reader ready (first time only)…",
      reading: "Reading the text on your device… {percent}%",
      doneTitle: "Text read from your screenshot",
      doneBody: "Reading text from an image can make mistakes. Check it below and fix anything wrong before you investigate.",
      lowConfidence: "The reader was only {percent}% sure. Please check the text carefully.",
      errorTitle: "We couldn't read that screenshot",
      errorLoad: "The reader could not finish on this device. Nothing was uploaded. You can paste the message text instead.",
      errorNoText: "We couldn't find readable text in this image. Try a sharper screenshot, or paste the text.",
      errorTooLarge: "This image is too large. Please use one under 10 MB.",
      errorType: "Please choose an image file (PNG, JPG or WebP).",
      retry: "Try again",
      pasteInstead: "Paste the text instead",
      languageNote: "Screenshot reading currently supports English text. For Hindi or Marathi, paste or speak the message.",
      remove: "Remove",
    },
    link: {
      placeholder: "Paste a link, e.g. example.com/join",
      check: "Check this link",
      notOpened: "We do not open the link. We only read the address itself.",
      resultTitle: "What the address itself shows",
      clean: "Nothing unusual in the address itself. That does not make the page safe. Verify the registration yourself.",
      addToMessage: "Add this link to my message",
      errorEmpty: "Paste a link first.",
      errorInvalid: "That does not look like a web address. Check it and try again.",
      findings: {
        "ip-host": { title: "Numbers instead of a name", detail: "Real companies almost always use a name. This address is just numbers." },
        "no-https": { title: "Not an encrypted connection", detail: "The link starts with http://, so anything typed there could be read on the way." },
        shortener: { title: "A shortened link", detail: "Short links hide where they really lead. Do not open it to find out." },
        "regulator-lookalike": { title: "Uses a regulator's name on another website", detail: "The name is in the address, but the website is not that regulator's official site." },
        "userinfo-trick": { title: "A trick with the @ sign", detail: "Everything before the @ is ignored. The real destination is the part after it." },
        punycode: { title: "Look-alike characters", detail: "This address uses special characters that can imitate a familiar name." },
        "invite-link": { title: "An invitation to a chat group", detail: "Groups are a common place where pressure builds among strangers." },
        "unusual-ending": { title: "An unusual ending", detail: "Many honest sites use it too, so this alone proves nothing." },
      },
    },
    demoBadge: "Sample demo",
    normalBadge: "Usually under 30 seconds",
    title: "Paste the message you want to check",
    subtitle:
      "We point out language that matches known pressure tactics. We cannot confirm if a sender is genuine.",
    step1: "Paste a message",
    step2: "See matched phrases",
    step3: "Verify independently",
    label: "Suspicious message text",
    placeholder: "Paste the full message here…",
    helpText: "Copy the text only. Do not include an OTP or password.",
    errorEmpty: "Paste a message before continuing.",
    errorTooLong: "This message is too long. Shorten it, then try again.",
    errorTooShort: "This text is too short. Paste the full message, then try again.",
    loadSample: "Load fictional sample",
    sampleNoticeTitle: "Fictional sample loaded",
    sampleNoticeBody:
      "It shows urgency, unrealistic promises, and a payment request. Edit it or use it as it is.",
    submit: "Check this message",
    submitting: "Preparing analysis…",
    privacyTitle: "Your message stays on this device",
    privacyBody:
      "Analysis runs in your browser. Nothing is uploaded to a server.",
    micStart: "Speak the message",
    micStop: "Stop listening",
    micListening: "Listening… speak now",
    micUnsupported: "Voice input is not available in this browser.",
    micDenied: "Microphone permission was blocked. Paste the text instead.",
    micNoSpeech: "We could not hear anything. Please paste the text instead.",
    stepsReading: "What happens next",
    stepsReadingLabel: "What happens next",
    modeLabel: "Input mode",
    modes: {
      text: { label: "Text", desc: "Paste the message text" },
      screenshot: { label: "Screenshot", desc: "Upload an image" },
      url: { label: "URL", desc: "Paste a link" },
    },
    dropHint: "Drop to use as input",
    uploadScreenshot: "Upload a screenshot",
    screenshotHint:
      "Drag and drop, or tap to choose. Text extraction from images is not available yet.",
    chooseFile: "Choose file",
    fetchFromUrl: "Fetch from a URL",
    urlHint:
      "Reading a live link is not available yet. For now, copy the message text and use Text mode.",
    analyzeUrl: "Analyze URL",
    privacyHeading: "Your content stays under your control",
    privacyNoCredentials:
      "We never ask for banking credentials, OTPs, or passwords.",
    previewTitle: "Investigation preview",
    previewSubtitle: "What happens when you submit",
    nothingUploaded: "Nothing is uploaded",
    nothingUploadedPoint2: "No account, no email, no phone number",
    previewSteps: {
      one: { label: "Analyzing content", detail: "Reading the submitted text" },
      two: { label: "Extracting claims", detail: "Amounts, deadlines, handles" },
      three: { label: "Checking risk signals", detail: "Matching known pressure tactics" },
      four: {
        label: "Separating evidence from persuasion",
        detail: "Claim versus what you can verify",
      },
      five: {
        label: "Building explanation",
        detail: "A safe next step you can act on",
      },
    },
  },

  analyzing: {
    checkingUser: "Checking your message",
    checkingSample: "Checking the sample message",
    subtitle:
      "Running local pattern checks on this device. Nothing is sent anywhere.",
    userPreview: "Message being checked",
    samplePreview: "Fictional demo message",
    /** `{percent}`, `{count}` and `{plural}` are substituted. */
    percentWithMatches: "{percent}% · {count} pattern{plural} matched",
    disclaimer:
      "This is a fixed rule scan running on this device. It is not an AI verdict, and it cannot tell you who sent the message.",
    steps: {
      reading: "Reading the submitted text",
      matching: "Matching known pressure patterns",
      grouping: "Grouping the matched signals",
      preparing: "Preparing safe next steps",
    },
    stageDesc: {
      one: "Analyzing content",
      two: "Extracting claims",
      three: "Separating evidence from persuasion",
      four: "Building explanation",
    },
    running: "running",
  },

  result: {
    triad: {
      title: "What the message shows, and what it leaves open",
      subtitle:
        "A signal is not a fact. Here is what is written in the message, what nobody can tell from the text, and what you should check yourself.",
      knowTitle: "What we know",
      knowNote: "Seen in the text · not verified",
      dontKnowTitle: "What we don't know",
      dontKnowNote: "Nothing in the message proves these",
      verifyTitle: "What to verify",
      verifyNote: "On an official source you find yourself",
      signalsLine:
        "{count} persuasion signal{plural} matched, across {tactics} tactic{tacticPlural}.",
      statesLine: "{kind}: {value}",
      unknowns: {
        authority: "Whether the sender is really registered or approved by the regulator.",
        urgency: "Whether the deadline or limit is real.",
        "social-proof": "Whether the other people exist, or earned anything.",
        "unrealistic-outcome": "Whether a return like this is possible at all.",
        "guaranteed-language": "Whether the promised return is real.",
        impersonation: "Whether the sender is who they say they are.",
        "payment-pressure": "Who owns the account you are asked to pay.",
        "withdrawal-pressure": "Whether the fee is genuine, or whether your money can be withdrawn.",
        sender: "Who actually sent this message.",
      },
    },
    badge: "Local pattern check · not a fraud verdict",
    noMatchTitle: "No known warning signs matched",
    matchTitle: "{count} matched phrase{plural}, each with a rule ID",
    matchSubtitleUser: "Every match below shows the exact words from your message.",
    matchSubtitleSample: "Every match below shows words from the fictional demo message.",
    noMatchSubtitle:
      "Our known patterns did not match. This does not mean the message is safe.",
    matchCount: "{count} exact phrase match{plural}",
    exactMatches: "{count} exact phrase match{plural}",
    nextHeading: "What to do next",
    nextPaymentLead:
      "A payment phrase matched. Do not send money or personal details yet.",
    nextGenericLead: "Before you act, pause and verify every claim yourself.",
    seePhrases: "See the exact matched phrases",
    needHelp: "Already paid? Get help",
    editMessage: "Edit or replace this message",
    openReplay: "Open the educational replay",
    showMessage: "Show the message that was checked",
    yourMessage: "Your submitted message",
    sampleMessage: "Fictional sample message",
    matchedHeading: "What matched",
    matchedSubtitleUser: "Highlighted text is copied from the message you submitted.",
    matchedSubtitleSample: "Highlighted text is copied from the fictional demo message.",
    ruleExactMatch: "Rule {rule} · exact match",
    whatCanIVerify: "What can I verify?",
    howScoreCalculated: "How the pattern level was calculated",
    confidencePrefix: "Important",
    factsHeading: "Details mentioned in the message",
    factsSubtitle: "These details come from the text. They are not verified facts.",
    severityPattern: "{severity} pattern",
    priorityFirst: "Do first",
    priorityNext: "Do next",
    priorityBaseline: "Baseline habit",
    noMatchStillVerify:
      "No known pattern matched. Please still verify the sender yourself.",
    claimLabel: "Claim",
    evidenceLabel: "Evidence",
    claimVersusEvidence: "Claim versus evidence",
    notProofLine: "PRATIBIMB does not treat persuasive language as proof.",
    copyPhrase: "Copy phrase",
    copied: "Copied",
    showMore: "Show more",
    showLess: "Show less",
    exactMatch: "Exact match from your message",
    position: "Position: {start}–{end}",
    totalScore: "Total score",
    scoreExplainer:
      "Each detected category contributes its highest severity once. The score is the sum of these weights.",
  },

  empty: {
    title: "No known manipulation patterns matched",
    body: "PRATIBIMB checks messages against a fixed set of fraud patterns.",
    warningTitle: "This is not an all-clear",
    warningBody:
      "Scams use new wording. No match does not mean the message is safe. Verify yourself if money or personal details were requested.",
    tryAnother: "Check a different message",
  },

  loading: {
    result: "Preparing your analysis",
    resultDetail: "Reading the message you submitted. Nothing leaves your device.",
    map: "Building the manipulation map",
    replay: "Preparing the educational replay",
    resilience: "Preparing your resilience report",
    recovery: "Preparing recovery mode",
    analyzing: "Preparing your local analysis",
  },

  actions: {
    paymentPauseTitle: "Pause any payment request",
    paymentPauseInstruction:
      "Do not transfer money to a personal account or payment handle. Check the recipient through an official source you find yourself.",
    withdrawalPauseTitle: "Do not pay to unlock or release funds",
    withdrawalPauseInstruction:
      "Do not send another fee to withdraw money. Contact your bank using details you find independently.",
    deadlineTitle: "Pause before the deadline",
    deadlineInstruction:
      "Do not let a countdown force a decision. Take time to check the claim yourself.",
    identityTitle: "Check the sender's identity independently",
    identityInstruction:
      "Look up the organization on its official site. Do not use links or numbers from the message.",
    claimsTitle: "Treat return promises as unverified claims",
    claimsInstruction:
      "Ask for written terms and evidence you can check yourself. A number in a message is not proof.",
    socialTitle: "Do not treat group claims as proof",
    socialInstruction:
      "Testimonials and member counts can be faked. Look for independent records instead.",
    reviewTitle: "Review the matched wording before acting",
    reviewInstruction:
      "Read the quoted phrase in context. Verify any important claim yourself.",
    rationale: "Shown because {examples} matched.",
  },

  riskHeadline: {
    low: "A few known patterns matched",
    medium: "Some manipulation patterns detected",
    high: "Many high-severity patterns detected",
    critical: "Many critical manipulation patterns detected",
  },

  explain: {
    howThisWorks: "How this works",
    step1: "Local rule scan.",
    step1Body: "Your message is checked against a fixed rule list.",
    step2: "Cited matches.",
    step2Body: "Each match keeps its rule ID and exact position in your text.",
    step3: "Literal extraction.",
    step3Body: "Amounts, dates and handles are copied out, not verified.",
    step4: "Rule-based next steps.",
    step4Body: "Each step links back to the phrase that caused it.",
    ruleCount:
      "{count} fixed text rules check for known pressure tactics. No message is sent to an AI or server.",
    ruleCountShort: "{count} text rules, all on your device.",
  },

  categories: {
    authority: "Authority claim",
    urgency: "Urgency signal",
    "social-proof": "Social proof",
    "unrealistic-outcome": "Unrealistic outcome",
    "guaranteed-language": "Guaranteed language",
    impersonation: "Impersonation",
    "payment-pressure": "Payment pressure",
    "withdrawal-pressure": "Withdrawal pressure",
    other: "Other",
  },

  severities: { low: "Low", medium: "Medium", high: "High", critical: "Critical" },

  facts: {
    amount: "Amount mentioned",
    percentage: "Percentage mentioned",
    deadline: "Deadline or time pressure",
    paymentHandle: "Possible payment handle",
    account: "Account referenced",
    contact: "Contact detail",
    url: "Link included",
  },

  map: {
    title: "Manipulation map",
    subtitle:
      "This message uses {signals} signal{signalPlural} across {tactics} tactic{tacticPlural}. Tap any signal to learn more.",
    whyItMatters: "Why it matters",
    whereItAppears: "Where it appears",
    important: "Important",
    importantBody:
      "This is a detected signal, not a verified fact. One match does not prove fraud.",
    backToClaims: "Back to claims",
    openReplay: "See the replay",
  },

  replay: {
    disclaimer:
      "We show one possible continuation. This is not a prediction of what will happen.",
    title: "Manipulation Replay",
    subtitle: "See how the message attempts to influence your decision.",
    previous: "Previous step",
    nextStep: "Next step",
    complete: "Finish replay",
    restart: "Start again",
    backToMap: "Back to manipulation map",
    whatIsHappening: "What is happening",
    whyItMatters: "Why it matters",
    whatYouCanVerify: "What you can verify",
    stepOf: "Step {current} of {total}",
    branchLabel: "Choose a scenario",
    noticeTitle: "Notice the pattern?",
    noticeBody:
      "This is a common manipulation pattern. Recognising it helps you stay safe.",
    keyInsight: "Key insight",
    keyInsightBody:
      "The pattern repeats: build trust, create urgency, ask for money, then block withdrawals.",
    understood: "I understand the pattern",
  },

  teachback: {
    badge: "Step 5 of 5",
    demoBadge: "Demo Mode",
    title: "Before you decide…",
    subtitle: "Why did this message feel trustworthy to you?",
    emotionHeading: "How did the message make you feel?",
    reasonHeading: "Why did it seem trustworthy?",
    reasons: {
      official: "It looked official",
      returns: "The returns sounded convincing",
      urgent: "It seemed urgent",
      others: "Others seemed to trust it",
      notime: "I had no time to verify",
    },
    reasonHelp: "Pick all that applied. There is no wrong answer.",
    nextTimeHeading: "What to do next time",
    textareaLabel: "Why did this message feel trustworthy?",
    placeholder: "Write your thoughts here. What made you want to trust it?",
    voiceComingSoon: "Voice input is not available",
    seeExample: "See an example answer",
    analyzeResponse: "Check my answer",
    completeBadge: "Analysis complete",
    resultTitle: "Your trust reasoning",
    resultSubtitle: "Here is what we found in your answer.",
    reasoningHeading: "Reasoning patterns detected",
    yourResponse: "Your answer",
    askYourself: "Now ask yourself:",
    keyQuestion: "Can you verify that claim yourself?",
    checklistHeading: "Verification checklist",
    continue: "Continue to the final step",
    honestLine: "Be honest. Naming the reason is the whole point.",
    optionalLabel: "Optional, but it teaches more.",
    exampleResponse:
      "I trusted it because the message looked official and mentioned SEBI. The returns sounded convincing, and everyone in the group seemed to be earning. I had no time to verify because the offer expired the same day.",
    nextTimeAdvice: {
      authority:
        "Verify the claim independently before trusting the source. Look the organisation up on its official site yourself.",
      urgency: "Pause when urgency replaces evidence. A real deadline survives a two-day wait.",
      "social-proof":
        "Treat group enthusiasm as marketing, not proof. Verify on an official register.",
      "guaranteed-language":
        "Guaranteed returns do not exist. Ask for written terms you can check independently.",
      "payment-pressure":
        "Never send money to unlock money. If a fee is required first, stop there.",
      "withdrawal-pressure":
        "No fee releases funds. Contact your bank using details you find yourself.",
    },
    defaultAdvice:
      "Pause when urgency replaces evidence. Send nothing until you have checked an official source you found yourself.",
    emotions: {
      excited: "Excited",
      fearful: "Scared",
      curious: "Curious",
      pressured: "Pressured",
      trusting: "Trusting",
      other: "Other",
    },
  },

  resilience: {
    badge: "Resilience checkpoint",
    title: "Patterns you can now recognise",
    subtitle: "These tactics are easier to spot next time.",
    habitsTitle: "Habits worth building",
    goalLine1: "Your goal isn’t to trust PRATIBIMB.",
    goalLine2: "Your goal is to need PRATIBIMB less next time.",
    goalBody: "Every time you check things yourself, you become harder to fool.",
    sentMoney: "I already sent money",
    another: "Check another message",
    backHome: "Back to home",
    disclaimer:
      "PRATIBIMB does not give investment advice. Please speak to a SEBI-registered advisor.",

    checkpointTitle: "Would you trust it now?",
    checkpointSubtitle:
      "No wrong answer. This is a checkpoint, not a test.",
    choice: {
      trust: "I would trust it",
      verify: "I would verify it first",
      walkaway: "I would walk away",
    },
    choiceHelp: "Be honest. There is no shame in any of the three.",
    choiceSafer: "Safer",
    choiceRiskier: "Riskier",
    choiceNeutral:
      "This is the only answer that involves checking something you found yourself.",
    progressTitle: "Your Resilience",
    progressSubtitle: "What this investigation trained, without the scorecard language.",
    progressLabels: {
      authority: "Authority manipulation",
      urgency: "Urgency pressure",
      "social-proof": "Social proof",
      "guaranteed-language": "Evidence verification",
    },
    progressNotYet: "Not seen in this message",
    recognised: "Recognised",
  },

  recovery: {
    badge: "Recovery mode",
    title: "Stop. Save the proof. Send no more money.",
    subtitle:
      "If you already sent money, act fast. This page helps you record the details.",
    importantTitle: "Important",
    importantBody:
      "Do not send more money. No extra payment will free your funds. Save everything for reporting.",
    checklistTitle: "Evidence checklist",
    stepsHeading: "What you can do now",
    steps: {
      one: "Preserve the evidence",
      two: "Record the timeline",
      three: "Identify the recipient",
      four: "Prepare an incident summary",
      five: "Reach official help",
    },
    preservedCount: "{kept} of {total} saved",
    timelineTitle: "Incident timeline",
    timelineNote: "This is an example timeline. Replace it with your real times.",
    generate: "Create incident summary",
    reportTitle: "Incident summary report",
    print: "Print",
    summaryHeading: "Incident summary",
    summaryIntro: "I received this message on [DATE].",
    summaryRisk: "PRATIBIMB found {claims} possible claim{plural} in {tactics} tactic{categoryPlural}.",
    summaryTactics: " These included: {tactics}.",
    summaryMoney: " A payment or withdrawal phrase also matched.",
    summaryEnd: "Replace [DATE] and add your details before you submit this.",
    messageHeading: "Message checked ({kind})",
    timelineInReport: "Example timeline — replace with your real events",
    claimsHeading: "Claims found in the message",
    claimsEmpty: "No known patterns matched. Write the claims in your own words.",
    evidenceHeading: "Evidence saved",
    nextStepsHeading: "Next steps",
    channelsTitle: "Official reporting channels",
    notAloneTitle: "You are not alone",
    notAloneBody:
      "Many people fall for these schemes. Reporting it helps stop the next person.",
    another: "Check another message",
    backHome: "Back to home",
    disclaimer:
      "This report is for records only. It cannot recover your money. Report to official channels only.",
    stepBank: "Call your bank now and report the transaction.",
    stepCyber: "File a complaint at cybercrime.gov.in or call 1930.",
    stepSebi: "Report to SEBI if the message claimed registration.",
    stepPreserve: "Save all messages. Do not delete anything.",
    stepStop: "Do not send any more payments.",
    noMoreMoney: "Do not send additional money to recover the original amount.",
  },

  error: {
    title: "We couldn't analyze this content.",
    body: "Something went wrong on this screen. Your message was not sent anywhere, so trying again is safe.",
    tryAgain: "Try again",
    startOver: "Start over",
    notFoundTitle: "This page does not exist",
    notFoundBody: "The link may be old. Nothing was lost.",
    investigate: "Check a message",
    home: "Back to home",
    stayedLocal:
      "Nothing was uploaded and nothing was sent anywhere. Your message stayed in this browser tab, so trying again is safe. If it keeps failing, paste the message as plain text instead of an image.",
  },
};
