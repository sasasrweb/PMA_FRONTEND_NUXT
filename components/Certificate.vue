<template>
  <div class="">
    <!-- Desktop Certificate -->
    <div
      class="relative w-[1123px] h-[794px] bg-white bg-no-repeat bg-center bg-contain hidden md:block"
      :style="{ backgroundImage: `url('${certificateBackground}')` }"
    >
      <!-- QR Code + Serial (Top Left) -->
      <div class="absolute top-[90px] left-[60px] flex gap-3 items-center">
        <img
          v-if="qrImageUrl"
          :src="qrImageUrl"
          alt="QR Code"
          class="w-[90px] h-[90px]"
        />
        <div class="text-[12px] leading-tight text-black">
          <div class="font-semibold">Serial Code:</div>
          <div class="break-all max-w-[160px]">{{ qr_code }}</div>
        </div>
      </div>

      <!-- Partner Logos (Top Center or Right if many) -->
      <div
        class="absolute"
        :class="{
          'top-[90px] left-[50.1%] transform -translate-x-1/2':
            partners.length === 1,
          'top-[110px] left-[51%] transform -translate-x-1/2':
            partners.length === 2,
          'top-[110px] left-[55%] transform -translate-x-1/2':
            partners.length === 3,
          'top-[105px] right-[60px]': partners.length === 4,
          'top-[110px] right-[60px]': partners.length > 4,
        }"
      >
        <div class="flex items-center justify-center gap-4">
          <img
            v-for="partner in partners"
            :key="partner.id"
            :src="partner.logo"
            :class="
              partners.length === 1
                ? 'h-[110px]'
                : partners.length === 2
                ? 'h-[85px]'
                : partners.length === 3
                ? 'h-[75px]'
                : partners.length === 4
                ? 'h-[75px]'
                : 'h-[64px]'
            "
            class="object-contain"
          />
        </div>
      </div>

      <div :class="certificateStyle.wrapperClass">
        <!-- Name -->
        <div>
          <div
            :class="[...certificateStyle.nameClass, dynamicNameSize]"
            style="margin: 0; padding: 0"
          >
            {{ studentName }}
          </div>
        </div>

        <!-- Course & Label -->
        <div :class="certificateStyle.courseClass">
          {{ studentCourse }}
        </div>

        <!-- Date Text -->
        <div :class="certificateStyle.dateClass">
          {{ formattedTrainingText }}
        </div>
      </div>

      <!-- Signatories (Centered Below Name) -->
      <div
        class="absolute bottom-[100px] left-[50%] transform -translate-x-1/2 w-full flex justify-evenly"
      >
        <div
          v-for="sig in signatories"
          :key="sig.id"
          class="flex flex-col items-center text-center w-[300px]"
        >
          <div class="relative w-[200px] h-[100px]">
            <img
              :src="sig.signature"
              alt="Signature"
              class="absolute object-contain h-full"
              style="top: 60px; left: 32px"
            />
          </div>
          <div class="text-lg font-bold text-black">
            {{ sig.description }}
          </div>
          <div class="text-base text-black">{{ sig.position }}</div>
        </div>
      </div>
    </div>

    <!-- Mobile certificate -->
    <div
      class="relative w-full bg-center bg-no-repeat bg-contain bg-white block md:hidden aspect-[3/4]"
      :style="{ backgroundImage: `url('${certificateMobileBackground}')` }"
    >
      <div
        class="absolute flex items-center justify-between space-x-4 px-4 top-[5%] sm:top-[10%]"
        :class="partnersRowClass"
        style="left: 50%; transform: translateX(-50%)"
      >
        <div class="flex w-1/2 gap-1">
          <img
            v-if="qrImageUrl"
            :src="qrImageUrl"
            alt="QR Code"
            class="w-6 h-6"
          />
          <div class="text-[0.5rem] grid gird-cols-1">
            Serial Number
            <div>{{ qr_code }}</div>
          </div>
        </div>
        <div class="flex items-center justify-center gap-2">
          <img
            v-for="partner in partners"
            :key="partner.id"
            :src="partner.logo"
            alt="Partner Logo"
            :class="partnerImgClass.mobile"
          />
        </div>
        <div v-if="partners.length <= 3"></div>
      </div>

      <!-- Student Name -->
      <div
        :class="certificateMobileStyle.nameClass"
        :style="certificateMobileStyle.nameStyle"
      >
        {{ studentName }}
      </div>

      <!-- Student Course -->
      <div
        :class="certificateMobileStyle.courseClass"
        :style="certificateMobileStyle.courseStyle"
      >
        {{ studentCourse }}
      </div>

      <!-- Formatted Date Text -->
      <div
        :class="certificateMobileStyle.dateClass"
        :style="certificateMobileStyle.dateStyle"
      >
        {{ formattedTrainingText }}
      </div>

      <div
        class="absolute flex justify-around w-[80%]"
        style="bottom: 5%; left: 50%; transform: translateX(-50%)"
      >
        <div
          v-for="sig in signatories"
          :key="sig.id"
          class="flex flex-col items-center justify-center p-1 rounded-lg"
        >
          <div class="relative flex flex-col items-center">
            <img
              :src="sig.signature"
              alt="Signature"
              class="absolute object-contain h-8 mb-1 -top-6"
            />
            <div
              class="text-[8px] md:text-xs font-medium text-center text-black"
            >
              {{ sig.description }}
            </div>
            <div class="text-[6px] md:text-[10px] text-center text-black">
              {{ sig.position }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="props.type !== 'download'"
      class="flex flex-col justify-center w-full gap-2 mt-4 md:justify-center md:items-center"
    >
      <button
        @click="onVerify"
        class="px-4 py-2 text-red-700 transition rounded-lg hover:bg-red-700 hover:text-white"
      >
        Verify
      </button>
      <button
        @click="emit('back')"
        class="flex items-center justify-center p-2 rounded-lg text-red hover:bg-red-700 hover:text-white"
      >
        Back to Certificate Verification
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits, onBeforeMount, computed } from "vue";
import { useRoute } from "vue-router";
import QRCode from "qrcode";

const props = defineProps<{
  data: any;
  type?: "preview" | "download"; // or other types if needed
  pos?: number | 1;
}>();

const emit = defineEmits<{
  (e: "verify", payload: any): void;
  (e: "back"): void;
}>();

const qrImageUrl = ref<string | null>(null);
const channel = props.data.certificate_channels[0] || {};
const student = channel.student || {};

const studentName = student.firstname || "N/A";
const location = props.data.location || "N/A";
const trainingDate = props.data.training_date || "N/A";
const qr_code = props.data.qr_code || "";
const studentCourse = student.course || "N/A";
const start = props.data.start || "N/A";
const end = props.data.end || "N/A";
const fontStyle = props.data.fontStyle;
const certificateType = ref(props.data.certificateType || "");
const givenDate = props.data.givenDate || "N/A";

const route = useRoute();

const partners =
  channel.partners?.map((p) => ({
    id: p.id,
    logo: p.logo,
  })) || [];

const signatories =
  channel.signatories?.map((s) => ({
    id: s.id,
    description: s.name,
    position: s.position,
    signature: s.signature,
  })) || [];

onMounted(async () => {
  console.log("front end data", props.data);
  if (qr_code) {
    try {
      qrImageUrl.value = await QRCode.toDataURL(qr_code, {
        width: 150,
        margin: 1,
      });
    } catch (err) {
      console.error("QR code generation failed", err);
    }
  }

  checkDevice(); // Check on load
  window.addEventListener("resize", checkDevice); // Listen to resize
});

const onVerify = () => {
  emit("verify", props.data);
};

const checkDevice = () => {
  if (window.innerWidth < 768) {
    console.log("Mobile");
  } else {
    console.log("Desktop");
  }
};

const partnersRowClass = computed(() => {
  if (partners.length > 3) {
    return "w-[80%]";
  }
  return "w-[90%]";
});

const partnerImgClass = computed(() => {
  if (partners.length > 3) {
    return {
      desktop: "object-contain h-8", // smaller
      mobile: "object-contain h-3", // smaller
    };
  }
  return {
    desktop: "object-contain h-12", // normal
    mobile: "object-contain h-6", // normal
  };
});

const getLocationFromCode = (code: string): string => {
  if (code.startsWith("CMPEM")) return "CMPEM";
  if (code.startsWith("MICE")) return "Mice Capsule";
  if (code.startsWith("REGIONAL")) return "Regional Training";
  if (code.startsWith("OMICE")) return "Other MICE Training";
  return "Training Program"; // fallback
};

const locationLabel = computed(() => getLocationFromCode(qr_code));

const formatDateToReadable = (dateStr: string) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const suffix = (d: number) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const date = new Date(dateStr);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}${suffix(day)} of ${month}, ${year}`;
};

const formattedTrainingText = computed(() => {
  const heldOn = props.data.training_date || "N/A";
  const location = props.data.location || "N/A";
  const given_date = props.data.givenDate
    ? formatDateToReadable(givenDate)
    : "N/A";

  return `held on ${heldOn} at the ${location}, Given this ${given_date}.`;
});

const dynamicNameSize = computed(() => {
  const length = studentName.length;

  if (length <= 20) return "text-[60px]";
  if (length <= 30) return "text-[50px]";
  if (length <= 40) return "text-[40px]";
  return "text-[40px]"; // fallback for very long names
});

const certificateStyle = computed(() => {
  const isValidationRoute = route.path === "/certificate-validation";
  const pos = props.pos;

  console.log("font style", fontStyle);

  return {
    wrapperClass: [
      isValidationRoute
        ? pos === 1
          ? "absolute top-[49%] left-[50%] transform -translate-x-1/2 text-center max-w-[700px] w-full grid grid-rows-[auto_auto_auto] gap-1 space-y-4"
          : "absolute top-[45%] left-[50%] transform -translate-x-1/2 text-center max-w-[700px] w-full grid grid-rows-[auto_auto_auto] gap-1 space-y-4"
        : "absolute top-[45%] left-[50%] transform -translate-x-1/2 text-center max-w-[700px] w-full grid grid-rows-[auto_auto_auto] gap-1 space-y-7",
    ],

    nameClass: [
      "font-bold break-words text-center leading-none",
      isValidationRoute ? "text-black" : "text-black",
      fontStyle || "great-vibes-regular",
    ],

    courseClass: isValidationRoute
      ? "text-[25px] font-bold leading-tight text-black"
      : "text-[25px] font-bold leading-tight text-black",

    dateClass: isValidationRoute
      ? "text-[14px] text-black leading-tight"
      : "text-[14px] text-black leading-tight",
  };
});

const certificateBackground = computed(() => {
  console.log("cert should be: ", certificateType.value);
  switch (certificateType.value) {
    case "attendance":
      console.log("attendance");
      return "/img/cert1.png";
    case "achievement":
      return "/img/cert2.png";
    default:
      return "/img/cert.png"; // fallback participation
  }
});

const certificateMobileBackground = computed(() => {
  switch (certificateType.value) {
    case "attendance":
      return "/img/cert5.png";
    case "achievement":
      return "/img/cert6.png";
    default:
      return "/img/cert4.png"; // fallback
  }
});

const certificateMobileStyle = computed(() => {
  const isValidationRoute = route.path === "/certificate-validation";
  const pos = props.pos;

  return {
    nameClass: [
      "absolute text-center text-black break-words font-bold leading-none",
      fontStyle || "great-vibes-regular",
      "w-[90%] max-w-[90%]",
      "px-2",
    ],
    nameStyle: {
      top: pos === 1 ? "53%" : "48%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "clamp(12px, 5vw, 28px)",
    },

    courseClass: [
      "absolute text-center text-black font-bold px-2",
      "w-[90%] max-w-[90%]",
    ],
    courseStyle: {
      top: pos === 1 ? "58%" : "57%",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: "clamp(8px, 3vw, 18px)",
    },

    dateClass: ["absolute text-center text-black px-2 w-[90%] max-w-[90%]"],
    dateStyle: {
      top: pos === 1 ? "68%" : "65%",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: "clamp(7px, 2.5vw, 16px)",
    },
  };
});
</script>
