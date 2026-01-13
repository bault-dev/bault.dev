"use client";

import * as React from "react";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FolderClosedIcon,
  ChevronDownIcon,
  PlusIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilesStore } from "@/store/files-store";
import { usePathname } from "next/navigation";

export const NavFolders = () => {
  const { folders } = useFilesStore();
  const pathname = usePathname();

  const [foldersOpen, setFoldersOpen] = React.useState(true);

  return (
    <Collapsible open={foldersOpen} onOpenChange={setFoldersOpen}>
      <SidebarGroup className="p-0 mt-4">
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="h-4 pb-4 pt-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-transparent cursor-pointer flex items-center justify-between">
            <div className="flex items-center gap-1">
              <ChevronDownIcon
                className={cn(
                  "size-3 transition-transform",
                  !foldersOpen && "-rotate-90"
                )}
              />
              <span>Folders</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-5 hover:bg-muted"
              onClick={(e) => e.stopPropagation()}
            >
              <PlusIcon className="size-3" />
            </Button>
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {folders.map((folder) => (
                <SidebarMenuItem key={folder.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/folder/${folder.id}`}
                    className="h-9"
                    tooltip={folder.name}
                  >
                    <Link href={`/folder/${folder.id}`}>
                      <FolderClosedIcon
                        className="size-4"
                        style={{ color: folder.color }}
                      />
                      <span className="flex-1 text-sm truncate">
                        {folder.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {folder.filesCount}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}
