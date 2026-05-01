"use client";

import * as React from "react";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  PlusIcon,
  UploadIcon,
  FolderPlusIcon,
  FileTextIcon,
  FileImageIcon,
  Link2Icon,
  HomeIcon,
  StarIcon,
  ClockIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: HomeIcon, label: "All Files", href: "/" },
  { icon: StarIcon, label: "Starred", href: "/starred" },
  { icon: ClockIcon, label: "Recent", href: "/recent" },
  { icon: Share2Icon, label: "Shared", href: "/shared" },
  { icon: Trash2Icon, label: "Trash", href: "/trash" },
];

export const NavMain = () => {
  const { state } = useSidebar()
  const pathname = usePathname()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            className={cn("w-full mb-4 gap-2", buttonVariants({ variant: "outline" }))} tooltip="New"
          >
            <PlusIcon className="size-4" />
            {state !== "collapsed" && "New"}
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem>
            <UploadIcon className="size-4 mr-2" />
            Upload File
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FolderPlusIcon className="size-4 mr-2" />
            New Folder
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <FileTextIcon className="size-4 mr-2" />
            New Document
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileImageIcon className="size-4 mr-2" />
            New Image
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link2Icon className="size-4 mr-2" />
            Add Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SidebarGroup className="p-0">
        <SidebarGroupContent>
          <SidebarMenu className="gap-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  className="h-9"
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}
