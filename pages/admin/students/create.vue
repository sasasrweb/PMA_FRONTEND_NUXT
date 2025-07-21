<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
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
import { useRouter } from "vue-router";

const router = useRouter();

// --- STATE MANAGEMENT ---
// Updated form state to handle multiple courses
const form = ref({
  usn: "",
  firstname: "",
  middlename: "",
  lastname: "",
  contact_number: "",
  courses: [] as string[], // Changed 'course' to 'courses' and initialized as an array
  status: "active",
  address: "",
  email: "",
});

const courses = ref<{ id: string; description: string }[]>([]);
const students = ref<any[]>([]);
const search = ref("");
const selectedCourse = ref(""); // To hold the currently selected course before adding

// --- API CALLS ---
/**
 * Fetches the list of available courses from the service.
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
 * Fetches the list of all students.
 */
const fetchStudents = async () => {
  try {
    const response = await studentService.getStudents();
    students.value = response.data;
  } catch (error) {
    console.error("Failed to fetch students", error);
    Swal.fire("Error", "Failed to load students", "error");
  }
};

// --- FORM LOGIC ---
/**
 * Populates the form with data from an existing student.
 * @param {any} student - The student object to populate the form with.
 */
const populateForm = (student: any) => {
  console.log(student.studentDetails.usn);
  form.value = {
    usn: student.studentDetails.usn || "",
    firstname: student.studentDetails.firstname || "",
    middlename: student.studentDetails.middlename || "",
    lastname: student.studentDetails.lastname || "",
    contact_number: student.studentDetails.contact_number || "",
    courses: student.studentDetails.course_ids || [], // Assuming the student object has an array of course IDs
    status: student.studentDetails.status || "active",
    address: student.studentDetails.address || "",
    email: student.studentDetails.email || "",
  };
};

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
 * Validates and submits the form data to create a new student.
 */
const submitForm = async () => {
  if (
    !form.value.firstname ||
    !form.value.lastname ||
    form.value.courses.length === 0 || // Ensure at least one course is selected
    !form.value.usn
  ) {
    Swal.fire(
      "Validation Error",
      "Please fill in all required fields and select at least one course.",
      "warning"
    );
    return;
  }

  try {
    // The payload now sends an array of course_ids
    const payload = { ...form.value, course_ids: form.value.courses };
    // We don't need the 'courses' property in the final payload
    delete (payload as any).courses;

    await studentService.createStudent(payload);
    Swal.fire("Success", "Student has been added successfully!", "success");

    // Reset form to its initial state
    form.value = {
      usn: "",
      firstname: "",
      middlename: "",
      lastname: "",
      contact_number: "",
      courses: [],
      status: "active",
      address: "",
      email: "",
    };

    await fetchStudents();

    router.push("/admin/students");
  } catch (error: any) {
    console.error("Failed to add student", error);
    Swal.fire(
      "Error",
      error.response?.data?.message || "Failed to add student",
      "error"
    );
  }
};

// --- COMPUTED PROPERTIES ---
/**
 * Filters the list of students based on the search keyword.
 */
const filteredStudents = computed(() => {
  const keyword = search.value.toLowerCase();
  return students.value.filter((student: any) => {
    const s = student.studentDetails;
    const studentCourses = student.courses || []; // Assuming student object has a 'courses' array with description
    return (
      s.usn?.toString().includes(keyword) ||
      s.firstname?.toLowerCase().includes(keyword) ||
      s.lastname?.toLowerCase().includes(keyword) ||
      s.middlename?.toLowerCase().includes(keyword) ||
      studentCourses.some((c: any) =>
        c.description?.toLowerCase().includes(keyword)
      )
    );
  });
});

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
onMounted(() => {
  fetchCourses();
  fetchStudents();
});
</script>

<template>
  <NuxtLayout name="admin">
    <div class="w-full">
      <!-- Right side: Form -->
      <form
        @submit.prevent="submitForm"
        class="flex flex-col w-auto col-span-3 space-y-4"
      >
        <h1 class="mb-4 text-2xl font-semibold">Add Student</h1>

        <!-- USN Input -->
        <div>
          <label for="usn" class="block mb-1 font-semibold">USN *</label>
          <Input
            v-model="form.usn"
            id="usn"
            type="number"
            required
            placeholder="Enter USN"
          />
        </div>

        <!-- Name Inputs -->
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

        <!-- Contact and Address -->
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

        <!-- Course Selection -->
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

        <!-- Selected Courses Display -->
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

        <!-- Status Selection -->
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

        <!-- Submit Button -->
        <button
          type="submit"
          class="px-4 py-2 text-white bg-black rounded hover:bg-gray-800"
        >
          Add Student
        </button>
      </form>
    </div>
  </NuxtLayout>
</template>
