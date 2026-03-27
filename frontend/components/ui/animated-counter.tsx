'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ 
  value, 
  decimals = 0, 
  duration = 1,
  className = '' 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  const spring = useSpring(prevValue.current, {
    stiffness: 75,
    damping: 15,
    duration: duration * 1000,
  });

  useEffect(() => {
    spring.set(value);
    prevValue.current = value;
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [spring]);

  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {displayValue.toFixed(decimals)}
    </motion.span>
  );
}
