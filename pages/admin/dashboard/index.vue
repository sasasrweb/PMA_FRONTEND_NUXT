<script setup lang="ts">
import { Input } from "@/components/ui/input";

useHead({
  title: "CMS Dashboard",
  meta: [
    { name: "CMS Dashboard Page", content: "Welcome to CMS Dashboard Page" },
  ],
});
</script>

<template>
  <NuxtLayout name="admin"> Welcome to CMS! </NuxtLayout>
</template>
