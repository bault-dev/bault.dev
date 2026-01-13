"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ProjectSwitcher } from "@/components/app/project-switcher";
import { NavMain } from "@/components/app/nav-main";
import { NavStorage } from "@/components/app/nav-storage";
import { NavFolders } from "@/components/app/nav-folders";
import { NavUser } from "@/components/app/nav-user";

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="lg:border-r-0!" collapsible="icon" {...props}>
      <SidebarHeader className="p-4 px-3 pb-0">
        <ProjectSwitcher />
      </SidebarHeader>

      <SidebarContent className="px-3 pt-6">
        <NavMain />
        <NavFolders />
        <NavStorage />
      </SidebarContent>

      <SidebarFooter className="p-4 px-3">
        <NavUser />
      </SidebarFooter>
    </Sidebar >
  );
}