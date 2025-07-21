<script setup lang="ts">
import { motion } from "motion-v";
import { watch, computed } from "vue";

const props = defineProps<{
  text: string;
  className?: string;
  mode?: "char" | "line"; // NEW: control splitting mode
  delay?: number;
  stagger?: number;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  finalOpacity?: number;
  initialY?: string | number;
  finalY?: string | number;
  initialScale?: number;
  finalScale?: number;
  initialRotate?: number;
  finalRotate?: number;
  once?: boolean;
  viewportAmount?: number;
}>();

// Debug watcher (optional)
watch(
  () => props.text,
  (newVal, oldVal) => {
    console.log("Text changed:", oldVal, "→", newVal);
  }
);

// Split text based on mode
const textParts = computed(() => {
  if (props.mode === "line") {
    return props.text.split("\n");
  } else {
    return props.text.split("");
  }
});
</script>

<template>
  <motion.div
    :variants="{
      hidden: { opacity: props.initialOpacity ?? 1 },
      visible: {
        opacity: props.finalOpacity ?? 1,
        transition: {
          delay: props.delay ?? 0,
          staggerChildren: props.stagger ?? 0.05,
        },
      },
    }"
    initial="hidden"
    while-in-view="visible"
    :viewport="{
      once: props.once ?? false,
      amount: props.viewportAmount ?? 0.2,
    }"
    :class="[
      'flex flex-wrap',
      props.mode === 'line' ? 'flex-col space-y-2' : '',
      props.className,
    ]"
  >
    <motion.span
      v-for="(part, index) in textParts"
      :key="index"
      :variants="{
        hidden: {
          y: props.initialY ?? '100%',
          opacity: props.initialOpacity ?? 0,
          scale: props.initialScale ?? 1,
          rotate: props.initialRotate ?? 0,
        },
        visible: {
          y: props.finalY ?? '0%',
          opacity: props.finalOpacity ?? 1,
          scale: props.finalScale ?? 1,
          rotate: props.finalRotate ?? 0,
          transition: {
            duration: props.duration ?? 0.3,
            ease: props.ease ?? 'easeOut',
          },
        },
      }"
      class="inline-block"
    >
      <template v-if="part === ' '"> &nbsp; </template>
      <template v-else>
        {{ part }}
      </template>
    </motion.span>
  </motion.div>
</template>
