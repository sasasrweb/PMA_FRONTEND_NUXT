<template>
  <NuxtLayout name="admin">
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-6 text-gray-800">Student Course View</h1>

      <!-- Student Info -->
      <div
        v-if="student"
        class="bg-white shadow rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700"
      >
        <div><span class="font-semibold">USN:</span> {{ student?.usn }}</div>
        <div>
          <span class="font-semibold">First Name:</span>
          {{ student?.firstname }}
        </div>
        <div>
          <span class="font-semibold">Middle Name:</span>
          {{ student?.middlename }}
        </div>
        <div>
          <span class="font-semibold">Last Name:</span> {{ student?.lastname }}
        </div>
        <div>
          <span class="font-semibold">Status:</span> {{ student?.status }}
        </div>
        <div>
          <span class="font-semibold">Contact Number:</span>
          {{ student?.contact_number ?? "No Contact Number" }}
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Course Table -->
        <div class="bg-white shadow rounded-xl p-4 overflow-auto max-h-[70vh]">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">
            Enrolled Courses
          </h2>
          <table class="w-full text-sm text-left border border-gray-200">
            <thead class="bg-gray-100 text-gray-600">
              <tr>
                <th class="border-b px-4 py-2">Course</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in courses"
                :key="item.id"
                @click="selectedCourse = item"
                :class="[
                  'cursor-pointer hover:bg-blue-50 transition',
                  selectedCourse?.id === item.id ? 'bg-blue-100' : '',
                ]"
              >
                <td class="border-b px-4 py-2">{{ item.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Selected Course Details -->
        <div class="bg-white shadow rounded-xl p-4 overflow-auto max-h-[70vh]">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">
            Course Details
          </h2>
          <div v-if="selectedCourse" class="space-y-2 text-gray-700">
            <p>
              <span class="font-semibold">Units:</span>
              {{ selectedCourse.units }}
            </p>
            <p>
              <span class="font-semibold">Hours:</span>
              {{ selectedCourse.hours }}
            </p>
            <p>
              <span class="font-semibold">Days:</span> {{ selectedCourse.days }}
            </p>
            <p>
              <span class="font-semibold">Description:</span>
              {{ selectedCourse.description || "N/A" }}
            </p>
          </div>
          <div v-else class="text-gray-400 italic">
            Click a course to see details.
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { studentService } from "@/components/api/admin/StudentService";

const route = useRoute();
const student = ref(null);
const courses = ref([]);
const selectedCourse = ref(null);

onMounted(async () => {
  const id = route.params.id;

  try {
    const studentResponse = await studentService.getStudent(id);
    student.value = studentResponse.data.student_details || {};

    const coursesResponse = await studentService.getStudentCourses(id);
    courses.value = coursesResponse.courses || [];

    console.log("Student data:", student.value);
    console.log("Courses data:", courses.value);
  } catch (error) {
    console.error("Error loading student/course data:", error);
  }
});
</script>
