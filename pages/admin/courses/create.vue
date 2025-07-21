<script setup lang="ts">
import { ref } from "vue";
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
import { useRouter } from "vue-router";

const router = useRouter();

// Form data
const form = ref({
  course_code: "",
  course_name: "",
  description: "",
  units: null as number | null,
  days: "",
  hours: "",
  status: "active",
});

// Form submit handler
const submitForm = async () => {
  // const filledFields = [
  //   form.value.units !== null && form.value.units !== 0,
  //   form.value.days.trim() !== "",
  //   form.value.hours.trim() !== "",
  // ];

  if (!form.value.description.trim()) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please fill in all required fields!",
    });
    return;
  }

  //const filledCount = filledFields.filter(Boolean).length;
  const isAnyFilled =
    (form.value.units !== null && form.value.units !== 0) ||
    form.value.days.trim() !== "" ||
    form.value.hours.trim() !== "";

  if (!form.value.description.trim()) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please fill in all required fields!",
    });
    return;
  }

  // if (filledCount !== 1) {
  //   Swal.fire({
  //     icon: "error",
  //     title: "Invalid Input",
  //     text: "Only one of Units, Days, or Hours should be filled.",
  //   });
  //   return;
  // }

  if (!isAnyFilled) {
    Swal.fire({
      icon: "error",
      title: "Invalid Input",
      text: "Please fill in at least one of Units, Days, or Hours.",
    });
    return;
  }

  try {
    console.log("Submitting course:", form.value);
    const response = await courseService.createCourse(form.value);

    console.log("Response from API:", response);

    if (
      response.status === 200 ||
      response.status === "success" ||
      !response.status
    ) {
      Swal.fire({
        icon: "success",
        title: "Course created successfully!",
        showConfirmButton: false,
        timer: 1500,
      });

      form.value = {
        course_code: "",
        course_name: "",
        description: "",
        units: null,
        days: "",
        hours: "",
        status: "active",
      };

      router.push("/admin/courses");
    } else {
      Swal.fire({
        icon: "error",
        title: "Error creating course",
        text:
          response.data?.message ||
          "An error occurred while creating the course.",
      });
    }
  } catch (error: any) {
    console.error("API error:", error);

    Swal.fire({
      icon: "error",
      title: "Request failed",
      text: error?.message || "An unexpected error occurred.",
    });
  }
};
</script>

<template>
  <NuxtLayout name="admin">
    <form @submit.prevent="submitForm" class="flex flex-col p-6 space-y-4">
      <h1 class="mb-4 text-2xl font-semibold">Add Course</h1>

      <!-- <div>
        <label for="course_code" class="block mb-1 font-semibold"
          >Course Code *</label
        >
        <Input
          v-model="form.course_code"
          id="course_code"
          type="text"
          required
          placeholder="Enter course code"
        />
      </div> -->

      <!-- <div>
        <label for="course_name" class="block mb-1 font-semibold"
          >Course Name *</label
        >
        <Input
          v-model="form.course_name"
          id="course_name"
          type="text"
          required
          placeholder="Enter course name"
        />
      </div> -->

      <div>
        <label for="description" class="block mb-1 font-semibold"
          >Course Code</label
        >
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
          type="number"
          placeholder="Enter days"
        />
      </div>

      <div>
        <label for="hours" class="block mb-1 font-semibold">Hours</label>
        <Input
          v-model="form.hours"
          id="hours"
          type="number"
          placeholder="Enter hours"
        />
      </div>

      <!-- <div>
        <label for="status" class="block mb-1 font-semibold">Status</label>
        <Select v-model="form.status" id="status">
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div> -->

      <button
        type="submit"
        class="px-4 py-2 text-white bg-black rounded hover:bg-gray-800"
      >
        Add Course
      </button>
    </form>
  </NuxtLayout>
</template>
