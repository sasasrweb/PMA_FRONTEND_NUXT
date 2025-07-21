<template>
  <div>
    <div ref="certificateContent" class="fixed -left-[9999px]">
      <div class="relative w-[1123px] h-[794px] overflow-hidden">
        <img
          src="/img/cert.png"
          alt="Certificate Background"
          class="absolute inset-0 object-cover w-full h-full -z-10"
        />
        <Certificate v-if="certData" :data="certData" type="download" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Certificate from "@/components/Certificate.vue";

// Get query parameters (Nuxt 3 way)
const route = useRoute();

const certificateContent = ref<HTMLElement | null>(null);
const certData = ref<any>(null);

// Load data from query or server (here we use query for simplicity)
onMounted(async () => {
  const {
    userName,
    certificateCode,
    location,
    trainingDate,
    start,
    end,
    course,
    certificateType,
    fontStyle,
    givenDate,
  } = route.query;

  // You can fetch more complex data here via API if needed

  certData.value = {
    location: location || "N/A",
    training_date: trainingDate || "N/A",
    qr_code: certificateCode || "",
    start: start || "N/A",
    end: end || "N/A",
    certiifcate_type: certificateType || "N/A",
    fontStyle: fontStyle || "sans",
    givenDate: given_date || "N/A",
    certificate_channels: [
      {
        student: {
          firstname: userName || "Student",
          course: course || "N/A",
        },
        partners: [], // You can pass these via API or extend query
        signatories: [],
      },
    ],
  };

  await nextTick();
  await downloadAsPdf(userName || "Certificate");
});

const downloadAsPdf = async (filename: string) => {
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
  pdf.save(`Certificate-${filename}.pdf`);
};
</script>
