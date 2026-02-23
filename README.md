# MANNAH

Mannah is a kid-focused 11+ learning app built to make daily practice feel like play, not pressure.

## Why I built this

I am a father.

I wanted a study tool my child would actually want to open every day: colorful, motivating, and structured enough for real progress. Mannah was built from that need: help children grow confidence in Maths, English, Verbal Reasoning, and Non-Verbal Reasoning while giving parents a clear progress report.

## What it does

### 36 question generators across 4 subjects
Maths (arithmetic, fractions, decimals, percentages, algebra, ratios, geometry, measurement, data handling, word problems, time, money), English (spelling, grammar, vocabulary, punctuation, cloze, sentence completion), Verbal Reasoning (synonyms, antonyms, analogies, letter series, number series, compound words, hidden words, move-a-letter, missing letters, shuffled sentences, word-letter codes), and Non-Verbal Reasoning (series, rotation, reflection, matrices, odd-one-out). Every question is generated from a seeded RNG so the same seed always produces the same question.

### Adaptive difficulty
The app tracks per-topic accuracy and recommends what to practise next, weakest topics first. A difficulty floor prevents children from farming easy questions once they've proven they can handle harder ones. Five difficulty levels scale from straightforward to exam-hard.

### Gamification that drives daily habits
XP with difficulty multipliers and speed bonuses. Diminishing returns stop topic-grinding. Levels, streaks, achievements, daily challenges, and boss battles give children a reason to come back every day.

### Parent dashboard
PIN-locked view showing weekly activity, per-subject accuracy, total questions answered, and focus-area recommendations. No accounts, no logins, no data leaves the device.

### Offline-first PWA
All data lives in IndexedDB via Dexie. The app installs to the home screen, works without an internet connection, and auto-updates via service worker.

## Tech stack

- React 19 + TypeScript
- Vite
- Dexie + IndexedDB (local-first data)
- Framer Motion
- Tailwind CSS (v4)
- date-fns

## Getting started

### Prerequisites

- Node.js 18+ (recommended 20+)
- npm

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Scripts

- `npm run dev` - start development server
- `npm run build` - type-check and build
- `npm run preview` - preview built app
- `npm run lint` - run ESLint
- `npm test` - run unit tests
- `npm run test:watch` - run tests in watch mode
- `npm run generate-icons` - generate app icons

## Project structure

- `src/pages` - app screens (Home, Quiz, Progress, Parent, etc.)
- `src/components` - reusable UI and feature components
- `src/engine` - question generation logic
- `src/gamification` - XP, streaks, achievements, bosses
- `src/db` - Dexie/IndexedDB setup and migrations
- `src/hooks` - app hooks (profile, XP, notifications, theme, etc.)

## Data and privacy

Mannah is currently local-first. Learner progress is stored in the browser using IndexedDB.

## Contributing

Contributions are welcome and appreciated.

If you are a parent, teacher, developer, or designer and want to improve learning outcomes for kids, please contribute:

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a pull request

You can also open issues for bugs, ideas, or curriculum improvements.

## License

Apache 2.0 — see [LICENSE](LICENSE) for details.

## Acknowledgment

Built with care for children who need consistency, confidence, and joy in learning.
