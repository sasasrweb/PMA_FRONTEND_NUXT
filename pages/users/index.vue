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
import { userService } from "~/components/api/admin/UserService";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

useHead({
  title: 'CMS Users',
  meta: [
    { name: 'description', content: 'CMS Users management (CRUD)' }
  ]
})

const router = useRouter();

const users = ref([]);
const search = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;

const addUser = () => {
  router.push("/admin/users/create");
};

const editUser = (id: number) => {
  router.push(`/admin/users/edit/${id}`);
};

const deleteUser = async (id: number) => {
  console.log("id", id);
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      await userService.deleteUser(id);
      Swal.fire("Deleted!", "The user has been deleted.", "success");
      fetchUsers(); // refresh list
    } catch (error) {
      Swal.fire("Error", "Failed to delete user.", "error");
    }
  }
};

const fetchUsers = async () => {
  try {
    const response = await userService.getUsers();
    users.value = response.data || [];
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }
};

const filteredUsers = computed(() => {
  const term = search.value.toLowerCase();
  return users.value.filter((user: any) =>
    user.email.toLowerCase().includes(term)
  );
});

const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / itemsPerPage)
);

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredUsers.value.slice(start, start + itemsPerPage);
});

const setPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

onMounted(fetchUsers);
</script>

<template>
  <NuxtLayout name="admin">
    <div>
      <h1 class="mb-4 text-xl font-semibold">Users</h1>

      <div class="flex justify-between mb-4">
        <Button
          @click="addUser"
          class="p-3 text-white bg-black rounded-lg hover:bg-gray-800"
        >
          Add User
        </Button>
      </div>

      <div class="mb-4">
        <Input
          v-model="search"
          placeholder="Search by email..."
          class="w-1/2 border-black"
        />
      </div>

      <div class="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-for="user in paginatedUsers" :key="user.id">
              <TableCell>{{ user.email }}</TableCell>
              <TableCell>{{ user.status }}</TableCell>
              <TableCell>
                <div class="flex space-x-2">
                  <Button
                    class="p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                    @click="editUser(user.id)"
                  >
                    Edit
                  </Button>
                  <Button
                    class="p-2 text-white bg-red-500 rounded hover:bg-red-600"
                    @click="deleteUser(user.id)"
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            <TableRow v-if="paginatedUsers.length === 0">
              <TableCell colspan="3" class="text-center"
                >No users found.</TableCell
              >
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination controls -->
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
