<script setup lang="ts">
import { motion } from "motion-v";

const props = defineProps<{
  src: string;
  alt?: string;
  className?: string;

  // Float config
  floatY?: boolean;          // Enable Y float (default true)
  floatX?: boolean;          // Enable X float (default false)
  floatDistance?: number;    // Distance of float (default 10)

  // Animation config
  duration?: number;         // Full cycle duration (default 4)
  ease?: string;             // Easing (default 'easeInOut')
  repeatType?: "loop" | "reverse" | "mirror"; // Repeat mode

  // Effects
  scaleEffect?: boolean;     // Enable scale wobble
  rotateEffect?: boolean;    // Enable small rotate
  opacityEffect?: boolean;   // Enable opacity pulse
  blurEffect?: boolean;      // Enable blur pulse
}>();

const distance = props.floatDistance ?? 10;

// Build dynamic animations
const animY = props.floatY !== false
  ? [0, -distance, 0, distance, 0]
  : [0];

const animX = props.floatX
  ? [0, -distance, 0, distance, 0]
  : [0];

const animScale = props.scaleEffect
  ? [1, 1.05, 1, 0.95, 1]
  : [1];

const animRotate = props.rotateEffect
  ? [0, 2, 0, -2, 0]
  : [0];

const animOpacity = props.opacityEffect
  ? [1, 0.8, 1, 0.8, 1]
  : [1];

const animFilter = props.blurEffect
  ? ["blur(0px)", "blur(2px)", "blur(0px)", "blur(2px)", "blur(0px)"]
  : ["blur(0px)"];
</script>

<template>
  <motion.img
    :src="src"
    :alt="alt ?? 'Floating image'"
    :animate="{
      y: animY,
      x: animX,
      scale: animScale,
      rotate: animRotate,
      opacity: animOpacity,
      filter: animFilter,
    }"
    :transition="{
      duration: props.duration ?? 4,
      ease: props.ease ?? 'easeInOut',
      repeat: Infinity,
      repeatType: props.repeatType ?? 'loop',
    }"
    :class="className"
    style="transform-style: preserve-3d;"
  />
</template>
