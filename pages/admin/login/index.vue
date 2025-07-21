<script setup lang="ts">
import { ref } from "vue";
import Input from "@/components/ui/input/Input.vue";
import Button from "@/components/ui/button/Button.vue";
import { authService } from "~/components/api/AuthService";
import Swal from "sweetalert2";

useHead({
  title: "PMA CMS",
  meta: [
    { name: "description", content: "PMA CMS - Philippine Mice Academy Certificate management (CRUD)" },
  ],
});

// Reactive form object
const form = ref({
  email: "",
  password: "",
});

// Handle login
const handleLogin = async () => {
  try {
    if (!form.value.email || !form.value.password) {
      Swal.fire({
        icon: "error",
        title: "Missing Credentials",
        text: "Please enter both email and password.",
      });
      return;
    }

    const data = {
      email: form.value.email,
      password: form.value.password,
    };

    const origin = await authService.login(data);
    const response = origin.data;

    if (response.status === 200) {
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        timer: 1500,
        showConfirmButton: false,
      });

      // Safe localStorage access
      if (typeof window !== "undefined") {
        localStorage.setItem("email", form.value.email);
        if (response.token) {
          localStorage.setItem("_token", response.token);
        }
      }

      setTimeout(() => {
        navigateTo("/admin/dashboard");
      }, 1500);
    } else {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: response.message || "Invalid email or password.",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Login Error",
      text: "An unexpected error occurred. Please try again.",
    });
    console.error("Login error:", error);
  }
};
</script>
<template>
  <NuxtLayout name="login">
    <form
      @submit.prevent="handleLogin"
      class="flex flex-col max-w-sm gap-4 p-4 mx-auto mt-16 bg-white shadow-md rounded-xl"
    >
      <h1 class="text-2xl font-bold text-center">CMS</h1>
      <Input v-model="form.email" placeholder="Email" type="email" />
      <Input v-model="form.password" placeholder="Password" type="password" />
      <Button class="w-full" type="submit">Login</Button>
    </form>
  </NuxtLayout>
</template>
