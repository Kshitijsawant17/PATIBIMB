import type { Pattern } from "./patterns";

/**
 * Hindi, Marathi and Hinglish manipulation rules.
 *
 * Why this file exists
 * --------------------
 * Investment scams aimed at Tier-2/3 Indian users are usually written in
 * Hinglish or a regional language, not in English. Without these rules the
 * engine reports "no known pattern matched" on precisely the messages most
 * likely to be fraudulent, which is the worst possible failure for this
 * product: it gives false reassurance.
 *
 * Writing these patterns safely
 * -----------------------------
 * 1. Devanagari has no `\b` word boundary, so these rules never use `\b` or
 *    `\w`. They use an explicit `[\u0900-\u097F]` block instead.
 * 2. `\u0900-\u097F` is the Devanagari range and already includes matras,
 *    so `पक्का` and `डबल` match as whole units.
 * 3. The leading `[\u0900-\u097F\s]*?` is bounded and non-greedy. It exists so
 *    a rule can match a phrase that begins mid-sentence, but it cannot run
 *    away across the paragraph.
 * 4. Hindi and Marathi share the Devanagari script, so a few genuinely shared
 *    words are covered once, and wording that actually differs is listed
 *    separately below with a comment saying why.
 * 5. Romanised Hinglish is kept in its own group because it is written in
 *    Latin script and can safely use `\b`.
 */
export const REGIONAL_PATTERNS: Pattern[] = [
  // --- Romanised Hinglish (Latin script, so \b is safe here) ----------------

  {
    regex: /\b(?:aaj\s*hi|abhi\s*hi|sirf\s*aaj|aaj\s*ke\s*and\s*andar|aaj\s*tak)\b/i,
    category: "urgency",
    severity: "high",
    claimText: "Aaj hi (today only)",
    copyKey: "hinglish-urgency-today",
    explanation:
      "“Aaj hi” means “today itself”. A same-day deadline stops you checking first.",
    verificationNeeded: "A real offer still exists tomorrow. Wait one day, then check again.",
  },
  {
    regex: /\b(?:double\s*(?:paisa|kar|payout)|paisa\s*double|double\s*paisa|paisa\s*double\s*karo)\b/i,
    category: "unrealistic-outcome",
    severity: "critical",
    claimText: "Double paisa",
    copyKey: "hinglish-unrealistic-double",
    explanation: "“Double paisa” promises to double your money. No real investment can.",
    verificationNeeded: "Nobody can promise a fixed doubling. Treat the claim as false.",
  },
  {
    regex: /\b(?:pakka\s*(?:return|profit|paisa|nata|returns)|pakki\s*(?:return|profit)|pakka)\b/i,
    category: "guaranteed-language",
    severity: "medium",
    claimText: "Pakka return",
    copyKey: "hinglish-guaranteed-pakka",
    explanation: "“Pakka return” is Hinglish for a guaranteed return. None can be guaranteed.",
    verificationNeeded: "Ask what happens in a losing year. No answer means walk away.",
  },
  {
    regex: /\b(?:100\s*%|\b9\d\s*%)\s*(?:profit|return|returns|success|accuracy|paisa)\b/i,
    category: "unrealistic-outcome",
    severity: "critical",
    claimText: "100% profit claim",
    copyKey: "hinglish-unrealistic-100-percent",
    explanation: "A 100% or near-100% profit claim is never true. Markets always carry risk.",
    verificationNeeded: "Stay away from anyone promising a 100% return.",
  },
  {
    regex: /\b(?:sirf\s*limited\s*(?:seat|slot|jagah)|limited\s*seats?|seat\s*khatam|slots?\s*bhare)\b/i,
    category: "urgency",
    severity: "medium",
    claimText: "Limited seats",
    copyKey: "hinglish-urgency-limited-seat",
    explanation: "Scarcity wording like “limited seats” pushes you to hurry and skip checks.",
    verificationNeeded: "Real investments are not sold like limited stock. Verify capacity claims.",
  },
  {
    regex: /\b(?:sebi\s*(?:registered|approved)|rbi\s*(?:approved|licensed)|government\s*(?:approved|scheme|backed))\b/i,
    category: "authority",
    severity: "high",
    claimText: "Regulator or government approval",
    copyKey: "hinglish-authority-regulator",
    explanation: "The message borrows a regulator’s name to look official.",
    verificationNeeded: "Open the regulator’s official site yourself and search the number.",
  },
  {
    regex: /\b(?:bhej[eo]|bhij[eo]|bhej)\w*\s*(?:paise|paisa|rupay|rs\.?\s*\d|amount)\b|\bupi\s*id\s*[:=]?\s*\w+/i,
    category: "payment-pressure",
    severity: "high",
    claimText: "Payment request",
    copyKey: "hinglish-payment-pressure",
    explanation: "You are asked to send money to a handle. That is a direct payment trap.",
    verificationNeeded: "Never pay a personal UPI ID. Verify through an official channel.",
  },
  {
    regex: /\b(?:withdraw\w*|nikalan\w*)\s*(?:ke\s*liye|for)?\s*(?:fee|charge|tax|penalty)|\b(?:fee|charge)\s*(?:lag|lagga)\w*/i,
    category: "withdrawal-pressure",
    severity: "critical",
    claimText: "Fee to release your money",
    copyKey: "hinglish-withdrawal-fee",
    explanation: "A fee to unlock your money is a classic advance-fee fraud step.",
    verificationNeeded: "Legitimate platforms do not charge you to take your own money back.",
  },
  {
    regex: /\b(?:secret|chhupa|chhup|mat\s*(?:batana|bataye|batan)|kisi\s*ko\s*(?:mat|na))\b/i,
    category: "impersonation",
    severity: "medium",
    claimText: "Keep it secret",
    copyKey: "hinglish-impersonation-secret",
    explanation: "Being told to stay quiet stops you checking with people you trust.",
    verificationNeeded: "A real adviser will not stop you speaking to family or an expert.",
  },
  {
    regex: /\b(?:sab\s*(?:log|people)\s*(?:kama|paisa)|sab\s*(?:log|people)\s*kama\s*rahe|sab\s*paisa\s*kama)\b/i,
    category: "social-proof",
    severity: "medium",
    claimText: "Sab log kama rahe",
    copyKey: "hinglish-social-everyone",
    explanation: "“Everyone is earning” cannot be checked. It is used to make a scheme look safe.",
    verificationNeeded: "Ask for a specific, checkable reference instead of “everyone”.",
  },

  // --- Hindi (Devanagari) ---------------------------------------------------
  // Devanagari rules below use [\u0900-\u097F] character classes rather than
  // \b, because JavaScript's word boundary does not understand this script.

  {
    regex: /[\u0900-\u097F]{0,10}?(?:पक्का|पक्की|गारंटी|गारन्टी|यकीन)[\u0900-\u097F\s]{0,8}?(?:रिटर्न|प्रतिफल|मुनाफा|पैसा|नफा)/,
    category: "guaranteed-language",
    severity: "critical",
    claimText: "पक्का रिटर्न",
    copyKey: "hi-guaranteed-return",
    explanation: "“पक्का रिटर्न” यानी पक्का रिटर्न। किसी असली निवेश में रिटर्न पक्का नहीं होता।",
    verificationNeeded: "सोचिए, नुकसान के साल क्या होगा? उत्तर न हो तो आगे न बढ़ें।",
  },
  {
    regex: /(?:आज\s*ही|अभी\s*कर(?:ो)?|आज\s*के\s*अंदर|आखिरी\s*(?:मौका|अवसर)|समय\s*समाप्त|जल्द\s*कर(?:ो)?)/,
    category: "urgency",
    severity: "high",
    claimText: "आज ही / आखिरी मौका",
    copyKey: "hi-urgency-today",
    explanation: "“आज ही” यानी आज ही करने का दबाव। इससे जाँच से पहले ही फँस सकते हैं।",
    verificationNeeded: "असली मौका कल भी रहेगा। एक दिन रुककर फिर जाँचें।",
  },
  {
    regex: /(?:डबल|दोगुना|दोहरा|तिगुना)[\u0900-\u097F\s]{0,6}?(?:पैसा|पैसे|रिटर्न|रुपये)?/,
    category: "unrealistic-outcome",
    severity: "critical",
    claimText: "डबल / दोगुना पैसा",
    copyKey: "hi-unrealistic-double",
    explanation: "पैसा दोगुना करने का वादा असल में संभव नहीं है।",
    verificationNeeded: "कोई तय मात्रा में पैसा दोगुना करने की गारंटी नहीं दे सकता।",
  },
  {
    regex: /100\s*%|9\d\s*%/,
    category: "unrealistic-outcome",
    severity: "critical",
    claimText: "100% मुनाफा दावा",
    copyKey: "hi-unrealistic-100-percent",
    explanation: "100% मुनाफा या रिटर्न का दावा कभी सच नहीं होता। बाज़ार में जोखिम रहता है।",
    verificationNeeded: "100% रिटर्न का दावा करने वाले से दूरी बनाए रखें।",
  },
  {
    // Covers both word orders that occur in practice: "पैसे भेजें" and
    // "भेजें पैसे", plus a UPI ID written in Devanagari. The `i` flag is needed
    // because "UPI" is Latin while "आईडी" is Devanagari.
    regex: /upi\s*(?:आईडी|id)|(?:पैसे|पैसा|पैसें|रकम|रुपये)[\u0900-\u097F\s]{0,6}?भेज|भेज[\u0900-\u097F\s]{0,8}?(?:पैसे|पैसा|पैसें|रकम|रुपये)/i,
    category: "payment-pressure",
    severity: "high",
    claimText: "पैसे भेजने का दबाव",
    copyKey: "hi-payment-pressure",
    explanation: "व्यक्तिगत UPI आईडी या खाते में पैसे भेजने को कहा गया है। यह भुगतान जाल है।",
    verificationNeeded: "व्यक्तिगत UPI आईडी में पैसा न भेजें। आधिकारिक स्रोत से जाँचें।",
  },
  {
    // "पैसा निकालने के लिए फी लगेगी" — the fee noun may follow the withdrawal
    // verb, so the gap between the two parts is deliberately generous.
    regex: /(?:निकालने|निकालना|निकालते)[\u0900-\u097F\s]{0,24}?(?:फी|शुल्क|टैक्स|जुर्माना|खर्च)/,
    category: "withdrawal-pressure",
    severity: "critical",
    claimText: "पैसा निकालने पर फी",
    copyKey: "hi-withdrawal-fee",
    explanation: "अपना पैसा निकालने के लिए फी माँगना सामान्य ठगी का तरीका है।",
    verificationNeeded: "असली प्लेटफ़ॉर्म अपने पैसे वापस लेने की फी नहीं लेते।",
  },
  {
    regex: /(?:sebi|सेबी|आरबीआई|सरकारी)[\u0900-\u097F\s]{0,6}?(?:रजिस्टर्ड|रजिस्टर्ड|अप्रूव्ड|approved|योजना|scheme)/i,
    category: "authority",
    severity: "high",
    claimText: "सेबी या सरकार की मंज़ूरी का दावा",
    copyKey: "hi-authority-regulator",
    explanation: "संदेश सरकारी दिखने के लिए रेगुलेटर का नाम लेता है। पंजीकरण खुद जाँचा जा सकता है।",
    verificationNeeded: "रेगुलेटर की आधिकारिक वेबसाइट खुद खोलकर पंजीकरण नंबर देखें।",
  },
  {
    regex: /(?:सभी\s*(?:लोग|लोगो))[\u0900-\u097F\s]{0,8}?(?:कमा|कमा\s*रहे?|जुड़)/,
    category: "social-proof",
    severity: "medium",
    claimText: "सभी लोग कमा रहे हैं",
    copyKey: "hi-social-everyone",
    explanation: "“सभी लोग कमा रहे” जैसा दावा जाँचा नहीं जा सकता। यह भरोसा बनाने के लिए है।",
    verificationNeeded: "“सभी” के बजाय कोई ठोस और जाँचने योग्य नाम माँगें।",
  },
  {
    regex: /(?:किसी\s*को\s*(?:मत|न)[\u0900-\u097F\s]{0,6}?(?:बताना|बताएँ|बताया)|गुप्त[\u0900-\u097F\s]{0,6}?(?:रख|बात))/,
    category: "impersonation",
    severity: "medium",
    claimText: "किसी को मत बताना",
    copyKey: "hi-impersonation-secret",
    explanation: "किसी को न बताने का कहना आपको अपने लोगों से जाँच करने से रोकता है।",
    verificationNeeded: "असली सलाहकार आपको भरोसेमंद व्यक्ति से बात करने से नहीं रोकेगा।",
  },

  // --- Marathi (Devanagari) ------------------------------------------------
  // Marathi uses the same script, so these rules cover Marathi-specific
  // wording rather than repeating the Hindi patterns above.
  {
    regex: /(?:निश्चित|हमी|खात्री|गॅरंटी)[\u0900-\u097F\s]{0,8}?(?:परतावा|नफा|फायदा|पैसे)/,
    category: "guaranteed-language",
    severity: "critical",
    claimText: "निश्चित परतावा",
    copyKey: "mr-guaranteed-return",
    explanation: "“निश्चित परतावा” म्हणजे निश्चित परतावा. खऱ्या गुंतवणुकीत परतावा निश्चित असत नाही.",
    verificationNeeded: "विचारा, नुकसानाच्या वर्षी काय होईल? उत्तर नसेल तर पुढे जाऊ नका.",
  },
  {
    regex: /(?:आजच|आत्ताच|शेवटची\s*संधी|वेळ\s*संपत|मुदत\s*संपत|लवकर\s*करा)/,
    category: "urgency",
    severity: "high",
    claimText: "आजच / शेवटची संधी",
    copyKey: "mr-urgency-today",
    explanation: "“आजच” म्हणजे आत्ताच करा असा दबाव. तपासणीपूर्वीच तुम्ही अडकता.",
    verificationNeeded: "खरी संधी उद्याही असेल. एक दिवस थांबून पुन्हा तपासा.",
  },
  {
    regex: /(?:दुप्पट|दोनदुप्पट|तिप्पट)[\u0900-\u097F\s]{0,6}?(?:पैसा|पैसे|परतावा|रुपये)?/,
    category: "unrealistic-outcome",
    severity: "critical",
    claimText: "पैसे दुप्पट",
    copyKey: "mr-unrealistic-double",
    explanation: "पैसे दुप्पट होतील असा वचन खऱ्यात शक्य नाही.",
    verificationNeeded: "ठराविक रकमेने पैसे दुप्पट होतील असे कोणीही आवड देत नाही.",
  },
  {
    regex: /(?:पैसे\s*(?:पाठवा|द्या|जमा)|भरा[\u0900-\u097F\s]{0,6}?(?:पैसे|रकम)|[\u092a\u0948]{1,2}\s*(?:आईडी|id)[\u0900-\u097F\s]{0,4}?[:=]?)/,
    category: "payment-pressure",
    severity: "high",
    claimText: "पैसे पाठवण्याचा दबाव",
    copyKey: "mr-payment-pressure",
    explanation: "वैयक्तिक खात्यात पैसे पाठवायला सांगितले आहे. हा थेट पैसे लुबण्याचा कट आहे.",
    verificationNeeded: "वैयक्तिक UPI आईडीला कधीही पैसे पाठवू नका. अधिकृत माध्यमाने तपासा.",
  },
  {
    regex: /(?:काढण्या|काढणे|काढता)[\u0900-\u097F\s]{0,12}?(?:शुल्क|फी|कर|दंड)/,
    category: "withdrawal-pressure",
    severity: "critical",
    claimText: "पैसे काढण्यासाठी शुल्क",
    copyKey: "mr-withdrawal-fee",
    explanation: "तुमचे पैसे काढण्यासाठी शुल्क मागणे हा गंडागूळीचा जुना पद्धत आहे.",
    verificationNeeded: "खऱ्या प्लॅटफॉर्म तुमचे पैसे परत घेण्यासाठी शुल्क घेत नाहीत.",
  },
  {
    regex: /(?:सर्व\s*(?:लोक|लोकांनी)|सगळे\s*(?:लोक|लोक))[\u0900-\u097F\s]{0,8}?(?:कमवत|कमावतारे|जिंकत)/,
    category: "social-proof",
    severity: "medium",
    claimText: "सर्व लोक कमवतात",
    copyKey: "mr-social-everyone",
    explanation: "“सर्व लोक कमवतात” हा दावा तपासता येत नाही. हा विश्वास निर्माण करण्यासाठी आहे.",
    verificationNeeded: "“सर्व” ऐवजी ठराविक, तपासता येणारे नाव किंवा नोंद मागा.",
  },
  {
    regex: /(?:कोणाला\s*(?:सांगू\s*नका|मत\s*सांगा)|गुप्त[\u0900-\u097F\s]{0,6}?(?:राख|ठेव))/,
    category: "impersonation",
    severity: "medium",
    claimText: "कोणाला सांगू नका",
    copyKey: "mr-impersonation-secret",
    explanation: "कोणाला सांगू नये असे सांगणे म्हणजे तुम्ही मित्रांशी तपासणी टाळता.",
    verificationNeeded: "खरा सल्लागार तुम्हाला विश्वासार्ह व्यक्तीशी बोलण्यापासून रोखणार नाही.",
  },
];
