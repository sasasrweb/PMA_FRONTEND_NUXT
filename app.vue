<template>
  <div>
    <NuxtPage :class="{ dark: darkModeStore.getDarkMode }" />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import { useDarkModeStore } from "@/store/darkMode";

const darkModeStore = useDarkModeStore();

definePageMeta({
  head: {
    link: [
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css",
      },
    ],
    script: [
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js",
      },
    ],
    meta: [
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
      },
    ],
  },
});

onMounted(() => {
  // Disable Ctrl+Scroll zoom
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  };

  // Disable Ctrl + +/-/=
  const handleKeydown = (e) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "+" || e.key === "-" || e.key === "=")
    ) {
      e.preventDefault();
    }
  };

  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("keydown", handleKeydown);

  // Save handlers to remove later
  window._zoomWheelHandler = handleWheel;
  window._zoomKeyHandler = handleKeydown;
});

onBeforeUnmount(() => {
  window.removeEventListener("wheel", window._zoomWheelHandler);
  window.removeEventListener("keydown", window._zoomKeyHandler);
});
</script>
