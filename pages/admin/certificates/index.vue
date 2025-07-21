<script setup lang="ts">
import {
  ArrowDownToLine,
  EllipsisVertical,
  PenLine,
  ScanQrCode,
  Trash2,
} from "lucide-vue-next";
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { certificateService } from "~/components/api/admin/CertificateService";
import { courseService } from "~/components/api/admin/CourseService";
import Swal from "sweetalert2";
import { useForm } from "vee-validate";
import { Form } from "@/components/ui/form";
import CertificateBatchExportVue from "@/components/CertificateBatchExport.vue";
import QRCode from "qrcode";

useHead({
  title: "CMS Certificate",
  meta: [
    { name: "description", content: "CMS - Certificate management (CRUD)" },
  ],
});

const form = useForm();
const router = useRouter();
const route = useRoute();

const students = ref<any[]>([]);
const search = ref("");
const showExportModal = ref(false);
const selectedCourse = ref<any[]>([]);
const selectedStatus = ref<any[]>([]);
const selectedDate = ref("");
const exportedCertificates = ref<any[]>([]);
const isExporting = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;
const prefixFilter = ref("all");
const courseOptions = ref<{ label: string; value: string }[]>([]);
const statusOptions = ["Active", "Invalid", "Expired", "Revoke"];

// Set action default
const isActionTrigger = ref(null);
const dropdownPosition = ref({ top: 0, left: 0, padding: 0 });

onMounted(() => {
  const queryPrefix = route.query.prefix as string;
  if (queryPrefix) {
    prefixFilter.value = queryPrefix;
  }

  fetchCertificates();
  fetchCourses();
});

// ✅ Sync prefixFilter back into the query string when dropdown changes
watch(prefixFilter, async (newPrefix) => {
  await router.replace({
    query: {
      ...route.query,
      prefix: newPrefix !== "all" ? newPrefix : undefined,
    },
  });
});

// ✅ React to changes in the URL and refetch certificates
watch(
  () => route.query.prefix,
  async (newPrefix) => {
    prefixFilter.value = newPrefix || "all";
    await fetchCertificates(); // Refetch with the new prefix
  }
);
const fetchCertificates = async () => {
  try {
    const params = {
      prefix: prefixFilter.value !== "all" ? prefixFilter.value : undefined,
    };

    const response = await certificateService.getCertificates(params); // pass prefix to API
    students.value = response;
    currentPage.value = 1;
  } catch (error: any) {
    Swal.fire(
      "Error",
      error.message || "Failed to fetch certificates",
      "error"
    );
  }
};

const fetchCourses = async () => {
  try {
    const response = await courseService.getCourses();
    courseOptions.value = response.data.map((course: any) => ({
      label: course.description,
      value: String(course.id),
    }));
  } catch (error: any) {
    Swal.fire("Error", error.message || "Failed to fetch courses", "error");
  }
};

const deleteCertificate = async (id: number, course: object) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: `This will delete the certificate for ${course}. This action cannot be undone!`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      await certificateService.deleteCertificate(id);
      Swal.fire("Deleted!", "The certificate has been deleted.", "success");
      fetchCertificates();
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.message || "Failed to delete certificate",
        "error"
      );
    }
  }
};

const viewCertificate = (id: number) => {
  const url = router.resolve(`/admin/certificates/view/?id=${id}`).href;
  window.open(url, "_blank");
};

const viewQR = async (id: number) => {
  try {
    const response = await certificateService.qrDownload(id);
    const qrData = response.data;

    if (response.status === 200 && qrData.certificates.qrs?.description) {
      const qrText = qrData.certificates.qrs.description;
      const size = 300;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      await QRCode.toCanvas(canvas, qrText, {
        errorCorrectionLevel: "H",
        width: size,
        margin: 1,
      });

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      const logo = new Image();
      logo.src = "/img/qr-logo.png";

      await new Promise((resolve, reject) => {
        logo.onload = resolve;
        logo.onerror = reject;
      });

      const logoSize = size * 0.2;
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

      const qrImageUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = qrImageUrl;
      link.download = `${qrText}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Swal.fire("Error", "QR data not found", "error");
    }
  } catch (error) {
    Swal.fire("Error", error.message || "Failed to generate QR", "error");
  }
};

function editCertificate(channelId: number, certificateId: number) {
  router.push(
    `/admin/certificates/edit?channel=${channelId}&id=${certificateId}`
  );
}

const goToGenerateCertificate = () => {
  router.push("/admin/certificates/create");
};

// ✅ Your modified exportCertificates function
const exportCertificates = async () => {
  const filters = {
    course: selectedCourse.value.map(Number),
    status: [...selectedStatus.value],
  };

  try {
    isExporting.value = true;

    // Step 1: Fetch raw data
    const response = await certificateService.bulkDownload(filters);
    const rawCertificates = response.data || response;

    console.log("data exported", rawCertificates);

    if (!rawCertificates.length) {
      Swal.fire("No Results", "No certificates matched your filters.", "info");
      return;
    }

    // Step 2: Use existing base64 fields directly (no image conversion)
    exportedCertificates.value = rawCertificates.map((cert) => {
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
        ...cert,
        certificate_channels: [
          {
            ...channel,
            partners,
            signatories,
          },
        ],
      };
    });

    // Step 3: Close modal
    showExportModal.value = false;
  } catch (error: any) {
    Swal.fire("Export Failed", error.message || "An error occurred", "error");
  } finally {
    isExporting.value = false;
  }
};

const filteredStudents = computed(() => {
  return students.value.filter((student) => {
    const term = search.value.toLowerCase();
    const fullName =
      `${student.firstname} ${student.middlename} ${student.lastname}`.toLowerCase();

    const matchesSearch =
      String(student.usn).toLowerCase().includes(term) ||
      fullName.includes(term) ||
      String(student.code).toLowerCase().includes(term);

    const matchesPrefix =
      prefixFilter.value === "all" ||
      student.code?.startsWith(prefixFilter.value);

    return matchesSearch && matchesPrefix;
  });
});

const totalPages = computed(() =>
  Math.ceil(filteredStudents.value.length / itemsPerPage)
);

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredStudents.value.slice(start, start + itemsPerPage);
});

const setPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const triggerAction = (id, event) => {
  if (isActionTrigger.value === id) {
    isActionTrigger.value = null;
    return;
  }

  const buttonRect = event.currentTarget.getBoundingClientRect();
  const popupWidth = 160;
  const popupHeight = 180;
  const padding = 4;

  let top = buttonRect.bottom + window.scrollY + padding;
  let left = buttonRect.left + window.scrollX;

  if (left + popupWidth > window.innerWidth + window.scrollX) {
    left = window.innerWidth + window.scrollX - popupWidth - padding;
  }

  if (top + popupHeight > window.innerHeight + window.scrollY) {
    top = buttonRect.top + window.scrollY - popupHeight - padding;
    if (top < window.scrollY + padding) {
      top = window.scrollY + padding;
    }
  }

  isActionTrigger.value = id;
  dropdownPosition.value = { top, left };
};

async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`[Base64] Failed for URL: ${url}`, error);
    return null;
  }
}

async function mapExportedData(certificates) {
  return Promise.all(
    certificates.map(async (cert) => {
      const channel = cert.certificate_channels?.[0] || {};

      const partners = await Promise.all(
        (channel.partners || []).map(async (p) => ({
          ...p,
          logo_base64: await imageUrlToBase64(p.logo),
        }))
      );

      const signatories = await Promise.all(
        (channel.signatories || []).map(async (s) => ({
          ...s,
          signature_base64: await imageUrlToBase64(s.signature),
        }))
      );

      return {
        ...cert,
        certificate_channels: [
          {
            ...channel,
            partners,
            signatories,
          },
        ],
      };
    })
  );
}
</script>

<template>
  <NuxtLayout name="admin">
    <div>
      <h1 class="mb-4 text-xl font-semibold">Certificates</h1>

      <div class="flex items-center justify-between mb-6">
        <Button
          class="text-white bg-black hover:bg-gray-800"
          @click="goToGenerateCertificate"
        >
          Generate Certificate
        </Button>

        <Button
          class="text-white bg-black hover:bg-gray-700"
          @click="showExportModal = true"
        >
          Bulk Export
        </Button>
      </div>
      <Input
        v-model="search"
        placeholder="Search..."
        class="flex w-1/2 px-3 py-1 mb-4 text-sm transition-colors bg-transparent border border-black rounded-md shadow-sm h-9 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />

      <div class="overflow-x-auto border rounded-lg">
        <Table class="!overflow-auto">
          <TableHeader>
            <TableRow>
              <TableHead>USN</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Certificate Type</TableHead>
              <TableHead>Scan Count</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="student in paginatedStudents" :key="student.usn">
              <TableCell>{{ student.usn }}</TableCell>
              <TableCell>{{ student.firstname }}</TableCell>
              <TableCell>{{ student.code }}</TableCell>
              <TableCell>{{ student.certificate_type }}</TableCell>
              <TableCell>{{ student.total_scans }}</TableCell>
              <TableCell>{{ student.status }}</TableCell>
              <TableCell>
                <div class="relative flex items-center justify-center">
                  <EllipsisVertical
                    class="text-gray-700 transition hover:cursor-pointer hover:text-gray-900"
                    @click="(e) => triggerAction(student.id, e)"
                  />
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="paginatedStudents.length === 0">
              <TableCell colspan="5" class="text-center">
                No certificates found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <transition name="fade-slide">
          <div
            v-if="isActionTrigger !== null"
            class="fixed overflow-hidden h-fit mt-2 flex flex-col border rounded-lg shadow-lg z-50 w-[10rem] bottom-[27%]"
            :style="{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }"
          >
            <Button
              class="items-center justify-between px-2 font-semibold text-black bg-white rounded-none hover:text-white group hover:bg-gray-600 text-start"
              @click="
                () => {
                  viewQR(isActionTrigger);
                  isActionTrigger = null;
                }
              "
            >
              <p>Save QR</p>
              <ScanQrCode class="group-hover:text-white size-4" />
            </Button>
            <Button
              class="items-center justify-between px-2 font-semibold text-black bg-white rounded-none hover:text-white group hover:bg-gray-600 text-start"
              @click="
                () => {
                  viewCertificate(isActionTrigger);
                  isActionTrigger = null;
                }
              "
            >
              <p>Save Certificate</p>
              <ArrowDownToLine class="group-hover:text-white size-4" />
            </Button>
            <Button
              class="items-center justify-between px-2 font-semibold text-black bg-white rounded-none hover:text-white group hover:bg-gray-600 text-start"
              @click="
                () => {
                  editCertificate(isActionTrigger);
                  isActionTrigger = null;
                }
              "
            >
              <p>Edit</p>
              <PenLine class="text-black group-hover:text-white size-4" />
            </Button>

            <Button
              class="items-center justify-between px-2 font-semibold text-white bg-red-500 rounded-none group hover:bg-red-600 text-start"
              @click="
                () => {
                  deleteCertificate(isActionTrigger);
                  isActionTrigger = null;
                }
              "
            >
              <p>Delete</p>
              <Trash2 class="text-white size-4" />
            </Button>
          </div>
        </transition>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-center gap-2 mt-4">
        <Button :disabled="currentPage === 1" @click="setPage(currentPage - 1)">
          Prev
        </Button>
        <Button
          v-for="page in totalPages"
          :key="page"
          :class="{
            'bg-black text-white': currentPage === page,
            'bg-gray-200': currentPage !== page,
          }"
          class="px-3 py-1 rounded"
          @click="setPage(page)"
        >
          {{ page }}
        </Button>
        <Button
          :disabled="currentPage === totalPages"
          @click="setPage(currentPage + 1)"
        >
          Next
        </Button>
      </div>

      <!-- Export Modal -->
      <Dialog v-model:open="showExportModal">
        <DialogContent class="sm:max-w-md">
          <form @submit.prevent="exportCertificates">
            <DialogTitle>Bulk Export Certificates</DialogTitle>
            <DialogDescription class="mb-4">
              Apply filters to export a set of certificates.
            </DialogDescription>

            <div class="mb-4">
              <label class="block mb-1 text-sm font-medium">Course</label>
              <Select v-model="selectedCourse" multiple>
                <SelectTrigger class="max-w-[25rem]">
                  <SelectValue
                    :placeholder="
                      selectedCourse.length
                        ? selectedCourse.join(', ')
                        : 'Select Courses'
                    "
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="course in courseOptions"
                    :key="course.value"
                    :value="course.value"
                  >
                    {{ course.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="mb-4">
              <label class="block mb-1 text-sm font-medium">Status</label>
              <Select v-model="selectedStatus" multiple>
                <SelectTrigger>
                  <SelectValue
                    :placeholder="
                      selectedStatus.length
                        ? selectedStatus.join(', ')
                        : 'Select Statuses'
                    "
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="status in statusOptions"
                    :key="status"
                    :value="status"
                  >
                    {{ status }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div v-if="isExporting" class="mb-4 text-sm text-gray-500">
              Generating certificates...
            </div>

            <DialogFooter>
              <Button
                type="submit"
                class="text-white bg-black hover:bg-gray-700"
              >
                Confirm Export
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <!-- Export Renderer -->
      <CertificateBatchExport
        v-if="exportedCertificates.length"
        :key="exportedCertificates.length"
        :certificates="exportedCertificates"
      />
    </div>
  </NuxtLayout>
</template>
