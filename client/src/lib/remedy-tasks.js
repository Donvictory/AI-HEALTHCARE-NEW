/**
 * DriftCare NG — Personalized Remedy Task Generator
 *
 * Generates 4 daily remedy tasks based on the user's latest check-in.
 * Tasks are unique to each user's health profile and reset each day.
 * Points are randomized between 3–10 per task.
 *
 * NOT a treatment plan — tasks are lifestyle nudges only.
 */

/** Deterministic seeded random — same seed → same numbers for the same day */
function seededRand(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Random integer between min and max (inclusive), using seeded RNG */
function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Pick N unique items from an array using seeded RNG, preserving order */
function pickUnique(rng, pool, n) {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

/**
 * All available remedy task templates, tagged by the health issue they address.
 * Each template is a function(profile) → { title, description, icon }
 */
const TASK_POOL = {
  // ── Sleep Issues ────────────────────────────────────────────────────────────
  poor_sleep: [
    {
      title: "No screens 30 min before bed",
      description:
        "Blue light suppresses melatonin. Put devices away by 9:30 PM tonight.",
      icon: "🌙",
    },
    {
      title: "Try a 10-min sleep wind-down",
      description:
        "Lie still, breathe deeply, and let your muscles relax from feet upward.",
      icon: "😴",
    },
    {
      title: "Keep your room cool & dark",
      description:
        "Ideal sleep temperature is 18–22°C. Cover windows and turn off harsh lights.",
      icon: "🛏️",
    },
    {
      title: "Set a consistent bedtime alarm",
      description:
        "Your circadian rhythm strengthens with regularity. Aim for the same bedtime.",
      icon: "⏰",
    },
  ],

  // ── High Stress ──────────────────────────────────────────────────────────────
  high_stress: [
    {
      title: "5-minute box breathing session",
      description:
        "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 5 times. Reduces cortisol fast.",
      icon: "🧘",
    },
    {
      title: "Write 3 things you're grateful for",
      description:
        "Gratitude journaling rewires the brain away from threat-mode. Takes 5 minutes.",
      icon: "📝",
    },
    {
      title: "Take a 15-min outdoor walk",
      description:
        "Daylight + movement drops cortisol and boosts serotonin. No phone during the walk.",
      icon: "🚶",
    },
    {
      title: "Talk to one person you trust today",
      description:
        "Social connection is one of the strongest stress buffers. Even a 5-min call counts.",
      icon: "💬",
    },
    {
      title: "Set 3 boundaries for today",
      description:
        "Identify 3 things you will NOT do today. Saying no is a health act.",
      icon: "🚧",
    },
  ],

  // ── Low Activity ─────────────────────────────────────────────────────────────
  low_activity: [
    {
      title: "20-minute brisk walk after eating",
      description:
        "Post-meal walks lower blood glucose and improve cardiovascular function.",
      icon: "🏃",
    },
    {
      title: "10 squats every hour (4 times today)",
      description:
        "Micro-movement keeps metabolism active even on sedentary days.",
      icon: "🏋️",
    },
    {
      title: "Dance for one full song",
      description:
        "3 minutes of movement elevates mood, burns calories, and counts as exercise.",
      icon: "💃",
    },
    {
      title: "Take the stairs at least twice",
      description:
        "Stair climbing is a full-body workout requiring zero equipment.",
      icon: "🪜",
    },
    {
      title: "10-min morning stretch routine",
      description:
        "Stretching improves circulation and reduces muscle tension from overnight rest.",
      icon: "🤸",
    },
  ],

  // ── Dehydration ──────────────────────────────────────────────────────────────
  dehydration: [
    {
      title: "Drink a full glass of water now",
      description:
        "Start a hydration cascade. One glass leads to another. Your kidneys will thank you.",
      icon: "💧",
    },
    {
      title: "Add lemon or cucumber to your water",
      description:
        "Flavoured water dramatically increases how much you actually drink through the day.",
      icon: "🍋",
    },
    {
      title: "Set hourly water reminders",
      description:
        "Your phone can be your hydration coach. Set alarms for 10 AM, 12 PM, 3 PM, 6 PM.",
      icon: "⏱️",
    },
    {
      title: "Eat a water-rich fruit or vegetable",
      description:
        "Watermelon, cucumber, or orange is 90%+ water. Great way to hydrate while eating.",
      icon: "🍉",
    },
  ],

  // ── Poor Mood ────────────────────────────────────────────────────────────────
  low_mood: [
    {
      title: "Get 20 minutes of morning sunlight",
      description:
        "Morning light regulates serotonin and dopamine — the mood trifecta. Go outside.",
      icon: "☀️",
    },
    {
      title: "Do one small thing you enjoy today",
      description:
        "Pick ONE enjoyable activity (music, food, hobby) — even 15 minutes matters.",
      icon: "🎯",
    },
    {
      title: "Clean or tidy one small space",
      description:
        "Environmental order reduces cognitive load and creates a mood lift signal.",
      icon: "🧹",
    },
    {
      title: "Avoid social media for 2 hours",
      description:
        "Comparison culture feeds low mood. A digital detox gives your mind breathing room.",
      icon: "📵",
    },
  ],

  // ── Fatigue / Febrile Symptoms ───────────────────────────────────────────────
  fatigue: [
    {
      title: "Rest fully — no heavy work today",
      description:
        "Fatigue is your body signalling recovery mode. Honour it. Productivity can wait.",
      icon: "🛌",
    },
    {
      title: "Eat a nourishing, protein-rich meal",
      description:
        "Eggs, beans, or fish give your cells what they need to repair and recover.",
      icon: "🍳",
    },
    {
      title: "Check your temperature",
      description:
        "If you have a thermometer at home, record your temperature now and again in 4 hours.",
      icon: "🌡️",
    },
    {
      title: "Sip warm fluids every 30 minutes",
      description:
        "Warm water, herbal tea, or pepper soup helps your immune response and keeps you hydrated.",
      icon: "🍵",
    },
  ],

  // ── Headache ─────────────────────────────────────────────────────────────────
  headache: [
    {
      title: "Drink 500ml of water immediately",
      description:
        "Dehydration is the most common cause of headaches in Nigeria's warm climate.",
      icon: "💧",
    },
    {
      title: "Step away from your screen for 30 min",
      description:
        "Eye strain and screen tension are top headache triggers. Give your eyes a break.",
      icon: "👁️",
    },
    {
      title: "Apply cold or warm compress to neck",
      description:
        "A cool compress at the base of your skull can relieve tension headaches in minutes.",
      icon: "🧊",
    },
    {
      title: "Check your blood pressure if possible",
      description:
        "Recurring headaches with high stress may signal blood pressure changes. Get it checked.",
      icon: "🩺",
    },
  ],

  // ── Smoking / Alcohol ────────────────────────────────────────────────────────
  smoking: [
    {
      title: "Delay your first cigarette by 30 min",
      description:
        "Each delay lengthens your window of control. Small delays build into zero cravings.",
      icon: "⏳",
    },
    {
      title: "Replace cigarette break with a walk",
      description:
        "The craving peak lasts 3–5 minutes. A short walk outlasts it and oxygenates your lungs.",
      icon: "🚶",
    },
  ],

  alcohol: [
    {
      title: "Drink one extra glass of water today",
      description:
        "Alcohol depletes your hydration. Rebalance with extra fluid intake today.",
      icon: "💧",
    },
    {
      title: "Eat a liver-supportive meal today",
      description:
        "Green vegetables, garlic, and turmeric support liver recovery after alcohol.",
      icon: "🥦",
    },
  ],

  // ── High BMI / Diabetes Risk ─────────────────────────────────────────────────
  high_bmi: [
    {
      title: "Replace one refined carb with protein",
      description:
        "Swap white bread or rice for eggs, beans, or fish in one meal today.",
      icon: "🍽️",
    },
    {
      title: "Walk for 20 minutes after your largest meal",
      description:
        "Post-meal walks are the single most effective way to manage blood glucose spikes.",
      icon: "🏃",
    },
    {
      title: "Skip sugary drinks for today",
      description:
        "Soft drinks and juice are the biggest blood glucose offenders. Choose water or zobo.",
      icon: "🚫",
    },
  ],

  // ── General Wellness ─────────────────────────────────────────────────────────
  general: [
    {
      title: "Take 5 deep breaths right now",
      description:
        "Conscious breathing activates your parasympathetic nervous system. Do it now.",
      icon: "🌬️",
    },
    {
      title: "Eat at least one fruit or vegetable today",
      description:
        "Whole-food micronutrients protect every system in your body. Make it happen.",
      icon: "🥗",
    },
    {
      title: "Log tomorrow's check-in reminder",
      description:
        "Consistency in tracking is the biggest predictor of long-term health improvement.",
      icon: "📅",
    },
    {
      title: "Tell someone close how you're feeling",
      description:
        "Emotional health is physical health. Naming your feelings reduces cortisol.",
      icon: "❤️",
    },
  ],
};

/**
 * Determine which task categories are most relevant for this check-in.
 * Returns an ordered list of category keys (most urgent first).
 */
function rankCategories(checkIn, profile) {
  const scores = [];

  const sleep = parseFloat(checkIn.hoursSlept) || 0;
  const stress = parseFloat(checkIn.stressLevel) || 0;
  const mood = parseFloat(checkIn.mood ?? checkIn.currentMood) || 0;
  const activity =
    parseFloat(checkIn.physicalActivity ?? checkIn.dailyActivityMeasure) || 0;
  const water =
    parseFloat(checkIn.waterIntake ?? checkIn.numOfWaterGlasses) || 0;
  const bmi = parseFloat(profile?.bmi) || 0;
  const symptoms = [
    ...(Array.isArray(checkIn.symptomsToday) ? checkIn.symptomsToday : []),
    ...(Array.isArray(checkIn.symptoms) ? checkIn.symptoms : []),
  ];
  const lifestyle = Array.isArray(checkIn.lifestyleChecks)
    ? checkIn.lifestyleChecks
    : [];
  const health = (
    checkIn.currentHealthStatus ||
    checkIn.healthStatus ||
    "GOOD"
  ).toUpperCase();

  // Score each category (higher = more urgent)
  if (sleep < 5) scores.push({ key: "poor_sleep", score: 10 });
  else if (sleep < 6.5) scores.push({ key: "poor_sleep", score: 6 });

  if (stress >= 8) scores.push({ key: "high_stress", score: 10 });
  else if (stress >= 6) scores.push({ key: "high_stress", score: 7 });

  if (mood <= 3) scores.push({ key: "low_mood", score: 9 });
  else if (mood <= 5) scores.push({ key: "low_mood", score: 5 });

  if (activity < 10) scores.push({ key: "low_activity", score: 8 });
  else if (activity < 20) scores.push({ key: "low_activity", score: 4 });

  if (water < 4) scores.push({ key: "dehydration", score: 8 });
  else if (water < 6) scores.push({ key: "dehydration", score: 5 });

  const hasFatigue = symptoms.some((s) =>
    s.match(/FATIGUE|TIRED|WEAKNESS|WEAKNESS/i),
  );
  const hasFever = symptoms.some((s) => s.match(/FEVER/i));
  const hasHeadache = symptoms.some((s) => s.match(/HEADACHE|HEAD/i));

  if (hasFever || health === "SICK") scores.push({ key: "fatigue", score: 10 });
  else if (hasFatigue) scores.push({ key: "fatigue", score: 7 });

  if (hasHeadache) scores.push({ key: "headache", score: 8 });

  if (lifestyle.includes("SMOKED_TODAY"))
    scores.push({ key: "smoking", score: 7 });
  if (lifestyle.includes("DRANK_LAST_NIGHT"))
    scores.push({ key: "alcohol", score: 6 });

  if (bmi > 27) scores.push({ key: "high_bmi", score: 7 });
  else if (bmi > 25) scores.push({ key: "high_bmi", score: 4 });

  // Always pad with general if we don't have enough
  scores.push({ key: "general", score: 1 });

  // Sort by urgency, dedup by key
  const seen = new Set();
  return scores
    .sort((a, b) => b.score - a.score)
    .filter(({ key }) => (seen.has(key) ? false : seen.add(key)))
    .map(({ key }) => key);
}

/**
 * Main export: generate 4 unique remedy tasks from a check-in.
 *
 * @param {Object} checkIn  - Today's normalized check-in record
 * @param {Object} profile  - User profile
 * @returns {Array}         - Array of 4 task objects { id, title, description, icon, points, completed, isRemedy }
 */
export function generateRemedyTasks(checkIn, profile) {
  if (!checkIn) return [];

  // Seed the RNG with today's date + user ID for reproducibility within the same day
  const today = new Date().toISOString().split("T")[0]; // "2026-02-22"
  const userId = profile?._id || profile?.id || "anon";
  const seedStr = today + userId;
  let seedNum = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seedNum = (seedNum * 31 + seedStr.charCodeAt(i)) & 0xfffffff;
  }
  const rng = seededRand(seedNum || 42);

  // Rank categories by urgency
  const rankedCategories = rankCategories(checkIn, profile);

  // Pick 4 tasks, one from each top category
  const tasks = [];
  const usedCategories = new Set();

  for (const category of rankedCategories) {
    if (tasks.length >= 4) break;
    if (usedCategories.has(category)) continue;

    const pool = TASK_POOL[category];
    if (!pool || pool.length === 0) continue;

    // Pick one task from the pool (seeded so it's consistent for the day)
    const idx = Math.floor(rng() * pool.length);
    const template = pool[idx];

    tasks.push({
      id: `remedy-${today}-${category}`,
      title: template.title,
      description: template.description,
      icon: template.icon,
      points: randInt(rng, 3, 10),
      completed: false,
      isRemedy: true, // flag to distinguish from static tasks
      category,
    });

    usedCategories.add(category);
  }

  // If we somehow have fewer than 4, pad from general
  const generalPool = TASK_POOL.general;
  let gIdx = 0;
  while (tasks.length < 4 && gIdx < generalPool.length) {
    const cat = `general_${gIdx}`;
    if (!usedCategories.has(cat)) {
      const template = generalPool[gIdx];
      tasks.push({
        id: `remedy-${today}-general-${gIdx}`,
        title: template.title,
        description: template.description,
        icon: template.icon,
        points: randInt(rng, 3, 10),
        completed: false,
        isRemedy: true,
        category: "general",
      });
      usedCategories.add(cat);
    }
    gIdx++;
  }

  return tasks;
}
