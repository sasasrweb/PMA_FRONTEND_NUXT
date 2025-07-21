<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import QrScannerLanding from "@/components/QrScannerLandingForm.vue";
import QrScanner from "@/components/QrScannerForm.vue";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { motion } from "motion-v";

useHead({
  title: "Certificate Validation",
  meta: [
    { name: "description", content: "Welcome to Certificate Validation Page" },
  ],
});

const checkDevice = () => {
  if (window.innerWidth < 768) {
    console.log("Mobile");
  } else {
    console.log("Desktop");
  }
};

onMounted(() => {
  checkDevice(); // Check on load
  window.addEventListener("resize", checkDevice); // Listen to resize

  console.log("hello");
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkDevice); // Clean up
});

const showScanner = ref(false);
</script>

<template>
  <NuxtLayout name="guest">
    <Transition name="fade-slide" mode="out-in">
      <div :key="showScanner">
        <!-- Scanner View -->
        <QrScanner v-if="showScanner" />

        <!-- Landing + Contact -->
        <div v-else>
          <QrScannerLanding @open-scanner="showScanner = true" />
        </div>
        <!-- Contact Section -->
      </div>
    </Transition>
    <div
      class="container flex-1 min-h-screen px-4 pt-[12rem] pb-10 mx-auto max-w-screen-2xl relative overflow-hidden"
    >
      <!-- Animated blur background circles
      <motion.div
        class="absolute w-96 h-96 rounded-full bg-red-400 blur-3xl opacity-30 top-[15rem] left-10"
        :while-hover="{ x: 30, y: -30, scale: 1.2 }"
        :transition="{ duration: 1.5, ease: 'easeInOut' }"
      />
      <motion.div
        class="absolute bg-blue-400 rounded-full w-72 h-72 blur-2xl opacity-20 bottom-10 right-10"
        :while-hover="{ x: -20, y: 20, scale: 1.1 }"
        :transition="{ duration: 1.5, ease: 'easeInOut' }"
      /> -->
      <div class="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
        <!-- Column 1 -->
        <div class="space-y-6">
          <div class="w-40 md:w-48 lg:w-60">
            <img src="/img/main_logo.png" class="w-full h-auto" />
          </div>
          <div class="flex flex-col gap-1 text-sm md:text-base">
            <div>Philippine Exhibitions and Trade</div>
            <div>Corporation - PETCO</div>
            <div>SF Libert Bldg, Armaiz Ave.</div>
            <div>Legaspi Village. Makati City</div>
          </div>
          <div class="text-sm md:text-base">philmiceacademy@gmail.com</div>
          <div class="flex flex-col gap-1 text-sm md:text-base">
            <div>FAX (632) 8 556 2723</div>
            <div>TEL (632) 8 832 5422</div>
            <div>TEL (632) 8 832 9303</div>
          </div>
        </div>

        <!-- Column 2 -->
        <div class="space-y-4 text-sm md:text-base">
          <div class="text-lg font-semibold">Join the Community</div>
          <a href="https://www.facebook.com/PhilMICEAcademy" class="underline"
            >Facebook</a
          >
        </div>

        <!-- Column 3 -->
        <div class="space-y-6">
          <div class="text-lg font-semibold">Contact</div>
          <form class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-1">
                <Label for="firstName">First Name</Label>
                <Input id="firstName" class="w-full input-bare" />
              </div>
              <div class="space-y-1">
                <Label for="lastName">Last Name</Label>
                <Input id="lastName" class="w-full input-bare" />
              </div>
            </div>

            <div class="space-y-1">
              <Label for="email">Email</Label>
              <Input id="email" type="email" class="w-full input-bare" />
            </div>

            <div class="space-y-1">
              <Label for="subject">Subject</Label>
              <Input id="subject" class="w-full input-bare" />
            </div>

            <div class="space-y-1">
              <Label for="message">Leave us a Message..</Label>
              <Textarea id="message" rows="4" class="w-full input-bare" />
            </div>

            <div>
              <Button
                type="submit"
                class="!border-none !bg-transparent !text-red-800 !shadow-none hover:border-b-[3px] focus:!border-b-[3px] hover:!pb-1 hover:!border-b-red-800"
              >
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.input-bare {
  @apply !shadow-none !rounded-none !border-0 !border-b !border-black focus:!outline-none focus:!border-b-[3px] focus:!ring-0 focus:!border-b-blue-900 hover:!border-b-[3px] hover:!pb-1;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
