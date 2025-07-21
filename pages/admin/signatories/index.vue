<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
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
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import { signatoryService } from "~/components/api/admin/SignatoryService";

useHead({
  title: 'CMS Signatories',
  meta: [
    { name: 'description', content: 'CMS - Signatories management (CRUD)' }
  ]
})

const router = useRouter();
const signatories = ref([]);
const search = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;

const fetchSignatories = async () => {
  try {
    const response = await signatoryService.getSignatories();
    console.log(response);
    signatories.value = response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch signatories:", error);
    Swal.fire("Error", "Failed to load signatory data.", "error");
  }
};

const goToAddSignatory = () => {
  router.push("/admin/signatories/create");
};

const editSignatory = (signatoryId: number) => {
  router.push(`/admin/signatories/edit/${signatoryId}`);
};

const deleteSignatory = async (signatoryId: number) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      await signatoryService.deleteSignatory(signatoryId);
      Swal.fire("Deleted!", "The signatory has been deleted.", "success");
      fetchSignatories();
    } catch (error) {
      console.error("Failed to delete signatory:", error);
      Swal.fire("Error", "Failed to delete signatory.", "error");
    }
  }
};

const filteredSignatories = computed(() => {
  const term = search.value.toLowerCase();
  return signatories.value.filter((signatory: any) => {
    return (
      signatory?.description?.toLowerCase().includes(term) ||
      signatory?.position?.toLowerCase().includes(term)
    );
  });
});

const totalPages = computed(() =>
  Math.ceil(filteredSignatories.value.length / itemsPerPage)
);

const paginatedSignatories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredSignatories.value.slice(start, start + itemsPerPage);
});

const setPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

onMounted(() => {
  fetchSignatories();
});
</script>

<template>
  <NuxtLayout name="admin">
    <div>
      <h1 class="mb-4 text-xl font-semibold">Signatories</h1>

      <div class="flex flex-col gap-2 mb-2">
        <div>
          <Button
            @click="goToAddSignatory"
            class="text-white bg-black rounded-lg hover:bg-gray-800"
          >
            Add Signatory
          </Button>
        </div>
        <div class="flex">
          <Input
            v-model="search"
            placeholder="Search by name or email..."
            class="w-1/2 border-black"
          />
        </div>
      </div>

      <div class="overflow-auto border rounded-lg">
        <Table class="min-w-full text-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Signature</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="signatory in paginatedSignatories"
              :key="signatory.id"
            >
              <TableCell>{{ signatory.description }}</TableCell>
              <TableCell>{{ signatory.position }}</TableCell>
              <TableCell
                ><div class="flex">
                  <img
                    v-if="signatory?.signature_image"
                    :src="signatory.signature_image"
                    alt="Signature"
                    class="h-24"
                  /></div
              ></TableCell>

              <TableCell>
                <div class="flex space-x-2">
                  <Button
                    class="text-white bg-blue-500 hover:bg-blue-600"
                    @click="editSignatory(signatory.id)"
                  >
                    Edit
                  </Button>
                  <Button
                    class="text-white bg-red-500 hover:bg-red-600"
                    @click="deleteSignatory(signatory.id)"
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="paginatedSignatories.length === 0">
              <TableCell colspan="4" class="text-center">
                No signatories found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div class="flex items-center justify-center mt-4 space-x-2">
        <Button :disabled="currentPage === 1" @click="setPage(currentPage - 1)">
          Previous
        </Button>
        <template v-for="page in totalPages" :key="page">
          <Button
            @click="setPage(page)"
            :variant="page === currentPage ? 'default' : 'outline'"
          >
            {{ page }}
          </Button>
        </template>
        <Button
          :disabled="currentPage === totalPages"
          @click="setPage(currentPage + 1)"
        >
          Next
        </Button>
      </div>
    </div>
  </NuxtLayout>
</template>
