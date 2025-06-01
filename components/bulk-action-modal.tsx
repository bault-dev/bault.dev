"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Folder, Move, Trash2, Download, Archive } from "lucide-react"
import type { FileSystemItem } from "@/lib/types"
import { FileIcon } from "@/lib/file-icons"

interface BulkActionModalProps {
  isOpen: boolean
  onClose: () => void
  action: "move" | "delete" | "download" | null
  selectedItems: FileSystemItem[]
  folders: FileSystemItem[]
  onConfirm: (data: any) => void
}

export function BulkActionModal({ isOpen, onClose, action, selectedItems, folders, onConfirm }: BulkActionModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>("")

  const handleConfirm = () => {
    const itemIds = selectedItems.map((item) => item.id)

    if (action === "move") {
      onConfirm({
        action: "move",
        itemIds,
        targetFolderId: selectedFolderId || null,
      })
    } else if (action === "delete") {
      onConfirm({
        action: "delete",
        itemIds,
      })
    } else if (action === "download") {
      onConfirm({
        action: "download",
        itemIds,
      })
    }

    handleClose()
  }

  const handleClose = () => {
    setSelectedFolderId("")
    onClose()
  }

  const getTotalSize = () => {
    return selectedItems.filter((item) => item.type === "file").reduce((total, file) => total + (file.size || 0), 0)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getModalContent = () => {
    const selectedFiles = selectedItems.filter((item) => item.type === "file")
    const selectedFolders = selectedItems.filter((item) => item.type === "folder")

    switch (action) {
      case "move":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                  <Move className="h-5 w-5 text-green-600" />
                </div>
                Move {selectedItems.length} Item{selectedItems.length !== 1 ? "s" : ""}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Selected Items Summary */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Selected Items</span>
                  <div className="flex items-center gap-2">
                    {selectedFiles.length > 0 && (
                      <Badge variant="outline" className="rounded-full text-xs">
                        {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                    {selectedFolders.length > 0 && (
                      <Badge variant="outline" className="rounded-full text-xs">
                        {selectedFolders.length} folder{selectedFolders.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>

                <ScrollArea className="max-h-32">
                  <div className="space-y-2">
                    {selectedItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <FileIcon fileName={item.name} isFolder={item.type === "folder"} size="md" />
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                    {selectedItems.length > 5 && (
                      <div className="text-xs text-muted-foreground">... and {selectedItems.length - 5} more items</div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Destination Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Move to</label>
                <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select destination folder" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="root" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-yellow-600" />
                        Root Folder
                      </div>
                    </SelectItem>
                    {folders
                      .filter((folder) => !selectedItems.some((item) => item.id === folder.id))
                      .map((folder) => (
                        <SelectItem key={folder.id} value={folder.id} className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-yellow-600" />
                            {folder.name}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className="rounded-xl bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Move Items
              </Button>
            </DialogFooter>
          </>
        )

      case "delete":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                Delete {selectedItems.length} Item{selectedItems.length !== 1 ? "s" : ""}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-red-700 dark:text-red-300">Items to Delete</span>
                  <div className="flex items-center gap-2">
                    {selectedFiles.length > 0 && (
                      <Badge variant="outline" className="rounded-full text-xs border-red-300 text-red-700">
                        {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                    {selectedFolders.length > 0 && (
                      <Badge variant="outline" className="rounded-full text-xs border-red-300 text-red-700">
                        {selectedFolders.length} folder{selectedFolders.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>

                <ScrollArea className="max-h-32">
                  <div className="space-y-2">
                    {selectedItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                        <FileIcon fileName={item.name} isFolder={item.type === "folder"} size="md" />
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                    {selectedItems.length > 5 && (
                      <div className="text-xs text-red-600 dark:text-red-400">
                        ... and {selectedItems.length - 5} more items
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">⚠️ This action cannot be undone.</p>
                <p>
                  {selectedFolders.length > 0 && "All folder contents will be permanently removed. "}
                  {selectedFiles.length > 0 && `Total size: ${formatSize(getTotalSize())}`}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleConfirm} variant="destructive" className="rounded-xl bg-red-500 hover:bg-red-600">
                Delete All
              </Button>
            </DialogFooter>
          </>
        )

      case "download":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                Download {selectedItems.length} Item{selectedItems.length !== 1 ? "s" : ""}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-blue-700 dark:text-blue-300">Items to Download</span>
                  <div className="flex items-center gap-2">
                    {selectedFiles.length > 0 && (
                      <Badge variant="outline" className="rounded-full text-xs border-blue-300 text-blue-700">
                        {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                    {selectedFolders.length > 0 && (
                      <Badge variant="outline" className="rounded-full text-xs border-blue-300 text-blue-700">
                        {selectedFolders.length} folder{selectedFolders.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>

                <ScrollArea className="max-h-32">
                  <div className="space-y-2">
                    {selectedItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                        <FileIcon fileName={item.name} isFolder={item.type === "folder"} size="md" />
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                    {selectedItems.length > 5 && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        ... and {selectedItems.length - 5} more items
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">📦 Download as ZIP archive</p>
                <p>
                  {selectedFolders.length > 0 && "Folders will be included with all their contents. "}
                  {selectedFiles.length > 0 && `Total size: ${formatSize(getTotalSize())}`}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className="rounded-xl bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Archive className="mr-2 h-4 w-4" />
                Download ZIP
              </Button>
            </DialogFooter>
          </>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen && !!action} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl border-border/40 max-w-lg">{getModalContent()}</DialogContent>
    </Dialog>
  )
}
