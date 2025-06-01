"use client"

import React from "react"
import { cn } from "@/lib/utils"
import type { FileSystemItem } from "@/lib/types"

interface DraggableItemProps {
  item: FileSystemItem
  isDragging: boolean
  isDragOver: boolean
  canDrop: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onDragOver: () => void
  onDragLeave: () => void
  onDrop: () => void
  children: React.ReactNode
  className?: string
}

export function DraggableItem({
  item,
  isDragging,
  isDragOver,
  canDrop,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
  className,
}: DraggableItemProps) {
  const handleDragStart = (e: React.DragEvent) => {
    console.log("DraggableItem: handleDragStart called for", item.name)

    // Prevent default to ensure drag works
    e.stopPropagation()

    // Set drag data
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", item.id)
    e.dataTransfer.setData("application/json", JSON.stringify(item))

    // Call the parent handler
    onDragStart()
  }

  const handleDragOver = (e: React.DragEvent) => {
    // Only allow drop on folders
    if (item.type === "folder" && canDrop) {
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = "move"
      onDragOver()
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    if (item.type === "folder" && canDrop) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only trigger if we're actually leaving this element
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      onDragLeave()
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    console.log("DraggableItem: handleDrop called on", item.name)

    if (item.type === "folder" && canDrop) {
      e.preventDefault()
      e.stopPropagation()

      // Get the dragged item data
      const draggedItemId = e.dataTransfer.getData("text/plain")
      console.log("Dropped item ID:", draggedItemId, "on folder:", item.name)

      onDrop()
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    console.log("DraggableItem: handleDragEnd called for", item.name)
    onDragEnd()
  }

  // Prevent text selection when dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only prevent default if we're clicking on the grip handle area
    const target = e.target as HTMLElement
    if (target.closest("[data-drag-handle]")) {
      e.preventDefault()
    }
  }

  const handleSelectStart = (e: React.SyntheticEvent) => {
    // Prevent text selection during drag
    if (isDragging) {
      e.preventDefault()
    }
  }

  // Clone the children and add drag props to the TableRow
  const enhancedChildren = React.cloneElement(children as React.ReactElement, {
    draggable: true,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragOver: handleDragOver,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    onMouseDown: handleMouseDown,
    onSelectStart: handleSelectStart,
    style: {
      userSelect: isDragging ? "none" : "auto",
      ...((children as React.ReactElement).props.style || {}),
    },
    className: cn(
      (children as React.ReactElement).props.className,
      "transition-all duration-200",
      isDragging && "opacity-50 scale-[0.98] shadow-lg",
      isDragOver &&
        item.type === "folder" &&
        canDrop &&
        "bg-green-50 dark:bg-green-950/20 ring-2 ring-green-500/50 ring-inset",
      className,
    ),
  })

  return enhancedChildren
}
