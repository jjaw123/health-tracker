"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({ value, duration = 500, className }: Props) {
  const [display, setDisplay] = useState(value);
  const displayStartRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = displayStartRef.current;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        displayStartRef.current = value;
      }
    };

    const id = requestAnimationFrame(tick);
    frameRef.current = id;
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      displayStartRef.current = value;
    };
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}
