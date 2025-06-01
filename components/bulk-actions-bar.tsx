"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Trash2, Move, Download, X, MoreHorizontal, Archive, Copy, Star, Share2 } from "lucide-react"
import type { FileSystemItem, BulkAction } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BulkActionsBarProps {
  selectedItems: FileSystemItem[]
  onClearSelection: () => void
  onBulkDelete: (itemIds: string[]) => void
  onBulkMove: (itemIds: string[]) => void
  onBulkDownload: (itemIds: string[]) => void
  onBulkCopy: (itemIds: string[]) => void
  className?: string
}

const bulkActions: BulkAction[] = [
  {
    id: "copy",
    label: "Copy",
    icon: Copy,
  },
  {
    id: "star",
    label: "Star",
    icon: Star,
  },
  {
    id: "share",
    label: "Share",
    icon: Share2,
  },
  {
    id: "archive",
    label: "Archive",
    icon: Archive,
  },
  {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    variant: "destructive",
  },
]

export function BulkActionsBar({
  selectedItems,
  onClearSelection,
  onBulkDelete,
  onBulkMove,
  onBulkDownload,
  onBulkCopy,
  className,
}: BulkActionsBarProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false)

  const selectedCount = selectedItems.length
  const selectedFiles = selectedItems.filter((item) => item.type === "file")

  const handleAction = (actionId: string) => {
    const itemIds = selectedItems.map((item) => item.id)

    switch (actionId) {
      case "delete":
        onBulkDelete(itemIds)
        break
      case "move":
        onBulkMove(itemIds)
        break
      case "download":
        onBulkDownload(itemIds)
        break
      case "copy":
        onBulkCopy(itemIds)
        break
      case "star":
        console.log("Star items:", itemIds)
        break
      case "share":
        console.log("Share items:", itemIds)
        break
      case "archive":
        console.log("Create archive:", itemIds)
        break
    }

    setIsActionsOpen(false)
  }

  const getTotalSize = () => {
    return selectedFiles.reduce((total, file) => total + (file.size || 0), 0)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50",
        "bg-background/95 backdrop-blur-sm border border-border/40 rounded-2xl shadow-xl",
        "px-4 py-3 flex items-center gap-3",
        "animate-in slide-in-from-bottom-2 duration-300",
        "max-w-[90vw] min-w-[320px]",
        className,
      )}
    >
      {/* Selection Count */}
      <div className="flex items-center gap-2 min-w-0">
        <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-xs font-medium shrink-0">
          {selectedCount}
        </Badge>
        <span className="text-sm font-medium text-foreground truncate">{selectedCount === 1 ? "item" : "items"}</span>
        {selectedFiles.length > 0 && (
          <span className="text-xs text-muted-foreground shrink-0">{formatSize(getTotalSize())}</span>
        )}
      </div>

      <Separator orientation="vertical" className="h-5 shrink-0" />

      {/* Primary Actions */}
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="sm" onClick={() => handleAction("move")} className="rounded-xl h-8 px-3 text-xs">
          <Move className="h-3.5 w-3.5 mr-1.5" />
          Move
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction("download")}
          className="rounded-xl h-8 px-3 text-xs"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Download
        </Button>

        {/* More Actions */}
        <DropdownMenu open={isActionsOpen} onOpenChange={setIsActionsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-xl h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-border/40 w-40">
            {bulkActions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                onClick={() => handleAction(action.id)}
                className={cn(
                  "rounded-lg cursor-pointer text-xs",
                  action.variant === "destructive" && "text-red-500 hover:!text-red-500 hover:!bg-red-500/10",
                )}
              >
                <action.icon className="mr-2 h-3.5 w-3.5" />
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator orientation="vertical" className="h-5 shrink-0" />

      {/* Close Button */}
      <Button variant="ghost" size="sm" onClick={onClearSelection} className="rounded-xl h-8 w-8 p-0 shrink-0">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
