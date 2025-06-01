"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Upload, FolderOpen } from "lucide-react"

interface DropZoneProps {
  onDrop: (files: FileList) => void
  onItemDrop?: (draggedItemId: string) => void
  isActive?: boolean
  className?: string
  children?: React.ReactNode
  acceptsItems?: boolean
}

export function DropZone({ onDrop, onItemDrop, isActive, className, children, acceptsItems = false }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragType, setDragType] = useState<"files" | "items" | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Determine what's being dragged
    const hasFiles = e.dataTransfer.types.includes("Files")
    const hasItems = e.dataTransfer.types.includes("text/plain")

    if (hasFiles) {
      setDragType("files")
      e.dataTransfer.dropEffect = "copy"
    } else if (hasItems && acceptsItems) {
      setDragType("items")
      e.dataTransfer.dropEffect = "move"
    } else {
      e.dataTransfer.dropEffect = "none"
      return
    }

    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Only hide if we're actually leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false)
      setDragType(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    console.log("DropZone: handleDrop called, dragType:", dragType)

    if (dragType === "files") {
      const files = e.dataTransfer.files
      if (files.length > 0) {
        console.log("Dropping files:", files.length)
        onDrop(files)
      }
    } else if (dragType === "items" && onItemDrop) {
      const draggedItemId = e.dataTransfer.getData("text/plain")
      if (draggedItemId) {
        console.log("Dropping item:", draggedItemId)
        onItemDrop(draggedItemId)
      }
    }

    setDragType(null)
  }

  return (
    <div
      className={cn(
        "relative transition-all duration-200",
        isDragOver && dragType === "files" && "bg-blue-50 dark:bg-blue-950/20",
        isDragOver && dragType === "items" && "bg-green-50 dark:bg-green-950/20",
        isActive && "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700",
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {isDragOver && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center border-2 border-dashed rounded-xl z-10 pointer-events-none",
            dragType === "files" && "bg-blue-500/10 border-blue-500",
            dragType === "items" && "bg-green-500/10 border-green-500",
          )}
        >
          <div
            className={cn(
              "flex flex-col items-center gap-2",
              dragType === "files" && "text-blue-600 dark:text-blue-400",
              dragType === "items" && "text-green-600 dark:text-green-400",
            )}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                dragType === "files" && "bg-blue-500/20",
                dragType === "items" && "bg-green-500/20",
              )}
            >
              {dragType === "files" ? <Upload className="h-6 w-6" /> : <FolderOpen className="h-6 w-6" />}
            </div>
            <p className="text-sm font-medium">{dragType === "files" ? "Drop files here" : "Move here"}</p>
          </div>
        </div>
      )}
    </div>
  )
}
