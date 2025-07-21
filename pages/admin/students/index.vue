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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "vue-router";
import { studentService } from "~/components/api/admin/StudentService";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

useHead({
  title: 'CMS Students',
  meta: [
    { name: 'description', content: 'CMS - Students management (CRUD)' }
  ]
})

const router = useRouter();
const students = ref([]);
const search = ref("");

const importModal = ref(false);
const importedData = ref<any[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

const currentPage = ref(1);
const itemsPerPage = 10;

const fetchStudents = async () => {
  try {
    const response = await studentService.getStudents();
    students.value = response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch students:", error);
    Swal.fire("Error", "Failed to load student data.", "error");
  }
};

const viewStudentCourse = (id: number) => {
  router.push(`/admin/students/view/${id}`);
};

const goToAddStudent = () => {
  router.push("/admin/students/create");
};

const editStudent = (studentId: number) => {
  router.push(`/admin/students/edit/${studentId}`);
};

const deleteStudent = async (studentId: number) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      await studentService.deleteStudent(studentId);
      Swal.fire("Deleted!", "The student has been deleted.", "success");
      fetchStudents();
    } catch (error) {
      console.error("Failed to delete student:", error);
      Swal.fire("Error", "Failed to delete student.", "error");
    }
  }
};

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const arrayBuffer = evt.target?.result as ArrayBuffer;
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    importedData.value = jsonData;
  };
  reader.readAsArrayBuffer(file);
};

const submitImportedStudents = async () => {
  try {
    await studentService.importStudents(importedData.value);
    Swal.fire("Success", "Students imported successfully!", "success");
    importModal.value = false;
    fetchStudents();
  } catch (error) {
    console.error("Import failed:", error);
    importModal.value = false;
    Swal.fire("Error", "Failed to import students.", "error");
  }
};

const filteredStudents = computed(() => {
  const term = search.value.toLowerCase();
  return students.value.filter((student: any) => {
    const fullName = `${student.studentDetails.firstname} ${
      student.studentDetails.middlename ?? ""
    } ${student.studentDetails.lastname}`.toLowerCase();
    const usn = String(student.studentDetails.usn).toLowerCase();
    return fullName.includes(term) || usn.includes(term);
  });
});

const totalPages = computed(() =>
  Math.ceil(filteredStudents.value.length / itemsPerPage)
);

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredStudents.value.slice(start, start + itemsPerPage);
});

const setPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

onMounted(() => {
  fetchStudents();
});
</script>

<template>
  <NuxtLayout name="admin">
    <div>
      <h1 class="mb-4 text-xl font-semibold">Students</h1>
      <div class="mb-4 flex justify-between">
        <Button
          @click="goToAddStudent"
          class="bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Add Student
        </Button>
        <Button
          @click="importModal = true"
          class="bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Import Students
        </Button>

        <Dialog v-model:open="importModal">
          <DialogContent class="max-w-4xl">
            <DialogTitle>Import Students</DialogTitle>
            <div class="my-4 space-y-4">
              <input
                type="file"
                accept=".xlsx, .xls"
                @change="handleFileUpload"
                ref="fileInput"
                class="block w-full"
              />
              <div v-if="importedData.length">
                <h2 class="font-medium mb-2">Preview:</h2>
                <div
                  class="overflow-auto max-w-[800px] max-h-[300px] border rounded"
                >
                  <table class="min-w-full text-sm border">
                    <thead class="bg-gray-100">
                      <tr>
                        <th class="px-3 py-1 border">#</th>
                        <th
                          v-for="(key, index) in Object.keys(importedData[0])"
                          :key="index"
                          class="px-3 py-1 border"
                        >
                          {{ key }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, index) in importedData" :key="index">
                        <td class="px-3 py-1 border">{{ index + 1 }}</td>
                        <td
                          v-for="(val, i) in Object.values(row)"
                          :key="i"
                          class="px-3 py-1 border"
                        >
                          {{ val }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="mt-4 flex justify-end space-x-2">
              <Button @click="importModal = false" variant="outline"
                >Cancel</Button
              >
              <Button
                @click="submitImportedStudents"
                class="bg-black text-white hover:bg-gray-700"
                >Submit</Button
              >
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div class="mb-4">
        <Input
          v-model="search"
          placeholder="Search by USN or Name..."
          class="w-1/2 border-black"
        />
      </div>

      <div class="border rounded-lg overflow-auto">
        <Table class="w-max-[300px] text-nowrap lg:w-full">
          <TableHeader>
            <TableRow>
              <TableHead>USN</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Middle Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="student in paginatedStudents"
              :key="student.studentDetails.usn"
            >
              <TableCell class="w-[12.5%]">{{
                student.studentDetails.usn
              }}</TableCell>
              <TableCell
                class="w-[12.5%] max-w-[150px] truncate whitespace-nowrap overflow-hidden"
              >
                {{ student.studentDetails.firstname }}
              </TableCell>
              <TableCell
                class="w-[12.5%] max-w-[150px] truncate whitespace-nowrap overflow-hidden"
              >
                {{ student.studentDetails.middlename }}
              </TableCell>
              <TableCell
                class="w-[12.5%] max-w-[150px] truncate whitespace-nowrap overflow-hidden"
              >
                {{ student.studentDetails.lastname }}
              </TableCell>
              <TableCell class="w-1/2">{{
                student.studentDetails.status
              }}</TableCell>
              <TableCell class="w-full">
                <div class="flex space-x-2">
                  <Button
                    class="bg-green-500 text-white hover:bg-green-600"
                    @click="viewStudentCourse(student.id)"
                  >
                    View Course
                  </Button>
                  <Button
                    class="bg-blue-500 text-white hover:bg-blue-600"
                    @click="editStudent(student.id)"
                  >
                    Edit
                  </Button>
                  <Button
                    class="bg-red-500 text-white hover:bg-red-600"
                    @click="deleteStudent(student.id)"
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="paginatedStudents.length === 0">
              <TableCell colspan="5" class="text-center">
                No students found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div class="flex justify-center items-center mt-4 space-x-2">
        <Button :disabled="currentPage === 1" @click="setPage(currentPage - 1)"
          >Previous</Button
        >
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
          >Next</Button
        >
      </div>
    </div>
  </NuxtLayout>
</template>
