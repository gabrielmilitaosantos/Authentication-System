import { useCallback, useEffect, useRef, useState } from "react";
import { calculateTimeLeft } from "../util/timeFormat";

interface TimerState {
  timeLeft: number;
  isExpired: boolean;
  expirationTime: number | null;
}

export function useTimer() {
  const [timer, setTimer] = useState<TimerState>({
    timeLeft: 0,
    isExpired: false,
    expirationTime: null,
  });

  const timerRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimer({
      timeLeft: 0,
      isExpired: true,
      expirationTime: null,
    });
  }, []);

  const updateTimer = useCallback((expirationTime: number) => {
    const timeLeft = calculateTimeLeft(expirationTime);
    setTimer({
      timeLeft,
      isExpired: timeLeft <= 0,
      expirationTime,
    });
  }, []);

  useEffect(() => {
    if (!timer.expirationTime || timer.isExpired) return;

    timerRef.current = window.setInterval(() => {
      const timeLeft = calculateTimeLeft(timer.expirationTime!);

      if (timeLeft <= 0) {
        setTimer((prev) => ({ ...prev, timeLeft: 0, isExpired: true }));
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        setTimer((prev) => ({ ...prev, timeLeft }));
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timer.expirationTime, timer.isExpired]);

  return {
    timer,
    stopTimer,
    updateTimer,
  };
}
