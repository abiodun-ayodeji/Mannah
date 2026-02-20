import { useCallback, useRef } from 'react';
import { Howl } from 'howler';

// Web Audio API based sound effects (no external files needed)
const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

function playCorrectSound() {
  if (!audioContext) return;
  playTone(523.25, 0.1, 'sine', 0.3); // C5
  setTimeout(() => playTone(659.25, 0.1, 'sine', 0.3), 100); // E5
  setTimeout(() => playTone(783.99, 0.2, 'sine', 0.3), 200); // G5
}

function playWrongSound() {
  if (!audioContext) return;
  playTone(311.13, 0.15, 'sawtooth', 0.2); // Eb4
  setTimeout(() => playTone(233.08, 0.3, 'sawtooth', 0.2), 150); // Bb3
}

function playLevelUpSound() {
  if (!audioContext) return;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.25), i * 120);
  });
}

function playStreakSound() {
  if (!audioContext) return;
  playTone(440, 0.1, 'triangle', 0.2);
  setTimeout(() => playTone(554.37, 0.1, 'triangle', 0.2), 80);
  setTimeout(() => playTone(659.25, 0.15, 'triangle', 0.25), 160);
}

function playTickSound() {
  if (!audioContext) return;
  playTone(800, 0.05, 'sine', 0.1);
}

function playBossIntroSound() {
  if (!audioContext) return;
  const notes = [196, 233.08, 261.63, 311.13]; // G3, Bb3, C4, Eb4
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'sawtooth', 0.15), i * 200);
  });
}

function playAchievementSound() {
  if (!audioContext) return;
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5 through E6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, 'sine', 0.2), i * 80);
  });
}

const SOUNDS = {
  correct: playCorrectSound,
  wrong: playWrongSound,
  levelUp: playLevelUpSound,
  streak: playStreakSound,
  tick: playTickSound,
  bossIntro: playBossIntroSound,
  achievement: playAchievementSound,
} as const;

type SoundName = keyof typeof SOUNDS;

export function useSound() {
  const enabledRef = useRef(true);

  const play = useCallback((name: SoundName) => {
    if (!enabledRef.current) return;
    // Resume audio context if suspended (browsers require user gesture)
    if (audioContext?.state === 'suspended') {
      audioContext.resume();
    }
    SOUNDS[name]();
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  return { play, setEnabled };
}
