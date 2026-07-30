import {
  Brain,
  Gauge,
  Dumbbell,
  Footprints,
  Flame,
  HeartPulse,
  Apple,
  ShieldPlus,
  Target,
  Wind,
  Crosshair,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

export type TrainingSection = {
  id: string;
  index: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  points: { title: string; detail: string }[];
  image: string;
  alt: string;
};

export const TRAINING_SECTIONS: TrainingSection[] = [
  {
    id: 'mindset',
    index: '01',
    icon: Brain,
    title: 'Fast Bowling Mindset',
    subtitle: 'The mental edge of a strike bowler',
    description:
      'Pace is built in the gym, but it is unleashed in the mind. PaceThink trains the composure, focus and competitive fire that separates a genuine quick from a quick who fades under pressure.',
    points: [
      { title: 'Pre-delivery routine', detail: 'A repeatable breath-cue-trigger sequence that anchors every ball, home or away.' },
      { title: 'Pressure visualisation', detail: 'Mental reps for death overs, new batter and big moments before they happen.' },
      { title: 'Bounce-back protocols', detail: 'Reset routines after a boundary or a bad ball so one mistake never becomes two.' },
      { title: 'Process over outcome', detail: 'Measure execution, not wickets — wickets follow a disciplined process.' },
    ],
    image: 'https://images.pexels.com/photos/34497242/pexels-photo-34497242.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Fast bowler in focused action',
  },
  {
    id: 'speed',
    index: '02',
    icon: Gauge,
    title: 'Speed Development',
    subtitle: 'Engineer genuine, repeatable pace',
    description:
      'Adding miles per hour is a system, not a guess. PaceThink breaks speed into run-up, action efficiency, ground reaction forces and load management — so you get quicker without breaking down.',
    points: [
      { title: 'Run-up calibration', detail: 'Build to ~75% of max at back-foot landing, not an all-out sprint from the start.' },
      { title: 'Action efficiency', detail: 'Remove energy leaks so more of your run-up reaches the ball at release.' },
      { title: 'Front-leg bracing', detail: 'A firm front knee converts horizontal speed into ball speed at delivery.' },
      { title: 'Pace periodisation', detail: 'Train pace in short, high-quality blocks and track speeds to see real gains.' },
    ],
    image: 'https://images.pexels.com/photos/12698200/pexels-photo-12698200.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Athlete sprinting on track',
  },
  {
    id: 'strength',
    index: '03',
    icon: Dumbbell,
    title: 'Strength & Gym',
    subtitle: 'Build the engine behind every delivery',
    description:
      'Fast bowling is a whole-body power movement. PaceThink strength programs target the lower body, posterior chain, rotational core and upper back — the structures that produce pace and survive it.',
    points: [
      { title: 'Lower-body force', detail: 'Squats, split squats and RDLs build the drive off the back foot.' },
      { title: 'Posterior chain', detail: 'Deadlifts and hip thrusts protect the back and generate raw pace.' },
      { title: 'Rotational core', detail: 'Medicine-ball throws and anti-rotation drills transfer force through the trunk.' },
      { title: 'Upper back & shoulders', detail: 'Rows and pull-aparts keep the action stable and repeatable.' },
    ],
    image: 'https://images.pexels.com/photos/4853280/pexels-photo-4853280.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Athlete performing a deadlift in the gym',
  },
  {
    id: 'sprint',
    index: '04',
    icon: Footprints,
    title: 'Sprint Training',
    subtitle: 'Speed that transfers to the crease',
    description:
      'Sprint work is the most direct carry-over to bowling speed. PaceThink layers accelerations, resisted sprints and top-speed reps alongside your actual run-up rehearsal.',
    points: [
      { title: 'Accelerations', detail: '10–30m sprints from standing and rolling starts, full recovery between reps.' },
      { title: 'Resisted sprints', detail: 'Sled or hill sprints to build the drive phase and horizontal force.' },
      { title: 'Top-speed reps', detail: 'Flying 20–40m sprints to improve stride efficiency at max velocity.' },
      { title: 'Run-up rehearsal', detail: 'Practise your real bowling run-up at speed so training meets the match.' },
    ],
    image: 'https://images.pexels.com/photos/19787364/pexels-photo-19787364.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Sprinters launching off the starting line',
  },
  {
    id: 'plyometric',
    index: '05',
    icon: Flame,
    title: 'Plyometric Drills',
    subtitle: 'Explosive elastic power',
    description:
      'Plyometrics build the fast, elastic strength behind a snappy delivery. PaceThink progresses you from low-intensity bounds to high-intensity depth jumps — safely and gradually.',
    points: [
      { title: 'Low-intensity', detail: 'Pogo jumps, A-skips and bounds to develop stiffness and elasticity.' },
      { title: 'Medium', detail: 'Box jumps, lateral bounds and broad jumps for explosive triple extension.' },
      { title: 'High-intensity', detail: 'Depth jumps — only once you can squat ~1.5x bodyweight — for reactive power.' },
      { title: 'Short ground contact', detail: 'Keep contacts quick and landings soft; quality over volume every time.' },
    ],
    image: 'https://images.pexels.com/photos/4761349/pexels-photo-4761349.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Athlete performing a box jump in the gym',
  },
  {
    id: 'mobility',
    index: '06',
    icon: HeartPulse,
    title: 'Mobility & Recovery',
    subtitle: 'Adapt between spells, stay available',
    description:
      'You do not get faster from training alone — you get faster from recovering from training. PaceThink tracks readiness and gives you mobility and recovery protocols that fit a bowler’s calendar.',
    points: [
      { title: 'Hip & t-spine mobility', detail: '90/90 switches and open-book rotations keep the action smooth.' },
      { title: 'Sleep & readiness', detail: '8+ hours of sleep is the single biggest performance lever you control.' },
      { title: 'Deload weeks', detail: 'Every 4–6 weeks, drop volume ~40% so your body actually absorbs the work.' },
      { title: 'Soreness vs pain', detail: 'Soreness fades; sharp or one-sided pain needs attention, not pushing through.' },
    ],
    image: 'https://images.pexels.com/photos/4804294/pexels-photo-4804294.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Athlete using a foam roller for recovery',
  },
  {
    id: 'nutrition',
    index: '07',
    icon: Apple,
    title: 'Nutrition',
    subtitle: 'Fuel for fire and recovery',
    description:
      'Fueling drives training quality and recovery. PaceThink builds match-day, training-day and rest-day nutrition around a fast bowler’s real energy demands and travel schedule.',
    points: [
      { title: 'Protein targets', detail: '~1.6–2.0g per kg daily, spread across meals, for muscle repair.' },
      { title: 'Carb periodisation', detail: 'More carbs on training and match days, fewer on rest days.' },
      { title: 'Match-day fueling', detail: 'A familiar carb meal 2–3h before, light snack 30–60 min before.' },
      { title: 'Recovery window', detail: 'Protein plus carbs within 60 minutes of finishing a spell.' },
    ],
    image: 'https://images.pexels.com/photos/1305063/pexels-photo-1305063.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Healthy nutritious breakfast with eggs and avocado',
  },
  {
    id: 'injury',
    index: '08',
    icon: ShieldPlus,
    title: 'Injury Prevention',
    subtitle: 'Stay on the park, season after season',
    description:
      'The fastest bowler is the one who is fit to bowl. PaceThink layers workload management, movement screening and prehab into your week so pace and durability grow together.',
    points: [
      { title: 'Workload management', detail: 'Track deliveries and sessions; avoid sudden spikes that drive stress fractures.' },
      { title: 'Movement screening', detail: 'Flag asymmetries and restrictions before they become injuries.' },
      { title: 'Prehab routines', detail: 'Targeted strength for the lower back, hamstrings, calves and shoulder.' },
      { title: 'Junior guidelines', detail: 'Younger bowlers follow recognised workload limits to protect growth plates.' },
    ],
    image: 'https://images.pexels.com/photos/2294360/pexels-photo-2294360.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Athlete stretching on a mat for mobility',
  },
  {
    id: 'drills',
    index: '09',
    icon: Target,
    title: 'Bowling Drills',
    subtitle: 'Repetition with intent',
    description:
      'Drills turn intent into skill. PaceThink gives you a living library of targeted drills — each with a clear purpose, cue and progression — adapted weekly to what your game needs.',
    points: [
      { title: 'Technical drills', detail: 'One-step and seam-present drills to groove a repeatable release.' },
      { title: 'Constraint-led drills', detail: 'Change target, ball or distance to force a specific adaptation.' },
      { title: 'Game simulation', detail: 'Spell simulation and scenario reps that mirror real match pressure.' },
      { title: 'Film & review', detail: 'Check every rep against your target shape; the camera is your best coach.' },
    ],
    image: 'https://images.pexels.com/photos/28759001/pexels-photo-28759001.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Cricketers in a match with dynamic action',
  },
  {
    id: 'swing',
    index: '10',
    icon: Wind,
    title: 'Swing & Seam Bowling',
    subtitle: 'Make the ball talk',
    description:
      'Swing and seam are craft, not luck. PaceThink teaches you seam management, wrist position and the conditions that bring conventional and reverse swing into play.',
    points: [
      { title: 'Conventional swing', detail: 'Upright seam toward slip; ball swings toward the shiny side.' },
      { title: 'Reverse swing', detail: 'Older rough ball swings toward the rough side, later in the delivery.' },
      { title: 'Steady wrist', detail: 'A straight, stable wrist at release keeps the seam honest and the ball moving.' },
      { title: 'Reading conditions', detail: 'Overcast and humid helps conventional; dry and abrasive helps reverse.' },
    ],
    image: 'https://images.pexels.com/photos/5519470/pexels-photo-5519470.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Red cricket ball with visible seam',
  },
  {
    id: 'yorker-bouncer',
    index: '11',
    icon: Crosshair,
    title: 'Yorker & Bouncer Training',
    subtitle: 'Two weapons, two plans',
    description:
      'The yorker ends overs; the bouncer resets minds. PaceThink trains both as precision weapons — with targets, field settings and clear plans for when to use each.',
    points: [
      { title: 'Yorker precision', detail: 'Target the base of the stumps; aim small, miss small; commit fully.' },
      { title: 'Yorker variations', detail: 'Wide-line and slower yorkers — but only once the stock yorker is reliable.' },
      { title: 'Bouncer tactics', detail: 'Back of a length at chest height; set deep square leg and fine leg.' },
      { title: 'Sparingly used', detail: 'Surprise is part of the bouncer’s value; overuse lets batters line it up.' },
    ],
    image: 'https://images.pexels.com/photos/35887605/pexels-photo-35887605.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Cricketer delivering a ball during a match',
  },
  {
    id: 'knowledge',
    index: '12',
    icon: TrendingUp,
    title: 'Cricket Knowledge',
    subtitle: 'Read the game like a thinker',
    description:
      'Tactical IQ turns your skills into wickets. PaceThink builds the game sense to read batters, set fields, plan spells and own your role in the attack across formats.',
    points: [
      { title: 'Batter profiling', detail: 'Read setup, head position and first movements to predict intent.' },
      { title: 'Field-setting logic', detail: 'Match your field to your plan — catching for pressure, saving for containment.' },
      { title: 'Spell planning', detail: 'Start with control, build pressure, then attack with your best ball.' },
      { title: 'Conditions reading', detail: 'Pitch, wind, ball age and humidity all change what works on the day.' },
    ],
    image: 'https://images.pexels.com/photos/36230651/pexels-photo-36230651.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Cricket stadium at night under lights',
  },
];
