<!-- components/CertificateRender.vue -->
<template>
  <div
    ref="containerRef"
    class="fixed w-[1498px] h-[842px] flex items-center justify-center text-center"
    style="
      top: 0;
      left: -9999px;
      visibility: hidden;
      background-image: url('/img/cert.png');
      background-size: cover;
    "
  >
    <!-- Full Name -->
    <div class="absolute top-[10rem] text-4xl font-bold text-gray-900">
      {{ cert.studentDetails.firstname }}
      {{ cert.studentDetails.middlename || "" }}
      {{ cert.studentDetails.lastname || "" }}
    </div>

    <!-- Issued and Expiry Dates -->
    <div
      class="absolute top-[15rem] left-1/2 transform -translate-x-1/2 space-y-4"
    >
      <div class="text-lg font-semibold bg-white/70 px-4 py-2 rounded">
        <strong>Issued:</strong> {{ formatDate(cert.created_at) }}
      </div>
      <div class="text-lg font-semibold bg-white/70 px-4 py-2 rounded">
        <strong>Expiry:</strong> {{ formatDate(cert.expiry) }}
      </div>
    </div>

    <!-- QR and Logo -->
    <div class="absolute bottom-[4rem] right-[6rem] w-[120px] h-[120px]">
      <canvas ref="qrCanvas" class="w-full h-full"></canvas>
      <div class="absolute inset-0 flex items-center justify-center">
        <img src="/img/qr-logo.png" class="w-[40px] h-[40px]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const props = defineProps({
  cert: Object,
});

const qrCanvas = ref(null);
const containerRef = ref(null); // reference for the full certificate div

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

onMounted(async () => {
  console.log("Certificate data received in CertificateRender:", props.cert);

  try {
    // Wait for QR to render
    if (qrCanvas.value && props.cert?.qr_code) {
      await QRCode.toCanvas(qrCanvas.value, props.cert.qr_code, {
        width: 120,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff00",
        },
      });
      console.log("QR Code rendered successfully.");
    } else {
      console.warn("Missing canvas or QR code data:", {
        canvas: qrCanvas.value,
        qr: props.cert?.qr_code,
      });
    }

    // Wait for DOM updates (QR + layout)
    await nextTick();

    // Trigger automatic PDF download
    const canvas = await html2canvas(containerRef.value, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1498, 842],
    });

    pdf.addImage(imgData, "PNG", 0, 0, 1498, 842);
    const filename =
      props.cert?.studentDetails?.firstname +
      "_" +
      props.cert?.studentDetails?.lastname +
      "_certificate.pdf";
    pdf.save(filename);
  } catch (error) {
    console.error("Auto PDF generation failed:", error);
  }
});
</script>
