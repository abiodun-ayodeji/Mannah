# MANNAH

Mannah is a kid-focused 11+ learning app built to make daily practice feel like play, not pressure.

## Why I built this

I am a father.

I wanted a study tool my child would actually want to open every day: colorful, motivating, and structured enough for real progress. Mannah was built from that need: help children grow confidence in Maths, English, Verbal Reasoning, and Non-Verbal Reasoning while giving parents clear visibility.

## What it does

- Adaptive quiz flow with recommendations based on weaker topics
- Subject journeys and constellation-style progression
- Daily challenges and boss battles for motivation
- XP, levels, streaks, and achievements
- Parent dashboard with PIN lock, weekly activity, and focus areas
- Bell notifications for:
- `Streak at risk`
- `Achievement unlocked`
- `Weekly summary ready`
- Aurora glass UI with bright/dark theme toggle (chameleon control)
- Offline-ready PWA behavior and install prompts

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

## Acknowledgment

Built with care for children who need consistency, confidence, and joy in learning.
