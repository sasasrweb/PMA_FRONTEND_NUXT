<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { Menu } from "lucide-vue-next";

const isLoading = ref(true);
const logoPosition = ref("center"); // 'center' or 'top-right'
const mobileMenuOpen = ref(false);

const route = useRoute();
const router = useRouter();

const currentPath = computed(() => route.path);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

onMounted(() => {
  const token = localStorage.getItem("_token");
  if (token && currentPath.value === "/admin/login") {
    router.push("/admin/dashboard");
  }

  const alreadyLoaded = sessionStorage.getItem("hasLoaded");
  const initialDelay = alreadyLoaded ? 200 : 2500;

  sessionStorage.setItem("hasLoaded", "true");

  setTimeout(() => {
    logoPosition.value = "top-right";

    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }, initialDelay);
});

const navigationLinks = [
  { title: "Home", path: "/" },
  { title: "About", path: "/about" },
  { title: "Certificate Validation", path: "/certificate-validation" },
  { title: "Testimonials", path: "/testimonials" },
  { title: "Contact Us", path: "/contact-us" },
];
</script>

<template>
  <div class="flex flex-col w-full min-h-screen bg-background text-foreground">
    <!-- Loader -->
    <transition name="fade">
      <div
        v-if="isLoading"
        class="fixed inset-0 z-50 flex items-center justify-center bg-white"
      >
        <div
          :class="[
            'fixed z-50',
            logoPosition === 'center'
              ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
              : 'top-4 left-4 transform scale-75',
          ]"
          :style="{
            opacity: logoPosition === 'center' ? 1 : 0.05,
            transition: 'all 0.5s ease',
          }"
        >
          <div
            class="w-24 h-24 md:w-24 md:h-24 absolute top-[30%] left-[20%] md:top-[30%] md:left-[20%] rounded-full bg-cover bg-center"
            style="background-image: url('/img/qr-logo.png')"
          ></div>

          <div
            class="mt-4 w-40 h-40 border-4 border-gray-300 border-t-red-800 rounded-full animate-spin"
          ></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
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
