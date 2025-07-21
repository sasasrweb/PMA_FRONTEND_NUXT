<template>
  <NuxtLayout name="admin">
    <div class="flex justify-center">
      <div
        class="w-full max-w-3xl p-6 space-y-6 bg-white border rounded-lg shadow"
      >
        <h2 class="text-2xl font-semibold">Edit Certificate</h2>

        <div class="space-y-1">
          <Label for="studentName">Student Name</Label>
          <Input v-model="form.studentName" placeholder="Full name" />
        </div>
        <p v-if="errors.studentName" class="text-sm text-red-500">
          {{ errors.studentName }}
        </p>

        <div class="space-y-1">
          <Label for="course">Course</Label>
          <Input v-model="form.course" placeholder="Course title" />
        </div>

        <div class="space-y-1">
          <Label>Sponsors</Label>
          <Dialog v-model:open="isDialogOpen">
            <DialogTrigger as-child>
              <Button variant="outline" class="justify-start w-full">
                <span v-if="selectedSponsors.length">
                  {{ selectedSponsors.map((s) => s.description).join(", ") }}
                </span>
                <span v-else class="text-muted-foreground"
                  >Select sponsors</span
                >
              </Button>
            </DialogTrigger>
            <DialogContent class="max-w-lg">
              <DialogHeader>
                <DialogTitle>Select Sponsors</DialogTitle>
              </DialogHeader>
              <Input v-model="sponsorSearch" placeholder="Search sponsors..." />
              <div class="mt-3 space-y-2 overflow-y-auto max-h-60">
                <div
                  v-for="sponsor in filteredSponsors"
                  :key="sponsor.id"
                  class="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    :id="'sponsor-' + sponsor.id"
                    :value="String(sponsor.id)"
                    :checked="form.sponsorIds.includes(String(sponsor.id))"
                    @change="toggleSponsorId(sponsor.id)"
                  />
                  <label :for="'sponsor-' + sponsor.id">{{
                    sponsor.description
                  }}</label>
                </div>
              </div>
              <DialogFooter>
                <Button @click="isDialogOpen = false">OK</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div class="flex flex-wrap gap-2 p-2 mt-2 border rounded">
            <div
              v-for="(sponsor, index) in selectedSponsors"
              :key="sponsor.id"
              class="px-3 py-1 text-sm text-blue-800 bg-blue-100 border rounded-full cursor-move"
              draggable="true"
              @dragstart="onDragStart(index)"
              @dragover.prevent
              @drop="onDrop(index)"
            >
              {{ sponsor.description }}
            </div>
          </div>
        </div>
        <p v-if="errors.sponsorIds" class="text-sm text-red-500">
          {{ errors.sponsorIds }}
        </p>

        <div class="space-y-1">
          <Label>Signatories</Label>
          <Dialog v-model:open="isSignatoryDialogOpen">
            <DialogTrigger as-child>
              <Button variant="outline" class="justify-start w-full">
                <span v-if="selectedSignatories.length">
                  {{ selectedSignatories.map((s) => s.description).join(", ") }}
                </span>
                <span v-else class="text-muted-foreground"
                  >Select signatories</span
                >
              </Button>
            </DialogTrigger>
            <DialogContent class="max-w-lg">
              <DialogHeader>
                <DialogTitle>Select Signatories</DialogTitle>
              </DialogHeader>
              <Input
                v-model="signatorySearch"
                placeholder="Search signatories..."
              />
              <div class="mt-3 space-y-2 overflow-y-auto max-h-60">
                <div
                  v-for="signatory in filteredSignatories"
                  :key="signatory.id"
                  class="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    :id="'signatory-' + signatory.id"
                    :value="String(signatory.id)"
                    :checked="form.signatoryIds.includes(String(signatory.id))"
                    @change="toggleSignatoryId(signatory.id)"
                  />
                  <label :for="'signatory-' + signatory.id">{{
                    signatory.description
                  }}</label>
                </div>
              </div>
              <DialogFooter>
                <Button @click="isSignatoryDialogOpen = false">OK</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div class="flex flex-wrap gap-2 p-2 mt-2 border rounded">
            <div
              v-for="(signatory, index) in selectedSignatories"
              :key="signatory.id"
              class="px-3 py-1 text-sm text-green-800 bg-green-100 border rounded-full cursor-move"
              draggable="true"
              @dragstart="onSignatoryDragStart(index)"
              @dragover.prevent
              @drop="onSignatoryDrop(index)"
            >
              {{ signatory.description }}
            </div>
          </div>
        </div>
        <p v-if="errors.signatoryIds" class="text-sm text-red-500">
          {{ errors.signatoryIds }}
        </p>

        <div class="space-y-1">
          <Label for="trainingDates">Date of Training</Label>
          <div class="w-full">
            <VueDatePicker
              v-model="form.trainingDates"
              multi-dates
              :enable-time="false"
              :format="customDateFormat"
              class="w-full"
            />
          </div>
          <div
            class="flex flex-col items-start justify-start p-2 text-sm text-white"
          >
            <div class="p-2 bg-red-600 rounded-lg">
              Selected: {{ formattedTrainingDates }}
            </div>
          </div>
        </div>

        <div class="space-y-1">
          <Label for="location">Location</Label>
          <Input v-model="form.location" placeholder="Location" />
        </div>

        <div class="space-y-1">
          <Label for="fontStyle">Font Style</Label>
          <Select v-model="form.fontStyle">
            <SelectTrigger>
              <SelectValue placeholder="Select a font style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in fontStyleOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p v-if="errors.fontStyle" class="text-sm text-red-500">
          {{ errors.fontStyle }}
        </p>

        <div class="space-y-1">
          <Label for="certificateType">Certificate Type</Label>
          <Select v-model="form.certificateType">
            <SelectTrigger>
              <SelectValue placeholder="Select a certificate type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in certificateTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p v-if="errors.certificateType" class="text-sm text-red-500">
          {{ errors.certificateType }}
        </p>

        <!-- Given Date -->
        <div class="space-y-1">
          <Label for="givenDate">Date Issued</Label>
          <Input type="date" v-model="form.givenDate" />
        </div>
        <p v-if="errors.givenDate" class="text-sm text-red-500">
          {{ errors.givenDate }}
        </p>

        <div class="space-y-1">
          <Label for="status">Status</Label>
          <Select v-model="form.status">
            <SelectTrigger>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p v-if="errors.status" class="text-sm text-red-500">
          {{ errors.status }}
        </p>

        <div class="space-y-1">
          <Label for="expiryFrom">Expiry Period</Label>
          <div class="flex gap-2">
            <input
              type="date"
              v-model="form.expiryFrom"
              class="w-full p-2 border rounded"
            />
            <span class="mt-2">to</span>
            <input
              type="date"
              v-model="form.expiryTo"
              class="w-full p-2 border rounded"
            />
          </div>
        </div>
        <Button class="w-full" @click="updateForm">Update Certificate</Button>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import Swal from "sweetalert2";
import { partnerService } from "@/components/api/admin/partnerService";
import { signatoryService } from "@/components/api/admin/signatoryService";
import { certificateService } from "@/components/api/admin/certificateService";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const certificateChannelId = ref(route.query.channel);
const certificateId = ref(route.query.id);

const form = ref({
  studentName: "",
  course: "",
  trainingDates: [],
  location: "",
  expiryFrom: "",
  expiryTo: "",
  sponsorIds: [],
  signatoryIds: [],
  status: "valid",
  usn: "",
  certificateType: "attendance",
  fontStyle: "great-vibes-regular",
  givenDate: "",
});

const errors = ref({});

const statusOptions = [
  { label: "Valid", value: "valid" },
  { label: "Revoked", value: "revoked" },
  { label: "Invalid", value: "invalid" },
  { label: "Expired", value: "expired" },
];

const fontStyleOptions = [
  { value: "great-vibes-regular", label: "Script" },
  { value: "font-arial", label: "Arial" },
  { value: "font-helvetica", label: "Helvetica" },
  { value: "font-inter", label: "Calibri" },
  { value: "font-georgia", label: "Georgia" }, // new update font
];

const certificateTypeOptions = [
  { value: "participation", label: "Participation" },
  { value: "attendance", label: "Attendance" },
  { value: "achievement", label: "Achievement" },
];

const sponsorSearch = ref("");
const isDialogOpen = ref(false);
const draggingIndex = ref(null);
const availableSponsors = ref([]);

const isSignatoryDialogOpen = ref(false);
const signatorySearch = ref("");
const availableSignatories = ref([]);
const draggingSignatoryIndex = ref(null);

const formattedTrainingDates = computed(() => {
  if (!form.value.trainingDates || !form.value.trainingDates.length) return "";

  const options = { year: "numeric", month: "long", day: "numeric" };

  const formatSafeDate = (dateInput: string | Date) => {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    ).toLocaleDateString("en-US", options);
  };

  const dates = form.value.trainingDates.map((date) => formatSafeDate(date));

  return dates.length === 1
    ? dates[0]
    : `${dates.slice(0, -1).join(", ")}, and ${dates.at(-1)}`;
});

const formatToDateString = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const updateForm = async () => {
  if (!validateForm()) return;
  console.log("the date format: ", form.value.trainingDates);
  const payload = {
    ...form.value,
    trainingDates: form.value.trainingDates.map(formatToDateString),
    formattedTrainingDates: formattedTrainingDates.value,
  };
  const response = await certificateService.updateCertificate(
    certificateChannelId.value,
    payload
  );
  if (response.status === 200) {
    Swal.fire("Success", "Certificate Successfully Updated!", "success");
    router.push(`/admin/certificates/`);
  } else {
    Swal.fire("Error", "Failed to update certificate.", "error");
  }
};

const customDateFormat = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const selectedSponsors = computed(() => {
  return form.value.sponsorIds
    .map((id) => availableSponsors.value.find((s) => String(s.id) === id))
    .filter(Boolean);
});

function toggleSponsorId(id) {
  const idStr = String(id);
  const exists = form.value.sponsorIds.includes(idStr);
  if (!exists && form.value.sponsorIds.length >= 5) {
    Swal.fire(
      "Limit Reached",
      "You can only select up to 5 sponsors.",
      "warning"
    );
    isDialogOpen.value = false;
    return;
  }
  if (exists) {
    form.value.sponsorIds = form.value.sponsorIds.filter((i) => i !== idStr);
  } else {
    form.value.sponsorIds.push(idStr);
  }
}

const filteredSponsors = computed(() =>
  availableSponsors.value.filter((sponsor) =>
    sponsor.description
      .toLowerCase()
      .includes(sponsorSearch.value.toLowerCase())
  )
);

function onDragStart(index) {
  draggingIndex.value = index;
}
function onDrop(targetIndex) {
  if (draggingIndex.value === null) return;
  const ids = [...form.value.sponsorIds];
  const [moved] = ids.splice(draggingIndex.value, 1);
  ids.splice(targetIndex, 0, moved);
  form.value.sponsorIds = ids;
  draggingIndex.value = null;
}

function toggleSignatoryId(id) {
  const idStr = String(id);
  const exists = form.value.signatoryIds.includes(idStr);
  if (!exists && form.value.signatoryIds.length >= 3) {
    Swal.fire(
      "Limit Reached",
      "You can only select up to 3 signatories.",
      "warning"
    );
    isSignatoryDialogOpen.value = false;
    return;
  }
  if (exists) {
    form.value.signatoryIds = form.value.signatoryIds.filter(
      (i) => i !== idStr
    );
  } else {
    form.value.signatoryIds.push(idStr);
  }
}

const filteredSignatories = computed(() =>
  availableSignatories.value.filter((s) =>
    s.description.toLowerCase().includes(signatorySearch.value.toLowerCase())
  )
);

const selectedSignatories = computed(() => {
  return form.value.signatoryIds
    .map((id) => availableSignatories.value.find((s) => String(s.id) === id))
    .filter(Boolean);
});

const onSignatoryDragStart = (index) => {
  draggingSignatoryIndex.value = index;
};

const onSignatoryDrop = (targetIndex) => {
  if (draggingSignatoryIndex.value === null) return;
  const ids = [...form.value.signatoryIds];
  const [moved] = ids.splice(draggingSignatoryIndex.value, 1);
  ids.splice(targetIndex, 0, moved);
  form.value.signatoryIds = ids;
  draggingSignatoryIndex.value = null;
};

function validateForm() {
  if (!form.value.studentName.trim())
    return (
      Swal.fire("Validation Error", "Student name is required.", "error") &&
      false
    );
  if (!form.value.course.trim())
    return (
      Swal.fire("Validation Error", "Course is required.", "error") && false
    );
  if (!form.value.location.trim())
    return (
      Swal.fire("Validation Error", "Location is required.", "error") && false
    );
  if (!form.value.trainingDates.length)
    return (
      Swal.fire(
        "Validation Error",
        "At least one training date is required.",
        "error"
      ) && false
    );
  if (!form.value.fontStyle)
    return (
      Swal.fire("Validation Error", "Font style is required.", "error") && false
    );
  if (!form.value.givenDate)
    return (
      Swal.fire("Validation Error", "Date issued is required.", "error") &&
      false
    );
  if (!form.value.certificateType)
    return (
      Swal.fire("Validation Error", "Certificate Type is required.", "error") &&
      false
    );
  if (!form.value.status)
    return (
      Swal.fire("Validation Error", "Status is required.", "error") && false
    );
  if (!form.value.expiryFrom || !form.value.expiryTo)
    return (
      Swal.fire(
        "Validation Error",
        "Both expiry dates are required.",
        "error"
      ) && false
    );
  if (form.value.sponsorIds.length < 1)
    return (
      Swal.fire(
        "Validation Error",
        "Please select at least one sponsor.",
        "error"
      ) && false
    );
  if (form.value.signatoryIds.length < 1)
    return (
      Swal.fire(
        "Validation Error",
        "Please select at least one signatory.",
        "error"
      ) && false
    );
  return true;
}

function parseRemarksDates(remarks: Array<{ date: string }>): Date[] {
  return remarks
    .map((item) => {
      if (item && typeof item.date === "string") {
        const d = new Date(item.date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()); // Truncate to local date
      }
      return null;
    })
    .filter((d): d is Date => d !== null);
}

function parseTrainingDateString(dateString) {
  const normalized = dateString.replace(/\s+and\s+/g, ", ").trim();
  const yearMatch = normalized.match(/(\d{4})$/);
  if (!yearMatch) return [];
  const year = parseInt(yearMatch[1]);
  const monthMatch = normalized.match(/^[A-Za-z]+/);
  if (!monthMatch) return [];
  const monthName = monthMatch[0];
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
  const daysPart = normalized
    .replace(monthName, "")
    .replace(year.toString(), "")
    .replace(/,/g, " ")
    .trim();
  const dayTokens = daysPart.split(/\s+/);
  const days = [];
  dayTokens.forEach((token) => {
    if (token.includes("-")) {
      const [start, end] = token.split("-").map(Number);
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let d = start; d <= end; d++) days.push(d);
      }
    } else {
      const day = Number(token);
      if (!isNaN(day)) days.push(day);
    }
  });
  return days.map((day) => new Date(year, monthIndex, day)); // ✅ Already in local
}

onMounted(async () => {
  try {
    const [certificateRes, partnersRes, signatoriesRes] = await Promise.all([
      certificateService.getCertificate(certificateChannelId.value),
      partnerService.getPartners(),
      signatoryService.getSignatories(),
    ]);

    availableSponsors.value = partnersRes.data;
    availableSignatories.value = signatoriesRes.data;

    const certData = certificateRes.data;
    if (certData) {
      let remarksArray = [];

      try {
        // Parse stringified remarks JSON
        remarksArray = JSON.parse(certData.remarks);
      } catch (e) {
        console.warn("Failed to parse remarks:", e);
      }

      form.value = {
        studentName: certData.firstname,
        course: certData.course_name,
        location: certData.location,
        usn: certData.usn,
        trainingDates:
          Array.isArray(remarksArray) && remarksArray.length
            ? parseRemarksDates(remarksArray)
            : parseTrainingDateString(certData.training_date),
        expiryFrom: certData.start || "",
        expiryTo: certData.expiry || "",
        sponsorIds: (certData.partners || []).map((p) => String(p.id)),
        signatoryIds: (certData.signatories || []).map((s) => String(s.id)),
        status: certData.certificate_status || "active",
        certificateType: certData.certificate_type || "attendance",
        fontStyle: certData.font_style || "great-vibes-regular",
        givenDate: certData.given_date,
      };
    } else {
      Swal.fire("Error", "Certificate not found.", "error");
      router.push("/admin/certificates");
    }
  } catch (error) {
    Swal.fire("Error", "Failed to load data for editing.", "error");
    console.error(error);
  }
});
</script>

<style>
/* No changes to style needed */
.pill {
  @apply px-3 py-1 bg-blue-100 text-blue-800 rounded-full border text-sm cursor-move;
}

.font-arial {
  font-family: Arial, sans-serif;
}

.font-helvetica {
  font-family: Helvetica, sans-serif;
}

.font-inter {
  font-family: "Inter", sans-serif;
}

.font-georgia {
  font-family: Georgia, serif;
}
</style>
