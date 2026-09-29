// emergency.js
// Decides whether an SMS looks like a real emergency.
// Design goal: never miss a genuine emergency, but stop firing voice calls
// for ordinary questions like "can you help me find Hall B?".

// Things that look scary but are almost always harmless questions.
// These are stripped out BEFORE we look for emergency signals.
const BENIGN_PHRASES = [
    /\bfire\s+(exit|escape|drill|safety|marshal|warden)s?\b/g,
    /\bsecurity\s+(desk|check|checks|checkpoint|policy|rules|screening|line)\b/g,
    /\b(first\s*aid|medical)\s+(station|room|desk|kit|tent|point)\b/g,
    // "can you help", "how can you help", "what can I help" etc. are chatbot small talk
    /\b(can|could|would|will|may|might|do|does|how|what)\s+(you|i|we)\s+(please\s+)?help\b/g,
];

// After "help me" / "need help", these words mean it's an ordinary request.
const HELP_FOLLOWED_BY_TASK =
    '(?:to\\s+)?(?:find|finding|locate|locating|get|getting|understand|understanding|' +
    'register|registering|with|know|knowing|see|book|check|figure|navigate|reach|' +
    'learn|choose|choosing|pick|plan|planning|sign|log|connect|contact|decide|set|' +
    'setup|use|using|answer|answering|about|regarding|on)\\b';

const EMERGENCY_PATTERNS = [
    // Fire
    { name: 'fire', re: /\bfire\b/ },
    { name: 'smoke/gas', re: /\bsmell(?:s|ing)?\s+(?:of\s+)?(?:smoke|burning|gas)\b/ },

    // Medical
    {
        name: 'medical',
        re: /\b(?:collaps(?:ed|es|ing)|faint(?:ed|s|ing)|pass(?:ed|ing)?\s+out|unconscious|unresponsive|seizures?|convuls\w+|chok(?:ing|ed)|can'?t\s+breathe|cannot\s+breathe|not\s+breathing|difficulty\s+breathing|hard\s+to\s+breathe|heart\s+attack|chest\s+pain|bleeding|stroke|allergic\s+reaction|overdose|injur(?:y|ed|ies)|hurt|wounded|ambulance|paramedic|fell\s+down)\b/,
    },
    { name: 'urgent medical', re: /\bmedical\s+(?:emergency|help|assistance|attention)\b/ },
    { name: 'general emergency', re: /\b(?:emergency|life[- ]threatening)\b/ },

    // Asking for a person by role ("need a doctor", "call security")
    {
        name: 'summon responder',
        re: /\b(?:need|call|get|find|bring|send)\s+(?:a\s+|an\s+|the\s+|some\s+)?(?:doctor|nurse|medic|paramedic|ambulance|security|police|guard)s?\b/,
    },

    // Personal safety
    {
        name: 'safety threat',
        re: /\b(?:attacked|assaulted|harassed|molested|stalked|threatened|robbed|kidnapped|abducted|following\s+me|weapon|gun|knife|bomb)\b/,
    },
    { name: 'feeling unsafe', re: /\b(?:feel|feeling|am|i'?m|im)\s+unsafe\b/ },

    // Pleas for help. "help" alone is a plea; "help me find X" is not.
    { name: 'bare help', re: /^\W*(?:please\s+|pls\s+|plz\s+)?(?:help|sos|mayday)(?:\s+(?:me|us|please|pls|now|quick(?:ly)?|asap))*\W*$/ },
    { name: 'help me', re: new RegExp('\\bhelp\\s+me\\b(?!\\s+' + HELP_FOLLOWED_BY_TASK + ')') },
    { name: 'need help', re: new RegExp('\\bneeds?\\s+(?:urgent\\s+|immediate\\s+|emergency\\s+)?(?:help|assistance)\\b(?!\\s+' + HELP_FOLLOWED_BY_TASK + ')') },
    { name: 'urgent help', re: /\b(?:urgent(?:ly)?|immediately|right\s+now|asap)\b.*\bhelp\b|\bhelp\b.*\b(?:urgent(?:ly)?|immediately|right\s+now|asap)\b/ },

    // Swahili (common in Nairobi). Remove any you don't want.
    { name: 'swahili', re: /\b(?:msaada|dharura|mgonjwa|ameanguka|anazimia|moto)\b/ },
];

function normalize(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[\u2018\u2019]/g, "'")   // curly apostrophes from phone keyboards
        .replace(/\s+/g, ' ')
        .trim();
}

function detectEmergency(message) {
    let text = normalize(message);
    for (const benign of BENIGN_PHRASES) {
        text = text.replace(benign, ' ');
    }
    for (const { name, re } of EMERGENCY_PATTERNS) {
        if (re.test(text)) {
            return { isEmergency: true, matched: name };
        }
    }
    return { isEmergency: false, matched: null };
}

module.exports = { detectEmergency };