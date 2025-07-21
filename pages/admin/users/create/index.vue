<template>
  <NuxtLayout name="admin">
    <div class="flex items-center justify-center">
      <div
        class="border rounded-lg p-4 w-1/2 max-w-1/2 max-h-[80vh] overflow-auto"
      >
        <h2 class="mb-3 text-xl font-semibold">Create User Account</h2>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="space-y-1">
            <Label for="name">Name</Label>
            <Input id="name" v-model="form.name" placeholder="Full name" />
          </div>

          <div class="space-y-1">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="form.email"
              placeholder="Email address"
            />
          </div>

          <div class="space-y-1">
            <Label for="password">Password</Label>
            <Input
              id="password"
              type="password"
              v-model="form.password"
              placeholder="Password"
            />
          </div>

          <div class="space-y-1">
            <Label for="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              v-model="form.confirmPassword"
              placeholder="Re-enter password"
            />
            <p v-if="passwordMismatch" class="text-sm text-red-600">
              Passwords do not match.
            </p>
          </div>

          <Button type="submit" class="w-full">Create Account</Button>
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed } from "vue";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { userService } from "~/components/api/admin/UserService";
import { useRouter } from "vue-router";

const router = useRouter();

const form = ref({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const passwordMismatch = computed(() => {
  return (
    form.value.password &&
    form.value.confirmPassword &&
    form.value.password !== form.value.confirmPassword
  );
});

const hasEmptyFields = computed(() => {
  return (
    !form.value.name.trim() ||
    !form.value.email.trim() ||
    !form.value.password.trim() ||
    !form.value.confirmPassword.trim()
  );
});

const submitForm = async () => {
  if (hasEmptyFields.value) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please fill out all required fields.",
    });
    return;
  }

  if (passwordMismatch.value) {
    Swal.fire({
      icon: "error",
      title: "Password Mismatch",
      text: "Passwords do not match. Please try again.",
    });
    return;
  }

  try {
    const payload = {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
    };

    const response = await userService.createUser(payload);

    if (response.status === 200) {
      await Swal.fire({
        icon: "success",
        title: "Account Created",
        text: `User account for ${form.value.name} has been created.`,
      });

      form.value = {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      };

      router.push("/admin/users");
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while creating the account.",
    });
  }
};
</script>
