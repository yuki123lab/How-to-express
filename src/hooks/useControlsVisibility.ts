import { useCallback, useEffect, useRef, useState } from 'react';

const HIDE_DELAY = 2000;

export function useControlsVisibility(isActive: boolean) {
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<number | null>(null);

  const showControls = useCallback(() => {
    setVisible(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, HIDE_DELAY);
  }, []);

  useEffect(() => {
    if (!isActive) {
      setVisible(true);
      return;
    }

    showControls();

    const handleMouseMove = () => {
      showControls();
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, showControls]);

  return visible;
}
