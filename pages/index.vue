<script setup lang="ts">
import { motion } from "motion-v";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

useHead({
  title: 'Home',
  meta: [
    {name: 'description', content: 'Welcome to Home Page'}
  ]
});

onMounted(() => {
  router.push("/certificate-validation");
});
</script>
<template>
  <NuxtLayout name="guest"
    ><div
      class="relative h-screen bg-[url('/assets/banner/bg-white-banner.png')] bg-center bg-no-repeat bg-cover"
    ></div>
  ></NuxtLayout>
</template>
