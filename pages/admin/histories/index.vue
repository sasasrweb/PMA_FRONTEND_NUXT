<script setup lang="ts">
import { ref } from "vue";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

// Sample data
const students = ref([
  {
    usn: "U001",
    firstname: "John",
    middlename: "A.",
    lastname: "Doe",
    contact_number: "1234567890",
    username: "johndoe",
    password: "password123",
    course: "BSIT",
    units: 21,
    days: "Mon-Wed-Fri",
    hours: "8AM - 10AM",
    status: "active",
  },
  {
    usn: "U002",
    firstname: "Jane",
    middlename: "B.",
    lastname: "Smith",
    contact_number: "0987654321",
    username: "janesmith",
    password: "securepass",
    course: "BSCS",
    units: 18,
    days: "Tue-Thu",
    hours: "1PM - 4PM",
    status: "inactive",
  },
]);
</script>

<template>
  <NuxtLayout name="admin">
    <div>
      <h1 class="mb-4 text-xl font-semibold">Histories</h1>
      <div class="mb-4">
        <Button class="p-3 text-white bg-black rounded-lg hover:bg-gray-800">
          Add Course
        </Button>
      </div>
      <div class="mb-4">
        <Input placeholder="Search..." class="w-1/2 border-black" />
      </div>

      <div class="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>USN</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Middle Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Contact #</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-for="student in students" :key="student.usn">
              <TableCell>{{ student.usn }}</TableCell>
              <TableCell>{{ student.firstname }}</TableCell>
              <TableCell>{{ student.middlename }}</TableCell>
              <TableCell>{{ student.lastname }}</TableCell>
              <TableCell>{{ student.contact_number }}</TableCell>
              <TableCell>{{ student.username }}</TableCell>
              <TableCell>{{ student.password }}</TableCell>
              <TableCell>{{ student.course }}</TableCell>
              <TableCell>{{ student.units }}</TableCell>
              <TableCell>{{ student.days }}</TableCell>
              <TableCell>{{ student.hours }}</TableCell>
              <TableCell>{{ student.status }}</TableCell>
              <TableCell>
                <div class="flex space-x-2">
                  <Button
                    class="p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Edit
                  </Button>
                  <Button
                    class="p-2 ml-2 text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </NuxtLayout>
</template>
