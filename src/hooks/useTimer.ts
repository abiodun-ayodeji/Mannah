import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(totalSeconds: number | null) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds ?? 0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const start = useCallback(() => {
    setTimeLeft(totalSeconds ?? 0);
    startTimeRef.current = Date.now();
    setIsRunning(true);
  }, [totalSeconds]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const getElapsed = useCallback(() => {
    return (Date.now() - startTimeRef.current) / 1000;
  }, []);

  useEffect(() => {
    if (!isRunning || totalSeconds == null) return;

    intervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, totalSeconds]);

  return { timeLeft, isRunning, start, stop, getElapsed, totalTime: totalSeconds ?? 0 };
}
