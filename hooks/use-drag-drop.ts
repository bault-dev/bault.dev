"use client"

import { useState, useCallback } from "react"
import type { FileSystemItem } from "@/lib/types"

interface DragDropState {
  draggedItem: FileSystemItem | null
  dragOverItem: FileSystemItem | null
  isDragging: boolean
}

export function useDragDrop() {
  const [dragState, setDragState] = useState<DragDropState>({
    draggedItem: null,
    dragOverItem: null,
    isDragging: false,
  })

  const handleDragStart = useCallback((item: FileSystemItem) => {
    console.log("Drag started for item:", item.name)
    setDragState({
      draggedItem: item,
      dragOverItem: null,
      isDragging: true,
    })
  }, [])

  const handleDragOver = useCallback((item: FileSystemItem | null) => {
    setDragState((prev) => ({
      ...prev,
      dragOverItem: item,
    }))
  }, [])

  const handleDragEnd = useCallback(() => {
    console.log("Drag ended")
    setDragState({
      draggedItem: null,
      dragOverItem: null,
      isDragging: false,
    })
  }, [])

  const canDrop = useCallback(
    (targetItem: FileSystemItem | null) => {
      if (!dragState.draggedItem) return false

      // Can't drop on itself
      if (targetItem && targetItem.id === dragState.draggedItem.id) return false

      // Can't drop into a file
      if (targetItem && targetItem.type === "file") return false

      // Can't drop a folder into its own child (simplified check)
      if (targetItem && dragState.draggedItem.type === "folder") {
        // For now, we'll allow it and handle validation in the move function
      }

      return true
    },
    [dragState.draggedItem],
  )

  const resetDragState = useCallback(() => {
    setDragState({
      draggedItem: null,
      dragOverItem: null,
      isDragging: false,
    })
  }, [])

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    canDrop,
    resetDragState,
  }
}
