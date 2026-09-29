// test-emergency.js  -  run with: node test-emergency.js
const { detectEmergency } = require('./emergency');

const SHOULD_TRIGGER = [
    'help', 'HELP!!', 'please help', 'help me', 'help me now',
    'ANYONE PLEASE HELP ME!!', 'someone needs help', 'I need help',
    'urgent help needed at hall B', 'someone collapsed near main stage',
    'there is a fire in hall b', 'my friend fainted', "I can't breathe",
    'need a doctor', 'call security', 'I need security at the courtyard',
    'someone is bleeding', 'he passed out', "I'm being harassed",
    'a man is following me', "there's an emergency", 'medical emergency at registration',
    'ambulance', 'someone is having a seizure', 'help me, someone fainted',
    'can you help me, my friend collapsed', 'msaada tafadhali', 'moto! moto!',
];

const SHOULD_NOT_TRIGGER = [
    'can you help me find hall b?', 'help me find the washroom',
    'I need help with registration', 'I need help finding my seat',
    'how can you help?', 'hello, can you help me?', 'what can you help with',
    'where is the fire exit', 'where is the security desk',
    'is there security at the entrance', 'where is the first aid station',
    'what time is the fireside chat', 'is there a smoking area',
    'talk on cyber attack prevention', 'help me understand the schedule',
    'what time is lunch', 'can you help with the wifi password',
    'I could use some help with the wifi', 'do you have a doctor on site',
    'where can I register',
];

let failures = 0;

function check(list, expected) {
    for (const msg of list) {
        const { isEmergency, matched } = detectEmergency(msg);
        const ok = isEmergency === expected;
        if (!ok) failures++;
        console.log(`${ok ? '✅' : '❌'} ${expected ? 'SHOULD trigger    ' : 'should NOT trigger'} | "${msg}"${matched ? `  -> ${matched}` : ''}`);
    }
}

check(SHOULD_TRIGGER, true);
console.log('');
check(SHOULD_NOT_TRIGGER, false);

console.log(failures === 0
    ? `\n🎉 All ${SHOULD_TRIGGER.length + SHOULD_NOT_TRIGGER.length} cases passed.`
    : `\n⚠️ ${failures} case(s) failed.`);
process.exit(failures === 0 ? 0 : 1);