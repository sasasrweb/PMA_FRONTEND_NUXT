<template>
  <div class="opacity-0 absolute -top-[9999px] -left-[9999px]">
    <div
      v-for="(cert, index) in transformedCertificates"
      :key="index"
      class="relative w-[1123px] h-[794px] hidden md:block overflow-hidden"
      :ref="setCertRef"
    >
      <img
        src="/img/cert.png"
        alt="Certificate Background"
        class="absolute inset-0 object-cover w-full h-full -z-10"
      />
      <Certificate :data="cert" type="download" :pos=1 />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import QRCode from "qrcode";
import Certificate from "@/components/Certificate.vue";

const props = defineProps({
  certificates: { type: Array, required: true },
});

const transformedCertificates = ref([]);
const certRefs = ref([]);
const auditLogs = ref<string[]>([]); // ✅ AUDIT LOGS

function log(message) {
  const timestamp = new Date().toISOString();
  auditLogs.value.push(`[${timestamp}] ${message}`);
  console.log(`[AUDIT] ${message}`);
}

function setCertRef(el) {
  if (el) certRefs.value.push(el);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

onMounted(async () => {
  log("Initializing transformation of certificate data...");
  transformedCertificates.value = props.certificates.map((cert, index) => {
    const transformed = buildCertData(cert);
    log(`Transformed certificate #${index + 1} - QR: ${transformed.qr_code}`);
    return transformed;
  });

  await nextTick();
  log("DOM rendered with transformed certificates. Waiting for resources...");
  await delay(500);

  log("Generating ZIP of rendered certificates...");
  await generateZipOfCertificates();

  log("Process complete. Cleared refs.");
  certRefs.value = [];
});

function buildCertData(cert) {
  const channel = cert.certificate_channels?.[0] || {};
  return {
    location: cert.location || "",
    training_date: cert.training_date || "",
    qr_code: cert.qr_code || "",
    start: cert.start || "",
    end: cert.expiry || "",
    fontStyle: cert.font_style || "great-vibes-regular",
    certificateType: cert.certificate_type || "participation",
    givenDate: cert.given_date,
    certificate_channels: [
      {
        student: {
          firstname: channel.student?.firstname || "",
          course: channel.course_name || "",
        },
        partners:
          channel.partners?.map((p) => ({
            id: p.id,
            logo: p.logo || p.logo_base64 || "",
          })) || [],
        signatories:
          channel.signatories?.map((s) => ({
            id: s.id,
            name: s.description,
            position: s.position,
            signature: s.signature || s.signature_base64 || "",
          })) || [],
      },
    ],
  };
}

async function generateZipOfCertificates() {
  const zip = new JSZip();
  console.log("how long?", certRefs.value.length);
  console.log("data", transformedCertificates.value.length);

  for (let i = 0; i < certRefs.value.length; i++) {
    const element = certRefs.value[i];
    const cert = transformedCertificates.value[i];

    console.log(transformedCertificates);

    if (!element || !cert) {
      log(`Skipping certificate #${i + 1} due to missing data or DOM.`);
      continue;
    }

    try {
      log(`Rendering canvas for certificate #${i + 1}...`);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const width = canvas.width;
      const height = canvas.height;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [width, height],
      });

      pdf.addImage(imgData, "JPEG", 0, 0, width, height);

      const blob = pdf.output("blob");
      const fileName = `Certificate-${cert.qr_code}.pdf`;

      zip.file(fileName, blob);
      log(`Added certificate #${i + 1} to ZIP as "${fileName}".`);
    } catch (err) {
      log(`Error rendering certificate #${i + 1}: ${err.message}`);
    }
  }

  try {
    log("Finalizing ZIP file...");
    const zipBlob = await zip.generateAsync({ type: "blob" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = "Certificates.zip";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    log("ZIP file downloaded successfully.");
  } catch (err) {
    log(`ZIP generation failed: ${err.message}`);
  }
}
</script>
