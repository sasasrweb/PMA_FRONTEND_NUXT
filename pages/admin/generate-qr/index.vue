<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import { qrService } from "~/components/api/admin/QrService";

useHead({
  title: "CMS Generate QR Codes",
  meta: [{ name: "description", content: "CMS - Generate QR Codes" }],
});

const router = useRouter();

const qrs = ref<any[]>([]);
const currentPage = ref(1);
const pageSize = 5;
const searchQuery = ref("");

const GenerateQRCode = () => {
  router.push("/admin/generate-qr/create");
};

const fetchQRCode = async () => {
  const response = await qrService.getQRs();
  if (response.status === 200) {
    // Filter out entries without file_base64
    qrs.value = response.data.filter((qr: any) => qr.file_base64);
  } else {
    console.error("Failed to fetch QR codes:", response);
  }
};

onMounted(fetchQRCode);

const filteredQRs = computed(() => {
  if (!searchQuery.value) return qrs.value;

  return qrs.value.filter((qr) =>
    qr.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const totalPages = computed(() =>
  Math.ceil(filteredQRs.value.length / pageSize)
);

const paginatedQRs = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredQRs.value.slice(start, start + pageSize);
});

const setPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const windowPages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const windowSize = 3;
  const start = Math.max(1, current - Math.floor(windowSize / 2));
  const end = Math.min(total, start + windowSize - 1);
  const pages = [];

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const deleteQRCode = async (id: number) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e3342f",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      const response = await qrService.deleteQR(id);
      if (response.status === 200 || response.status === 204) {
        Swal.fire("Deleted!", "QR Code has been deleted.", "success");
        fetchQRCode();
      } else {
        Swal.fire("Failed", "Unable to delete QR Code.", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire("Error", "An error occurred while deleting.", "error");
    }
  }
};

const downloadQRImage = (qr: any) => {
  if (!qr.file_base64) return;

  const link = document.createElement("a");
  link.href = qr.file_base64;
  link.download = `qr-${qr.description}.png`;
  link.click();
};
</script>

<template>
  <NuxtLayout name="admin">
    <div>
      <h1 class="mb-4 text-xl font-semibold">QR Management</h1>

      <div
        class="grid grid-cols-1 sm:flex-row sm:items-center sm:justify-between gap-4 mb-4"
      >
        <Button
          class="p-3 text-white bg-black rounded-lg hover:bg-gray-800 w-[10%]"
          @click="GenerateQRCode"
        >
          Generate QR Code
        </Button>

        <Input
          v-model="searchQuery"
          placeholder="Search description..."
          class="w-full sm:w-1/2 border-black"
        />
      </div>

      <div class="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-for="qr in paginatedQRs" :key="qr.id">
              <TableCell>{{ qr.description }}</TableCell>
              <TableCell>
                <img
                  :src="qr.file_base64"
                  alt="QR Code"
                  class="w-20 h-20 object-contain border rounded"
                />
              </TableCell>
              <TableCell>
                <div class="flex space-x-2">
                  <Button
                    class="p-2 text-white bg-indigo-500 rounded hover:bg-indigo-600"
                    @click="downloadQRImage(qr)"
                  >
                    Download
                  </Button>
                  <Button
                    class="p-2 text-white bg-red-500 rounded hover:bg-red-600"
                    @click="deleteQRCode(qr.id)"
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination -->
      <div
        class="flex items-center justify-center mt-6 gap-2 flex-wrap text-sm font-medium"
      >
        <Button
          :disabled="currentPage === 1"
          @click="setPage(currentPage - 1)"
          variant="outline"
        >
          Previous
        </Button>

        <template v-if="windowPages[0] > 1">
          <Button @click="setPage(1)" variant="outline">1</Button>
          <span class="text-gray-500">…</span>
        </template>

        <template v-for="page in windowPages" :key="page">
          <Button
            @click="setPage(page)"
            :variant="currentPage === page ? 'default' : 'outline'"
          >
            {{ page }}
          </Button>
        </template>

        <template v-if="windowPages[windowPages.length - 1] < totalPages">
          <span class="text-gray-500">…</span>
          <Button
            @click="setPage(totalPages)"
            :variant="currentPage === totalPages ? 'default' : 'outline'"
          >
            {{ totalPages }}
          </Button>
        </template>

        <Button
          :disabled="currentPage === totalPages"
          @click="setPage(currentPage + 1)"
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  </NuxtLayout>
</template>
