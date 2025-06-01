"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Folder, Move, Edit3, Trash2 } from "lucide-react"
import type { FileSystemItem } from "@/lib/types"
import { FileIcon } from "@/lib/file-icons"

interface ActionModalProps {
  isOpen: boolean
  onClose: () => void
  action: "rename" | "move" | "delete" | null
  item: FileSystemItem | null
  folders: FileSystemItem[]
  onConfirm: (data: any) => void
}

export function ActionModal({ isOpen, onClose, action, item, folders, onConfirm }: ActionModalProps) {
  const [newName, setNewName] = useState("")
  const [selectedFolderId, setSelectedFolderId] = useState<string>("")

  const handleConfirm = () => {
    if (action === "rename" && newName.trim()) {
      onConfirm({ newName: newName.trim() })
    } else if (action === "move") {
      onConfirm({ targetFolderId: selectedFolderId || null })
    } else if (action === "delete") {
      onConfirm({})
    }
    handleClose()
  }

  const handleClose = () => {
    setNewName("")
    setSelectedFolderId("")
    onClose()
  }

  const getModalContent = () => {
    switch (action) {
      case "rename":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Edit3 className="h-5 w-5 text-blue-600" />
                </div>
                Rename {item?.type === "folder" ? "Folder" : "File"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <FileIcon fileName={item?.name || ""} isFolder={item?.type === "folder"} size="lg" />
                <span className="font-medium">{item?.name}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-name">New name</Label>
                <Input
                  id="new-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={item?.name}
                  className="rounded-xl"
                  onKeyPress={(e) => e.key === "Enter" && handleConfirm()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!newName.trim()}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Rename
              </Button>
            </DialogFooter>
          </>
        )

      case "move":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                  <Move className="h-5 w-5 text-green-600" />
                </div>
                Move {item?.type === "folder" ? "Folder" : "File"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <FileIcon fileName={item?.name || ""} isFolder={item?.type === "folder"} size="lg" />
                <span className="font-medium">{item?.name}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Move to</Label>
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
                      .filter((folder) => folder.id !== item?.id && folder.id !== item?.parentId)
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
                className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Move Here
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
                Delete {item?.type === "folder" ? "Folder" : "File"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-200 dark:border-red-800">
                <FileIcon fileName={item?.name || ""} isFolder={item?.type === "folder"} size="lg" />
                <span className="font-medium text-red-700 dark:text-red-300">{item?.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this {item?.type}?{" "}
                {item?.type === "folder" && "All contents will be permanently removed."} This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleConfirm} variant="destructive" className="rounded-xl bg-red-500 hover:bg-red-600">
                Delete
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
      <DialogContent className="rounded-2xl border-border/40 max-w-md">{getModalContent()}</DialogContent>
    </Dialog>
  )
}
