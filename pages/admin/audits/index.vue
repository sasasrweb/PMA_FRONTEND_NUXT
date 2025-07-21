<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
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
import { auditService } from "~/components/api/admin/AuditService";

useHead({
  title: "CMS Audits",
  meta: [{ name: "description", content: "CMS - Audits" }],
});

const audits = ref([]);
const search = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;

const fetchAudits = async () => {
  try {
    const response = await auditService.getAudits();
    audits.value = response.data || response;
  } catch (error) {
    console.error("Failed to fetch audits:", error);
  }
};

const filteredAudits = computed(() => {
  const term = search.value.toLowerCase();
  return audits.value.filter(
    (audit: any) =>
      audit.description.toLowerCase().includes(term) ||
      (audit.user_id + "").includes(term)
  );
});

const totalPages = computed(() =>
  Math.ceil(filteredAudits.value.length / itemsPerPage)
);

const paginatedAudits = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredAudits.value.slice(start, start + itemsPerPage);
});

const setPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const windowPages = computed(() => {
  const pages = [];
  if (totalPages.value <= 3) {
    // If total pages 3 or fewer, show all
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage.value <= 2) {
      pages.push(1, 2, 3);
    } else if (currentPage.value >= totalPages.value - 1) {
      pages.push(totalPages.value - 2, totalPages.value - 1, totalPages.value);
    } else {
      pages.push(
        currentPage.value - 1,
        currentPage.value,
        currentPage.value + 1
      );
    }
  }
  return pages;
});

onMounted(fetchAudits);
</script>

<template>
  <NuxtLayout name="admin">
    <div>
      <h1 class="mb-4 text-xl font-semibold">Audit Logs</h1>

      <div class="mb-4">
        <Input
          v-model="search"
          placeholder="Search by description or user ID..."
          class="w-1/2 border-black"
        />
      </div>

      <div class="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Username</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-for="audit in paginatedAudits" :key="audit.id">
              <TableCell>{{ audit.description }}</TableCell>
              <TableCell>{{
                audit.users ? audit.users.name : "Unknown User"
              }}</TableCell>
            </TableRow>

            <TableRow v-if="paginatedAudits.length === 0">
              <TableCell colspan="2" class="text-center">
                No audit logs found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-center mt-4 space-x-2">
        <Button :disabled="currentPage === 1" @click="setPage(currentPage - 1)">
          Previous
        </Button>

        <template v-if="windowPages[0] > 1">
          <Button
            @click="setPage(1)"
            :variant="currentPage === 1 ? 'default' : 'outline'"
            >1</Button
          >
          <span class="text-sm text-gray-500">..</span>
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
          <span class="text-sm text-gray-500">..</span>
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
        >
          Next
        </Button>
      </div>
    </div>
  </NuxtLayout>
</template>
