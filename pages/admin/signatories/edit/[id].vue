<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SignatureCanvas from "@/components/SignatureCanvas.vue";
import { signatoryService } from "~/components/api/admin/SignatoryService";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

const route = useRoute();
const router = useRouter();

const name = ref("");
const position = ref("");
const signaturePadRef = ref<any>(null);
const uploadedFile = ref<File | null>(null);
const signatureMode = ref<"manual" | "upload">("manual");

const previousSignatureUrl = ref<string | null>(null);
const loading = ref(true);

const fetchSignatory = async () => {
  try {
    const id = Number(route.params.id);
    const response = await signatoryService.getSignatory(id);

    if (response.status === 200) {
      const signatory = response.data;
      name.value = signatory.description || "";
      position.value = signatory.position || "";

      if (signatory.signature_image) {
        previousSignatureUrl.value = signatory.signature_image;
      }
    }
  } catch (error) {
    console.error("Error fetching signatory:", error);
    Swal.fire("Error", "Could not load signatory.", "error");
  } finally {
    loading.value = false;
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target && target.files && target.files.length > 0) {
    uploadedFile.value = target.files[0];
  } else {
    uploadedFile.value = null;
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

const submitUpdate = async () => {
  const id = Number(route.params.id);

  if (!name.value || !position.value) {
    Swal.fire("Error", "Name and position are required.", "error");
    return;
  }

  const payloadEntries = [
    ["name", name.value],
    ["position", position.value],
  ];

  try {
    if (signatureMode.value === "manual" && !signaturePadRef.value?.isEmpty()) {
      const signatureData = signaturePadRef.value.toDataURL();
      payloadEntries.push(["signature", signatureData]);
    }

    if (signatureMode.value === "upload" && uploadedFile.value) {
      const signatureData = await fileToBase64(uploadedFile.value);
      payloadEntries.push(["signature", signatureData]);
    }

    const payload = Object.fromEntries(payloadEntries);
    await signatoryService.updateSignatory(id, payload);

    Swal.fire("Updated", "Signatory updated successfully!", "success");
    router.push("/admin/signatories");
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  }
};

onMounted(() => {
  fetchSignatory();
});
</script>

<template>
  <NuxtLayout name="admin">
    <div class="max-w-xl p-6 mx-auto bg-white border rounded-lg shadow">
      <h2 class="mb-4 text-xl font-semibold">Edit Signatory</h2>

      <div v-if="loading">Loading...</div>
      <form v-else @submit.prevent="submitUpdate" class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Name</label>
          <Input v-model="name" class="w-full" />
        </div>

        <div>
          <label class="block mb-1 font-medium">Position</label>
          <Input v-model="position" class="w-full" />
        </div>

        <div>
          <label class="block mb-1 font-medium">Signature</label>

          <div class="flex items-center gap-4 mb-2">
            <label>
              <input
                type="radio"
                value="manual"
                v-model="signatureMode"
                class="mr-1"
              />
              Manual
            </label>
            <label>
              <input
                type="radio"
                value="upload"
                v-model="signatureMode"
                class="mr-1"
              />
              Upload
            </label>
          </div>

          <div v-if="previousSignatureUrl" class="mb-2">
            <p class="text-sm text-gray-600 mb-1">Current Signature:</p>
            <Dialog>
              <DialogTrigger as-child>
                <img
                  :src="previousSignatureUrl"
                  alt="Current Signature"
                  class="h-24 border rounded cursor-pointer hover:opacity-75 transition"
                />
              </DialogTrigger>
              <DialogContent class="w-full max-w-xl p-4 text-center">
                <h3 class="mb-4 text-lg font-semibold">
                  Current Signature Preview
                </h3>
                <img
                  :src="previousSignatureUrl"
                  alt="Current Signature"
                  class="max-h-[400px] mx-auto rounded border"
                />
              </DialogContent>
            </Dialog>
          </div>

          <div v-if="signatureMode === 'manual'">
            <SignatureCanvas ref="signaturePadRef" />
          </div>

          <div v-else>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              @change="handleFileUpload"
              class="mt-2"
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
