<template>
  <div>
    <div ref="certificateContent" class="fixed -left-[9999px]">
      <div
        class="relative w-[1123px] h-[794px] hidden md:block overflow-hidden"
      >
        <img
          src="/img/cert.png"
          alt="Certificate Background"
          class="absolute inset-0 object-cover w-full h-full -z-10"
        />
        <Certificate v-if="certData" :data="certData" type="download" :pos=1 />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, defineProps } from "vue";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Certificate from "@/components/Certificate.vue"; // Assuming the certificate template is a component

// Refs
const certificateContent = ref<HTMLElement | null>(null);
const qrCanvas = ref<HTMLCanvasElement | null>(null);
const certData = ref<any>(null);

// Constants
const certificateTemplate = "/img/cert.png";

const generateQrCodeWithLogo = async (
  certificateCode: string,
  qrLogoSrc: string
) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const qrSize = 100;

  canvas.width = qrSize;
  canvas.height = qrSize;

  if (!ctx) return;

  try {
    const qrDataUrl = await QRCode.toDataURL(certificateCode, {
      errorCorrectionLevel: "H",
      width: qrSize,
      margin: 1,
    });

    const qrImage = new Image();
    qrImage.src = qrDataUrl;
    await new Promise(
      (resolve) => (qrImage.onload = qrImage.onerror = resolve)
    );
    ctx.drawImage(qrImage, 0, 0, qrSize, qrSize);

    const logoImage = new Image();
    logoImage.src = qrLogoSrc;
    await new Promise(
      (resolve) => (logoImage.onload = logoImage.onerror = resolve)
    );

    const logoSize = qrSize * 0.25;
    const logoX = (qrSize - logoSize) / 2;
    const logoY = (qrSize - logoSize) / 2;
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
  } catch (err) {
    console.error("QR code generation failed", err);
  }

  return canvas;
};

const downloadAsPdf = async () => {
  if (!certificateContent.value) return;

  const canvas = await html2canvas(certificateContent.value, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
  });

  const imgData = canvas.toDataURL("image/jpeg", 1.0);
  const pdfWidth = canvas.width * 0.75;
  const pdfHeight = canvas.height * 0.75;

  const pdf = new jsPDF({
    orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
    unit: "pt",
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`Certificate-${props.userName}.pdf`);
};

// Props available inside setup scope for `downloadAsPdf`
const props = defineProps<{
  userName: string;
  certificateCode: string;
  location?: string;
  trainingDate?: string;
  partners?: any[];
  signatories?: any[];
  qrLogoSrc?: string;
  start?: string;
  end?: string;
  course: string;
  certificateType?: string,
  fontStyle?: string,
  givenDate?: string,
}>();

// Lifecycle
onMounted(async () => {
  certData.value = {
    location: props.location,
    training_date: props.trainingDate,
    qr_code: props.certificateCode,
    start: props.start,
    end: props.end,
    certificateType: props.certificateType,
    fontStyle: props.fontStyle,
    givenDate: props.givenDate,
    certificate_channels: [
      {
        student: {
          firstname: props.userName,
          course: props.course,
        },
        partners: props.partners,
        signatories: props.signatories,
      },
    ],
  };

  console.log(certData);
  await generateQrCodeWithLogo(
    props.certificateCode,
    props.qrLogoSrc || "/img/qr-logo.png"
  );

  await nextTick();
  await downloadAsPdf();
});
</script>
