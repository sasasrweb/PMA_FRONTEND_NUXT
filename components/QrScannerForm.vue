<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import Swal from "sweetalert2";

import { certificateService } from "@/components/api/admin/certificateService";
import Certificate from "@/components/Certificate.vue";
import QrScannerFormResult from "@/components/QrScannerFormResult.vue";
import { Button } from "@/components/ui/button";
import { CloudUpload, Info } from "lucide-vue-next";
import Loader from "@/components/form/Loader.vue";

useHead({
  script: [
    {
      src: "https://www.google.com/recaptcha/api.js",
      async: true,
      defer: true,
    },
  ],
});

const qrCode = ref("");
const scannedData = ref(null);
const errorMessage = ref("");
const showCertificate = ref(false);
const showResult = ref(false);
const requireFullName = ref(false);
const manualFullName = ref("");
const requiredFullNameType = ref("");

const recaptchaToken = ref("");

let qrReader: Html5Qrcode;
const isScanning = ref(false);

const fileName = ref("");
const filePreviewUrl = ref("");
const manualSerial = ref("");
const fileObject = ref<File | null>(null);

const isBusy = ref(false);

const CAMERA_CHOICE_KEY = "selectedCameraId";
const CAMERA_CHOICE_TIME_KEY = "selectedCameraTime";
const CAMERA_CHOICE_DURATION_MS = 15 * 60 * 1000; // 1 hour

const recaptchaWidgetId = ref<number | null>(null);
const recaptchaEl = ref<HTMLElement | null>(null);

const renderRecaptcha = () => {
  if ((window as any).grecaptcha && recaptchaEl.value) {
    // Destroy existing instance if any
    if (recaptchaWidgetId.value !== null) {
      try {
        (window as any).grecaptcha.reset(recaptchaWidgetId.value);
      } catch (err) {
        console.warn("Failed to reset reCAPTCHA", err);
      }
    }

    // Render new widget
    recaptchaWidgetId.value = (window as any).grecaptcha.render(recaptchaEl.value, {
      sitekey: "6LfHH3wrAAAAAOgkS5OkPsnpVqVfQsjUqE-_yeXa",
      callback: handleRecaptchaVerified,
    });
  }
};

// ✅ Named handler function
function handleRecaptchaVerified(token: string) {
  recaptchaToken.value = token;
}

// Assign it to the global callback expected by Google reCAPTCHA
(window as any).onCaptchaVerified = handleRecaptchaVerified;

watch(manualSerial, (value) => {
  requireFullName.value = value.trim().length >= 8;
});

const showError = (msg: string) => {
  errorMessage.value = msg;
  Swal.fire({
    icon: "error",
    title: "Error",
    text: msg,
  });
};

const fetchCertificate = async (code: string) => {
  isBusy.value = true;
  try {
    const payload = {
      recaptcha: recaptchaToken.value,
      checkFullName: manualFullName.value ?? "",
      checkRequiredFullNametype: requiredFullNameType.value ?? "none",
    };

    const response = await certificateService.scanCertificate(code, payload);
    if (response.status === 200) {
      scannedData.value = response.data;
      console.log(scannedData.value);

      if (Array.isArray(scannedData.value)) {
        scannedData.value = scannedData.value.map((cert) => {
          const channel = cert.certificate_channels?.[0] || {};

          const partners = (channel.partners || []).map((p) => ({
            id: p.id,
            description: p.description,
            logo_base64: p.logo_base64 || "",
          }));

          const signatories = (channel.signatories || []).map((s) => ({
            id: s.id,
            description: s.description,
            position: s.position,
            signature_base64: s.signature_base64 || "",
          }));

          return {
            id: cert.id,
            usn: cert.student?.usn || "",
            studentName: cert.student?.firstname || "",
            studentCourse: channel.course_name || "",
            start: cert.start || "",
            end: cert.expiry || "",
            status: cert.status,
            qr_code: cert.qr_code,
            fontStyle: cert.font_style || "great-vibes-regular",
            certificateType: cert.certificate_type || "participation",
            givenDate: cert.given_date,
            recaptcha: recaptchaToken.value || "",
            student: {
              firstname: cert.student?.firstname || "",
              course: channel.course_name || "",
            },
            certificate_channels: [
              {
                ...channel,
                partners,
                signatories,
              },
            ],
          };
        });
      } else if (typeof scannedData.value === "object") {
        const cert = scannedData.value;
        const channel = cert.certificate_channels?.[0] || {};

        const partners = (channel.partners || []).map((p) => ({
          id: p.id,
          name: p.description,
          logo: p.logo_base64 || "",
        }));

        const signatories = (channel.signatories || []).map((s) => ({
          id: s.id,
          name: s.description,
          position: s.position,
          signature: s.signature_base64 || "",
        }));

        console.log("verify data channel", channel);

        scannedData.value = {
          id: cert.id,
          usn: cert.student?.usn || "",
          studentName: channel.student?.firstname || "",
          studentCourse: channel.course_name || "",
          end: cert.expiry || "",
          start: cert.start || "",
          status: cert.status,
          qr_code: cert.qr_code,
          training_date: cert.training_date || "",
          location: cert.location || "",
          fontStyle: cert.font_style || "great-vibes-regular",
          certificateType: cert.certificate_type || "participation",
          givenDate: cert.given_date,
          recaptcha: recaptchaToken.value || "",
          certificate_channels: [
            {
              ...channel,
              student: {
                firstname: channel.student?.firstname || "",
                course: channel.course_name || "",
              },
              partners,
              signatories,
            },
          ],
        };
      }

      console.log("final data", scannedData.value);
      showCertificate.value = true;
      showResult.value = false;
      stopScanner(); // Stop camera while viewing certificate
    } else {
      showError(response.data.message || "Certificate not found.");
    }
  } catch (err: any) {
    showError(err?.message || "Server error.");
    console.error(err);
  } finally {
    isBusy.value = false;
  }
};

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    await stopScanner();
    const file = target.files[0];
    fileName.value = file.name;
    filePreviewUrl.value = URL.createObjectURL(file);
    fileObject.value = file;
    errorMessage.value = "";
  }
};

const onSubmitFileScan = async () => {
  if (!fileObject.value) {
    showError("Please select an image first.");
    return; // 🚀 Return early, no need to go further
  }

  if (!recaptchaToken.value) {
    Swal.fire({
      icon: "error",
      title: "CAPTCHA Required",
      text: "Please complete the CAPTCHA.",
    });
    isBusy.value = false;
    return;
  }

  try {
    await stopScanner(); // ✅ stop scanner BEFORE processing image

    const img = new Image();
    img.src = filePreviewUrl.value!;

    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        showError("Could not create canvas context.");
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qrResult = jsQR(imageData.data, imageData.width, imageData.height);
      if (qrResult) {
        qrCode.value = qrResult.data;
        await stopScanner(); // Stop again just in case
        await fetchCertificate(qrResult.data);

        (window as any).grecaptcha?.reset();
        recaptchaToken.value = "";
      } else {
        showError("No QR code detected in the image.");
      }
    };

    img.onerror = () => {
      showError("Failed to load the image.");
    };
  } catch (err) {
    showError("An error occurred while scanning the image.");
    console.error(err);
  }
};

const onSubmitSerial = async () => {
  isBusy.value = true;

  if (!recaptchaToken.value) {
    Swal.fire({
      icon: "error",
      title: "CAPTCHA Required",
      text: "Please complete the CAPTCHA.",
    });
    isBusy.value = false;
    return;
  }

  if (!manualSerial.value) {
    Swal.fire({
      icon: "warning",
      title: "Input Required",
      text: "Please enter a serial number.",
    });
    return;
  }

  if (requireFullName.value && !manualFullName.value) {
    Swal.fire({
      icon: "warning",
      title: "Input Required",
      text: "Please enter your full name.",
    });
    isBusy.value = false;
    return;
  }

  requiredFullNameType.value = "input";

  await stopScanner();
  await fetchCertificate(manualSerial.value);
  (window as any).grecaptcha?.reset();
  recaptchaToken.value = "";
  manualFullName.value = "";
  isBusy.value = false;
};

const handleVerify = () => {
  showCertificate.value = false;
  showResult.value = true;
};

const handleBack = async () => {
  showCertificate.value = false;
  showResult.value = false;
  await stopScanner();
  await startScanner(); // Restart camera when returning to scanner

   // Wait a tick to ensure DOM is updated before rendering reCAPTCHA
   nextTick(() => {
    renderRecaptcha();
  });
};

const startScanner = async () => {
  try {
    const devices = await Html5Qrcode.getCameras();
    if (!devices || devices.length === 0) {
      showError("No camera found on this device.");
      return;
    }

    const savedCameraId = localStorage.getItem(CAMERA_CHOICE_KEY);
    const savedTime = localStorage.getItem(CAMERA_CHOICE_TIME_KEY);
    const now = Date.now();

    // Check if saved choice is still valid
    if (
      savedCameraId &&
      savedTime &&
      now - parseInt(savedTime) < CAMERA_CHOICE_DURATION_MS &&
      devices.some((d) => d.id === savedCameraId)
    ) {
      // Start scanning with saved camera
      console.log("Using remembered camera:", savedCameraId);
      await startQrReader(savedCameraId);
      return;
    }

    // Build radio + remember checkbox HTML
    const optionsHtml =
      devices
        .map((device, idx) => {
          return `
          <div style="text-align: left; margin-bottom: 4px;">
            <input type="radio" name="camera" id="camera${idx}" value="${
            device.id
          }" ${idx === 0 ? "checked" : ""}>
            <label for="camera${idx}">${
            device.label || `Camera ${idx + 1}`
          }</label>
          </div>`;
        })
        .join("") +
      `<div style="margin-top:8px; text-align:left;">
        <input type="checkbox" id="rememberCamera">
        <label for="rememberCamera">Remember my choice for 1 hour</label>
      </div>`;

    const { value: selectedCameraId } = await Swal.fire({
      title: "Select a camera",
      html: optionsHtml,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Start Scanning",
      preConfirm: () => {
        const selected = (
          document.querySelector(
            "input[name='camera']:checked"
          ) as HTMLInputElement
        )?.value;
        if (!selected) {
          Swal.showValidationMessage("Please select a camera.");
        }
        return selected;
      },
    });

    if (selectedCameraId) {
      const remember = (
        document.getElementById("rememberCamera") as HTMLInputElement
      )?.checked;
      if (remember) {
        localStorage.setItem(CAMERA_CHOICE_KEY, selectedCameraId);
        localStorage.setItem(CAMERA_CHOICE_TIME_KEY, now.toString());
      } else {
        localStorage.removeItem(CAMERA_CHOICE_KEY);
        localStorage.removeItem(CAMERA_CHOICE_TIME_KEY);
      }

      await startQrReader(selectedCameraId);
    } else {
      console.log("Camera selection was cancelled.");
    }
  } catch (err) {
    showError("Error accessing camera devices.");
    console.error("Camera access error:", err);
  }
};

// Helper to start the QR reader
const startQrReader = async (cameraId: string) => {
  await qrReader.start(
    { deviceId: { exact: cameraId } },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    async (decodedText) => {
      if (!recaptchaToken.value) {
        Swal.fire({
          icon: "error",
          title: "CAPTCHA Required",
          text: "Please complete the CAPTCHA.",
        });
        isBusy.value = false;
        return;
      }

      qrCode.value = decodedText;
      await stopScanner();
      await fetchCertificate(decodedText);

      (window as any).grecaptcha?.reset();
      recaptchaToken.value = "";
    }
  );
  isScanning.value = true;
  console.log("Scanner started with device ID:", cameraId);
};

const stopScanner = async () => {
  if (qrReader && isScanning.value) {
    try {
      await qrReader.stop();
      await qrReader.clear();
      isScanning.value = false;
      console.log("Scanner stopped and cleared");
    } catch (err) {
      console.warn("Error stopping/clearing scanner:", err);
    }
  } else {
    console.log("Scanner is not running, nothing to stop.");
  }
};

onMounted(() => {
  qrReader = new Html5Qrcode("reader");
  startScanner();
});

onBeforeUnmount(() => {
  stopScanner();
});
</script>

<template>
  <div
    class="md:pt-[15rem] lg:pt-[15rem] xl:pt-[15rem] relative min-h-screen bg-[url('/assets/banner/bg-white-banner.png')] bg-center bg-no-repeat bg-cover"
  >
    <Loader v-if="isBusy" />

    <div class="container max-w-screen-lg px-4 mx-auto">
      <div v-if="!showResult">
        <!-- HEADER -->
        <div
          class="p-4 mt-32 sm:mt-20 font-semibold border-l-4 border-green-800 bg-[linear-gradient(to_right,rgba(254,202,202,0.4),rgba(254,226,226,0.3),rgba(255,255,255,0.8))]"
        >
          <h2 class="mb-4 text-xl">Scan Your Certificate for Verification</h2>
        </div>

        <div class="w-full mt-4">
          <!-- SCANNER + INPUT SECTION -->
          <div v-if="!showCertificate">
            <div class="mt-2">
              <div
                id="reader"
                class="flex items-center justify-center w-full text-gray-400 bg-white/30 rounded-xl"
              ></div>

              <div
                v-if="qrCode"
                class="mt-4 text-sm text-green-700 break-words"
              >
                ✅ Scanned QR Code: {{ qrCode }}
              </div>

              <div
                class="flex flex-wrap items-center justify-start w-full p-2 mt-2 bg-white border-2 border-dashed shadow-md cursor-pointer rounded-xl hover:bg-red-700 hover:text-white"
              >
                <CloudUpload class="mr-2" />
                <label
                  for="qr-upload"
                  class="flex-1 text-sm font-medium rounded-lg cursor-pointer sm:text-base"
                >
                  {{ fileName || "Upload Image of QR" }}
                </label>
                <input
                  id="qr-upload"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onFileChange"
                />
              </div>
              <div v-if="errorMessage" class="mt-4 text-sm text-red-700">
                ⚠️ {{ errorMessage }}
              </div>

              <div
                class="flex flex-col items-start justify-start max-w-xs gap-2 p-2 pt-4 rounded-xl"
              >
                <div v-if="filePreviewUrl" class="w-full">
                  <img
                    :src="filePreviewUrl"
                    alt="Preview"
                    class="w-24 h-auto rounded shadow"
                  />
                </div>

                <Button
                  v-if="filePreviewUrl"
                  type="button"
                  class="mt-2 text-red-700 bg-white hover:bg-red-800 hover:text-white"
                  @click="onSubmitFileScan"
                >
                  Submit
                </Button>
              </div>

              <div class="relative w-full my-4">
                <hr class="border-t border-gray-300" />
                <div
                  class="absolute px-2 text-sm -translate-x-1/2 -translate-y-1/2 bg-white left-1/2 top-1/2"
                >
                  or
                </div>
              </div>

              <div class="pt-8 space-y-4">
                <div class="flex space-x-2 text-sm">
                  <Info class="opacity-30" />
                  <div class="text-gray-400">
                    If the QR doesn't work, you can enter your serial number
                    instead.
                  </div>
                </div>

                <div class="space-y-2">
                  <div class="text-sm">Enter Serial Number</div>
                  <input
                    v-model="manualSerial"
                    type="text"
                    class="w-full pl-4 border-b-2 focus:border-b-gray-800 focus:outline-none hover:border-b-red-700"
                  />

                  <!-- ✅ Full Name Field -->
                  <div v-if="requireFullName">
                    <div class="text-sm">Enter Your Full Name</div>
                    <input
                      v-model="manualFullName"
                      type="text"
                      placeholder="e.g. Juan Dela Cruz"
                      class="w-full pl-4 border-b-2 focus:border-b-gray-800 focus:outline-none hover:border-b-red-700"
                    />
                  </div>

                  <div
                    ref="recaptchaEl"
                    class="g-recaptcha"
                    data-sitekey="6LfHH3wrAAAAAOgkS5OkPsnpVqVfQsjUqE-_yeXa"
                    data-callback="onCaptchaVerified"
                  ></div>

                  <div class="pt-2">
                    <Button
                      type="button"
                      class="w-full text-red-700 bg-white sm:w-auto hover:bg-red-800 hover:text-white"
                      @click="onSubmitSerial"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CERTIFICATE COMPONENT -->
          <Certificate
            v-if="showCertificate"
            :data="scannedData"
            :pos="1"
            @verify="handleVerify"
            @back="handleBack"
          />
        </div>
      </div>

      <!-- RESULT COMPONENT (no header) -->
      <QrScannerFormResult
        v-if="showResult"
        :userData="scannedData"
        @back="handleBack"
      />
    </div>
  </div>
</template>
