<template>
  <header
    class="flex items-center justify-between w-full h-16 px-6 bg-white border-b"
  >
    <div class="text-xl font-semibold">MyApp</div>
    <nav class="flex items-center gap-4 text-sm text-muted-foreground">
      <NuxtLink to="/" class="hover:text-primary">Home</NuxtLink>
      <NuxtLink to="/about" class="hover:text-primary">About</NuxtLink>
      <NuxtLink to="/contact" class="hover:text-primary">Contact</NuxtLink>
    </nav>
  </header>
</template>
