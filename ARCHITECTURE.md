# Architecture & Design Decisions

A reference for contributors. Covers the "why" behind key choices, not just the "what".

## Local-first, no backend

All data lives in IndexedDB via [Dexie](https://dexie.org). No server, no accounts, no data leaves the device. This is deliberate:

- Children's data stays private by default
- The app works offline (PWA with service worker)
- No infrastructure cost — the app is free forever

**State management** uses `useLiveQuery` from `dexie-react-hooks` instead of Redux/Zustand/Context. A Dexie query is reactive: when the underlying table changes, any component using that query re-renders automatically. This eliminates prop drilling and dispatch boilerplate.

```
Component → useLiveQuery(db.attempts...) → IndexedDB
Component → useLiveQuery(db.streakState...) → IndexedDB
```

Every hook in `src/hooks/` follows the same pattern: query with `useLiveQuery`, return data + mutation functions.

## Question engine

Questions are generated on-demand from a seed, never stored. This gives infinite variety with zero storage cost.

**Generator contract** (`src/engine/generators/`):
```ts
(seed: number, difficulty: Difficulty) => Question
```

Every generator accepts a seed and difficulty (1-5), returns a complete `Question` with prompt, options, correct answer, and explanation. The seed feeds a [Mulberry32 PRNG](src/utils/random.ts) — same seed always produces the same question.

**Registry** (`src/engine/question-engine.ts`): Maps each `Topic` enum to its generator function. Quiz generation round-robins through selected topics.

**Adding a new topic:**
1. Create `src/engine/generators/{subject}/{topic}.ts` exporting a generator function
2. Add the topic to the enum in `src/types/subject.ts`
3. Register it in the `GENERATORS` map in `question-engine.ts`
4. Add a label in `TOPIC_LABELS`

## Difficulty system

Five levels (1-5). Each generator implements its own scaling — arithmetic uses bigger numbers, verbal uses harder word lists, non-verbal adds more visual noise.

**Difficulty floor** (`src/utils/practice-recommendations.ts`): Once a child proves accuracy on a topic (>70% over 5+ attempts), they can't drop back to the easiest level. This prevents farming easy questions for XP.

| Accuracy | Minimum difficulty |
|----------|-------------------|
| < 50%    | 1                 |
| 50-70%   | 2                 |
| 70-85%   | 3                 |
| >= 85%   | 4                 |

**Recommendations**: The home screen shows the 3 weakest topics (lowest accuracy, minimum 3 attempts) with suggested difficulty. This nudges children toward what they need most.

## XP and leveling

**File:** `src/gamification/xp-system.ts`

XP for a correct answer = `base(10) * difficultyMultiplier * speedBonus * streakBonus * diminishingReturns`

- **Difficulty multiplier**: D1=1x, D2=1.5x, D3=2x, D4=3x, D5=4x
- **Speed bonus**: Up to 1.5x for answering in under 25% of the time limit
- **Streak bonus**: +5% per consecutive correct answer, capped at +50%
- **Diminishing returns**: Repeating the same topic in one day halves XP each session (floor at 25%)
- **Wrong answer**: Always 2 XP (consolation, keeps children from feeling punished)

**Level curve**: `xpForLevel(n) = 50 * n^1.5`. Exponential — early levels are fast, later levels require sustained effort. Cap at level 100.

## Achievements

**File:** `src/gamification/achievement-system.ts`

45 achievements across 6 categories (volume, mastery, streak, speed, exploration, special). Each has a `conditionType` and `conditionThreshold`. The check function runs after every quiz session, aggregates data from `db.attempts` and `db.streakState`, and unlocks any newly-met conditions.

Achievements are **not** state machines. They're pure checks against aggregate data — this makes them easy to add without tracking per-achievement progress.

## Boss battles

**File:** `src/gamification/boss-battle.ts`

13 bosses across all 4 subjects. Each boss covers specific topics at a fixed difficulty. The battle is a quiz with HP bars — correct answers deal damage to the boss, wrong answers deal damage to the player. Bosses give narrative framing to practice sessions.

## Routing

**File:** `src/App.tsx`

Quiz configuration passes through **search params** (`/quiz?subject=maths&topic=arithmetic&difficulty=3`), not URL path segments. This keeps quiz URLs stateless and shareable.

Quiz and boss battle pages render **outside the AppShell** (no sidebar, header, or bottom nav). This gives full-screen focus during practice. All other pages render inside AppShell with navigation chrome.

## Styling

**Tailwind CSS (v4)** for component utilities. **Custom CSS** in `src/index.css` for animations, theming, and the aurora glass effect.

**Theming** uses a `data-theme` attribute on the root element (`dark` or `bright`). CSS variables define colors in `@theme`, and scoped selectors like `:root[data-theme='bright'] .aurora-glass` override them per mode.

**Aurora glass effect**: Dark mode uses `backdrop-filter: blur(14px)` with semi-transparent gradient backgrounds. Bright mode disables blur and uses opaque pastels.

**Subject colors**: Maths = indigo, English = emerald, Verbal = pink, Non-Verbal = amber. These are consistent across all screens.

## Sound

**File:** `src/hooks/useSound.ts`

Web Audio API oscillators — no audio files. Seven synthesised sounds (correct, wrong, level-up, streak, tick, boss-intro, achievement). Each is a short sequence of tones with `OscillatorNode` and `GainNode`. Audio context is resumed on first user interaction (browser requirement).

## Database schema

**File:** `src/db/database.ts`

| Table | Key | Purpose |
|-------|-----|---------|
| `attempts` | `id`, compound `[subject+topic]` | Every answered question. Source of truth for XP, accuracy, achievements. |
| `sessions` | `id`, indexed `startTime` | Quiz/boss/challenge metadata. Used for daily counts and diminishing returns. |
| `topicMastery` | compound `[subject+topic]` | Per-topic rating. One record per subject+topic pair. |
| `achievements` | `id` | Unlocked achievements with timestamps. |
| `userProfile` | `id` | Name, settings (sound, timer, theme, daily goal). |
| `streakState` | `id` | Single record tracking current/longest streak and last active date. |
| `notifications` | `id` | Achievement unlocks, streak warnings, weekly summaries. Idempotent IDs prevent duplicates. |
| `dailyStats` | `date` | One record per day for daily activity tracking. |

Compound indices like `[subject+topic]` enable efficient queries such as "get all maths arithmetic attempts" without scanning the full table.

## Animations

Framer Motion throughout. Conventions:

- **Modals**: `AnimatePresence` wrapper, backdrop fades in/out, content springs from `scale: 0.5`
- **Page transitions**: `motion.div` with `initial={{ opacity: 0, y: 20 }}`, spring physics
- **Feedback overlay**: Slides up from bottom (`y: 300 → 0`)
- **Buttons**: `whileHover={{ scale: 1.05 }}`, `whileTap={{ scale: 0.95 }}`
- **Achievements toast**: Drops from top with spring, auto-dismisses

## PWA

**File:** `vite.config.ts`

- `registerType: 'prompt'` — prompts user to update (won't interrupt mid-quiz)
- Workbox caches all JS, CSS, HTML, images
- `display: 'standalone'`, `orientation: 'portrait'`
- Maskable icons for Android adaptive icon support

## Component conventions

- **Page components** (`src/pages/`): Full route handlers. Use `useSearchParams` for config, `useLiveQuery` for data.
- **Reusable components** (`src/components/`): Receive typed props. Handler props use `on` prefix (`onSelect`, `onClose`, `onFinish`).
- **Hooks** (`src/hooks/`): Wrap Dexie queries. Return `null` for "no data" (not `undefined`). Return both data and mutation functions.
- **Types** (`src/types/`): Enums for subjects/topics. Literal unions for answer formats. Timestamps are `number` (milliseconds). Dates are `string` (ISO format `yyyy-MM-dd`).

## File structure

```
src/
  pages/           Route-level screens
  components/
    layout/        AppShell, Header, Sidebar, BottomNav
    quiz/          QuizSession, QuestionCard, MultipleChoice, QuizResults
    gamification/  LevelUpModal, XPBar, StreakDisplay, AchievementToast
  engine/
    generators/
      maths/       12 generators
      english/     6 generators
      verbal/      10 generators
      nonverbal/   6 generators
    question-engine.ts   Generator registry
  gamification/    XP, achievements, streaks, boss battles, daily challenges
  hooks/           useXP, useSound, useStreak, useTimer, useUserProfile, etc.
  db/              Dexie schema and migrations
  types/           TypeScript definitions
  utils/           Practice recommendations, seeded RNG
  notifications/   Notification creation and management
```
