import type React from "react"
export interface FileSystemItem {
  id: string
  name: string
  type: "file" | "folder"
  parentId: string | null
  size?: number // in bytes
  lastModified?: Date
  content?: string // For simplicity, storing content of small files
  children?: FileSystemItem[] // For UI rendering convenience
}

export type SortByType = "name" | "type" | "lastModified" | "size"
export type SortOrderType = "asc" | "desc"

export interface BulkAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  variant?: "default" | "destructive"
  requiresTarget?: boolean
}
