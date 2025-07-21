<script setup lang="ts">
import { computed, ref } from "vue";
import { ArrowDownToLine } from "lucide-vue-next";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

// Props
const props = defineProps<{
  userData: any; // raw certificate data
  debug?: boolean;
}>();

const emit = defineEmits<{ (e: "back"): void }>();
const certificateRef = ref<HTMLElement | null>(null);
const channel = props.userData.certificate_channels[0] || {};
const fallbackImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=";

const qrImageUrl = ref<string | null>(null);

const certData = ref<any>(null);

const studentName =
  props.userData.certificate_channels[0].student.firstname || "N/A";
const location = props.userData.location || "N/A";
const trainingDate = props.userData.training_date || "N/A";
const qr_code = props.userData.qr_code || "";

const partners =
  channel.partners?.map((p) => ({
    id: p.id,
    logo: p.logo,
    logo_64: p.logo_base64,
  })) || [];

const signatories =
  channel.signatories?.map((s) => ({
    id: s.id,
    description: s.description,
    position: s.position,
    signature: s.signature,
    signature_64: s.signature_base64,
  })) || [];

const isValidBase64 = (str: string | null) => {
  return str?.startsWith("data:image/") && str.includes("base64,");
};

// Transform raw userData into the format for display
const displayData = computed(() => {
  const channel = props.userData.certificate_channels?.[0] || {};
  const student = channel.student || {};

  return {
    name: `${student.firstname || "N/A"}`.trim(),
    course: channel.course_name || "N/A",
    venue: props.userData.location || "N/A",
    courseDate: props.userData.training_date || "N/A",
    dateIssued: props.userData.start || "N/A",
    serialNumber: props.userData.qr_code || "N/A",
    status: props.userData.status || "N/A", // FIXED HERE
    givenDate: props.userData.givenDate || "N/A",
  };
});

// Download logic
// const downloadInfo = () => {
//   const info = `
// Name: ${displayData.value.name}
// Course: ${displayData.value.course}
// Venue: ${displayData.value.venue}
// Course Date: ${displayData.value.courseDate}
// Date Issued: ${displayData.value.dateIssued}
// Serial Number: ${displayData.value.serialNumber}
// Status: ${displayData.value.status}
// `.trim();

//   const blob = new Blob([info], { type: "text/plain;charset=utf-8" });
//   const url = window.URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = "certificate-info.txt";
//   link.click();
//   window.URL.revokeObjectURL(url);
// };
const downloadInfo = async () => {
  if (!certificateRef.value) {
    console.error("Certificate DOM not found");
    return;
  }

  try {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const canvas = await html2canvas(certificateRef.value, {
      scale: isMobile ? 1.2 : 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);

    // Must be called inside a real click event
    pdf.save(`Certificate-${displayData.value.name || "Download"}.pdf`);
  } catch (err) {
    console.error("PDF generation failed", err);
  }
};

onMounted(async () => {
  const channel = props.userData.certificate_channels?.[0] || {};
  const student = channel.student || {};

  certData.value = {
    location: props.userData.location || "N/A",
    training_date: props.userData.training_date || "N/A",
    qr_code: props.userData.qr_code || "",
    start: props.userData.start || "N/A",
    end: props.userData.end || "N/A",
    certificateType: props.userData.certificateType || "N/A",
    fontStyle: props.userData.fontStyle || "sans",
    givenDate: props.userData.givenDate || "N/A",
    certificate_channels: [
      {
        student: {
          firstname: student.firstname || "N/A",
          course: channel.course_name || "N/A",
        },
        partners: channel.partners || [],
        signatories: channel.signatories || [],
      },
    ],
  };

  if (props.userData.qr_code) {
    try {
      qrImageUrl.value = await QRCode.toDataURL(props.userData.qr_code, {
        width: 150,
        margin: 1,
      });
    } catch (err) {
      console.error("QR code generation failed:", err);
    }
  }
});
</script>

<template>
  <div class="...">
    <div class="container max-w-screen-lg px-4 mx-auto">
      <div
        class="p-4 mt-32 sm:mt-20 font-semibold border-l-4 border-green-800 bg-[linear-gradient(to_right,rgba(254,202,202,0.4),rgba(254,226,226,0.3),rgba(255,255,255,0.8))]"
      >
        <h2 class="mb-4 text-xl">Certificate Details</h2>
      </div>

      <div class="relative p-4 bg-white rounded-lg">
        <div class="flex justify-end">
          <button
            @click="downloadInfo"
            class="hidden p-2 text-white transition bg-black rounded hover:bg-gray-800 md:block"
          >
            <ArrowDownToLine />
          </button>
        </div>

        <div
          class="p-6 mt-4 border-2 border-t-8 rounded-lg shadow border-t-red-800"
        >
          <div
            class="mb-4 space-y-2 text-lg sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0"
          >
            <div class="flex sm:block">
              <span class="mr-1 font-bold">Name:</span>
              <span>{{ displayData.name }}</span>
            </div>
            <div class="flex sm:block">
              <span class="mr-1 font-bold">Venue:</span>
              <span>{{ displayData.venue }}</span>
            </div>
            <div class="flex sm:block">
              <span class="mr-1 font-bold">Course:</span>
              <span>{{ displayData.course }}</span>
            </div>
            <div class="flex sm:block">
              <span class="mr-1 font-bold">Course Date:</span>
              <span class="text-red-700">{{ displayData.courseDate }}</span>
            </div>
          </div>

          <hr class="my-4" />

          <div
            class="space-y-2 text-lg sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0"
          >
            <div class="flex sm:block">
              <span class="mr-1 font-bold">Date Issued:</span>
              <span>{{ displayData.givenDate }}</span>
            </div>
            <div class="flex sm:block">
              <span class="mr-1 font-bold">Serial Number:</span>
              <span class="text-gray-600">{{ displayData.serialNumber }}</span>
            </div>
            <div
              class="flex items-start justify-start w-full mt-2 space-x-2 sm:col-span-2 md:justify-center md:items-center"
            >
              <span class="font-bold">Status:</span>
              <span
                class="px-3 py-1 capitalize rounded-full"
                :class="{
                  'bg-green-200 text-green-800':
                    displayData.status?.toLowerCase?.() === 'valid',
                  'bg-yellow-200 text-yellow-800':
                    displayData.status?.toLowerCase?.() === 'expired',
                  'bg-red-200 text-red-800': ['invalid', 'revoked'].includes(
                    displayData.status?.toLowerCase?.()
                  ),
                  'bg-gray-200 text-gray-600': ![
                    'valid',
                    'expired',
                    'invalid',
                    'revoked',
                  ].includes(displayData.status?.toLowerCase?.()),
                }"
              >
                {{ displayData.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <button
          class="w-full px-4 py-2 text-red-800 transition border border-red-800 rounded hover:bg-red-800 hover:text-white sm:w-auto"
          @click="emit('back')"
        >
          Back to Certificate Verification
        </button>
      </div>

      <pre v-if="props.debug" class="p-2 mt-4 text-xs bg-gray-100 rounded"
        >{{ JSON.stringify(props.userData, null, 2) }}
      </pre>

      <div ref="certificateRef" class="fixed -left-[9999px]">
        <div
          class="relative w-[1123px] h-[794px] hidden md:block overflow-hidden"
        >
          <img
            src="/img/cert.png"
            alt="Certificate Background"
            class="absolute inset-0 object-cover w-full h-full -z-10"
          />
          <Certificate
            v-if="certData"
            :data="certData"
            type="download"
            :pos="2"
          />
        </div>
      </div>
    </div>
  </div>
</template>
