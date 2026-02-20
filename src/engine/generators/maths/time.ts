import type { Question, Difficulty } from '../../../types/question';
import { Subject, MathsTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, uniqueId } from '../../../utils/random';

function formatTime12(hours: number, minutes: number): string {
  const period = hours < 12 ? 'am' : 'pm';
  const h = hours % 12 === 0 ? 12 : hours % 12;
  return `${h}:${String(minutes).padStart(2, '0')} ${period}`;
}

function formatTime24(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} minutes`;
  if (m === 0) return `${h} hour${h > 1 ? 's' : ''}`;
  return `${h} hour${h > 1 ? 's' : ''} ${m} minutes`;
}

export function generateTime(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const tags: string[] = ['time'];

  let prompt: string;
  let answerStr: string;
  let explanation: string;

  if (difficulty <= 2) {
    // Calculate simple durations with round times
    const startH = randomInt(6, 14, rng);
    const startM = difficulty === 1 ? 0 : randomInt(0, 3, rng) * 15;
    const durH = randomInt(1, 3, rng);
    const durM = difficulty === 1 ? 0 : randomInt(0, 3, rng) * 15;
    const totalMin = (startH * 60 + startM) + (durH * 60 + durM);
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    answerStr = formatTime12(endH, endM);
    prompt = `A train departs at ${formatTime12(startH, startM)} and the journey takes ${formatDuration(durH * 60 + durM)}. What time does it arrive?`;
    explanation = `${formatTime12(startH, startM)} + ${formatDuration(durH * 60 + durM)} = ${answerStr}`;
    tags.push('duration');
  } else if (difficulty === 3) {
    // Convert between 12h and 24h, or find duration between two times
    const type = rng() < 0.5 ? 'convert' : 'duration';
    if (type === 'convert') {
      const h = randomInt(0, 23, rng);
      const m = randomInt(0, 11, rng) * 5;
      const to24 = rng() < 0.5;
      if (to24) {
        answerStr = formatTime24(h, m);
        prompt = `Convert ${formatTime12(h, m)} to 24-hour time.`;
        explanation = `${formatTime12(h, m)} in 24-hour time is ${answerStr}`;
      } else {
        answerStr = formatTime12(h, m);
        prompt = `Convert ${formatTime24(h, m)} to 12-hour time.`;
        explanation = `${formatTime24(h, m)} in 12-hour time is ${answerStr}`;
      }
      tags.push('conversion');
    } else {
      const startH = randomInt(8, 14, rng);
      const startM = randomInt(0, 3, rng) * 15;
      const durMin = randomInt(2, 6, rng) * 15 + randomInt(0, 2, rng) * 30;
      const totalMin = startH * 60 + startM + durMin;
      const endH = Math.floor(totalMin / 60) % 24;
      const endM = totalMin % 60;
      answerStr = formatDuration(durMin);
      prompt = `A film starts at ${formatTime12(startH, startM)} and finishes at ${formatTime12(endH, endM)}. How long is the film?`;
      explanation = `From ${formatTime12(startH, startM)} to ${formatTime12(endH, endM)} = ${answerStr}`;
      tags.push('duration');
    }
  } else if (difficulty === 4) {
    // Subtract time or work with minutes past the hour
    const type = rng() < 0.5 ? 'subtract' : 'multi_step';
    if (type === 'subtract') {
      const endH = randomInt(12, 20, rng);
      const endM = randomInt(0, 11, rng) * 5;
      const durMin = randomInt(3, 8, rng) * 15 + randomInt(0, 2, rng) * 5;
      let startMin = endH * 60 + endM - durMin;
      if (startMin < 0) startMin += 24 * 60;
      const startH = Math.floor(startMin / 60) % 24;
      const startM = startMin % 60;
      answerStr = formatTime12(startH, startM);
      prompt = `A concert ends at ${formatTime12(endH, endM)} and lasted ${formatDuration(durMin)}. What time did it start?`;
      explanation = `${formatTime12(endH, endM)} - ${formatDuration(durMin)} = ${answerStr}`;
      tags.push('subtraction');
    } else {
      // Multi-step: two activities
      const startH = randomInt(8, 12, rng);
      const startM = randomInt(0, 3, rng) * 15;
      const dur1 = randomInt(2, 6, rng) * 15;
      const break_min = randomInt(1, 3, rng) * 15;
      const dur2 = randomInt(2, 6, rng) * 15;
      const totalDur = dur1 + break_min + dur2;
      const endMin = startH * 60 + startM + totalDur;
      const endH = Math.floor(endMin / 60) % 24;
      const endM = endMin % 60;
      answerStr = formatTime12(endH, endM);
      prompt = `A lesson starts at ${formatTime12(startH, startM)}, lasts ${formatDuration(dur1)}, then there is a ${formatDuration(break_min)} break, followed by another ${formatDuration(dur2)} lesson. What time does it all finish?`;
      explanation = `${formatDuration(dur1)} + ${formatDuration(break_min)} + ${formatDuration(dur2)} = ${formatDuration(totalDur)}. ${formatTime12(startH, startM)} + ${formatDuration(totalDur)} = ${answerStr}`;
      tags.push('multi_step');
    }
  } else {
    // Difficulty 5: complex duration, crossing midnight, or timetable problems
    const type = rng() < 0.5 ? 'cross_noon' : 'timetable';
    if (type === 'cross_noon') {
      const startH = randomInt(9, 11, rng);
      const startM = randomInt(1, 11, rng) * 5;
      const durMin = randomInt(10, 30, rng) * 10;
      const endTotalMin = startH * 60 + startM + durMin;
      const endH = Math.floor(endTotalMin / 60) % 24;
      const endM = endTotalMin % 60;
      answerStr = formatDuration(durMin);
      prompt = `A meeting runs from ${formatTime24(startH, startM)} to ${formatTime24(endH, endM)}. How long is the meeting?`;
      explanation = `From ${formatTime24(startH, startM)} to ${formatTime24(endH, endM)} = ${answerStr}`;
      tags.push('duration');
    } else {
      // How many minutes between two 24h times
      const h1 = randomInt(6, 12, rng);
      const m1 = randomInt(0, 11, rng) * 5;
      const h2 = randomInt(h1 + 1, Math.min(h1 + 8, 23), rng);
      const m2 = randomInt(0, 11, rng) * 5;
      const durMin = (h2 * 60 + m2) - (h1 * 60 + m1);
      answerStr = formatDuration(durMin);
      prompt = `A bus leaves at ${formatTime24(h1, m1)} and arrives at ${formatTime24(h2, m2)}. How long is the journey?`;
      explanation = `From ${formatTime24(h1, m1)} to ${formatTime24(h2, m2)} = ${answerStr}`;
      tags.push('duration');
    }
  }

  // Generate distractors
  const distractors = new Set<string>();
  // Parse answer to make plausible distractors
  const timeMatch12 = answerStr.match(/^(\d{1,2}):(\d{2}) (am|pm)$/);
  const timeMatch24 = answerStr.match(/^(\d{2}):(\d{2})$/);
  const durMatch = answerStr.match(/^(\d+) hour/);

  while (distractors.size < 3) {
    if (timeMatch12) {
      const h = parseInt(timeMatch12[1]);
      const m = parseInt(timeMatch12[2]);
      const period = timeMatch12[3];
      const mOff = randomInt(1, 4, rng) * 15;
      const hOff = randomInt(0, 1, rng);
      let newM = m + (rng() < 0.5 ? mOff : -mOff);
      let newH = h + (rng() < 0.5 ? hOff : -hOff);
      if (newM >= 60) { newM -= 60; newH += 1; }
      if (newM < 0) { newM += 60; newH -= 1; }
      if (newH > 12) newH -= 12;
      if (newH <= 0) newH += 12;
      const dStr = `${newH}:${String(newM).padStart(2, '0')} ${period}`;
      if (dStr !== answerStr) distractors.add(dStr);
    } else if (timeMatch24) {
      const h = parseInt(timeMatch24[1]);
      const m = parseInt(timeMatch24[2]);
      const mOff = randomInt(1, 4, rng) * 5;
      const hOff = randomInt(0, 1, rng);
      let newM = m + (rng() < 0.5 ? mOff : -mOff);
      let newH = h + (rng() < 0.5 ? hOff : -hOff);
      if (newM >= 60) { newM -= 60; newH += 1; }
      if (newM < 0) { newM += 60; newH -= 1; }
      if (newH >= 24) newH -= 24;
      if (newH < 0) newH += 24;
      const dStr = formatTime24(newH, newM);
      if (dStr !== answerStr) distractors.add(dStr);
    } else {
      // Duration string
      const durMinMatch = answerStr.match(/(\d+) minute/);
      const durHrMatch = answerStr.match(/(\d+) hour/);
      let totalM = 0;
      if (durHrMatch) totalM += parseInt(durHrMatch[1]) * 60;
      if (durMinMatch) totalM += parseInt(durMinMatch[1]);
      const offset = randomInt(1, 4, rng) * 15;
      const d = rng() < 0.5 ? totalM + offset : totalM - offset;
      if (d > 0) {
        const dStr = formatDuration(d);
        if (dStr !== answerStr) distractors.add(dStr);
      }
    }
  }

  const correctId = uniqueId();
  const options = shuffle(
    [answerStr, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: v })),
    rng
  );

  return {
    id: uniqueId(),
    subject: Subject.MATHS,
    topic: MathsTopic.TIME,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'time',
    generatorSeed: seed,
    tags,
  };
}
