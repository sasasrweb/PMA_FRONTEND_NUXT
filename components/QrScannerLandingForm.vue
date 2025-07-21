<script setup lang="ts">
import AnimatedText from "@/components/AnimatedText.vue";
import { Button } from "@/components/ui/button";
import { delay, motion } from "motion-v";

const emit = defineEmits(["open-scanner"]);
</script>

<template>
  <div
    class="relative h-full md:h-screen bg-[url('/assets/banner/bg-banner.png')] bg-center bg-no-repeat bg-cover"
  >
    <motion.div
      class="absolute right-[5rem] top-[30rem] hidden md:block md:top-[28rem]"
      :initial="{ y: 0 }"
      :animate="{ y: [0, -20, 0] }"
      :transition="{
        duration: 4,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay: 0,
      }"
    >
      <div class="relative">
        <img
          src="/img/person_1.png"
          class="lg:w-[300px] md:w-[200px] z-10 relative"
        />
        <div>
          <motion.div
            class="absolute -bottom-[3rem] -right-[5rem]"
            :initial="{ y: 0 }"
            :animate="{ y: [0, -15, 0] }"
            :transition="{
              duration: 6,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
              delay: 0.7,
            }"
          >
            <img src="/img/person_1_1.png" class="lg:w-[300px] md:w-[200px]" />
          </motion.div>
        </div>
      </div>
    </motion.div>

    <motion.div
      class="absolute xl:right-[20rem] xl:top-[10rem] lg:right-0 md:right-12 md:top-40 lg:top-[10rem] hidden md:block"
      :initial="{ y: 0 }"
      :animate="{ y: [0, -15, 0] }"
      :transition="{
        duration: 5,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay: 0.17,
      }"
    >
      <div class="relative">
        <img
          src="/img/person_2.png"
          class="lg:w-[300px] md:w-[200px] z-10 relative"
        />
        <div>
          <motion.div
            class="absolute lg:top-[5rem] lg:right-[5rem] md:top-[5rem] md:right-[5rem]"
            :initial="{ y: 0 }"
            :animate="{ y: [0, -15, 0] }"
            :transition="{
              duration: 6,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
              delay: 0.9,
            }"
          >
            <img
              src="/img/person_2_1.png"
              class="lg:w-[200px] md:w-[120px] xl:w-[300px] w-full"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>

    <motion.div
      class="absolute lg:right-[25rem] lg:top-[20rem] md:right-[14rem] md:top-[20rem] hidden md:block xl:right-[45rem]"
      :initial="{ y: 0 }"
      :animate="{ y: [0, -25, 0] }"
      :transition="{
        duration: 3.5,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay: 1,
      }"
    >
      <img src="/img/qr_floating.png" class="lg:w-[264px] md:w-[150px]" />
    </motion.div>

    <div class="container relative w-full px-4 py-4 pt-40 mx-auto text-white">
      <div class="max-w-4xl space-y-8 md:space-y-12">
        <AnimatedText
          text="Quickly scan and"
          className="text-3xl sm:text-5xl md:text-6xl lg:text-[87px] font-bold text-white"
          :delay="0.3"
          :stagger="0.1"
          :duration="0.5"
          ease="easeOut"
          :initialOpacity="0"
          :finalOpacity="1"
          :initialY="50"
          :finalY="0"
          :initialScale="0.8"
          :finalScale="1.1"
          :initialRotate="-10"
          :finalRotate="0"
          once
          :viewportAmount="0.3"
        />

        <AnimatedText
          text="Confirm Your"
          className="text-3xl sm:text-5xl md:text-6xl lg:text-[87px] font-bold text-white"
          :delay="0.4"
          :stagger="0.15"
          :duration="0.4"
          ease="easeInOut"
          :initialOpacity="0"
          :finalOpacity="1"
          :initialY="0"
          :finalY="0"
          :initialScale="1"
          :finalScale="1"
          :initialRotate="0"
          :finalRotate="0"
          :initialX="-50"
          :finalX="0"
          once
          :viewportAmount="0.4"
        />

        <AnimatedText
          text="Certificates"
          className="text-3xl sm:text-5xl md:text-6xl lg:text-[87px] font-bold text-white"
          :delay="0.6"
          :stagger="0.12"
          :duration="0.5"
          ease="easeOut"
          :initialOpacity="0"
          :finalOpacity="1"
          :initialY="-60"
          :finalY="0"
          :initialScale="1.2"
          :finalScale="1"
          :initialRotate="0"
          :finalRotate="0"
          once
          :viewportAmount="0.4"
        />

        <AnimatedText
          text="Use this page to easily verify your Course Certificate/s issued by the Philippine MICE Academy. Thank you for enrolling in our Course. "
          mode="line"
          :delay="1"
          :stagger="0.3"
          :duration="0.5"
          className="text-base leading-relaxed max-w-3xl sm:w-1/2 xl:w-full md:w-3/4"
        />

        <!-- Button -->
        <div class="mt-6 sm:mt-8">
          <Button
            type="button"
            class="p-3 px-6 text-sm text-red-800 bg-white wave-btn sm:p-4 md:p-5 sm:px-10 sm:text-base hover:bg-gray-700 hover:text-white"
            @click="emit('open-scanner')"
          >
            Scan now
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
