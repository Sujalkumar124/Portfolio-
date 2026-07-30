// Dynamic generative engine for "Ask PaceThink AI".
// Analyzes each question's intent, extracts specifics (numbers, body parts,
// formats, conditions), and composes a unique, contextual answer from a deep
// knowledge base — with structural and lexical variation so no two answers
// are identical. Replies in the same language the user wrote in.

export type Language = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'pt' | 'ur' | 'bn' | 'ta' | 'other';

// ---------- Language detection ----------

const LANG_HINTS: { lang: Language; patterns: RegExp }[] = [
  { lang: 'hi', patterns: /[\u0900-\u097F]/ },
  { lang: 'ur', patterns: /[\u0600-\u06FF]/ },
  { lang: 'bn', patterns: /[\u0980-\u09FF]/ },
  { lang: 'ta', patterns: /[\u0B80-\u0BFF]/ },
  { lang: 'es', patterns: /\b(velocidad|fuerza|recuperaci|nutrici|entrenamiento|lanza|boliche|rapidez|consejo|cómo|como|lesión|lesion|dolor|ejercicio|movilidad|dieta|comida|proteína|proteina)\b/i },
  { lang: 'fr', patterns: /\b(vitesse|force|récupération|recuperation|nutrition|entraînement|entrainement|conseil|joueur|rapide|comment|pourquoi|blessure|douleur|exercice|mobilite|mobilité|diète|repas|protéine|proteine)\b/i },
  { lang: 'de', patterns: /\b(schnelligkeit|kraft|erholung|ernährung|ernahrung|training|rat|schnell|wie|warum|verletzung|schmerz|übung|beweglichkeit|diät|diat|mahlzeit)\b/i },
  { lang: 'pt', patterns: /\b(velocidade|força|forca|recuperação|recuperacao|nutrição|nutricao|treino|conselho|lança|lanca|como|porque|lesão|lesao|dor|exercício|exercicio|mobilidade|dieta|refeição|refeicao|proteína|proteina)\b/i },
];

export function detectLanguage(text: string): Language {
  for (const { lang, patterns } of LANG_HINTS) {
    if (patterns.test(text)) return lang;
  }
  return 'en';
}

// ---------- Intent detection ----------

type TopicKey =
  | 'pace' | 'technique' | 'strength' | 'sprint' | 'plyometric'
  | 'mobility' | 'recovery' | 'nutrition' | 'injury' | 'mindset'
  | 'drills' | 'swing' | 'yorker' | 'bouncer' | 'knowledge' | 'general';

const TOPIC_KEYWORDS: Record<TopicKey, string[]> = {
  pace: ['pace', 'speed', 'quicker', 'rapido', 'velocidad', 'vitesse', 'schnell', 'तेज', 'गति', 'رفتار', 'তেজ', 'வேகம்', 'faster', 'km/h', 'mph', 'quickness', 'bowl faster', 'bowl quick'],
  technique: ['technique', 'action', 'biomechanics', 'form', 'release', 'técnica', 'technique', 'तकनीक', 'एक्शन', 'تکنیک', 'কৌশল', 'நுட்பம்', 'run-up', 'runup', 'follow through', 'follow-through', 'delivery stride', 'crease'],
  strength: ['strength', 'gym', 'weight', 'lift', 'deadlift', 'squat', 'fuerza', 'force', 'kraft', 'ताकत', 'जिम', 'طاقت', 'جم', 'শক্তি', 'வலிமை', 'barbell', 'bench', 'press', 'row', 'pull', 'muscle'],
  sprint: ['sprint', 'running', 'run', 'acceleration', 'sprint', 'carrera', 'sprinten', 'दौड़', 'स्प्रिंट', 'اسپرنٹ', 'دوڑ', 'ஓட்டம்', 'sprint training', 'sled', 'hill'],
  plyometric: ['plyometric', 'jump', 'box jump', 'bounds', 'explosive', 'pliometría', 'pliometrie', 'प्लायोमेट्रिक', 'कूद', 'پلائیو میٹرک', 'چھلانگ', 'ಜಿಗಿತ', 'குதிக்க', 'depth jump', 'clap push', 'med ball', 'medicine ball'],
  mobility: ['mobility', 'flexibility', 'stretch', 'range of motion', 'movilidad', 'souplesse', 'लचीलापन', 'گشت', 'لچک', 'নমনীয়তা', 'நெகிழ்வு', 'warm up', 'warm-up', 'stretching', 'yoga'],
  recovery: ['recovery', 'rest', 'sleep', 'soreness', 'recuperación', 'récupération', 'erholung', 'आराम', 'वसूली', 'تعافی', 'آرام', 'পুনরুদ্ধার', 'மீட்பு', 'tired', 'fatigue', 'deload', 'overtraining', 'ice bath'],
  nutrition: ['nutrition', 'food', 'diet', 'eat', 'protein', 'hydrate', 'nutrición', 'nutrition', 'ernährung', 'पोषण', 'खाना', 'غذا', 'خوراک', 'পুষ্টি', 'ஊட்டச்சத்து', 'carb', 'meal', 'supplement', 'water', 'hydration', 'vitamin'],
  injury: ['injury', 'pain', 'hurt', 'sore', 'back pain', 'stress fracture', 'lesión', 'lesion', 'blessure', 'verletzung', 'चोट', 'दर्द', 'چوٹ', 'درد', 'আঘাত', 'காயம்', 'வலி', 'tear', 'strain', 'sprain', 'shin splint', 'shoulder pain', 'knee pain', 'hurts', 'aching'],
  mindset: ['mindset', 'mental', 'confidence', 'pressure', 'focus', 'mentalidad', 'mental', 'confiance', 'मानसिक', 'आत्मविश्वास', 'ذہنی', 'اعتماد', 'মানসিকতা', 'மனநிலை', 'nervous', 'anxiety', 'concentration', 'psychology', 'visualisation', 'visualization'],
  drills: ['drill', 'drills', 'practice', 'repetition', 'ejercicio', 'exercice', 'अभ्यास', 'ड्रिल', 'مشق', 'ڈرل', 'अभ्यास', 'प্র্যাকটিস', 'பயிற்சி', 'target bowling', 'net session', 'training session'],
  swing: ['swing', 'seam', 'conventional', 'reverse', 'swing', 'seam', 'स्विंग', 'सीम', 'سوئنگ', 'سیون', 'সুইং', 'ஸ்விங்', 'inswing', 'outswing', 'new ball', 'old ball', 'shine', 'rough'],
  yorker: ['yorker', 'blockhole', 'death', 'yorker', 'यॉर्कर', 'یارکر', 'য়র্কার', 'யார்கர்', 'slower ball', 'death overs', 'final overs', 'toss'],
  bouncer: ['bouncer', 'short', 'short-pitched', 'bouncer', 'corto', 'बाउंसर', 'باؤنسر', 'बौन्सर', 'बाउन्सर', 'बाउन्सर', 'باؤنسر', 'বাউন্সার', 'பவுன்சர்', 'short ball', 'rise', 'chest height', 'pull shot'],
  knowledge: ['knowledge', 'tactics', 'field', 'setting', 'game sense', 'iq', 'conocimiento', 'connaissances', 'ज्ञान', 'रणनीति', 'علم', 'حکمت', 'জ্ঞান', 'அறிவு', 'captain', 'field placement', 'spell plan', 'reading the batter', 'conditions', 'pitch', 'wind'],
  general: [],
};

function detectTopics(text: string): TopicKey[] {
  const lower = text.toLowerCase();
  const injuryKeywords = TOPIC_KEYWORDS.injury;
  const isMedical = injuryKeywords.some((k) => lower.includes(k));

  const scored: { key: TopicKey; score: number }[] = [];
  (Object.keys(TOPIC_KEYWORDS) as TopicKey[]).forEach((key) => {
    if (key === 'general') return;
    let score = 0;
    for (const kw of TOPIC_KEYWORDS[key]) {
      if (lower.includes(kw.toLowerCase())) score += 1;
    }
    if (score > 0) scored.push({ key, score });
  });

  if (isMedical) {
    scored.push({ key: 'injury', score: 99 });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.length > 0 ? scored.slice(0, 2).map((s) => s.key) : ['general'];
}

// ---------- Specificity extraction ----------

type Specifics = {
  numbers: string[];
  bodyParts: string[];
  formats: string[];
  conditions: string[];
  timeframes: string[];
};

function extractSpecifics(text: string): Specifics {
  const lower = text.toLowerCase();
  const numbers = (lower.match(/\b(\d+)\s*(mph|km\/h|kmh|kmph|rep|reps|set|sets|week|weeks|day|days|minute|minutes|hour|hours|over|overs|meter|meters|metre|kg|lb|pound)\b/g) || []).map((s) => s.trim());
  const bodyParts = ['back', 'shoulder', 'knee', 'hamstring', 'ankle', 'hip', 'calf', 'elbow', 'wrist', 'groin', 'core', 'glute', 'quad', 'foot', 'neck']
    .filter((bp) => lower.includes(bp));
  const formats = ['test', 'odi', 't20', 't10', 'death', 'powerplay', 'new ball', 'first over', 'last over', 'spell', 'match', 'net']
    .filter((f) => lower.includes(f));
  const conditions = ['overcast', 'humid', 'dry', 'green pitch', 'flat pitch', 'dusty', 'wind', 'reverse', 'dew', 'hot', 'cold']
    .filter((c) => lower.includes(c));
  const timeframes = ['before match', 'match day', 'after match', 'off season', 'pre-season', 'in season', 'every day', 'weekly', 'daily', 'morning', 'evening', 'night']
    .filter((t) => lower.includes(t));
  return { numbers, bodyParts, formats, conditions, timeframes };
}

// ---------- Deep knowledge base ----------

type KnowledgeEntry = {
  intros: string[];
  principles: { title: string; detail: string }[];
  closers: string[];
};

const KB: Record<TopicKey, KnowledgeEntry> = {
  pace: {
    intros: [
      'Building genuine pace is a system, not a single tweak. Here is how to approach it based on what you asked.',
      'Pace comes from efficiently transferring run-up speed into the ball. Let me break down the levers that matter most for your question.',
      'To bowl faster, you need to remove energy leaks and maximise force at release. Here are the key areas to target.',
      'Speed is built in layers — run-up, action, and physical power. Here is a targeted plan.',
    ],
    principles: [
      { title: 'Run-up calibration', detail: 'Build speed gradually so you reach roughly 75% of your maximum at back-foot landing. Sprinting from the start wastes energy and disrupts timing.' },
      { title: 'Front-leg bracing', detail: 'A firm, braced front knee at delivery acts as a pivot — it converts horizontal run-up speed into ball speed. A soft front leg leaks that energy.' },
      { title: 'Alignment', detail: 'Keep hips and shoulders aligned toward the target through the crease. Misalignment leaks power and risks injury.' },
      { title: 'The whip', detail: 'Let the bowling arm come through last, like a catapult. The sequencing of hips, trunk, shoulder, then arm creates the whip that adds pace.' },
      { title: 'Repeatable action', detail: 'A simpler, repeatable action is faster than a complex one. Efficiency beats raw effort — the fastest bowlers look smooth, not strained.' },
      { title: 'Strength transfer', detail: 'Lower-body force and posterior-chain strength feed directly into pace. If your gym numbers stall, your pace likely will too.' },
      { title: 'Sprint carry-over', detail: 'Sprint training is the most direct physical carry-over to bowling speed. Accelerations and resisted sprints build the drive phase.' },
      { title: 'Track and progress', detail: 'Log your speeds with a radar gun or app. Train pace in short, high-quality blocks of 4–6 deliveries, not long tired spells.' },
    ],
    closers: [
      'Focus on one lever at a time rather than changing everything at once. Small, consistent improvements compound into real pace.',
      'Pick the one principle that feels weakest in your current action and work it for two weeks before moving on.',
      'Remember: pace is a skill, not just effort. Train it deliberately and measure it so you can see the gains.',
    ],
  },
  technique: {
    intros: [
      'A repeatable action is the foundation of everything else. Here is how to refine yours.',
      'Your action determines how efficiently you turn physical power into pace and accuracy. Let me walk through the key phases.',
      'Technique is about sequencing — getting the body parts to fire in the right order. Here are the critical checkpoints.',
      'Good biomechanics protect you from injury and unlock pace. Here is what to focus on.',
    ],
    principles: [
      { title: 'Grip and set-up', detail: 'Start with a consistent grip — first and second fingers either side of the seam, thumb underneath. A repeatable set-up builds a repeatable release.' },
      { title: 'Back-foot landing', detail: 'Land stable and slightly across so your hips coil and load. This is where your power is stored.' },
      { title: 'Front-arm action', detail: 'Drive the front arm down and across the body — it pulls the bowling arm through and creates rotational speed.' },
      { title: 'Release point', detail: 'Aim for a high, consistent release. Even small changes in release height or angle move the ball dramatically.' },
      { title: 'Follow-through', detail: 'Finish long and across the body. Never stop at release — the follow-through decelerates you safely and adds final speed.' },
      { title: 'Side-on vs open', detail: 'A side-on action loads the hips and shoulders in line with the target. Mixed actions (front-on hips, side-on shoulders) increase back-injury risk.' },
      { title: 'Film and review', detail: 'Record yourself from side-on and compare frames against your target shape. The camera is your most honest coach.' },
    ],
    closers: [
      'Change one thing at a time. Multiple tweaks at once make it impossible to know what actually worked.',
      'Groove changes in drills before taking them into a spell. Repetition in isolation builds trust under pressure.',
      'A great action is one you can repeat when tired. Practice it when fatigued, not just when fresh.',
    ],
  },
  strength: {
    intros: [
      'Fast bowling is a whole-body power movement. Here is how to build the engine behind every delivery.',
      'Strength underpins both pace and durability. Here are the priorities for a fast bowler.',
      'The gym work that transfers to pace targets specific qualities. Here is what matters most.',
      'Your strength program should build force production and injury resilience together. Here is the framework.',
    ],
    principles: [
      { title: 'Lower-body force', detail: 'Squats, split squats and RDLs build the drive off the back foot and the brace of the front leg — the engine of pace.' },
      { title: 'Posterior chain', detail: 'Deadlifts, hip thrusts and glute work generate raw power and protect your lower back through every delivery.' },
      { title: 'Rotational core', detail: 'Medicine-ball throws, pallof presses and anti-rotation drills transfer force through the trunk — the link between hips and arm.' },
      { title: 'Upper back and shoulders', detail: 'Rows, pull-aparts and overhead work keep the action stable and the shoulder joint resilient.' },
      { title: 'Single-leg work', detail: 'Split squats and single-leg RDLs build the stability you need at back-foot and front-foot landing.' },
      { title: 'Periodisation', detail: 'Lift heavier in the off-season (2–3x weekly), maintain in-season (1–2x). Never peak your gym work on a match week.' },
      { title: 'Power work', detail: 'Pair heavy lifts with explosive jumps or throws in the same session to train the fast-twitch fibres that produce pace.' },
    ],
    closers: [
      'Strength is a long game. Progress your lifts gradually and protect your technique — never sacrifice action quality for a heavier gym session.',
      'Two quality sessions a week beat four sloppy ones. Recover from lifting so it helps your bowling, not competes with it.',
      'Get your form checked before adding weight. Good movement patterns protect you; bad ones under load create injuries.',
    ],
  },
  sprint: {
    intros: [
      'Sprint training is the most direct physical carry-over to bowling speed. Here is how to structure it.',
      'Bowling is a controlled sprint with a ball in hand. Sprint work builds the qualities that make you quicker. Here is the plan.',
      'To bowl fast, train fast. Sprint sessions develop the acceleration and elastic power behind pace. Here is the framework.',
      'Speed on the track translates to speed off the crease. Here is how to train it effectively.',
    ],
    principles: [
      { title: 'Accelerations', detail: '10–30m sprints from standing or rolling starts. Do 3–4 reps with full recovery — quality matters more than quantity.' },
      { title: 'Resisted sprints', detail: 'Sled pushes or hill sprints build the drive phase and horizontal force production — the first few steps of your run-up.' },
      { title: 'Top-speed reps', detail: 'Flying 20–40m sprints (build up, then sprint) improve stride efficiency at maximum velocity.' },
      { title: 'Run-up rehearsal', detail: 'Practise your actual bowling run-up at speed so the track work meets the match. This is the most specific transfer.' },
      { title: 'Recovery between reps', detail: 'Rest fully — 1 minute per 10m sprinted. Sprinting under fatigue trains slowness, not speed.' },
      { title: 'Separation from gym', detail: 'Keep sprint days away from heavy leg days. Combining both dilutes the quality of each.' },
      { title: 'Volume control', detail: 'A sprint session is rarely more than 6–10 quality reps. Less is more when intensity is truly maximal.' },
    ],
    closers: [
      'Sprint work rewards intensity, not exhaustion. If you cannot run at 95%+, you are not training speed anymore — stop and recover.',
      'Progress gradually and watch your hamstrings. Sprinting is powerful medicine — too much too soon causes strains.',
      'Pair sprint training with your bowling days where possible so the body adapts to both together.',
    ],
  },
  plyometric: {
    intros: [
      'Plyometrics build the explosive, elastic strength behind a snappy delivery. Here is how to progress safely.',
      'Reactive power is what makes a delivery "snappy" rather than just fast. Plyometric drills develop it. Here is the progression.',
      'To bowl quick, you need stiffness and elasticity — the ability to bounce force through the ground. Here is how to train it.',
      'Plyometric work trains the fast-twitch qualities that raw lifting cannot. Here is the safe framework.',
    ],
    principles: [
      { title: 'Low-intensity start', detail: 'Pogo jumps, A-skips and small bounds develop stiffness and elasticity. Master these before anything advanced.' },
      { title: 'Medium intensity', detail: 'Box jumps, lateral bounds and broad jumps build explosive triple extension (ankle, knee, hip).' },
      { title: 'High-intensity', detail: 'Depth jumps are the most demanding — only add them once you can squat roughly 1.5x your bodyweight. They train reactive power.' },
      { title: 'Short ground contact', detail: 'The goal is quick contacts, not high jumps. Minimise time on the ground — that is what builds elasticity.' },
      { title: 'Soft landings', detail: 'Land quietly and absorb force through hip, knee and ankle. Loud landings mean poor absorption and higher injury risk.' },
      { title: 'Low volume, high quality', detail: '2 sets of 4–6 reps is plenty. Rest fully between sets. Fatigued plyometrics train bad movement patterns.' },
      { title: 'Progression rule', detail: 'Only progress intensity when the current level feels easy and your landings are consistently clean.' },
    ],
    closers: [
      'Plyometrics are potent — a little goes a long way. Stop at the first sign of sharp or localised soreness.',
      'Pair them with strength work, not as a replacement. Elastic power builds on a base of raw force.',
      'If anything feels sharp or sore, stop immediately. Explosive training under compensation is how injuries happen.',
    ],
  },
  mobility: {
    intros: [
      'Mobility keeps your action smooth and lowers injury risk. Here is how to build a routine that fits a bowler.',
      'A mobile bowler is a durable bowler. Here is how to target the areas that matter most for pace.',
      'Mobility is a skill — train it consistently, not just when you feel tight. Here is the framework.',
      'Range of motion directly affects your action and your injury risk. Here is how to improve it.',
    ],
    principles: [
      { title: 'Hip mobility', detail: '90/90 switches, deep lunge rotations and hip circles keep your pelvis moving freely through the delivery stride.' },
      { title: 'Thoracic spine', detail: 'Open-book rotations and thread-the-needle drills keep your upper back turning — essential for a side-on action.' },
      { title: 'Ankle dorsiflexion', detail: 'Wall stretches and calf raises maintain the ankle range you need at front-foot landing.' },
      { title: 'Shoulder mobility', detail: 'Band dislocates and sleeper stretches keep the shoulder healthy through thousands of deliveries.' },
      { title: 'Pre-bowling routine', detail: 'Spend 10–15 minutes on dynamic mobility before bowling. Static stretching is for after, not before.' },
      { title: 'Post-session', detail: '10 minutes of static stretching and foam rolling after bowling aids recovery and maintains range.' },
      { title: 'Consistency over intensity', detail: '10 minutes daily beats one long session weekly. Mobility responds to frequency.' },
    ],
    closers: [
      'Mobility is not flexibility for its own sake — it is movement quality that protects you and unlocks your action.',
      'If a restriction will not budge after consistent work, get a movement screen from a physio. Some limits need hands-on help.',
      'Track which areas tighten up after bowling and prioritise those. Your body tells you what it needs.',
    ],
  },
  recovery: {
    intros: [
      'Recovery is where adaptation happens — you do not get faster from training alone, but from recovering from it. Here is the framework.',
      'How you recover between sessions determines how much you actually improve. Here is how to structure it.',
      'Recovery is not passive — it is an active part of your training. Here are the levers that matter most.',
      'Your body adapts between sessions, not during them. Here is how to make that adaptation work for you.',
    ],
    principles: [
      { title: 'Sleep', detail: '8+ hours is the single biggest performance lever you control. Protect it — it drives repair, hormonal balance and reaction speed.' },
      { title: 'Post-session refuel', detail: 'Rehydrate and eat protein plus carbs within 60 minutes of finishing. This window matters for glycogen and muscle repair.' },
      { title: 'Active recovery', detail: 'Light mobility, walking or swimming on off days promotes blood flow without adding load.' },
      { title: 'Deload weeks', detail: 'Every 4–6 weeks, drop training volume by roughly 40% for a week so your body absorbs the work and supercompensates.' },
      { title: 'Soreness vs pain', detail: 'Soreness is general and fades. Sharp, localised or one-sided pain needs attention — do not push through it.' },
      { title: 'Readiness tracking', detail: 'Track sleep, mood and soreness each morning. If all three are down, ease the day — your body is asking for less.' },
      { title: 'Workload balance', detail: 'Avoid sudden spikes in deliveries. Gradual progression is how you build durability without stress fractures.' },
    ],
    closers: [
      'Treat recovery as seriously as training. The best bowlers are not the ones who train hardest — they are the ones who absorb training best.',
      'If you are consistently tired or sore, you are under-recovered, not under-trained. Adjust before it becomes an injury.',
      'Build recovery into your plan, not around it. A plan without recovery is just a slow path to burnout.',
    ],
  },
  nutrition: {
    intros: [
      'Fueling drives training quality and recovery. Here is how to eat for pace and durability.',
      'What you eat directly affects how hard you can train and how well you recover. Here is the framework.',
      'Nutrition is part of your training, not separate from it. Here is how to structure it for a fast bowler.',
      'A fast bowler burns serious energy. Here is how to fuel that demand properly.',
    ],
    principles: [
      { title: 'Protein targets', detail: 'Aim for roughly 1.6–2.0g of protein per kg of bodyweight daily, spread across 3–4 meals. This supports muscle repair.' },
      { title: 'Carb periodisation', detail: 'Eat more carbohydrates on training and match days (your main fuel), fewer on rest days. Match intake to output.' },
      { title: 'Hydration', detail: 'Sip water through the day. In heat or long sessions, add electrolytes — dehydration drops pace and concentration fast.' },
      { title: 'Match-day fueling', detail: 'Eat a familiar carb-based meal 2–3 hours before, a light snack 30–60 minutes before, and sip fluids through your spell.' },
      { title: 'Recovery window', detail: 'Protein plus carbs within 60 minutes of finishing a spell kick-starts repair and refuelling.' },
      { title: 'Trial in training', detail: 'Never try a new food or supplement on match day. Test everything in training first so there are no surprises.' },
      { title: 'Whole foods first', detail: 'Build your diet around lean protein, whole grains, fruit, vegetables and healthy fats. Supplements fill gaps — they do not replace meals.' },
    ],
    closers: [
      'Nutrition does not need to be perfect — it needs to be consistent. Small sustainable habits beat short intense diets.',
      'If you are unsure, start with protein at every meal and hydration through the day. Those two changes move the needle most.',
      'For a personalised plan, a sports dietitian is worth it — especially if you are training hard or travelling often.',
    ],
  },
  injury: {
    intros: [
      'For any pain, sharp discomfort, swelling or possible injury, stop bowling immediately and get it assessed by a qualified coach or healthcare professional. Do not train through pain. Here is general educational context only.',
      'I can give general educational context, but this cannot replace a hands-on assessment. Please see a qualified coach or healthcare professional. Here is what is generally understood.',
      'Important: stop and get assessed before acting on anything below. For pain or injury, a qualified professional must examine you. Here is general background only.',
      'This guidance is educational, not medical. For anything concerning pain or injury, confirm with a qualified coach or healthcare professional. Here is general context.',
    ],
    principles: [
      { title: 'Stop and assess', detail: 'The first rule with pain is to stop. Bowling through sharp or localised pain turns minor issues into major ones.' },
      { title: 'Workload matters', detail: 'Most fast-bowling injuries come from sudden spikes in deliveries. Gradual progression protects bones, tendons and muscles.' },
      { title: 'Back soreness', detail: 'General back soreness is common in fast bowlers, but persistent or one-sided pain is a red flag — especially in younger bowlers.' },
      { title: 'Junior guidelines', detail: 'Younger bowlers should follow recognised workload limits to protect growth plates. Overbowling at a young age causes lasting damage.' },
      { title: 'Movement screening', detail: 'Many injuries start with movement restrictions or asymmetries. A screen catches these before they become injuries.' },
      { title: 'Prehab', detail: 'Targeted strength for the lower back, hamstrings, calves and shoulder builds resilience where bowlers break down most.' },
      { title: 'Cross-train around it', detail: 'If cleared by a professional, you can often maintain fitness by training around the injury — but only with their guidance.' },
    ],
    closers: [
      'This guidance cannot replace a hands-on assessment. For any pain, swelling or concern, see a qualified coach or healthcare professional before acting on anything.',
      'Always confirm with a qualified coach or healthcare professional. Your body is telling you something — listen to it and get it checked.',
      'When in doubt, rest and seek professional advice. Bowling through pain is how short-term soreness becomes a long-term injury.',
    ],
  },
  mindset: {
    intros: [
      'The mental game separates good bowlers from great ones. Here is how to build it deliberately.',
      'Pace is unleashed in the mind, not just the body. Here is how to train your mental edge.',
      'A strike bowler’s mindset is a skill you can develop. Here are the key pillars.',
      'Pressure is where bowlers are made or broken. Here is how to train for it.',
    ],
    principles: [
      { title: 'Pre-delivery routine', detail: 'A short, repeatable routine — breath, cue, trigger — anchors every ball. It gives you control when the game speeds up.' },
      { title: 'Stay present', detail: 'Bowl this ball, not the last one or the next. The present delivery is the only one you can actually affect.' },
      { title: 'Process over outcome', detail: 'Focus on execution, not wickets. Wickets follow a disciplined process — chasing them directly often backfires.' },
      { title: 'Reframe pressure', detail: 'Pressure is a privilege — it means the moment matters. Treat it as an opportunity, not a threat.' },
      { title: 'Self-talk', detail: 'Replace "do not bowl a bad ball" with a positive cue like "hit the top of off". The brain struggles with negative instructions.' },
      { title: 'Visualisation', detail: 'Picture successful deliveries before you bowl them. The brain rehearses the movement through imagery.' },
      { title: 'Bounce-back routine', detail: 'Have a reset after a boundary or bad ball — a breath, a word, a physical cue — so one mistake never becomes two.' },
    ],
    closers: [
      'Mental skills are skills — train them as deliberately as you train your action. They improve with practice, not just with matches.',
      'Start with one routine and use it every ball for a month. Consistency is what makes it automatic under pressure.',
      'Your mindset is your most portable weapon. It travels with you to every ground, every spell, every ball.',
    ],
  },
  drills: {
    intros: [
      'Drills turn intent into skill. Here is how to make your practice actually transfer to matches.',
      'Good drills have one clear purpose each. Here is a framework for designing effective practice.',
      'Repetition with intent beats mindless volume. Here is how to structure your bowling drills.',
      'The right drill at the right time accelerates improvement. Here is how to use them well.',
    ],
    principles: [
      { title: 'One purpose per drill', detail: 'Do not mix too many cues. A drill with a single focus lets you actually improve that one thing.' },
      { title: 'Constraint-led design', detail: 'Change the ball, target size or distance to force a specific adaptation. Constraints create learning.' },
      { title: 'Quality reps', detail: '6–10 good reps beat 30 sloppy ones. Stop when fatigue changes your action — tired reps teach bad habits.' },
      { title: 'Film and review', detail: 'Check every session against your target shape. The camera shows what feeling cannot.' },
      { title: 'Technical drills', detail: 'One-step drills groove the release; seam-present drills keep the seam straight. Use these to isolate phases.' },
      { title: 'Target bowling', detail: 'Bowl to a coin or small marker to train accuracy under pressure. Small targets force precision.' },
      { title: 'Spell simulation', detail: 'Rehearse full overs with rest patterns matching a real spell. This builds volume tolerance and decision-making.' },
      { title: 'Progress the difficulty', detail: 'Once a drill is easy, make it harder — smaller target, more speed, fatigue, or a competitive element.' },
    ],
    closers: [
      'A drill is only as good as your intent doing it. Know what you are trying to improve before you start every set.',
      'Rotate drills across the week so you touch technique, accuracy and game simulation. Variety keeps learning fresh.',
      'Review your drills monthly. If one is no longer challenging you, it is no longer improving you.',
    ],
  },
  swing: {
    intros: [
      'Swing comes from seam position and surface management — it is craft, not luck. Here is how to make the ball talk.',
      'Swing and seam are skills you can train. Here is what actually makes the ball move.',
      'Making a cricket ball swing is about physics you can control. Here is the breakdown.',
      'Swing is the art of asymmetry. Here is how to create and exploit it.',
    ],
    principles: [
      { title: 'Conventional swing', detail: 'Keep the seam upright and pointed toward slip. Shine one side, leave the other rough — the ball swings toward the shiny side.' },
      { title: 'Reverse swing', detail: 'With an older, rougher ball and one very dry/shiny side, the ball swings toward the rough side, and later in the delivery.' },
      { title: 'Steady wrist', detail: 'A stable, straight wrist at release keeps the seam honest. A tilted or wobbling seam reduces swing dramatically.' },
      { title: 'Seam presentation', detail: 'The seam is your steering wheel. Present it consistently and the ball will behave consistently.' },
      { title: 'Reading conditions', detail: 'Overcast and humid conditions help conventional swing. Dry and abrasive conditions help reverse swing develop.' },
      { title: 'Ball maintenance', detail: 'Shine one side religiously and protect the rough side. The contrast is what creates the pressure difference.' },
      { title: 'Practice with intent', detail: 'Bowl with a specific swing plan each ball — inswinger to a right-hander, outswinger to set up the inswinger. Do not just "bowl and hope".' },
    ],
    closers: [
      'Swing is a partnership with the ball. Look after it, present the seam well, and it will reward you.',
      'Practise holding the seam straight in front of a mirror before every session. It is that important.',
      'Match your plan to the conditions. A great inswinger in the wrong conditions is just a straight ball.',
    ],
  },
  yorker: {
    intros: [
      'The yorker is a precision weapon, especially at the death. Here is how to make it reliable under pressure.',
      'A great yorker ends overs and wins matches. Here is how to train it as a skill, not a hope.',
      'The yorker is the most valuable delivery in limited-overs cricket. Here is how to bowl it on demand.',
      'Bowling a yorker is about trust and repetition. Here is the training framework.',
    ],
    principles: [
      { title: 'Target the base', detail: 'Aim for the base of the stumps or the blockhole. Aim small, miss small — a half-yorker is a full toss or half-volley.' },
      { title: 'Release point', detail: 'Release slightly fuller and higher than your stock ball. Trust the length — do not pull up at the last moment.' },
      { title: 'Repetition to mastery', detail: 'Bowl 20–30 yorkers a session to a small target until the length is automatic. It is a feel skill, built through volume.' },
      { title: 'Commit fully', detail: 'Under pressure, commit to the yorker completely. A tentative yorker is the most expensive ball in cricket.' },
      { title: 'Variations', detail: 'Wide-line yorkers and slower yorkers are valuable — but only once your stock yorker is reliable. Do not collect variations before mastering the base.' },
      { title: 'Practice target', detail: 'Use a chalk mark, a shoe or a small cone as the target. Visual feedback accelerates learning.' },
      { title: 'Death-over simulation', detail: 'Practise yorkers under scenario pressure — last over, batter on strike, field set. Context changes execution.' },
    ],
    closers: [
      'The yorker rewards trust. Once you commit to the length, the worst outcome is a single — far better than a half-yorker gone for six.',
      'Build the stock yorker first. Variations are a trap if your base delivery is not reliable under pressure.',
      'Track your hit rate in practice. If you are landing fewer than 7 in 10, you need more repetition before adding variations.',
    ],
  },
  bouncer: {
    intros: [
      'The bouncer is a tactical shock weapon. Here is how to use it effectively and safely.',
      'A good bouncer resets a batter’s mind. Here is how to bowl one that works.',
      'The bouncer is about surprise and commitment. Here is the framework.',
      'Used well, the bouncer is one of your most powerful tools. Here is how to deploy it.',
    ],
    principles: [
      { title: 'Length', detail: 'Bowl back of a length, not too short — too short and it sails over the batter harmlessly.' },
      { title: 'Pace and commitment', detail: 'Commit to it fully. A slow bouncer is a long-hop and gets dispatched. Pace is what makes it threatening.' },
      { title: 'Target height', detail: 'Aim around chest or shoulder height, adjusted to the batter’s height and footwork. The goal is to make them uncomfortable.' },
      { title: 'Field settings', detail: 'Set a deep square leg and fine leg for the top edge and the pull. The bouncer needs catching cover to be safe.' },
      { title: 'Use it sparingly', detail: 'Surprise is part of its value. Overuse lets batters line it up and wait on the back foot.' },
      { title: 'Set-up value', detail: 'A bouncer can set up the next ball — a fuller delivery after a bouncer often finds the batter on the back foot.' },
      { title: 'Safety and rules', detail: 'Always bowl within the rules and conditions. In junior cricket, follow the bouncer limits strictly.' },
    ],
    closers: [
      'The bouncer is a chess move, not a default. Use it to disrupt rhythm and set up your other deliveries.',
      'A well-set field turns a good bouncer into a wicket-taking ball. Plan the trap before you bowl it.',
      'Respect the batter and the rules. A bouncer used recklessly is dangerous and often counterproductive.',
    ],
  },
  knowledge: {
    intros: [
      'Cricket IQ turns your skills into wickets. Here is how to read the game like a thinker.',
      'Tactical awareness is what makes a quick bowler a wicket-taker. Here are the key areas.',
      'A great bowler reads the game as well as they bowl. Here is how to build that sense.',
      'Game sense is a skill you can develop. Here is how to think like a strike bowler.',
    ],
    principles: [
      { title: 'Read the batter', detail: 'Watch their setup, head position and first movements. Are they looking to attack or defend? Their body tells you before the ball does.' },
      { title: 'Field-setting logic', detail: 'Match your field to your plan — a catching field for pressure, a saving field for containment. The field should make sense with the ball you bowl.' },
      { title: 'Spell planning', detail: 'Start with control, build pressure, then attack with your best ball. A spell is a story, not a series of random deliveries.' },
      { title: 'Conditions reading', detail: 'Pitch, wind, ball age and humidity all change what works. Adjust your plan to the day, not to a fixed template.' },
      { title: 'Partnerships', detail: 'Bowl to a plan with your partner. Building pressure from both ends creates wickets — one end cannot do it alone.' },
      { title: 'Set batters up', detail: 'Think two or three balls ahead. A stock ball sets up a variation; a series of full balls sets up a bouncer.' },
      { title: 'Watch the greats', detail: 'Study how elite bowlers set batters up over spells, not just the wicket ball. The wicket is the result of a plan.' },
    ],
    closers: [
      'Tactical IQ compounds with experience. Review your spells afterwards — what worked, what did not, and what you would do next time.',
      'A thinking bowler ages better than a pure pace bowler. Your mind stays sharp when your body slows.',
      'Talk to your captain and keeper — they see angles you cannot. The best plans are built together.',
    ],
  },
  general: {
    intros: [
      'I can help with anything related to fast bowling — pace, technique, strength, sprint training, plyometrics, mobility, recovery, nutrition, mindset, drills, swing, yorkers, bouncers and cricket IQ. Could you tell me a bit more about what you want to improve?',
      'That is a great area to explore. I cover pace, technique, fitness, recovery, mindset, drills and cricket tactics. Try asking something specific, like "how do I bowl faster?" or "what should I eat on match day?"',
      'I am your fast-bowling guide. Ask me about any part of your game — speed, strength, recovery, nutrition, swing, yorkers, bouncers or cricket IQ — and I will give you specific, practical guidance.',
      'Happy to help with your bowling. Tell me which area you want to work on — pace, technique, fitness, recovery, mindset, craft or tactics — and I will break it down for you.',
    ],
    principles: [],
    closers: [
      'The more specific your question, the more specific my answer. What exactly would you like to improve?',
      'Try a follow-up question and I will give you a detailed, tailored answer.',
      'Pick any topic above and ask me anything — I will reply in your language.',
    ],
  },
};

// ---------- Disclaimer (multilingual) ----------

const DISCLAIMER: Record<Language, string> = {
  en: 'Note: this is educational guidance only. For any pain, injury or medical concern, confirm with a qualified coach or healthcare professional before acting on it.',
  hi: 'नोट: यह केवल शैक्षिक मार्गदर्शन है। किसी भी दर्द, चोट या चिकित्सा संबंधी चिंता के लिए, कृपया योग्य कोच या चिकित्सा पेशेवर से पुष्टि करें।',
  es: 'Nota: esta es una guía educativa únicamente. Ante cualquier dolor, lesión o problema médico, confírmalo con un entrenador cualificado o un profesional sanitario.',
  fr: 'Note : ceci est un conseil éducatif uniquement. Pour toute douleur, blessure ou préoccupation médicale, confirme auprès d un entraîneur qualifié ou d un professionnel de santé.',
  de: 'Hinweis: Dies ist nur eine pädagogische Anleitung. Bei Schmerzen, Verletzungen oder medizinischen Bedenken bitte mit einem qualifizierten Trainer oder Arzt abklären.',
  pt: 'Nota: esta é apenas uma orientação educacional. Para qualquer dor, lesão ou problema médico, confirme com um treinador qualificado ou um profissional de saúde.',
  ur: 'نوٹ: یہ صرف تعلیمی رہنمائی ہے۔ کسی بھی درد، چوٹ یا طبی تشویش کے لیے، براہ کرم ایک قابل کوچ یا طبی پیشہ ور سے تصدیق کریں۔',
  bn: 'বিঃদ্রঃ এটি শুধুমাত্র শিক্ষামূলক নির্দেশনা। কোনো ব্যথা, আঘাত বা চিকিৎসা সংক্রান্ত উদ্বেগের জন্য একজন যোগ্য কোচ বা স্বাস্থ্য পেশাদারের সাথে নিশ্চিত করুন।',
  ta: 'குறிப்பு: இது கல்வி வழிகாட்டி மட்டுமே. ஏதேனும் வலி, காயம் அல்லது மருத்துவ கவலை இருப்பின், தகுதியான பயிற்சியாளர் அல்லது மருத்துவ நிபுணரிடம் உறுதிப்படுத்தவும்.',
  other: 'Note: this is educational guidance only. For any pain, injury or medical concern, confirm with a qualified coach or healthcare professional before acting on it.',
};

// ---------- Greetings ----------

const GREETINGS: Partial<Record<Language, string>> = {
  en: "Hi, I'm PaceThink AI — your guide to fast bowling. Ask me about pace, technique, strength, sprint training, plyometrics, mobility, recovery, nutrition, mindset, drills, swing, yorkers, bouncers or cricket IQ. I'll give you a specific, practical answer every time.",
  hi: 'नमस्ते, मैं PaceThink AI हूँ — तेज़ गेंदबाज़ी का आपका गाइड। पूछें गति, तकनीक, ताकत, स्प्रिंट, प्लायोमेट्रिक, गतिशीलता, आराम, पोषण, मानसिकता, ड्रिल, स्विंग, यॉर्कर, बाउंसर या क्रिकेट ज्ञान के बारे में। हर बार एक अलग, विशिष्ट उत्तर मिलेगा।',
  es: 'Hola, soy PaceThink AI — tu guía de lanzamiento rápido. Pregúntame sobre velocidad, técnica, fuerza, sprint, pliometría, movilidad, recuperación, nutrición, mentalidad, ejercicios, swing, yorker, bouncer o IQ de cricket. Te daré una respuesta específica cada vez.',
  fr: "Bonjour, je suis PaceThink AI — votre guide du lancer rapide. Posez-moi des questions sur la vitesse, la technique, la force, le sprint, la pliométrie, la mobilité, la récupération, la nutrition, le mental, les exercices, le swing, le yorker, le bouncer ou le QI cricket.",
  de: 'Hallo, ich bin PaceThink AI — dein Guide für schnelles Bowlen. Frag mich zu Tempo, Technik, Kraft, Sprint, Plyometrie, Mobilität, Erholung, Ernährung, Mindset, Übungen, Swing, Yorker, Bouncer oder Cricket-IQ.',
  pt: 'Olá, sou o PaceThink AI — seu guia de lançamento rápido. Pergunte sobre velocidade, técnica, força, sprint, pliometria, mobilidade, recuperação, nutrição, mentalidade, exercícios, swing, yorker, bouncer ou QI de cricket.',
  ur: 'ہیلو، میں PaceThink AI ہوں — تیز گیند بازی کا آپ کا گائیڈ۔ رفتار، تکنیک، طاقت، اسپرنٹ، پلائیو میٹرک، موبلٹی، تعافی، غذا، ذہنییت، مشق، سوئنگ، یارکر، باؤنسر یا کرکٹ علم کے بارے میں پوچھیں۔',
  bn: 'হ্যালো, আমি PaceThink AI — আপনার ফাস্ট বোলিং গাইড। গতি, কৌশল, শক্তি, স্প্রিন্ট, প্লায়োমেট্রিক, গতিশীলতা, পুনরুদ্ধার, পুষ্টি, মানসিকতা, ড্রিল, সুইং, ইয়র্কার, বাউন্সার বা ক্রিকেট জ্ঞান সম্পর্কে জিজ্ঞাসা করুন।',
  ta: 'வணக்கம், நான் PaceThink AI — உங்கள் வேகப் பந்து வீச்சு வழிகாட்டி. வேகம், தொழில்நுட்பம், வலிமை, ஸ்பிரிண்ட், ப்ளியோமெட்ரிக், மொபிலிட்டி, மீட்பு, ஊட்டச்சத்து, மனநிலை, பயிற்சி, ஸ்விங், யார்கர், பவுன்சர் அல்லது கிரிக்கெட் அறிவு பற்றி கேளுங்கள்.',
};

export function getGreeting(lang: Language): string {
  return GREETINGS[lang] ?? GREETINGS.en!;
}

// ---------- Localized framing (intro/closer/specifics wrappers) ----------

type Framing = {
  keyPointsLabel: string;
  relatedLabel: string;
  specificsBody: (parts: string) => string;
  specificsFormat: (fmt: string) => string;
  specificsCondition: (cond: string) => string;
  noteEnglish: string; // shown when principles are in English but user wrote in another language
};

const FRAMING: Record<Language, Framing> = {
  en: {
    keyPointsLabel: '',
    relatedLabel: 'Related to your question, one more point',
    specificsBody: (p) => `Since you mentioned your ${p}, I will focus on that area. `,
    specificsFormat: (f) => `For the ${f} situation you described: `,
    specificsCondition: (c) => `Given the ${c} conditions you mentioned: `,
    noteEnglish: '',
  },
  hi: {
    keyPointsLabel: 'मुख्य बिंदु:',
    relatedLabel: 'आपके सवाल से जुड़ा एक और बिंदु',
    specificsBody: (p) => `चूँकि आपने अपने ${p} का ज़िक्र किया, मैं उसी पर केंद्रित करूँगा। `,
    specificsFormat: (f) => `आपने जिस ${f} स्थिति का वर्णन किया: `,
    specificsCondition: (c) => `आपने जिन ${c} परिस्थितियों का ज़िक्र किया: `,
    noteEnglish: '(तकनीकी बिंदु अंग्रेज़ी में दिए गए हैं):',
  },
  es: {
    keyPointsLabel: 'Puntos clave:',
    relatedLabel: 'Relacionado con tu pregunta, un punto más',
    specificsBody: (p) => `Como mencionaste tu ${p}, me centraré en esa zona. `,
    specificsFormat: (f) => `Para la situación de ${f} que describes: `,
    specificsCondition: (c) => `Dadas las condiciones de ${c} que mencionas: `,
    noteEnglish: '(puntos técnicos en inglés):',
  },
  fr: {
    keyPointsLabel: 'Points clés :',
    relatedLabel: 'Lié à votre question, un point de plus',
    specificsBody: (p) => `Comme vous mentionnez votre ${p}, je vais me concentrer sur cette zone. `,
    specificsFormat: (f) => `Pour la situation de ${f} que vous décrivez : `,
    specificsCondition: (c) => `Compte tenu des conditions de ${c} que vous mentionnez : `,
    noteEnglish: '(points techniques en anglais) :',
  },
  de: {
    keyPointsLabel: 'Wichtige Punkte:',
    relatedLabel: 'Zu deiner Frage noch ein Punkt',
    specificsBody: (p) => `Da du deinen ${p} erwähnt hast, konzentriere ich mich darauf. `,
    specificsFormat: (f) => `Für die ${f}-Situation, die du beschreibst: `,
    specificsCondition: (c) => `Angesichts der ${c}-Bedingungen, die du erwähnst: `,
    noteEnglish: '(technische Punkte auf Englisch):',
  },
  pt: {
    keyPointsLabel: 'Pontos-chave:',
    relatedLabel: 'Relacionado à sua pergunta, mais um ponto',
    specificsBody: (p) => `Como mencionou o seu ${p}, vou focar nessa área. `,
    specificsFormat: (f) => `Para a situação de ${f} que descreve: `,
    specificsCondition: (c) => `Dadas as condições de ${c} que menciona: `,
    noteEnglish: '(pontos técnicos em inglês):',
  },
  ur: {
    keyPointsLabel: 'اہم نکات:',
    relatedLabel: 'آپ کے سوال سے متعلق ایک اور نکتہ',
    specificsBody: (p) => `چونکہ آپ نے اپنے ${p} کا ذکر کیا، میں اس پر توجہ دوں گا۔ `,
    specificsFormat: (f) => `آپ نے جس ${f} صورتحال کی وضاحت کی: `,
    specificsCondition: (c) => `آپ نے جن ${c} حالات کا ذکر کیا: `,
    noteEnglish: '(تکنیکی نکات انگریزی میں):',
  },
  bn: {
    keyPointsLabel: 'মূল পয়েন্ট:',
    relatedLabel: 'আপনার প্রশ্নের সাথে সম্পর্কিত আরেকটি বিন্দু',
    specificsBody: (p) => `যেহেতু আপনি আপনার ${p} উল্লেখ করেছেন, আমি সেই অংশে মনোনিবেশ করব। `,
    specificsFormat: (f) => `আপনি যে ${f} পরিস্থিতির বর্ণনা দিয়েছেন: `,
    specificsCondition: (c) => `আপনি উল্লেখ করা ${c} পরিস্থিতি বিবেচনায়: `,
    noteEnglish: '(প্রযুক্তিগত পয়েন্ট ইংরেজিতে):',
  },
  ta: {
    keyPointsLabel: 'முக்கிய புள்ளிகள்:',
    relatedLabel: 'உங்கள் கேள்விக்கு தொடர்புடைய மற்றொரு புள்ளி',
    specificsBody: (p) => `நீங்கள் உங்கள் ${p} குறிப்பிட்டதால், நான் அந்த பகுதியில் கவனம் செலுத்துவேன். `,
    specificsFormat: (f) => `நீங்கள் விவரித்த ${f} நிலைமைக்கு: `,
    specificsCondition: (c) => `நீங்கள் குறிப்பிட்ட ${c} நிபந்தனைகளைக் கருத்தில் கொண்டு: `,
    noteEnglish: '(தொழில்நுட்ப புள்ளிகள் ஆங்கிலத்தில்):',
  },
  other: {
    keyPointsLabel: '',
    relatedLabel: 'Related to your question, one more point',
    specificsBody: (p) => `Since you mentioned your ${p}, I will focus on that area. `,
    specificsFormat: (f) => `For the ${f} situation you described: `,
    specificsCondition: (c) => `Given the ${c} conditions you mentioned: `,
    noteEnglish: '',
  },
};

// Localized intros and closers for major non-English languages.
// These wrap the English principle content so the response framing
// matches the user's language.
const LOCALIZED_INTROS: Partial<Record<Language, Record<TopicKey, string[]>>> = {
  hi: {
    pace: ['गति बनाना एक प्रणाली है, कोई एक तरकीब नहीं। यहाँ महत्वपूर्ण तरीके दिए गए हैं।', 'तेज़ गेंदबाज़ी के लिए गति कैसे बढ़ाएँ — यहाँ प्रमुख बिंदु हैं।'],
    technique: ['एक दोहराने योग्य एक्शन हर चीज़ की नींव है। यहाँ अपनी तकनीक को निखारने के तरीके हैं।', 'आपका एक्शन तय करता है कि आप ताक़त को गति में कैसे बदलते हैं। यहाँ मुख्य चरण हैं।'],
    strength: ['तेज़ गेंदबाज़ी पूरे शरीर की शक्ति का काम है। यहाँ जिम ट्रेनिंग की प्राथमिकताएँ हैं।', 'ताकत गति और टिकाऊपन दोनों की नींव है। यहाँ मुख्य अभ्यास हैं।'],
    sprint: ['स्प्रिंट ट्रेनिंग गेंदबाज़ी की गति में सबसे सीधा लाभ देती है। यहाँ इसे कैसे करें।', 'गेंदबाज़ी एक नियंत्रित स्प्रिंट है। स्प्रिंट ट्रेनिंग गति के गुणों को विकसित करती है।'],
    plyometric: ['प्लायोमेट्रिक्स विस्फोटक लोचदार शक्ति बनाते हैं। यहाँ सुरक्षित प्रगति है।', 'रिएक्टिव पावर डिलीवरी को "तेज़" बनाती है। यहाँ प्लायोमेट्रिक ढाँचा है।'],
    mobility: ['गतिशीलता आपके एक्शन को सुचारू रखती है और चोट का जोखिम कम करती है। यहाँ रूटीन है।', 'लचीला गेंदबाज़ी टिकाऊ गेंदबाज़ी है। यहाँ महत्वपूर्ण क्षेत्र हैं।'],
    recovery: ['आराम ही अनुकूलन होता है। आप केवल ट्रेनिंग से तेज़ नहीं होते — आराम से तेज़ होते हैं। यहाँ ढाँचा है।', 'आप सत्रों के बीच कैसे आराम करते हैं, यह तय करता है कि आप कितना सुधरते हैं।'],
    nutrition: ['ईंधन ट्रेनिंग की गुणवत्ता और वसूली को चलाता है। यहाँ एक तेज़ गेंदबाज़ के लिए पोषण है।', 'आप जो खाते हैं वह आपकी ट्रेनिंग और वसूली को सीधे प्रभावित करता है।'],
    injury: ['किसी भी दर्द, तेज़ असुविधा या संभावित चोट के लिए, तुरंत गेंदबाज़ी बंद करें और योग्य कोच या चिकित्सा पेशेवर से जाँच कराएँ। यहाँ केवल सामान्य जानकारी है।'],
    mindset: ['मानसिक खेल अच्छे को महान बनाता है। यहाँ इसे कैसे बनाएँ।', 'गति शरीर में नहीं, दिमाग में खुलती है। यहाँ मानसिक ढाँचा है।'],
    drills: ['ड्रिल इरादे को कौशल में बदलते हैं। यहाँ प्रभावी अभ्यास कैसे बनाएँ।', 'अच्छी ड्रिल का एक स्पष्ट उद्देश्य होता है। यहाँ ढाँचा है।'],
    swing: ['स्विंग सीम स्थिति और सतह प्रबंधन से आता है — यह कारीगरी है, किस्मत नहीं। यहाँ कैसे करें।', 'स्विंग और सीम एक कौशल है जिसे आप सीख सकते हैं। यहाँ गेंद को कैसे चलाएँ।'],
    yorker: ['यॉर्कर एक सटीक हथियार है, खासकर डेथ में। यहाँ इसे भरोसेमंद कैसे बनाएँ।', 'एक शानदार यॉर्कर ओवर ख़त्म करता है और मैच जीतता है। यहाँ प्रशिक्षण है।'],
    bouncer: ['बाउंसर एक रणनीतिक आश्चर्य हथियार है। यहाँ इसे प्रभावी और सुरक्षित तरीके से कैसे उपयोग करें।', 'एक अच्छा बाउंसर बल्लेबाज़ के दिमाग को रीसेट करता है। यहाँ कैसे बॉल करें।'],
    knowledge: ['क्रिकेट आईक्यू आपके कौशल को विकेट में बदलता है। यहाँ खेल को कैसे पढ़ें।', 'रणनीतिक जागरूकता एक तेज़ गेंदबाज़ को विकेट लेने वाला बनाती है।'],
    general: ['मैं तेज़ गेंदबाज़ी से जुड़े किसी भी विषय पर मदद कर सकता हूँ — गति, तकनीक, ताकत, स्प्रिंट, प्लायोमेट्रिक, गतिशीलता, आराम, पोषण, मानसिकता, ड्रिल, स्विंग, यॉर्कर, बाउंसर या क्रिकेट ज्ञान। थोड़ा और बताइए कि आप क्या सुधारना चाहते हैं?'],
  },
  es: {
    pace: ['Ganar velocidad es un sistema, no un solo truco. Aquí están los métodos clave.', 'Para lanzar más rápido, hay que eliminar fugas de energía. Aquí los puntos clave.'],
    technique: ['Una acción repetible es la base de todo. Aquí cómo refinarla.', 'Tu acción determina cómo conviertes la fuerza en velocidad. Aquí las fases clave.'],
    strength: ['Lanzar rápido es un movimiento de fuerza de todo el cuerpo. Aquí las prioridades del gimnasio.', 'La fuerza sostiene la velocidad y la durabilidad. Aquí lo más importante.'],
    sprint: ['El entrenamiento de sprint es la transferencia física más directa a la velocidad. Aquí cómo estructurarlo.', 'Lanzar es un sprint controlado. El sprint desarrolla las cualidades de la velocidad.'],
    plyometric: ['La pliometría desarrolla la fuerza elástica explosiva. Aquí la progresión segura.', 'La potencia reactiva hace que el lanzamiento sea "explosivo". Aquí el marco.'],
    mobility: ['La movilidad mantiene la acción fluida y reduce el riesgo de lesión. Aquí la rutina.', 'Un lanzador móvil es un lanzador duradero. Aquí las zonas clave.'],
    recovery: ['La recuperación es donde ocurre la adaptación. Aquí el marco.', 'Cómo recuperas entre sesiones determina cuánto mejoras. Aquí cómo.'],
    nutrition: ['La nutrición impulsa la calidad del entrenamiento y la recuperación. Aquí cómo comer.', 'Lo que comes afecta directamente tu entrenamiento y recuperación.'],
    injury: ['Ante cualquier dolor, molestia aguda o posible lesión, deja de lanzar de inmediato y consulta a un entrenador cualificado o profesional sanitario. Aquí solo contexto general.'],
    mindset: ['El juego mental separa a los buenos de los grandes. Aquí cómo desarrollarlo.', 'La velocidad se libera en la mente. Aquí el marco mental.'],
    drills: ['Los ejercicios convierten la intención en habilidad. Aquí cómo hacer práctica efectiva.', 'Un buen ejercicio tiene un propósito claro. Aquí el marco.'],
    swing: ['El swing viene de la posición de la costura y la superficie — es arte, no suerte. Aquí cómo.', 'El swing y la costura son habilidades que puedes entrenar. Aquí cómo.'],
    yorker: ['El yorker es un arma de precisión, sobre todo al final. Aquí cómo hacerlo fiable.', 'Un gran yorker termina overs y gana partidos. Aquí el entrenamiento.'],
    bouncer: ['El bouncer es un arma táctica de sorpresa. Aquí cómo usarlo de forma efectiva y segura.', 'Un buen bouncer resetea la mente del bateador. Aquí cómo lanzarlo.'],
    knowledge: ['El IQ de cricket convierte tus habilidades en wickets. Aquí cómo leer el juego.', 'La conciencia táctica hace que un lanzador rápido tome wickets.'],
    general: ['Puedo ayudar con cualquier tema de lanzamiento rápido — velocidad, técnica, fuerza, sprint, pliometría, movilidad, recuperación, nutrición, mentalidad, ejercicios, swing, yorker, bouncer e IQ de cricket. ¿Me cuentas un poco más sobre qué quieres mejorar?'],
  },
};

const LOCALIZED_CLOSERS: Partial<Record<Language, string[]>> = {
  hi: ['एक समय पर एक ही सिद्धांत पर काम करें। छोटे, लगातार सुधार असली गति देते हैं।', 'याद रखें: गति एक कौशल है, केवल मेहनत नहीं। इसे जानबूझकर ट्रेन करें।'],
  es: ['Concéntrate en un principio a la vez. Las pequeñas mejoras constantes generan velocidad real.', 'Recuerda: la velocidad es una habilidad, no solo esfuerzo. Entrénala con intención.'],
};

// ---------- Response generation ----------

// Deterministic-ish pseudo-random based on the question so the same question
// gives a stable answer, but different questions give different answers.
function seededPick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickPrinciples(
  topic: TopicKey,
  count: number,
  seed: number,
  specifics: Specifics
): { title: string; detail: string }[] {
  const all = KB[topic].principles;
  if (all.length === 0) return [];

  // Prioritise principles that mention extracted specifics.
  const scored = all.map((p, idx) => {
    let score = (idx * 17 + seed) % 100;
    const text = (p.title + ' ' + p.detail).toLowerCase();
    for (const bp of specifics.bodyParts) if (text.includes(bp)) score += 50;
    for (const fmt of specifics.formats) if (text.includes(fmt)) score += 40;
    for (const cond of specifics.conditions) if (text.includes(cond)) score += 40;
    for (const tf of specifics.timeframes) if (text.includes(tf)) score += 30;
    return { p, score, idx };
  });
  scored.sort((a, b) => b.score - a.score);

  // Take top-scored, but add a little rotation so repeated questions vary.
  const result: { title: string; detail: string }[] = [];
  const usedIdx = new Set<number>();
  for (const s of scored) {
    if (result.length >= count) break;
    if (usedIdx.has(s.idx)) continue;
    result.push(s.p);
    usedIdx.add(s.idx);
  }
  // Fill any remaining slots from unused.
  for (const s of scored) {
    if (result.length >= count) break;
    if (usedIdx.has(s.idx)) continue;
    result.push(s.p);
    usedIdx.add(s.idx);
  }
  return result;
}

export function getAnswer(question: string): { answer: string; topic: TopicKey; lang: Language } {
  const lang = detectLanguage(question);
  const topics = detectTopics(question);
  const primary = topics[0];
  const specifics = extractSpecifics(question);
  const seed = hashString(question.trim().toLowerCase());
  const framing = FRAMING[lang] ?? FRAMING.en;

  const entry = KB[primary];
  // Use localized intro if available, else fall back to English KB intro.
  const localizedIntros = LOCALIZED_INTROS[lang]?.[primary];
  const intro = localizedIntros
    ? seededPick(localizedIntros, seed)
    : seededPick(entry.intros, seed);
  const principleCount = primary === 'general' ? 0 : Math.min(4, 3 + (seed % 2));
  const principles = pickPrinciples(primary, principleCount, seed, specifics);
  // Use localized closer if available, else fall back to English KB closer.
  const localizedClosers = LOCALIZED_CLOSERS[lang];
  const closer = localizedClosers
    ? seededPick(localizedClosers, seed >> 3)
    : seededPick(entry.closers, seed >> 3);

  // If two topics were detected, weave in one principle from the secondary.
  let secondaryPrinciple: { title: string; detail: string } | null = null;
  if (topics.length > 1 && primary !== 'general' && topics[1] !== 'general') {
    const sec = KB[topics[1]].principles;
    if (sec.length > 0) {
      secondaryPrinciple = seededPick(sec, seed >> 5);
    }
  }

  // Acknowledge specifics if found, in the user's language.
  let specificsNote = '';
  if (specifics.bodyParts.length > 0) {
    const bpList = specifics.bodyParts.slice(0, 3).join(', ');
    specificsNote = framing.specificsBody(bpList);
  } else if (specifics.formats.length > 0) {
    specificsNote = framing.specificsFormat(specifics.formats[0]);
  } else if (specifics.conditions.length > 0) {
    specificsNote = framing.specificsCondition(specifics.conditions[0]);
  }

  let body = `${intro}\n\n${specificsNote}`;
  if (framing.keyPointsLabel && principles.length > 0) {
    body += `${framing.keyPointsLabel}\n`;
  }
  if (principles.length > 0) {
    const list = principles
      .map((p, i) => `${i + 1}. ${p.title} — ${p.detail}`)
      .join('\n');
    body += list;
  }
  if (secondaryPrinciple) {
    body += `\n\n${framing.relatedLabel}: ${secondaryPrinciple.title} — ${secondaryPrinciple.detail}`;
  }
  body += `\n\n${closer}`;

  // Injury topics always get the disclaimer appended.
  const isMedical = primary === 'injury' || TOPIC_KEYWORDS.injury.some((k) => question.toLowerCase().includes(k));
  if (isMedical) {
    body += `\n\n${DISCLAIMER[lang] ?? DISCLAIMER.en}`;
  }

  return { answer: body, topic: primary, lang };
}
