<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import { Input } from "~~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~~/components/ui/select";

import { courseService } from "~/components/api/admin/CourseService";

// Route & Router
const route = useRoute();
const router = useRouter();
const courseId = route.params.id;

// Form data
const form = ref({
  course_code: "",
  course_name: "",
  description: "",
  units: null as number | null,
  days: null as number | null,
  hours: null as number | null,
  status: "active",
});

// Load existing course data
const loadCourse = async () => {
  try {
    const response = await courseService.getCourse(courseId);
    if (response.status === 200 || response.status === "success") {
      Object.assign(form.value, response.data);
    } else {
      throw new Error(response.data?.message || "Failed to fetch course.");
    }
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Unable to load course data.",
    });
    router.push("/admin/courses");
  }
};

onMounted(() => {
  loadCourse();
});

// Submit form for update
const submitForm = async () => {
  // Ensure description is not empty
  if (!form.value.description.trim()) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Description is required.",
    });
    return;
  }

  // Check that at least one of the optional fields is filled
  const hasValidUnits = form.value.units !== null && form.value.units !== 0;
  const hasValidDays =
    form.value.days !== null &&
    String(form.value.days).trim() !== "" &&
    String(form.value.days).toLowerCase() !== "0";
  const hasValidHours =
    form.value.hours !== null &&
    String(form.value.hours).trim() !== "" &&
    String(form.value.hours).toLowerCase() !== "0";

  if (!hasValidUnits && !hasValidDays && !hasValidHours) {
    Swal.fire({
      icon: "error",
      title: "Missing Input",
      text: "Please fill at least one of Units, Days, or Hours.",
    });
    return;
  }

  try {
    const response = await courseService.updateCourse(courseId, form.value);
    console.log("Response from API:", response);
    if (response.status === 200 || response.status === "success") {
      Swal.fire({
        icon: "success",
        title: "Course updated successfully!",
        showConfirmButton: false,
        timer: 1500,
      });
      router.push("/admin/courses");
    } else {
      throw new Error(response.data?.message || "Update failed.");
    }
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: "Request failed",
      text: error.message || "An unexpected error occurred.",
    });
  }
};
</script>

<template>
  <NuxtLayout name="admin">
    <form @submit.prevent="submitForm" class="flex flex-col p-6 space-y-4">
      <h1 class="mb-4 text-2xl font-semibold">Edit Course</h1>

      <div>
        <label for="description" class="block mb-1 font-semibold">
          Course Code
        </label>
        <Input
          v-model="form.description"
          id="description"
          type="text"
          placeholder="Enter description"
        />
      </div>

      <div>
        <label for="units" class="block mb-1 font-semibold">Units</label>
        <Input
          v-model.number="form.units"
          id="units"
          type="number"
          min="0"
          placeholder="Enter units"
        />
      </div>

      <div>
        <label for="days" class="block mb-1 font-semibold">Days</label>
        <Input
          v-model="form.days"
          id="days"
          type="text"
          placeholder="Enter days"
        />
      </div>

      <div>
        <label for="hours" class="block mb-1 font-semibold">Hours</label>
        <Input
          v-model="form.hours"
          id="hours"
          type="text"
          placeholder="Enter hours"
        />
      </div>

      <button
        type="submit"
        class="px-4 py-2 text-white bg-black rounded hover:bg-gray-800"
      >
        Update Course
      </button>
    </form>
  </NuxtLayout>
</template>
