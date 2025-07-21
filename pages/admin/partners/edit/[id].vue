<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { partnerService } from "@/components/api/admin/PartnerService";

const route = useRoute();
const router = useRouter();

const name = ref("");
const uploadedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const loading = ref(true);

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file) {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.type)) {
      uploadedFile.value = file;
      previewUrl.value = URL.createObjectURL(file);
    } else {
      Swal.fire(
        "Invalid File",
        "Only PNG, JPEG, JPG, or WebP images are allowed.",
        "error"
      );
      uploadedFile.value = null;
      previewUrl.value = null;
      input.value = ""; // Clear file input
    }
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const fetchPartner = async () => {
  try {
    const id = Number(route.params.id);
    const response = await partnerService.getPartner(id);

    if (response.status === 200) {
      const partner = response.data;

      // 🟢 Use `description` instead of `name`
      name.value = partner.description || "";

      // 🟢 Use `logo_image` if available
      previewUrl.value = partner.logo_image || null;
    }
  } catch (error) {
    console.error("Error loading partner:", error);
    Swal.fire("Error", "Failed to load partner.", "error");
  } finally {
    loading.value = false;
  }
};

const submitUpdate = async () => {
  const id = Number(route.params.id);
  if (!name.value) {
    Swal.fire("Error", "Partner name is required.", "error");
    return;
  }

  const payloadEntries: [string, any][] = [["name", name.value]];

  if (uploadedFile.value) {
    const logoBase64 = await fileToBase64(uploadedFile.value);
    payloadEntries.push(["logo", logoBase64]);
  }

  try {
    const payload = Object.fromEntries(payloadEntries);
    await partnerService.updatePartner(id, payload);
    Swal.fire("Updated", "Partner updated successfully!", "success");
    router.push("/admin/partners");
  } catch (error) {
    console.error("Update failed:", error);
    Swal.fire("Error", error.message, "error");
  }
};

onMounted(() => {
  fetchPartner();
});
</script>

<template>
  <NuxtLayout name="admin">
    <div class="max-w-xl p-6 mx-auto bg-white border rounded-lg shadow">
      <h2 class="mb-4 text-xl font-semibold">Edit Partner</h2>

      <div v-if="loading">Loading...</div>
      <form v-else @submit.prevent="submitUpdate" class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Partner Name</label>
          <Input v-model="name" class="w-full" />
        </div>

        <div>
          <label class="block mb-1 font-medium">Upload Logo (2MB) Limit</label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            @change="handleFileUpload"
            class="block w-full border rounded p-2"
          />

          <div v-if="previewUrl" class="mt-2">
            <p class="text-sm text-gray-600">Current Logo Preview:</p>
            <img
              :src="previewUrl"
              alt="Partner Logo"
              class="h-24 border rounded"
            />
          </div>
        </div>

        <Button
          type="submit"
          class="w-full bg-black text-white hover:bg-gray-800"
        >
          Update
        </Button>
      </form>
    </div>
  </NuxtLayout>
</template>
