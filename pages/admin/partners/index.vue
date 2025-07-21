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
import { useRouter } from "vue-router";
import { partnerService } from "~/components/api/admin/PartnerService";
import Swal from "sweetalert2";

useHead({
  title: 'CMS Partners',
  meta: [
    { name: 'description', content: 'CMS - Partners management (CRUD)' }
  ]
})

const router = useRouter();
const partners = ref([]);
const search = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;

const fetchPartners = async () => {
  try {
    const response = await partnerService.getPartners();
    console.log(response);
    partners.value = response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch partners:", error);
    Swal.fire("Error", "Failed to load partner data.", "error");
  }
};

const goToAddPartner = () => {
  router.push("/admin/partners/create");
};

const editPartner = (partnerId: number) => {
  router.push(`/admin/partners/edit/${partnerId}`);
};

const deletePartner = async (partnerId: number) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      await partnerService.deletePartner(partnerId); // ✅ Already using it here
      Swal.fire("Deleted!", "The partner has been deleted.", "success");
      fetchPartners(); // Refresh list
    } catch (error) {
      console.error("Failed to delete partner:", error);
      Swal.fire("Error", "Failed to delete partner.", "error");
    }
  }
};

const filteredPartners = computed(() => {
  const term = search.value.toLowerCase();
  return partners.value.filter((partner: any) =>
    partner.description?.toLowerCase().includes(term)
  );
});

const totalPages = computed(() =>
  Math.ceil(filteredPartners.value.length / itemsPerPage)
);

const paginatedPartners = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredPartners.value.slice(start, start + itemsPerPage);
});

const setPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

onMounted(() => {
  fetchPartners();
});
</script>

<template>
  <NuxtLayout name="admin">
    <div>
      <h1 class="mb-4 text-xl font-semibold">Partners</h1>
      <div class="flex justify-between mb-4">
        <Button
          @click="goToAddPartner"
          class="text-white bg-black rounded-lg hover:bg-gray-800"
        >
          Add Partner
        </Button>
      </div>

      <div class="mb-4">
        <Input
          v-model="search"
          placeholder="Search by Partner Name..."
          class="w-1/2 border-black"
        />
      </div>

      <div class="overflow-auto border rounded-lg">
        <Table class="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="partner in paginatedPartners" :key="partner.id">
              <TableCell>{{ partner.description }}</TableCell>
              <TableCell>
                <img
                  v-if="partner.logo_image"
                  :src="partner.logo_image"
                  alt="Logo"
                  class="h-16 w-auto object-contain border rounded"
                />
              </TableCell>
              <TableCell>
                <div class="flex space-x-2">
                  <Button
                    class="text-white bg-blue-500 hover:bg-blue-600"
                    @click="editPartner(partner.id)"
                  >
                    Edit
                  </Button>
                  <Button
                    class="text-white bg-red-500 hover:bg-red-600"
                    @click="deletePartner(partner.id)"
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="paginatedPartners.length === 0">
              <TableCell colspan="4" class="text-center">
                No partners found.
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
