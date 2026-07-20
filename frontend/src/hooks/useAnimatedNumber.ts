import { animate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

export function useAnimatedNumber(target: number, duration = 1): number {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionValue, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => setDisplay(value),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
}
