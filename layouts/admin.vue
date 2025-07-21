<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useHead } from "#imports";

import Swal from "sweetalert2";

import AppSidebar from "@/components/AppSidebar.vue";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

// Router
const router = useRouter();

// Protect route
onMounted(() => {
  const token = localStorage.getItem("_token");
  const currentPath = router.currentRoute.value.path;

  if (!token && currentPath !== "/admin/login") {
    router.push("/admin/login");
  }
});

// Logout method with SweetAlert2 confirmation
const logout = async () => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You will be logged out.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, logout",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    localStorage.removeItem("_token");
    router.push("/admin/login");
    Swal.fire("Logged out!", "You have been logged out.", "success");
  }
};

// Toastr support (optional)
useHead({
  link: [
    {
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css",
    },
  ],
  script: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js",
      defer: true,
    },
  ],
});
</script>

<template>
  <SidebarProvider>
    <AppSidebar @logout="logout" />
    <SidebarInset>
      <!-- Header with Breadcrumb -->
      <header class="flex items-center h-16 gap-2 px-4 border-b shrink-0">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="h-4 mr-2" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem class="hidden md:block">
              <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator class="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Page</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <!-- Main content area -->
      <div class="flex flex-1 flex-col gap-4 p-4 mt-[5rem]">
        <div class="px-[5rem]">
          <slot />
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
