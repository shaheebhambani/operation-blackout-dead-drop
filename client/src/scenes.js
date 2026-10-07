const R = (t, d = 2600) => ({ lines: ['^' + t], dur: d, gap: 0, red: true });
// Line prefixes: "!" = big green, "^" = big red, "BAR" = progress bar
export const SCENES = [
  { id: 'boot', dur: 7000, gap: 0.8, lines: ['// SIGNAL ACQUIRED //', 'NODE: BLACKOUT', 'TRACE: VERIFIED', 'INITIALIZING BLACKOUT PROTOCOL...', 'BAR', 'TRACE SIGNATURE MATCHED', 'SOURCE AUTHENTICATED', 'INVESTIGATION STATUS: COMPLETE'] },
  { id: 'win', dur: 10000, gap: 0.9, sfx: 'success', lines: ['!INVESTIGATION COMPLETE', 'TRACE VERIFIED', 'THE GHOST HAS BEEN LOCATED.', 'THREAT STATUS: NEUTRALIZED', 'CASE STATUS: CLOSED'] },
  { id: 'glitch', dur: 3200, gap: 0.45, cls: 'glitch', sfx: 'glitch', lines: ['!CASE STATUS: ████████', '^ERROR', '^ERROR\nERROR\nERROR'] },
  { id: 'corrupt', dur: 7000, gap: 1.5, red: true, sfx: 'static', lines: ['WARNING', 'THIS SESSION WAS NOT TERMINATED.', 'YOU WERE NOT SUPPOSED TO SEE THIS.', 'CONNECTION TO SOURCE ESTABLISHED.'] },
  { id: 'tx', dur: 4800, gap: 1.2, red: true, sfx: 'heartbeat', cls: 'glitch', lines: ['INCOMING TRANSMISSION', 'SOURCE: UNKNOWN', 'VOICE CHANNEL: CONNECTED'] },
  { id: 'scare', dur: 1300, red: true, sfx: 'jumpscare', lines: [] },
  { id: 'black', dur: 1500, lines: [] },
  R('YOU WERE NEVER CHASING ME.', 3500), R('I WAS LEADING YOU.'), R('EVERY CLUE WAS DELIBERATE.'), R('EVERY OBSTACLE WAS A TEST.'),
  R('I NEEDED INVESTIGATORS\nCAPABLE OF FOLLOWING A TRAIL\nWITHOUT TRUSTING EVERYTHING\nTHEY SAW.', 4500),
  R('YOU FOLLOWED EVERY SIGNAL.'), R('YOU FOUND MY MESSENGER.'), R('YOU DECODED MY TRANSMISSION.'), R('YOU WATCHED MY PEOPLE.'),
  R('AND YOU DISCOVERED THE ONE LOCATION\nI TRIED TO HIDE.', 3500), R("BUT THERE'S SOMETHING\nYOU HAVEN'T UNDERSTOOD.", 3500),
  R("AND NOW I'VE FOUND YOU."), R("YOU'VE COMPLETED MY FIRST EXPERIMENT.", 3200), R("IT'S TIME FOR THE REAL INVESTIGATION.", 3500),
  { id: 'operator', dur: 6500, gap: 1, red: true, lines: ['[ SYSTEM ]', 'OPERATOR DETECTED', 'IDENTITY: INVESTIGATOR', 'STATUS: WATCHING', 'LOCATION: UNKNOWN', '^YOU'] },
  { id: 'room', dur: 8000, sfx: 'static', lines: [] },
];
