import { useEffect, useRef, useState } from "react";

type Options = {
  isActive: boolean;
};

export function useStreamingTimer({ isActive }: Options) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [finalSec, setFinalSec] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    startedAtRef.current = startedAt;
  }, [startedAt]);

  useEffect(() => {
    if (isActive) {
      if (startedAt === null) {
        const now = Date.now();
        setStartedAt(now);
        setElapsedSec(0);
      }
      if (timerRef.current == null) {
        timerRef.current = window.setInterval(() => {
          const sa = startedAtRef.current;
          if (sa != null) {
            const sec = Math.max(0, Math.floor((Date.now() - sa) / 1000));
            setElapsedSec(sec);
          }
        }, 1000);
      }
    } else {
      if (timerRef.current != null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (startedAt !== null && finalSec === null) {
        const sec = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
        setFinalSec(sec);
      }
    }

    return () => {
      if (timerRef.current != null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, startedAt, finalSec]);

  return {
    elapsedSec,
    finalSec: finalSec ?? elapsedSec,
    reset: () => {
      setStartedAt(null);
      setElapsedSec(0);
      setFinalSec(null);
    },
  };
}
