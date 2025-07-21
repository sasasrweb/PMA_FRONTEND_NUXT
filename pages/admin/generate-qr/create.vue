<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";
import { qrService } from "~/components/api/admin/QrService";

const router = useRouter();

const description = ref("");
const imageFile = ref<File | null>(null);
const isSubmitting = ref(false);
const qrCodeDataUrl = ref("");
const selectedFrame = ref("none");
const qrRef = ref<HTMLElement | null>(null);

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  imageFile.value = target.files?.[0] || null;
};

const generateQRCode = async () => {
  if (!description.value) {
    Swal.fire("Error", "Please enter a description", "error");
    return;
  }

  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(description.value);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "QR Code Generated!",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Failed to generate QR code", "error");
  }
};

const downloadQRCode = async () => {
  if (!qrRef.value) return;

  const canvas = await html2canvas(qrRef.value, {
    backgroundColor: null,
    useCORS: true,
  });

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "qr-code.png";
  link.click();
};

const printQRCode = async () => {
  if (!qrRef.value) return;

  const canvas = await html2canvas(qrRef.value, {
    backgroundColor: null,
    useCORS: true,
  });

  const imageData = canvas.toDataURL("image/png");
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head><title>Print QR</title></head>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">
          <img src="${imageData}" style="max-width:100%;max-height:100%;" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  }
};

const submitForm = async () => {
  if (!description.value || !qrCodeDataUrl.value || !qrRef.value) {
    Swal.fire("Error", "Please generate the QR code before saving.", "error");
    return;
  }

  isSubmitting.value = true;
  try {
    const canvas = await html2canvas(qrRef.value, {
      backgroundColor: null,
      useCORS: true,
    });

    const imageBase64 = canvas.toDataURL("image/png");

    const payload = {
      description: description.value,
      image: imageBase64,
      file_id: null,
    };

    const response = await qrService.createQR(payload);
    if (response.status === 201 || response.status === 200) {
      Swal.fire("Success", "QR Code saved successfully", "success");
      router.push("/admin/generate-qr");
    } else {
      Swal.fire("Error", "Failed to save QR code.", "error");
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Something went wrong during save", "error");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <NuxtLayout name="admin">
    <div class="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <!-- Left Column -->
      <div>
        <h1 class="mb-6 text-2xl font-bold">Generate QR Code</h1>

        <div class="space-y-4">
          <div>
            <Label for="description" class="block mb-1 text-lg"
              >Description</Label
            >
            <Textarea
              id="description"
              v-model="description"
              placeholder="Enter your link or text"
              class="w-full h-64 placeholder:text-lg"
            />
          </div>

          <div class="flex justify-end">
            <Button
              class="px-4 py-2 text-white bg-red-700 hover:bg-red-800 rounded-lg"
              @click="generateQRCode"
            >
              Generate QR Code
            </Button>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div
        class="flex flex-col items-center p-6 bg-white border rounded-lg shadow-sm"
      >
        <div
          class="relative p-4 border border-gray-200 min-h-[12rem] flex items-center justify-center"
        >
          <div
            ref="qrRef"
            class="relative w-48 h-48 flex items-center justify-center"
            :class="{
              'border-4 border-blue-500 rounded-lg': selectedFrame === 'frame1',
              'border-[6px] border-dashed border-green-500 p-1':
                selectedFrame === 'frame2',
              'rounded-full': selectedFrame === 'frame3',
            }"
            :style="
              selectedFrame === 'frame3'
                ? {
                    border: '4px dotted #ec4899',
                    animation: 'pulse-glow 2s infinite',
                    borderRadius: '9999px',
                  }
                : {}
            "
          >
            <img
              v-if="qrCodeDataUrl"
              :src="qrCodeDataUrl"
              alt="Generated QR Code"
              class="object-contain w-full h-full"
              crossorigin="anonymous"
            />
            <img
              v-if="qrCodeDataUrl"
              src="/img/qr-logo.png"
              alt="QR Logo"
              class="absolute w-12 h-12 rounded-full"
              crossorigin="anonymous"
            />
            <span v-else class="text-gray-400 text-sm"
              >QR Preview will appear here</span
            >
          </div>
        </div>

        <!-- Frame Options -->
        <div class="w-full mt-4">
          <div class="mb-2 text-sm font-bold text-center">FRAME</div>
          <div class="grid grid-cols-4 gap-2">
            <div
              class="p-1 border text-center cursor-pointer hover:ring-2 ring-blue-400"
              :class="{ 'ring-2 ring-blue-500': selectedFrame === 'none' }"
              @click="selectedFrame = 'none'"
            >
              ✖
            </div>
            <div
              class="p-1 border text-center cursor-pointer hover:ring-2 ring-blue-400"
              :class="{ 'ring-2 ring-blue-500': selectedFrame === 'frame1' }"
              @click="selectedFrame = 'frame1'"
            >
              FRAME 1
            </div>
            <div
              class="p-1 border text-center cursor-pointer hover:ring-2 ring-blue-400"
              :class="{ 'ring-2 ring-blue-500': selectedFrame === 'frame2' }"
              @click="selectedFrame = 'frame2'"
            >
              FRAME 2
            </div>
            <div
              class="p-1 border text-center cursor-pointer hover:ring-2 ring-blue-400"
              :class="{ 'ring-2 ring-blue-500': selectedFrame === 'frame3' }"
              @click="selectedFrame = 'frame3'"
            >
              FRAME 3
            </div>
          </div>
          <div class="py-5 pb-2 space-x-2 flex justify-center items-center">
            <Button
              class="px-6 py-2 text-white bg-green-700 hover:bg-green-800"
              @click="downloadQRCode"
              :disabled="!qrCodeDataUrl"
            >
              Download JPG
            </Button>

            <Button
              class="px-6 py-2 text-white bg-pink-600 hover:bg-pink-700"
              @click="printQRCode"
              :disabled="!qrCodeDataUrl"
            >
              Print QR
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex justify-start mt-10 gap-4 flex-wrap">
      <Button
        class="px-6 py-2 text-white bg-gray-800 hover:bg-gray-700"
        @click="submitForm"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "Saving..." : "Save QR Code" }}
      </Button>
    </div>
  </NuxtLayout>
</template>

<style scoped>
@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(236, 72, 153, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0);
  }
}
</style>
