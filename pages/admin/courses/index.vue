<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

// UI Components
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

import { courseService } from "~/components/api/admin/CourseService";

useHead({
  title: 'CMS Courses',
  meta: [
    { name: 'description', content: 'CMS - Courses management (CRUD)' }
  ]
})

const router = useRouter();
const allCourses = ref<any[]>([]);
const paginatedCourses = ref<any[]>([]);
const searchQuery = ref("");

const currentPage = ref(1);
const perPage = 10;

// Computed to filter by search query
const filteredCourses = computed(() => {
  const query = searchQuery.value.toLowerCase();
  if (!query) return allCourses.value;

  return allCourses.value.filter((course) => {
    return (
      course.description?.toLowerCase().includes(query) ||
      String(course.hours).toLowerCase().includes(query) ||
      String(course.days).toLowerCase().includes(query) ||
      String(course.units).toLowerCase().includes(query)
    );
  });
});

const totalPages = computed(() =>
  Math.ceil(filteredCourses.value.length / perPage)
);

const paginate = () => {
  const start = (currentPage.value - 1) * perPage;
  const end = start + perPage;
  paginatedCourses.value = filteredCourses.value.slice(start, end);
};

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    paginate();
  }
};

const fetchCourses = async () => {
  try {
    const response = await courseService.getCourses();
    allCourses.value = response.data;
    currentPage.value = 1;
    paginate();
  } catch (error) {
    console.error("Failed to fetch courses:", error);
  }
};

const goToAddCourse = () => {
  router.push("/admin/courses/create");
};

const edit = (id: number) => {
  router.push(`/admin/courses/edit/${id}`);
};

const deleteCourse = async (id: number) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (confirm.isConfirmed) {
    try {
      const response = await courseService.deleteCourse(id);
      if (response.status === 200 || response.status === "success") {
        Swal.fire("Deleted!", "Course has been deleted.", "success");
        await fetchCourses();
      } else {
        throw new Error(response.data?.message || "Deletion failed.");
      }
    } catch (error: any) {
      Swal.fire("Error", error.message || "Could not delete course.", "error");
    }
  }
};

onMounted(fetchCourses);

watch(searchQuery, () => {
  currentPage.value = 1;
  paginate();
});

watch(currentPage, () => {
  paginate();
});
</script>

<template>
  <NuxtLayout name="admin">
    <div>
      <h1 class="mb-4 text-xl font-semibold">Courses</h1>

      <div class="mb-4 flex justify-between items-center">
        <Button
          class="p-3 text-white bg-black rounded-lg hover:bg-gray-800"
          @click="goToAddCourse"
        >
          Add Course
        </Button>
        <Input
          v-model="searchQuery"
          placeholder="Search..."
          class="w-1/2 border-black"
        />
      </div>

      <div class="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-for="course in paginatedCourses" :key="course.id">
              <TableCell>{{ course.description }}</TableCell>
              <TableCell>{{ course.hours }}</TableCell>
              <TableCell>{{ course.days }}</TableCell>
              <TableCell>{{ course.units }}</TableCell>
              <TableCell>
                <div class="flex space-x-2">
                  <Button
                    class="p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                    @click="edit(course.id)"
                  >
                    Edit
                  </Button>
                  <Button
                    class="p-2 text-white bg-red-500 rounded hover:bg-red-600"
                    @click="deleteCourse(course.id)"
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="paginatedCourses.length === 0">
              <TableCell colspan="5" class="text-center">
                No courses found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div class="flex justify-center mt-6 space-x-2">
        <Button
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          Previous
        </Button>

        <Button
          v-for="page in totalPages"
          :key="page"
          :variant="page === currentPage ? 'default' : 'outline'"
          @click="changePage(page)"
        >
          {{ page }}
        </Button>

        <Button
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          Next
        </Button>
      </div>
    </div>
  </NuxtLayout>
</template>
