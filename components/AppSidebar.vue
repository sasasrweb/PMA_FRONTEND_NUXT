<script setup lang="ts">
import {
  User,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Globe,
  LayoutDashboard,
  Award,
  QrCodeIcon,
  Handshake,
  PenLine,
  ScrollText,
} from "lucide-vue-next";

import { useRoute } from "vue-router"; // <-- Use this instead of useRouter
import { NuxtLink } from "#components";

import NavUser from "@/components/NavUser.vue";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProps,
} from "@/components/ui/sidebar";

const route = useRoute();

const emit = defineEmits(["logout"]);

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: "inset",
});

function formatNameFromEmail(email: string | null): string {
  if (!email) return "Admin User";
  const namePart = email.split("@")[0];
  return namePart
    .split(/[\.\-_ ]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
const email = localStorage.getItem("email");

const data = {
  user: {
    name: formatNameFromEmail(email),
    email: email || "admin@example.com",
    avatar: "/avatars/default.png",
  },
  navMain: [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Users", url: "/admin/users", icon: User },
    { title: "QR", url: "/admin/generate-qr", icon: QrCodeIcon },
    {
      title: "Certificates",
      icon: Award,
      children: [
        { title: "View Certificates", url: "/admin/certificates?prefix=all" },
        { title: "CMPEM", url: "/admin/certificates?prefix=CMPEM" },
        { title: "Mice Capsule", url: "/admin/certificates?prefix=MC" },
        { title: "Regional Training", url: "/admin/certificates?prefix=DOT" },
        { title: "Other MICE Training", url: "/admin/certificates?prefix=GEN" },
      ],
    },
    { title: "Partners", url: "/admin/partners", icon: Handshake },
    { title: "Signatories", url: "/admin/signatories", icon: PenLine },
    { title: "Audits", url: "/admin/audits", icon: ScrollText },
  ],
};

const openDropdown = ref<string | null>(null);
function toggle(title: string) {
  openDropdown.value = openDropdown.value === title ? null : title;
}

function isChildActive(item: any): boolean {
  if (!item.children) return false;

  return item.children.some((child: any) => {
    const currentPath = route.path;
    const currentQuery = route.query;

    const [childPath, queryString] = child.url.split("?");
    const childQuery = Object.fromEntries(new URLSearchParams(queryString));

    const pathMatches = currentPath === childPath;
    const queryMatches = Object.entries(childQuery).every(
      ([key, value]) => currentQuery[key] === value
    );

    return pathMatches && queryMatches;
  });
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink to="/admin/dashboard">
              <div
                class="flex items-center justify-center rounded-lg aspect-square size-8 bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <LayoutDashboard class="size-4" />
              </div>
              <div class="grid flex-1 text-sm leading-tight text-left">
                <img src="/img/main_logo.png" class="w-32 h-12" />
              </div>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <!-- Replacing <NavMain> with inline dropdown logic -->
      <div>
        <div v-for="item in data.navMain" :key="item.title" class="mb-1">
          <div v-if="item.children" class="relative">
            <button
              @click="toggle(item.title)"
              :class="[
                'flex items-center w-full gap-2 px-4 py-2 text-left rounded-md',
                isChildActive(item)
                  ? 'bg-red-700 text-white'
                  : 'hover:bg-muted',
              ]"
            >
              <component :is="item.icon" class="size-4" />
              <span>{{ item.title }}</span>
            </button>
            <div v-show="openDropdown === item.title" class="mt-1 ml-6">
              <NuxtLink
                v-for="child in item.children"
                :key="child.title"
                :to="child.url"
                :class="[
                  'block px-3 py-1 text-sm hover:underline',
                  route.path === child.url
                    ? 'text-red-700 font-semibold'
                    : 'text-muted-foreground',
                ]"
              >
                {{ child.title }}
              </NuxtLink>
            </div>
          </div>

          <NuxtLink
            v-else
            :to="item.url"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted',
              route.path === item.url
                ? 'text-white font-semibold bg-red-700'
                : 'text-muted-foreground',
            ]"
          >
            <component :is="item.icon" class="size-4" />
            <span>{{ item.title }}</span>
          </NuxtLink>
        </div>
      </div>
    </SidebarContent>

    <SidebarFooter>
      <NavUser :user="data.user" @logout="emit('logout')" />
    </SidebarFooter>
  </Sidebar>
</template>
