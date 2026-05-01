"use client";

import { FolderClosed, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFilesStore } from "@/store/files-store";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { RenameDialog } from "./rename-dialog";
import { DeleteDialog } from "./delete-dialog";

interface FolderGridProps {
  parentId?: string;
}

export function FolderGrid({ parentId }: FolderGridProps) {
  const { getFoldersByParent, deleteFolder, renameFolder } = useFilesStore();
  const folders = getFoldersByParent(parentId || null);

  const [renameItem, setRenameItem] = useState<{ id: string; name: string } | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = async () => {
    if (deleteItem) {
      await deleteFolder(deleteItem.id);
      toast.success("Folder deleted");
      setDeleteItem(null);
    }
  };

  const handleRename = async (newName: string) => {
    if (renameItem) {
      await renameFolder(renameItem.id, newName);
      toast.success("Folder renamed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Folders</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {folders.map((folder) => (
          <Link
            key={folder.id}
            href={`/folder/${folder.id}`}
            className={cn(
              "p-4 rounded-xl border bg-card hover:bg-accent/50 transition-all cursor-pointer group block"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${folder.color}15` }}
              >
                <FolderClosed
                  className="size-5"
                  style={{ color: folder.color }}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Open</DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setRenameItem({ id: folder.id, name: folder.name });
                  }}>
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem>Share</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteItem({ id: folder.id, name: folder.name });
                  }}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="font-medium text-sm truncate mb-0.5">{folder.name}</p>
            <p className="text-xs text-muted-foreground">
              {folder.filesCount} files · {folder.size}
            </p>
          </Link>
        ))}
      </div>
      <RenameDialog
        open={!!renameItem}
        onOpenChange={(open) => !open && setRenameItem(null)}
        initialName={renameItem?.name || ""}
        onRename={handleRename}
        title="Rename Folder"
      />
      <DeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Folder"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}