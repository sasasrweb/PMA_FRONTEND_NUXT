<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signatoryService } from "@/components/api/admin/SignatoryService";
import Swal from "sweetalert2";
import SignatureCanvas from "@/components/SignatureCanvas.vue";

const name = ref("");
const position = ref("");
const signatureMode = ref<"manual" | "upload">("manual");

const signaturePadRef = ref<any>(null);
const uploadedSignature = ref<File | null>(null);
const router = useRouter();

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (
    input.files?.[0] &&
    ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
      input.files[0].type
    )
  ) {
    uploadedSignature.value = input.files[0];
  } else {
    Swal.fire(
      "Invalid File",
      "Only PNG, JPEG, JPG, or WEBP images are allowed.",
      "error"
    );
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

const submitForm = async () => {
  if (!name.value || !position.value) {
    Swal.fire("Error", "Name and position are required.", "error");
    return;
  }

  let signatureData: string | null = null;

  if (signatureMode.value === "manual") {
    if (!signaturePadRef.value || signaturePadRef.value.isEmpty()) {
      Swal.fire("Error", "Please draw a signature.", "error");
      return;
    }
    signatureData = signaturePadRef.value.toDataURL();
  } else if (signatureMode.value === "upload") {
    if (!uploadedSignature.value) {
      Swal.fire("Error", "Please upload a signature image.", "error");
      return;
    }
    signatureData = await fileToBase64(uploadedSignature.value);
  } else {
    Swal.fire("Error", "Invalid signature mode.", "error");
    return;
  }

  // Now you can use `signatureData`
  console.log("Signature Data:", signatureData);

  try {
    const response = await signatoryService.createSignatory({
      name: name.value,
      position: position.value,
      signature: signatureData,
    });

    if (response.status === 200) {
      Swal.fire("Success", "Signatory created successfully!", "success");
      router.push("/admin/signatories");
    }
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  }
};
</script>

<template>
  <NuxtLayout name="admin">
    <div class="max-w-xl p-6 mx-auto bg-white border rounded-lg shadow">
      <h2 class="mb-4 text-xl font-semibold">Create Signatory</h2>

      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Name</label>
          <Input v-model="name" class="w-full" />
        </div>

        <div>
          <label class="block mb-1 font-medium">Position</label>
          <Input v-model="position" class="w-full" />
        </div>

        <div>
          <label class="block mb-1 font-medium">Signature Mode</label>
          <div class="flex space-x-4">
            <label class="flex items-center space-x-2">
              <input
                type="radio"
                value="manual"
                v-model="signatureMode"
                class="accent-black"
              />
              <span>Draw</span>
            </label>
            <label class="flex items-center space-x-2">
              <input
                type="radio"
                value="upload"
                v-model="signatureMode"
                class="accent-black"
              />
              <span>Upload</span>
            </label>
          </div>
        </div>

        <div v-if="signatureMode === 'manual'">
          <label class="block mb-1 font-medium">Draw Signature</label>
          <SignatureCanvas ref="signaturePadRef" />
        </div>

        <div v-if="signatureMode === 'upload'">
          <label class="block mb-1 font-medium"
            >Upload Signature (2MB) Limit</label
          >
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            @change="handleFileUpload"
            class="block w-full border rounded p-2"
          />
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
