<template>
  <div>
    <div class="mt-10 text-center">
      <CertificateView
        v-if="certificateLoaded"
        :userName="certificateHolderName"
        :certificateCode="certificateVerificationCode"
        :end="expiry"
        :created_at="created_at"
        :location="location"
        :trainingDate="trainingDate"
        :partners="partners"
        :signatories="signatories"
        :start="start"
        :course="course"
        :certificateType="certificateType"
        :fontStyle="fontStyle"
        :givenDate="givenDate"
      />
      <transition name="fade">
        <div
          class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
        >
          <div class="relative flex flex-col items-center justify-center">
            <!-- Center logo -->
            <div
              v-if="countdown > 0"
              class="absolute w-24 h-24 bg-center bg-cover rounded-full top-7"
              style="background-image: url(/img/qr-logo.png)"
            ></div>

            <div
              v-else
              class="w-24 h-24 mb-4 bg-center bg-cover rounded-none"
              style="background-image: url(/img/download_success.png)"
            ></div>

            <!-- Spinner (only when downloading) -->
            <div
              v-if="countdown > 0"
              class="w-32 h-32 mt-4 border-4 border-gray-300 rounded-full border-t-red-800 animate-spin"
            ></div>

            <!-- Countdown text -->
            <div v-if="countdown > 0" class="mt-4 text-gray-600">
              Downloading please wait... {{ countdown }} second<span
                v-if="countdown !== 1"
                >s</span
              >...
            </div>

            <div v-else class="text-gray-600">Downloaded Successfully!</div>

            <!-- Back button -->
            <button
              v-if="countdown === 0"
              @click="goBack"
              class="px-4 py-2 mt-4 text-white bg-red-800 rounded hover:bg-red-700"
            >
              Go Back to Certificates
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import CertificateView from "@/components/CertificateView.vue";
import { certificateService } from "@/components/api/admin/CertificateService";

// State
const certificateHolderName = ref<string>("");
const certificateVerificationCode = ref<string>("");
const start = ref<string>("");
const expiry = ref<string>("");
const createdAt = ref<string>("");
const location = ref<string>("");
const trainingDate = ref<string>("");
const partners = ref<any[]>([]);
const signatories = ref<any[]>([]);
const certificateLoaded = ref<boolean>(false);
const countdown = ref<number>(10);
const course = ref<string>("");
const fontStyle = ref<string>("");
const givenDate = ref<string>("");
const certificateType = ref<string>("");

// Router
const router = useRouter();
const route = useRoute();

// Methods
const goBack = () => {
  router.push("/admin/certificates/");
};

const startCountdown = () => {
  const timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer);
    }
  }, 1000);
};

// Fetch Certificate on Mount
onMounted(async () => {
  startCountdown();

  try {
    const certificateId = parseInt(route.query.id as string, 10);
    if (isNaN(certificateId))
      throw new Error("Invalid certificate ID in URL query");

    const response = await certificateService.getCertificate(certificateId);

    console.log("cert data", response);

    certificateHolderName.value = response.data.studentDetails.firstname;
    certificateVerificationCode.value = String(response.data.qr_code);
    expiry.value = response.data.expiry || "N/A";
    start.value = response.data.start || "N/A";
    createdAt.value = response.data.studentDetails.created_at;
    location.value = response.data.location || "N/A";
    trainingDate.value = response.data.training_date || "N/A";
    partners.value = response.data.partners || [];
    signatories.value = response.data.signatories || [];
    course.value = response.data.course_name || "N/A";
    certificateType.value = response.data.certificate_type || "N/A";
    fontStyle.value = response.data.font_style || "N/A";
    givenDate.value = response.data.given_date || "N/A";

    certificateLoaded.value = true;
    countdown.value = 0;
  } catch (error) {
    console.error("Failed to load certificate data:", error);
  }
});
</script>
