<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { partnerService } from "~/components/api/admin/PartnerService";

const name = ref("");
const logoFile = ref<File | null>(null);
const router = useRouter();
const logoPreview = ref<string | null>(null);

const handleLogoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    Swal.fire(
      "Invalid File",
      "Only PNG, JPG, JPEG, and WEBP images are allowed.",
      "error"
    );
    return;
  }

  logoFile.value = file;
  logoPreview.value = URL.createObjectURL(file);
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const submitForm = async () => {
  if (!name.value) {
    Swal.fire("Error", "Partner name is required.", "error");
    return;
  }

  if (!logoFile.value) {
    Swal.fire("Error", "Please upload a logo image.", "error");
    return;
  }

  try {
    const base64Logo = await fileToBase64(logoFile.value);

    const payload = {
      name: name.value,
      logo: base64Logo,
    };

    const response = await partnerService.createPartner(payload);

    console.log(response, payload);

    if (response.status === 200) {
      Swal.fire("Success", "Partner created successfully!", "success");
      router.push("/admin/partners");
    }
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  }
};
</script>

<template>
  <NuxtLayout name="admin">
    <div class="max-w-xl p-6 mx-auto bg-white border rounded-lg shadow">
      <h2 class="mb-4 text-xl font-semibold">Create Partner</h2>

      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Partner Name</label>
          <Input v-model="name" class="w-full" />
        </div>

        <div>
          <label class="block mb-1 font-medium">Upload Logo (2MB) Limit</label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            @change="handleLogoUpload"
            class="block w-full border rounded p-2"
          />

          <!-- ✅ Preview section -->
          <div v-if="logoPreview" class="mt-2">
            <p class="text-sm text-gray-600 mb-1">Logo Preview:</p>
            <img
              :src="logoPreview"
              alt="Logo Preview"
              class="max-h-32 border rounded shadow"
            />
          </div>
        </div>

        <Button
          type="submit"
          class="w-full bg-black text-white hover:bg-gray-800"
        >
          Submit
        </Button>
      </form>
    </div>
  </NuxtLayout>
</template>
