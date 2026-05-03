"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Github,
  LayoutGrid,
  List,
  MoreVertical,
  Search,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { useFilesStore } from "@/store/files-store";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./breadcrumbs";
import { QuickActions } from "./quick-actions";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { AISidebar } from "@/components/ai/ai-sidebar";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function FilesHeader() {
  const { searchQuery, setSearchQuery } = useFilesStore();
  const [viewMode, setViewMode] = useLocalStorage<"grid" | "list">("bault-view-mode", "list");

  return (
    <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 border-b bg-card sticky top-0 z-10 w-full">
      <SidebarTrigger className="-ml-1 sm:-ml-2" />

      <div className="hidden lg:block">
        <Breadcrumb />
      </div>

      <div className="flex-1 lg:hidden">
        <Breadcrumb />
      </div>

      <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
        <QuickActions />
      </div>

      <div className="hidden md:block relative max-w-xs">
        <InputGroup>
          <InputGroupInput
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="hidden sm:flex items-center gap-1 border rounded-lg p-px">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setViewMode("grid")}
          className={cn("size-7.5", viewMode === "grid" && "bg-muted")}
        >
          <LayoutGrid className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setViewMode("list")}
          className={cn("size-7.5", viewMode === "list" && "bg-muted")}
        >
          <List className="size-4" />
        </Button>
      </div>

      <AISidebar />
      <ModeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end">
          <DropdownMenuItem>
            <Search className="size-4 mr-2" />
            Search
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <List className="size-4 mr-2" />
            ) : (
              <LayoutGrid className="size-4 mr-2" />
            )}
            {viewMode === "grid" ? "List View" : "Grid View"}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="size-4 mr-2" />
            Notifications
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href="https://github.com/ln-dev7/square-ui/tree/master/templates/files"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github />
              GitHub
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
