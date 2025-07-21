<template>
  <NuxtLayout name="admin">
    <div class="flex justify-center">
      <div
        class="w-full max-w-3xl p-6 space-y-6 bg-white border rounded-lg shadow"
      >
        <h2 class="text-2xl font-semibold">Create Certificate</h2>

        <!-- Student Name -->
        <div class="space-y-1">
          <Label for="studentName">Student Name</Label>
          <Input v-model="form.studentName" placeholder="Full name" />
        </div>
        <p v-if="errors.studentName" class="text-sm text-red-500">
          {{ errors.studentName }}
        </p>

        <!-- Course -->
        <div class="space-y-1">
          <Label for="course">Course</Label>
          <Input v-model="form.course" placeholder="Course title" />
        </div>

        <!-- Sponsor Dialog Trigger -->
        <div class="space-y-1">
          <Label
            >Sponsors
            <span class="text-xs">(Select at least two sponsors)</span></Label
          >

          <!-- Button to open dialog -->
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

          <!-- Draggable List of Selected Sponsors (Custom) -->
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

        <!-- Signatory Dialog Trigger -->
        <div class="space-y-1">
          <Label
            >Signatories
            <span class="text-xs"
              >(Select at least two signatories)</span
            ></Label
          >

          <!-- Button to open dialog -->
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

          <!-- Custom Draggable List of Selected Signatories -->
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

        <!-- Date of Training -->
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

        <!-- Location -->
        <div class="space-y-1">
          <Label for="location">Location</Label>
          <Input v-model="form.location" placeholder="Location" />
        </div>

        <!-- Serial Type Selection -->
        <div class="space-y-1">
          <Label for="serialType">Serial Type (Course)</Label>
          <Select v-model="form.serialType">
            <SelectTrigger>
              <SelectValue placeholder="Select a serial type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in serialTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>

          <div class="mt-2 text-sm text-gray-700">
            <span v-if="generatedSerial"
              >Generated Serial: <strong>{{ generatedSerial }}</strong></span
            >
          </div>
        </div>

        <p v-if="errors.serialType" class="text-sm text-red-500">
          {{ errors.serialType }}
        </p>

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

        <!-- Issue Date
        <div class="space-y-1">
          <Label for="issueDate">Issue Date</Label>
          <input
            type="date"
            v-model="form.issueDate"
            class="w-full p-2 border rounded"
          />
        </div> -->

        <!-- Expiry Date -->
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
        <Button class="w-full" @click="submitForm">Create Certificate</Button>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import Swal from "sweetalert2";
import { partnerService } from "@/components/api/admin/partnerService";
import { signatoryService } from "@/components/api/admin/signatoryService";
import { certificateService } from "@/components/api/admin/certificateService";

import { useRouter } from "vue-router";
const router = useRouter(); // ✅ correct

const form = ref({
  studentName: "",
  course: "",
  trainingDates: [],
  location: "",
  //issueDate: "",
  expiryFrom: "",
  expiryTo: "",
  sponsorIds: [],
  signatoryIds: [],
  serialType: "",
  fontStyle: "",
  certificateType: "",
  givenDate: "",
});

const errors = ref({
  studentName: "",
  course: "",
  location: "",
  trainingDates: "",
  //issueDate: "",
  expiryFrom: "",
  expiryTo: "",
  sponsorIds: "",
  signatoryIds: "",
  serialType: "",
  fontStyle: "",
  certificateType: "",
  givenDate: "",
});

const serialTypeOptions = [
  { value: "CMPEM", label: "CMPEM" },
  { value: "Mice Capsule", label: "Mice Capsule" },
  { value: "Regional Training", label: "Regional Training" },
  { value: "Other Mice Training", label: "Other MICE Training" },
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

//sponsor
const sponsorSearch = ref("");
const isDialogOpen = ref(false);
const draggingIndex = ref(null);

//sigantory
const isSignatoryDialogOpen = ref(false);
const signatorySearch = ref("");

const availableSponsors = ref([]); // will be fetched via partnerService
const availableSignatories = ref([]); // will be fetched via signatoryService

const generatedSerial = ref("");
const serialCounter = ref(1); // Frontend counter (you can later persist this)

function toggleSponsor(sponsor) {
  console.log("[Sponsor Clicked]:", sponsor);
  const exists = form.value.sponsors.some((s) => s.id === sponsor.id);
  if (!exists) {
    form.value.sponsors.push(sponsor);
    console.log("[Sponsor Added]:", sponsor);
  } else {
    form.value.sponsors = form.value.sponsors.filter(
      (s) => s.id !== sponsor.id
    );
    console.log("[Sponsor Removed]:", sponsor);
  }
  console.log("[Current Sponsors]:", form.value.sponsors);
}

function toggleSignatory(signatory) {
  console.log("[Signatory Clicked]:", signatory);
  const exists = form.value.signatories.some((s) => s.id === signatory.id);
  if (!exists) {
    form.value.signatories.push(signatory);
    console.log("[Signatory Added]:", signatory);
  } else {
    form.value.signatories = form.value.signatories.filter(
      (s) => s.id !== signatory.id
    );
    console.log("[Signatory Removed]:", signatory);
  }
  console.log("[Current Signatories]:", form.value.signatories);
}

function isSponsorSelected(sponsor) {
  return form.value.sponsors.some((s) => s.id === sponsor.id);
}

const formattedTrainingDates = computed(() => {
  if (!form.value.trainingDates.length) return "";
  const options = { year: "numeric", month: "long", day: "numeric" };
  const dates = form.value.trainingDates.map((date) =>
    new Date(date).toLocaleDateString("en-US", options)
  );
  return dates.length === 1
    ? dates[0]
    : `${dates.slice(0, -1).join(", ")}, and ${dates.at(-1)}`;
});

const submitForm = async () => {
  if (!validateForm()) return;

  const payload = {
    ...form.value,
    formattedTrainingDates: formattedTrainingDates.value,
    serial_number: generatedSerial.value, // ✅ include this
  };

  try {
    const response = await certificateService.createCertificate(payload);

    if (response.status === 200) {
      Swal.fire("Success", "Certificate Successfully Created!", "success");
      console.log("[Form Submit Triggered]");
      console.log("[Final Submitted Data]:", payload);

      router.push("/admin/certificates");
    } else {
      Swal.fire("Error", response?.error, "error");
      console.error("Unexpected response:", response);
    }
  } catch (error) {
    console.error("Submission error:", error);
    Swal.fire("Error", error?.error || "Failed to create certificate", "error");
  }
};

// Custom date format function for v-model binding
const customDateFormat = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const selectedSponsorNames = computed(() => {
  return availableSponsors.value
    .filter((s) => form.value.sponsorIds.includes(String(s.id)))
    .map((s) => s.description);
});

// Re-compute selected sponsor objects based on selected IDs
const selectedSponsors = computed(() => {
  return form.value.sponsorIds
    .map((id) => availableSponsors.value.find((s) => String(s.id) === id))
    .filter(Boolean);
});

// Update sponsorIds when reordered
const onSponsorReorder = (event) => {
  debugger;
  const reordered = event.to.children;
  const reorderedIds = Array.from(reordered)
    .map((el) => {
      const name = el.innerText.trim();
      const found = availableSponsors.value.find((s) => s.description === name);
      return found ? String(found.id) : null;
    })
    .filter(Boolean);

  form.value.sponsorIds = reorderedIds;
};

// Toggle sponsor ID in form.sponsorIds
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

// Optional close dialog logic (can be handled with `v-model` too)
function closeDialog() {
  const dialog = document.querySelector("dialog[open]");
  if (dialog) dialog.close?.(); // polyfill if needed
}

// Filtered list for search
const filteredSponsors = computed(() =>
  availableSponsors.value.filter((sponsor) =>
    sponsor.description
      .toLowerCase()
      .includes(sponsorSearch.value.toLowerCase())
  )
);

// Triggered when dragging starts
function onDragStart(index) {
  draggingIndex.value = index;
}

// Triggered when item is dropped
function onDrop(targetIndex) {
  if (draggingIndex.value === null) return;

  const ids = [...form.value.sponsorIds];

  const [moved] = ids.splice(draggingIndex.value, 1);
  ids.splice(targetIndex, 0, moved);

  form.value.sponsorIds = ids;
  draggingIndex.value = null;
}

//signatory
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

// Drag-and-drop logic
const draggingSignatoryIndex = ref(null);

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
  if (!form.value.studentName.trim()) {
    Swal.fire("Validation Error", "Student name is required.", "error");
    return false;
  }

  if (!form.value.course.trim()) {
    Swal.fire("Validation Error", "Course is required.", "error");
    return false;
  }

  if (!form.value.location.trim()) {
    Swal.fire("Validation Error", "Location is required.", "error");
    return false;
  }

  if (!form.value.trainingDates.length) {
    Swal.fire(
      "Validation Error",
      "At least one training date is required.",
      "error"
    );
    return false;
  }

  if (!form.value.serialType || form.value.serialType.length === 0) {
    Swal.fire("Validation Error", "Serial type is required.", "error");
    return false;
  }

  if (!form.value.fontStyle || form.value.fontStyle.length === 0) {
    Swal.fire(
      "Validation Error",
      "Certificate Font Style is required.",
      "error"
    );
    return false;
  }

  if (!form.value.certificateType || form.value.certificateType.length === 0) {
    Swal.fire("Validation Error", "Certificate Type is required.", "error");
    return false;
  }

  if (!form.value.fontStyle || form.value.fontStyle.length === 0) {
    Swal.fire(
      "Validation Error",
      "Certificate Font Style is required.",
      "error"
    );
    return false;
  }

  // if (!form.value.issueDate) {
  //   Swal.fire("Validation Error", "Issue date is required.", "error");
  //   return false;
  // }

  if (!form.value.expiryFrom || !form.value.expiryTo) {
    Swal.fire("Validation Error", "Both expiry dates are required.", "error");
    return false;
  }

  if (!form.value.givenDate) {
    Swal.fire("Validation Error", "Date issued is required.", "error");
    return false;
  }

  if (form.value.sponsorIds.length < 1) {
    Swal.fire(
      "Validation Error",
      "Please select at least one sponsor.",
      "error"
    );
    return false;
  }

  if (form.value.signatoryIds.length < 1) {
    Swal.fire(
      "Validation Error",
      "Please select at least one signatory.",
      "error"
    );
    return false;
  }

  return true;
}

onMounted(async () => {
  try {
    const [partners, signatories] = await Promise.all([
      partnerService.getPartners(),
      signatoryService.getSignatories(),
    ]);

    console.log(partners, signatories);

    availableSponsors.value = partners.data;
    availableSignatories.value = signatories.data;
  } catch (error) {
    Swal.fire("Error", "Failed to load sponsors or signatories.", "error");
    console.error(error);
  }
});

watch(
  () => form.value.serialType,
  async (newType) => {
    if (!newType) {
      generatedSerial.value = "";
      return;
    }

    try {
      const res = await certificateService.fetchAvailableSerial({
        serial_type: newType,
      });

      if (res?.serial) {
        generatedSerial.value = res.serial;
      } else {
        generatedSerial.value = "";
        Swal.fire("Error", "No serial returned from server.", "error");
      }
    } catch (error) {
      console.error("Serial fetch failed:", error);
      Swal.fire("Error", "Failed to generate serial number.", "error");
    }
  }
);
</script>

<style>
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
