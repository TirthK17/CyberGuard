import type { Variants, Transition } from "framer-motion";

/**
 * Shared Motion Design System for CyberGuard
 * Provides standardized spring presets, easings, and reusable variants.
 */

export const easeApple = [0.16, 1, 0.3, 1] as const;

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 18,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: easeApple },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeApple },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeApple },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.2 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.28, ease: easeApple },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.18 },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.32, ease: easeApple },
  },
  exit: {
    opacity: 0,
    x: 24,
    transition: { duration: 0.2 },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.32, ease: easeApple },
  },
  exit: {
    opacity: 0,
    x: -24,
    transition: { duration: 0.2 },
  },
};

export function staggerContainer(
  staggerChildren = 0.05,
  delayChildren = 0.05
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
}

export const cardHover = {
  whileHover: {
    y: -3,
    transition: { duration: 0.18, ease: "easeOut" },
  },
  whileTap: {
    scale: 0.985,
  },
};

export const pageTransition = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.2, ease: easeApple },
};
