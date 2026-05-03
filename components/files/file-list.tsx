"use client";

import {
  Download,
  Eye,
  Clock,
  FolderOpen,
  MoreVertical,
  PencilLine,
  Share2,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { Fragment, useRef, useState } from "react";
import { toast } from "sonner";
import { getUploadUrl, saveFileToDatabase } from "@/app/actions/files-actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { getCategoryForFile } from "@/lib/file-categories";
import { cn } from "@/lib/utils";
import { useFilesStore } from "@/store/files-store";
import type { ViewType } from "./content";
import { DeleteDialog } from "./delete-dialog";
import { FileIcon } from "./file-icon";
import { FilePreviewModal } from "./file-preview-modal";
import { RenameDialog } from "./rename-dialog";
import { ShareDialog } from "./share-dialog";

interface FileListProps {
  view: ViewType;
  folderId?: string;
}

export function FileList({ view, folderId }: FileListProps) {
  const {
    toggleStarred,
    getFilteredFiles,
    getStarredFiles,
    getRecentFiles,
    getSharedFiles,
    getFilesByFolder,
    deleteFile,
    renameFile,
    fetchFiles,
    fetchStorageStats,
  } = useFilesStore();
  const [viewMode] = useLocalStorage<"grid" | "list">(
    "bault-view-mode",
    "list",
  );

  const [renameItem, setRenameItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteItem, setDeleteItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [shareItem, setShareItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [previewItem, setPreviewItem] = useState<{
    id: string;
    name: string;
    type: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManageFile = (access: "owner" | "shared") => access === "owner";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const file = uploadedFiles[0];
    const toastId = toast.loading(`Uploading ${file.name}...`);

    try {
      const { url, storageKey, fileId } = await getUploadUrl({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
      });

      const xhr = new XMLHttpRequest();
      await new Promise((resolve, reject) => {
        xhr.open("PUT", url, true);
        xhr.setRequestHeader(
          "Content-Type",
          file.type || "application/octet-stream",
        );
        xhr.onload = () => {
          if (xhr.status === 200) resolve(null);
          else reject(new Error("Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });

      await saveFileToDatabase({
        id: fileId,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        storageKey,
        folderId,
      });

      await fetchFiles({ folderId });
      await fetchStorageStats();

      toast.success(`Uploaded ${file.name}`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(`Failed to upload ${file.name}`, { id: toastId });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (deleteItem) {
      await deleteFile(deleteItem.id);
      toast.success("File deleted");
      setDeleteItem(null);
    }
  };

  const handleRename = async (newName: string) => {
    if (renameItem) {
      await renameFile(renameItem.id, newName);
      toast.success("File renamed");
    }
  };

  let files = getFilteredFiles();
  let title = "All Files";

  if (view === "starred") {
    files = getStarredFiles();
    title = "Starred Files";
  } else if (view === "recent") {
    files = getRecentFiles();
    title = "Recent Files";
  } else if (view === "shared") {
    files = getSharedFiles();
    title = "Shared Files";
  } else if (view === "trash") {
    files = [];
    title = "Trash";
  } else if (view === "folder" && folderId) {
    files = getFilesByFolder(folderId);
    title = "Folder";
  }

  if (files.length === 0) {
    const emptyStates = {
      starred: {
        icon: Star,
        title: "No starred files",
        description: "Star important files to find them quickly",
      },
      recent: {
        icon: Clock,
        title: "No recent files",
        description: "Files you open will appear here",
      },
      shared: {
        icon: Users,
        title: "No shared files",
        description: "Files shared with you will appear here",
      },
      trash: {
        icon: Trash2,
        title: "Trash is empty",
        description: "Deleted files will appear here for 30 days",
      },
      default: {
        icon: FolderOpen,
        title: "This folder is empty",
        description: "Upload files or drag and drop them here",
      },
    };

    const state =
      emptyStates[view as keyof typeof emptyStates] || emptyStates.default;
    const Icon = state.icon;

    return (
      <>
        {/* biome-ignore lint/a11y/useSemanticElements: nested action buttons require a non-button container */}
        <div
          className="flex flex-col items-center justify-center py-16 text-center cursor-pointer hover:bg-accent/20 rounded-xl transition-colors border-2 border-dashed border-transparent hover:border-border"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              if (view === "all" || view === "folder") {
                fileInputRef.current?.click();
              }
            }
          }}
          onClick={() => {
            if (view === "all" || view === "folder") {
              fileInputRef.current?.click();
            }
          }}
        >
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Icon className="size-7 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-1">{state.title}</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {state.description}
          </p>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </>
    );
  }

  if (viewMode === "grid") {
    return (
      <TooltipProvider>
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {files.map((file) => {
              const canManage = canManageFile(file.access);

              return (
                <Fragment key={file.id}>
                  {/* biome-ignore lint/a11y/useSemanticElements: nested action buttons require a non-button container */}
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPreviewItem({
                          id: file.id,
                          name: file.name,
                          type: file.type,
                        });
                      }
                    }}
                    onClick={() =>
                      setPreviewItem({
                        id: file.id,
                        name: file.name,
                        type: file.type,
                      })
                    }
                    className="p-4 rounded-xl border bg-card hover:bg-accent/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <FileIcon type={file.type} />
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "size-7 transition-opacity",
                                file.starred
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100",
                              )}
                              disabled={!canManage}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStarred(file.id);
                              }}
                            >
                              <Star
                                className={cn(
                                  "size-4",
                                  file.starred &&
                                  "fill-amber-400 text-amber-400",
                                )}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {file.starred
                              ? "Remove from starred"
                              : "Add to starred"}
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewItem({
                                  id: file.id,
                                  name: file.name,
                                  type: file.type,
                                });
                              }}
                            >
                              <Eye />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download />
                              Download
                            </DropdownMenuItem>
                            {canManage && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setRenameItem({
                                    id: file.id,
                                    name: file.name,
                                  });
                                }}
                              >
                                <PencilLine />
                                Rename
                              </DropdownMenuItem>
                            )}
                            {canManage && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setShareItem({
                                    id: file.id,
                                    name: file.name,
                                  });
                                }}
                              >
                                <Share2 />
                                Share
                              </DropdownMenuItem>
                            )}
                            {canManage && <DropdownMenuSeparator />}
                            {canManage && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDeleteItem({
                                    id: file.id,
                                    name: file.name,
                                  });
                                }}
                              >
                                <Trash2 />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="font-medium text-sm truncate mb-0.5">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{file.size}</span>
                      {file.shared && <Share2 className="size-3" />}
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
        <RenameDialog
          open={!!renameItem}
          onOpenChange={(open) => !open && setRenameItem(null)}
          initialName={renameItem?.name || ""}
          onRename={handleRename}
          title="Rename File"
        />
        <DeleteDialog
          open={!!deleteItem}
          onOpenChange={(open) => !open && setDeleteItem(null)}
          onConfirm={handleDelete}
          title="Delete File"
          description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        />
        <ShareDialog
          open={!!shareItem}
          onOpenChange={(open) => !open && setShareItem(null)}
          fileId={shareItem?.id || ""}
          fileName={shareItem?.name || ""}
        />
        <FilePreviewModal
          open={!!previewItem}
          onOpenChange={(open) => !open && setPreviewItem(null)}
          fileId={previewItem?.id || ""}
          fileName={previewItem?.name || ""}
          fileType={previewItem?.type || "unknown"}
        />
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_150px_100px_70px_100px_70px] gap-4 px-4 py-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
            <span>Name</span>
            <span>Category</span>
            <span>Size</span>
            <span>Owner</span>
            <span>Modified</span>
            <span></span>
          </div>
          <div className="divide-y">
            {files.map((file) => {
              const category = getCategoryForFile(file.name);
              const canManage = canManageFile(file.access);

              return (
                <Fragment key={file.id}>
                  {/* biome-ignore lint/a11y/useSemanticElements: nested action buttons require a non-button container */}
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPreviewItem({
                          id: file.id,
                          name: file.name,
                          type: file.type,
                        });
                      }
                    }}
                    onClick={() =>
                      setPreviewItem({
                        id: file.id,
                        name: file.name,
                        type: file.type,
                      })
                    }
                    className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_150px_100px_70px_100px_70px] gap-2 sm:gap-4 px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer group items-center"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileIcon type={file.type} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {file.size} · {file.modifiedAt}
                        </p>
                      </div>
                      {file.shared && (
                        <Share2 className="size-3.5 text-muted-foreground shrink-0 hidden sm:block" />
                      )}
                    </div>
                    <div className="hidden sm:flex items-center">
                      <div
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium w-fit"
                        style={{
                          backgroundColor: `${category.color}15`,
                          color: category.color,
                        }}
                      >
                        <category.icon className="size-3" />
                        {category.name}
                      </div>
                    </div>
                    <span className="hidden sm:block text-sm text-muted-foreground">
                      {file.size}
                    </span>
                    <div className="hidden sm:flex items-center" onClick={(e) => e.stopPropagation()}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="size-8 cursor-pointer hover:z-10 transition-transform hover:scale-110">
                            <AvatarImage src={file.owner?.image || ""} />
                            <AvatarFallback className="text-[10px] bg-muted/50">
                              {file.owner?.name ? file.owner.name.substring(0, 2).toUpperCase() : "?"}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          {file.owner?.name || "Unknown User"}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="hidden sm:block text-sm text-muted-foreground">
                      {file.modifiedAt}
                    </span>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "size-7 transition-opacity",
                              file.starred
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100",
                            )}
                            disabled={!canManage}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStarred(file.id);
                            }}
                          >
                            <Star
                              className={cn(
                                "size-4",
                                file.starred && "fill-amber-400 text-amber-400",
                              )}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {file.starred
                            ? "Remove from starred"
                            : "Add to starred"}
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewItem({
                                id: file.id,
                                name: file.name,
                                type: file.type,
                              });
                            }}
                          >
                            <Eye />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download />
                            Download
                          </DropdownMenuItem>
                          {canManage && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setRenameItem({ id: file.id, name: file.name });
                              }}
                            >
                              <PencilLine />
                              Rename
                            </DropdownMenuItem>
                          )}
                          {canManage && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShareItem({ id: file.id, name: file.name });
                              }}
                            >
                              <Share2 />
                              Share
                            </DropdownMenuItem>
                          )}
                          {canManage && <DropdownMenuSeparator />}
                          {canManage && (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeleteItem({ id: file.id, name: file.name });
                              }}
                            >
                              <Trash2 />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
      <RenameDialog
        open={!!renameItem}
        onOpenChange={(open) => !open && setRenameItem(null)}
        initialName={renameItem?.name || ""}
        onRename={handleRename}
        title="Rename File"
      />
      <DeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete File"
        description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
      />
      <ShareDialog
        open={!!shareItem}
        onOpenChange={(open) => !open && setShareItem(null)}
        fileId={shareItem?.id || ""}
        fileName={shareItem?.name || ""}
      />
      <FilePreviewModal
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
        fileId={previewItem?.id || ""}
        fileName={previewItem?.name || ""}
        fileType={previewItem?.type || "unknown"}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />
    </TooltipProvider>
  );
}
