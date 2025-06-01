"use client"

import Link from "next/link"
import { FolderPlus, HardDrive, Home, Star, Clock, Share2, Upload, X, Filter } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { StorageIndicator } from "./storage-indicator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FileIcon } from "@/lib/file-icons"
import { cn } from "@/lib/utils"
import type { FileSystemItem } from "@/lib/types"

interface BaultSidebarProps {
  usedStorage: number
  maxStorage: number
  onNewFolder: () => void
  fileTypeFilter: string | null
  onFileTypeFilterChange: (filter: string | null) => void
  currentItems: FileSystemItem[]
}

const navigationItems = [
  {
    title: "My Files",
    icon: Home,
    href: "/",
    isActive: true,
  },
  {
    title: "Recent",
    icon: Clock,
    href: "/recent",
    badge: "3",
  },
  {
    title: "Starred",
    icon: Star,
    href: "/starred",
  },
  {
    title: "Shared",
    icon: Share2,
    href: "/shared",
  },
]

const fileTypeFilters = [
  {
    id: "code",
    title: "Code Files",
    fileName: "component.tsx",
    extensions: ["js", "jsx", "ts", "tsx", "py", "java", "c", "cpp", "cs", "php", "rb", "go", "rs", "swift", "kt"],
  },
  {
    id: "styles",
    title: "Stylesheets",
    fileName: "styles.css",
    extensions: ["css", "scss", "sass", "less"],
  },
  {
    id: "documents",
    title: "Documents",
    fileName: "readme.md",
    extensions: ["md", "txt", "pdf", "doc", "docx", "rtf"],
  },
  {
    id: "images",
    title: "Images",
    fileName: "image.png",
    extensions: ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "ico"],
  },
  {
    id: "config",
    title: "Config Files",
    fileName: "package.json",
    extensions: ["json", "yaml", "yml", "toml", "env", "ini", "conf", "config"],
    specialCheck: (item: FileSystemItem) =>
      item.name.includes("config") ||
      item.name.startsWith(".env") ||
      item.name === "package.json" ||
      item.name === "tsconfig.json",
  },
  {
    id: "data",
    title: "Data Files",
    fileName: "data.csv",
    extensions: ["csv", "sql", "db", "sqlite", "xml"],
  },
  {
    id: "folders",
    title: "Folders",
    fileName: "", // Will use folder icon
    extensions: [],
    isFolder: true,
  },
]

export function BaultSidebar({
  usedStorage,
  maxStorage,
  onNewFolder,
  fileTypeFilter,
  onFileTypeFilterChange,
  currentItems,
}: BaultSidebarProps) {
  // Calculate counts for each file type
  const getFileTypeCount = (filter: (typeof fileTypeFilters)[0]) => {
    if (filter.isFolder) {
      return currentItems.filter((item) => item.type === "folder").length
    }

    return currentItems.filter((item) => {
      if (item.type === "folder") return false

      const extension = item.name.toLowerCase().split(".").pop() || ""
      const matchesExtension = filter.extensions.includes(extension)
      const matchesSpecial = filter.specialCheck ? filter.specialCheck(item) : false

      return matchesExtension || matchesSpecial
    }).length
  }

  const handleFilterClick = (filterId: string) => {
    if (fileTypeFilter === filterId) {
      onFileTypeFilterChange(null) // Clear filter if clicking the same one
    } else {
      onFileTypeFilterChange(filterId)
    }
  }

  const clearFilter = () => {
    onFileTypeFilterChange(null)
  }

  return (
    <Sidebar className="border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarHeader className="p-6 border-b border-border/40">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-200">
            <HardDrive className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Bault
            </span>
            <span className="text-xs text-muted-foreground">File Manager</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-grow px-4 py-6">
        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            <Button
              onClick={onNewFolder}
              className="w-full justify-start rounded-xl h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FolderPlus className="mr-3 h-4 w-4" />
              New Folder
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl h-11 border-border/40 hover:bg-muted/50 transition-all duration-200"
            >
              <Upload className="mr-3 h-4 w-4" />
              Upload Files
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-6 bg-border/40" />

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className="rounded-xl h-11 px-4 hover:bg-muted/50 data-[active=true]:bg-muted data-[active=true]:text-foreground transition-all duration-200"
                  >
                    <Link href={item.href} className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-4 w-4" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="rounded-full text-xs px-2 py-0.5">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-6 bg-border/40" />

        {/* File Type Filters */}
        <SidebarGroup>
          <div className="flex items-center justify-between mb-3">
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Filter by Type
            </SidebarGroupLabel>
            {fileTypeFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilter}
                className="h-6 w-6 p-0 rounded-md hover:bg-muted/50"
                title="Clear filter"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {fileTypeFilter && (
            <div className="mb-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Filter className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Filtering: {fileTypeFilters.find((f) => f.id === fileTypeFilter)?.title}
                </span>
              </div>
            </div>
          )}

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {fileTypeFilters.map((filter) => {
                const count = getFileTypeCount(filter)
                const isActive = fileTypeFilter === filter.id

                return (
                  <SidebarMenuItem key={filter.id}>
                    <SidebarMenuButton
                      onClick={() => handleFilterClick(filter.id)}
                      className={cn(
                        "rounded-xl h-10 px-4 hover:bg-muted/50 transition-all duration-200 cursor-pointer",
                        isActive &&
                          "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
                      )}
                    >
                      {filter.isFolder ? (
                        <FileIcon fileName="" isFolder={true} size="md" className="mr-3" />
                      ) : (
                        <FileIcon fileName={filter.fileName} size="md" className="mr-3" />
                      )}
                      <span className="flex-1 text-sm font-medium">{filter.title}</span>
                      <Badge
                        variant={isActive ? "default" : "outline"}
                        className={cn("rounded-full text-xs", isActive && "bg-blue-600 text-white border-blue-600")}
                      >
                        {count}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-6 bg-border/40" />

        {/* Storage Indicator */}
        <StorageIndicator usedStorage={usedStorage} maxStorage={maxStorage} />
      </SidebarContent>

      <SidebarSeparator className="bg-border/40" />

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-xl h-14 px-4 hover:bg-muted/50 transition-all duration-200">
              <Avatar className="h-9 w-9 mr-3 ring-2 ring-border/20">
                <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Jane Doe</span>
                <span className="text-xs text-muted-foreground">jane@example.com</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
