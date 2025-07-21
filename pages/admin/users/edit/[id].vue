<template>
  <NuxtLayout name="admin">
    <div class="flex items-center justify-center">
      <div
        class="border rounded-lg p-4 w-1/2 max-w-1/2 max-h-[80vh] overflow-auto"
      >
        <h2 class="mb-3 text-xl font-semibold">Edit User Account</h2>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="space-y-1">
            <Label for="name">Name</Label>
            <Input id="name" v-model="form.name" placeholder="Full name" />
            <p v-if="errors.name" class="text-sm text-red-600">
              {{ errors.name }}
            </p>
          </div>

          <div class="space-y-1">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="form.email"
              placeholder="Email address"
            />
            <p v-if="errors.email" class="text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>

          <div class="space-y-1">
            <Label for="status">Status</Label>
            <select
              id="status"
              v-model="form.status"
              class="w-full border rounded p-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <p v-if="errors.status" class="text-sm text-red-600">
              {{ errors.status }}
            </p>
          </div>

          <div class="space-y-1">
            <Label for="password">New Password</Label>
            <Input
              id="password"
              type="password"
              v-model="form.password"
              placeholder="Leave blank to keep current password"
            />
            <p v-if="errors.password" class="text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>

          <div class="space-y-1">
            <Label for="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              v-model="form.confirmPassword"
              placeholder="Re-enter new password"
            />
            <p v-if="passwordMismatch" class="text-sm text-red-600">
              Passwords do not match.
            </p>
          </div>

          <Button type="submit" class="w-full">Update Account</Button>
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { userService } from "~/components/api/admin/UserService";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const form = ref({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  status: "active",
});

const errors = ref({});

const userId = Number(route.params.id);

const passwordMismatch = computed(
  () =>
    form.value.password &&
    form.value.confirmPassword &&
    form.value.password !== form.value.confirmPassword
);

const fetchUser = async () => {
  try {
    const response = await userService.getUser(userId);
    if (response.status === 200 || response.data) {
      const user = response.data ?? response;
      form.value.name = user.name ?? "";
      form.value.email = user.email ?? "";
      form.value.status = user.status ?? "active";
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    Swal.fire("Error", "Failed to load user.", "error");
    router.push("/admin/users");
  }
};

const submitForm = async () => {
  errors.value = {};

  if (!form.value.name.trim() || !form.value.email.trim()) {
    Swal.fire(
      "Missing Fields",
      "Please fill out all required fields.",
      "warning"
    );
    return;
  }

  if (passwordMismatch.value) {
    Swal.fire("Error", "Passwords do not match.", "error");
    return;
  }

  const payload = {
    name: form.value.name,
    email: form.value.email,
    status: form.value.status,
    ...(form.value.password ? { password: form.value.password } : {}),
  };

  try {
    const response = await userService.updateUser(userId, payload);

    if (response.status === 200) {
      await Swal.fire(
        "Updated",
        "User account updated successfully.",
        "success"
      );
      router.push("/admin/users");
    }
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    } else {
      Swal.fire(
        "Error",
        "An error occurred while updating the account.",
        "error"
      );
    }
  }
};

onMounted(() => {
  fetchUser();
});
</script>
