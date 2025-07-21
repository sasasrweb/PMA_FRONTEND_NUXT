<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import ApplicationLogo from "@/components/ui/ApplicationLogo.vue";
import { Menu, X } from "lucide-vue-next";
import Loader from "@/components/form/Loader.vue";
import { motion } from "motion-v";

const isLoading = ref(true);
const logoPosition = ref("center"); // 'center' or 'top-right'

const route = useRoute();
const router = useRouter();

const currentPath = computed(() => route.path);
const hideHeaderBg = ref(false);
const mobileMenuOpen = ref(false);

const handleScroll = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  hideHeaderBg.value = scrollPercent >= 20;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const isAdminLogin = computed(
  () => route.path.split("?")[0] === "/admin/login"
);

onMounted(() => {
  const token = localStorage.getItem("_token");
  if (token && currentPath.value === "/admin/login") {
    router.push("/admin/dashboard");
  }

  window.addEventListener("scroll", handleScroll);

  // Determine if session already loaded
  const alreadyLoaded = sessionStorage.getItem("hasLoaded");
  const initialDelay = alreadyLoaded ? 500 : 2500;

  // Mark session as loaded
  sessionStorage.setItem("hasLoaded", "true");

  setTimeout(() => {
    logoPosition.value = "top-right";

    // After animation duration (~500ms more), remove loader
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }, initialDelay);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

const navigationLinks = [
  { title: "Home", path: "https://www.philmiceacademy.com/" },
  { title: "About Us", path: "https://www.philmiceacademy.com/about" },
  { title: "Courses", path: "https://www.philmiceacademy.com/learning" },
  { title: "Certificate Validation", path: "/certificate-validation" },
  {
    title: "News & Events",
    path: "https://www.philmiceacademy.com/news-and-events",
  },
  { title: "Contact Us", path: "https://www.philmiceacademy.com/contact-3" },
  { title: "Enrollment", path: "https://www.philmiceacademy.com/contact-8" },
];

const isActiveLink = (path: string) => {
  if (!path.startsWith("/")) return false;
  return route.path === path;
};
</script>

<template>
  <!-- Public Layout -->
  <div class="flex flex-col w-full min-h-screen bg-background text-foreground">
    <Loader class="absolute" />
    <header
      class="fixed top-0 left-0 w-full h-[11rem] sm:h-[16rem] md:h-[20rem] lg:h-[16rem] z-20 transition-all duration-500 ease-in-out"
    >
      <!-- Background Layer -->
      <div
        class="absolute inset-0 z-0 bg-bottom bg-no-repeat bg-cover translate-y-0 opacity-100 bg-[url(/assets/header/header_mobile.png)] lg:bg-[url(/assets/header/header.png)]"
      ></div>

      <!-- Foreground Content Layer -->
      <div
        class="relative z-20 w-full py-1 mx-auto transition-all translate-y-0 opacity-100 md:py-4 max-w-screen-2xl"
      >
        <div
          class="flex items-center justify-between md:justify-between lg:justify-center"
        >
          <NuxtLink
            to="https://www.philmiceacademy.com/"
            class="z-20 px-4 py-4"
          >
            <motion.div
              :initial="{ y: 0, scale: 1 }"
              :animate="{
                y: [0, -5, 0, 5, 0],
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }"
              :while-hover="{
                scale: [1, 1.1, 1],
                transition: {
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }"
              class="inline-block"
            >
              <img
                src="/img/main_logo.png"
                alt="Logo"
                class="w-32 h-auto md:w-64"
              />
            </motion.div>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav
            class="items-center justify-center hidden w-full space-x-4 text-xl lg:space-x-4 lg:text-[1rem] xl:text-xl xl:space-x-12 lg:block lg:flex"
          >
            <NuxtLink
              v-for="link in navigationLinks"
              :key="link.path"
              :to="link.path"
              @click="mobileMenuOpen = false"
              class="relative inline-block h-[1.2em] overflow-hidden"
            >
              <motion.div
                :initial="{ y: '0%' }"
                :whileHover="{ y: '-50%' }"
                :transition="{ duration: 0.4, ease: 'easeInOut' }"
              >
                <!-- Original text -->
                <div
                  :class="[
                    'block',
                    isActiveLink(link.path)
                      ? 'text-red-800 font-semibold'
                      : 'text-muted-foreground',
                  ]"
                >
                  {{ link.title }}
                </div>

                <!-- Reveal text -->
                <div class="block font-semibold text-red-800">
                  {{ link.title }}
                </div>
              </motion.div>
            </NuxtLink>
          </nav>

          <!-- Mobile Menu Toggle -->
          <div class="z-30 lg:hidden">
            <button @click="toggleMobileMenu" class="p-2 focus:outline-none">
              <component
                :is="mobileMenuOpen ? '' : Menu"
                class="w-6 text-gray-800 md:size-10"
              />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Sidebar Overlay -->
    <transition name="fade">
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-40 bg-black bg-opacity-50"
        @click.self="mobileMenuOpen = false"
      ></div>
    </transition>

    <!-- Background Blur Overlay -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-40 backdrop-blur-sm bg-black/40 md:hidden"
      @click.self="mobileMenuOpen = false"
    ></div>

    <!-- Sidebar Drawer -->
    <transition name="slide">
      <div
        v-if="mobileMenuOpen"
        class="fixed top-0 right-0 z-50 w-64 h-full bg-[#650b0f]/70 text-white shadow-lg backdrop-blur-sm md:w-[25rem] lg:hidden"
      >
        <nav class="flex flex-col px-2 py-6 space-y-4 text-base md:py-12">
          <div v-if="mobileMenuOpen" class="z-30 flex justify-end lg:hidden">
            <button @click="toggleMobileMenu" class="p-2 focus:outline-none">
              <Menu class="w-6 text-white md:size-10" />
            </button>
          </div>
          <div class="flex flex-col px-8 space-y-4 md:text-2xl md:space-y-8">
            <hr class="border-2" />
            <NuxtLink
              v-for="link in navigationLinks"
              :key="link.path"
              :to="link.path"
              @click="mobileMenuOpen = false"
              class="relative inline-block h-[1.2em] overflow-hidden"
            >
              <motion.div
                :initial="{ y: '0%' }"
                :whileHover="{ y: '-60%' }"
                :transition="{ duration: 0.4, ease: 'easeInOut' }"
              >
                <!-- Original text -->
                <div
                  :class="[
                    'block',
                    currentPath === link.path
                      ? 'text-red-800 font-semibold'
                      : 'text-muted-foreground',
                  ]"
                >
                  {{ link.title }}
                </div>

                <!-- Reveal text -->
                <div class="block font-semibold text-red-800">
                  {{ link.title }}
                </div>
              </motion.div>
            </NuxtLink>
          </div>
        </nav>
      </div>
    </transition>

    <!-- Main Content -->
    <main class="pt-20 md:pt-20">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1.5s linear infinite;
}
</style>
