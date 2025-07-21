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
import { studentService } from "~/components/api/admin/StudentService";

const route = useRoute();
const router = useRouter();
const studentId = route.params.id as string;

// --- STATE MANAGEMENT ---
// Updated form state to handle multiple courses
const form = ref({
  usn: "",
  firstname: "",
  middlename: "",
  lastname: "",
  contact_number: "",
  courses: [] as string[], // Changed to handle multiple courses
  status: "active",
  address: "",
  email: "",
});

const courses = ref<{ id: string; description: string }[]>([]);
const selectedCourse = ref(""); // To hold the currently selected course before adding

// --- API CALLS ---
/**
 * Fetches the list of available courses from the API.
 */
const fetchCourses = async () => {
  try {
    const response = await courseService.getCourses();
    courses.value = response.data;
  } catch (error) {
    console.error("Failed to fetch courses", error);
    Swal.fire("Error", "Failed to load courses", "error");
  }
};

/**
 * Fetches the details of the student to be edited.
 */
const fetchStudent = async () => {
  try {
    const response = await studentService.getStudent(studentId);
    const student = response.data;

    // Populate the form with existing student data
    form.value = {
      usn: student.student_details.usn || "",
      firstname: student.student_details.firstname || "",
      middlename: student.student_details.middlename || "",
      lastname: student.student_details.lastname || "",
      contact_number: student.student_details.contact_number || "",
      courses: student.course_channels?.map((c: any) => c.course_id) || [],
      status: student.student_details.status || "active",
      address: student.student_details.address || "",
      email: student.student_details.email || "",
    };
  } catch (error) {
    console.error("Failed to load student", error);
    Swal.fire("Error", "Failed to load student data", "error");
  }
};

// --- FORM LOGIC ---
/**
 * Adds the currently selected course to the form's courses array.
 */
const addCourse = () => {
  if (
    selectedCourse.value &&
    !form.value.courses.includes(selectedCourse.value)
  ) {
    form.value.courses.push(selectedCourse.value);
    selectedCourse.value = ""; // Reset the select input
  }
};

/**
 * Removes a course from the form's courses array.
 * @param {string} courseId - The ID of the course to remove.
 */
const removeCourse = (courseId: string) => {
  form.value.courses = form.value.courses.filter((id) => id !== courseId);
};

/**
 * Validates and submits the form data to update the student.
 */
const submitForm = async () => {
  if (!form.value.firstname || !form.value.lastname) {
    Swal.fire(
      "Validation Error",
      "Please fill in all required fields and select at least one course.",
      "warning"
    );
    return;
  }

  try {
    const payload = { ...form.value, course_ids: form.value.courses };
    delete (payload as any).courses;

    await studentService.updateStudent(studentId, payload);
    Swal.fire("Success", "Student has been updated successfully!", "success");
    router.push("/admin/students");
  } catch (error: any) {
    console.error("Failed to update student", error);
    Swal.fire(
      "Error",
      error.response?.data?.message || "Failed to update student",
      "error"
    );
  }
};

/**
 * Gets the description for a given course ID.
 * @param {string} courseId - The ID of the course.
 * @returns {string} The description of the course.
 */
const getCourseDescription = (courseId: string) => {
  const course = courses.value.find((c) => c.id === courseId);
  return course ? course.description : "Unknown Course";
};

// --- LIFECYCLE HOOKS ---
onMounted(async () => {
  await fetchCourses();
  await fetchStudent();
});
</script>

<template>
  <NuxtLayout name="admin">
    <form @submit.prevent="submitForm" class="flex flex-col p-6 space-y-4">
      <h1 class="mb-4 text-2xl font-semibold">Edit Student</h1>

      <div>
        <label class="block mb-1 font-semibold">USN *</label>
        <p class="px-3 py-2 text-gray-700 bg-gray-100 border rounded-md">
          {{ form.usn }}
        </p>
      </div>

      <div>
        <label for="firstname" class="block mb-1 font-semibold"
          >First Name *</label
        >
        <Input
          v-model="form.firstname"
          id="firstname"
          type="text"
          required
          placeholder="Enter first name"
        />
      </div>

      <div>
        <label for="middlename" class="block mb-1 font-semibold"
          >Middle Name</label
        >
        <Input
          v-model="form.middlename"
          id="middlename"
          type="text"
          placeholder="Enter middle name"
        />
      </div>

      <div>
        <label for="lastname" class="block mb-1 font-semibold"
          >Last Name *</label
        >
        <Input
          v-model="form.lastname"
          id="lastname"
          type="text"
          required
          placeholder="Enter last name"
        />
      </div>

      <div>
        <label for="contact_number" class="block mb-1 font-semibold"
          >Contact Number</label
        >
        <Input
          v-model="form.contact_number"
          id="contact_number"
          type="number"
          placeholder="Enter contact number"
        />
      </div>

      <div>
        <label for="address" class="block mb-1 font-semibold">Address</label>
        <Input
          v-model="form.address"
          id="address"
          type="text"
          placeholder="Enter address"
        />
      </div>

      <div>
        <label for="course" class="block mb-1 font-semibold">Course *</label>
        <div class="flex items-center space-x-2">
          <Select v-model="selectedCourse">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select a course to add" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="course in courses"
                :key="course.id"
                :value="course.id"
              >
                {{ course.description }}
              </SelectItem>
            </SelectContent>
          </Select>
          <button
            @click.prevent="addCourse"
            type="button"
            class="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 whitespace-nowrap"
          >
            Add Course
          </button>
        </div>
      </div>

      <div v-if="form.courses.length > 0" class="p-2 border rounded-md">
        <h3 class="mb-2 font-semibold">Selected Courses:</h3>
        <ul class="space-y-1">
          <li
            v-for="courseId in form.courses"
            :key="courseId"
            class="flex items-center justify-between p-2 bg-gray-100 rounded-md"
          >
            <span>{{ getCourseDescription(courseId) }}</span>
            <button
              @click.prevent="removeCourse(courseId)"
              class="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </li>
        </ul>
      </div>

      <div>
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
      </div>

      <button
        type="submit"
        class="px-4 py-2 text-white bg-black rounded hover:bg-gray-800"
      >
        Update Student
      </button>
    </form>
  </NuxtLayout>
</template>
