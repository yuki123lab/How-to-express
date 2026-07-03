import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_SPEED = 1.2;
const MIN_SPEED = 0.3;
const MAX_SPEED = 5.0;
const SPEED_STEP = 0.3;
const WHEEL_SPEED_BOOST = 0.5;
const REVERSE_SPEED = -2.0;
const RECOVERY_DURATION = 500;

export function useScrollEngine(isActive: boolean) {
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const currentSpeedRef = useRef(DEFAULT_SPEED);
  const defaultSpeedRef = useRef(DEFAULT_SPEED);
  const pausedRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const recoveryTimerRef = useRef<number | null>(null);
  const recoveryStartTimeRef = useRef<number>(0);
  const recoveryFromSpeedRef = useRef<number>(DEFAULT_SPEED);
  const isRecoveringRef = useRef(false);
  const isActiveRef = useRef(isActive);

  // Keep ref in sync
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const updateSpeed = useCallback((newSpeed: number) => {
    const clamped = Math.max(MIN_SPEED, Math.min(MAX_SPEED, newSpeed));
    currentSpeedRef.current = clamped;
    setSpeed(parseFloat(clamped.toFixed(1)));
  }, []);

  const togglePause = useCallback(() => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }, []);

  /** Full reset - called when exiting play view */
  const reset = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (recoveryTimerRef.current) {
      clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }
    isRecoveringRef.current = false;
    currentSpeedRef.current = defaultSpeedRef.current;
    pausedRef.current = false;
    setPaused(false);
    setSpeed(defaultSpeedRef.current);
  }, []);

  /** Stop scroll loop without resetting position - called when pausing (e.g. voice mode) */
  const stop = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (recoveryTimerRef.current) {
      clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }
    isRecoveringRef.current = false;
  }, []);

  const startRecovery = useCallback(() => {
    isRecoveringRef.current = true;
    recoveryStartTimeRef.current = performance.now();
    recoveryFromSpeedRef.current = currentSpeedRef.current;
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    // Only handle wheel when scroll engine is active
    if (!isActiveRef.current) return;
    e.preventDefault();

    if (e.deltaY > 0) {
      currentSpeedRef.current = defaultSpeedRef.current + WHEEL_SPEED_BOOST;
    } else {
      currentSpeedRef.current = REVERSE_SPEED;
    }

    setSpeed(parseFloat(currentSpeedRef.current.toFixed(1)));

    if (recoveryTimerRef.current) {
      clearTimeout(recoveryTimerRef.current);
    }

    recoveryTimerRef.current = window.setTimeout(() => {
      startRecovery();
    }, 100);
  }, [startRecovery]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle keys when scroll engine is active
    if (!isActiveRef.current) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        updateSpeed(currentSpeedRef.current + SPEED_STEP);
        break;
      case 'ArrowDown':
        e.preventDefault();
        updateSpeed(currentSpeedRef.current - SPEED_STEP);
        break;
      case ' ':
        e.preventDefault();
        togglePause();
        break;
    }
  }, [updateSpeed, togglePause]);

  // Main scroll loop
  useEffect(() => {
    if (!isActive) {
      // Just stop the loop, don't reset position
      stop();
      return;
    }

    const scrollLoop = () => {
      if (!pausedRef.current) {
        if (isRecoveringRef.current) {
          const elapsed = performance.now() - recoveryStartTimeRef.current;
          const progress = Math.min(elapsed / RECOVERY_DURATION, 1);
          const from = recoveryFromSpeedRef.current;
          const to = defaultSpeedRef.current;
          currentSpeedRef.current = from + (to - from) * progress;

          if (progress >= 1) {
            isRecoveringRef.current = false;
            currentSpeedRef.current = defaultSpeedRef.current;
          }

          setSpeed(parseFloat(currentSpeedRef.current.toFixed(1)));
        }

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY < maxScroll) {
          window.scrollBy(0, currentSpeedRef.current);
        }
      }

      rafIdRef.current = requestAnimationFrame(scrollLoop);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    rafIdRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (recoveryTimerRef.current) {
        clearTimeout(recoveryTimerRef.current);
      }
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, handleWheel, handleKeyDown, stop]);

  const changeSpeed = useCallback((delta: number) => {
    updateSpeed(currentSpeedRef.current + delta);
  }, [updateSpeed]);

  return {
    paused,
    speed,
    togglePause,
    changeSpeed,
    reset,
    stop,
  };
}
