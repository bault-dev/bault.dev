"use client"

import type React from "react"

import { useState, type ChangeEvent, useMemo } from "react"
import type { FileSystemItem, SortByType, SortOrderType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActionModal } from "./action-modal"
import { DropZone } from "./drop-zone"
import { DraggableItem } from "./draggable-item"
import { useDragDrop } from "@/hooks/use-drag-drop"
import { BulkActionsBar } from "./bulk-actions-bar"
import { BulkActionModal } from "./bulk-action-modal"
import {
  Folder,
  UploadCloud,
  MoreVertical,
  ArrowUpDown,
  Trash2,
  Edit3,
  Search,
  FolderPlus,
  Move,
  GripVertical,
  CheckSquare,
  Filter,
  X,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { FileIconWithBackground, FileExtensionBadge } from "@/lib/file-icons"

interface FileExplorerProps {
  items: FileSystemItem[]
  currentPath: FileSystemItem[]
  allFolders: FileSystemItem[]
  onFileUpload: (file: File) => void
  onFilesUpload: (files: FileList) => void
  onItemClick: (item: FileSystemItem) => void
  onBreadcrumbClick: (folderId: string | null) => void
  onDeleteItem: (itemId: string) => void
  onRenameItem: (itemId: string, newName: string) => void
  onMoveItem: (itemId: string, targetFolderId: string | null) => void
  onCreateFolder: () => void
  currentFolderId: string | null
  fileTypeFilter: string | null
  onClearFilter: () => void
}

export function FileExplorer({
  items,
  currentPath,
  allFolders,
  onFileUpload,
  onFilesUpload,
  onItemClick,
  onBreadcrumbClick,
  onDeleteItem,
  onRenameItem,
  onMoveItem,
  onCreateFolder,
  currentFolderId,
  fileTypeFilter,
  onClearFilter,
}: FileExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortByType>("name")
  const [sortOrder, setSortOrder] = useState<SortOrderType>("asc")
  const [modalAction, setModalAction] = useState<"rename" | "move" | "delete" | null>(null)
  const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<"move" | "delete" | "download" | null>(null)
  const [isSelectMode, setIsSelectMode] = useState(false)

  const { dragState, handleDragStart, handleDragOver, handleDragEnd, canDrop, resetDragState } = useDragDrop()

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileUpload(event.target.files[0])
      event.target.value = ""
    }
  }

  const handleFilesUpload = (files: FileList) => {
    console.log("FileExplorer: handleFilesUpload called with", files.length, "files")
    onFilesUpload(files)
  }

  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

    filtered.sort((a, b) => {
      let comparison = 0
      const valA = a[sortBy]
      const valB = b[sortBy]

      if (sortBy === "type") {
        if (a.type === "folder" && b.type === "file") comparison = -1
        else if (a.type === "file" && b.type === "folder") comparison = 1
        else comparison = a.name.localeCompare(b.name)
      } else if (sortBy === "size") {
        comparison = (a.size ?? 0) - (b.size ?? 0)
      } else if (sortBy === "lastModified") {
        comparison = (a.lastModified?.getTime() ?? 0) - (b.lastModified?.getTime() ?? 0)
      } else {
        comparison = a.name.localeCompare(b.name)
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [items, searchTerm, sortBy, sortOrder])

  const handleSort = (column: SortByType) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const getFileSize = (sizeInBytes?: number) => {
    if (sizeInBytes === undefined) return "-"
    if (sizeInBytes < 1024) return `${sizeInBytes} B`
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleActionClick = (action: "rename" | "move" | "delete", item: FileSystemItem) => {
    setSelectedItem(item)
    setModalAction(action)
  }

  const handleModalConfirm = (data: any) => {
    if (!selectedItem) return

    switch (modalAction) {
      case "rename":
        onRenameItem(selectedItem.id, data.newName)
        break
      case "move":
        onMoveItem(selectedItem.id, data.targetFolderId === "root" ? null : data.targetFolderId)
        break
      case "delete":
        onDeleteItem(selectedItem.id)
        break
    }

    setModalAction(null)
    setSelectedItem(null)
  }

  const handleModalClose = () => {
    setModalAction(null)
    setSelectedItem(null)
  }

  const handleItemDragStart = (item: FileSystemItem) => {
    console.log("FileExplorer: handleItemDragStart called for", item.name)
    handleDragStart(item)
  }

  const handleItemDragOver = (item: FileSystemItem) => {
    if (item.type === "folder") {
      handleDragOver(item)
    }
  }

  const handleItemDrop = (targetItem: FileSystemItem) => {
    console.log("FileExplorer: handleItemDrop called", {
      draggedItem: dragState.draggedItem?.name,
      targetItem: targetItem.name,
      canDrop: canDrop(targetItem),
    })

    if (dragState.draggedItem && targetItem.type === "folder" && canDrop(targetItem)) {
      console.log("Moving item:", dragState.draggedItem.name, "to folder:", targetItem.name)
      onMoveItem(dragState.draggedItem.id, targetItem.id)
    }
    handleDragEnd()
  }

  const handleRootDrop = (draggedItemId: string) => {
    console.log("FileExplorer: handleRootDrop called for item ID:", draggedItemId)
    if (draggedItemId) {
      onMoveItem(draggedItemId, null)
    }
    resetDragState()
  }

  const handleBreadcrumbDrop = (folderId: string | null, draggedItemId: string) => {
    console.log("FileExplorer: handleBreadcrumbDrop called", { folderId, draggedItemId })
    if (draggedItemId) {
      onMoveItem(draggedItemId, folderId)
    }
    resetDragState()
  }

  // Handle clicking on the row vs the drag handle
  const handleRowClick = (item: FileSystemItem, e: React.MouseEvent) => {
    // Don't trigger click if we're clicking on the drag handle
    const target = e.target as HTMLElement
    if (target.closest("[data-drag-handle]")) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onItemClick(item)
  }

  const handleItemSelect = (itemId: string, isSelected: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(itemId)
      } else {
        newSet.delete(itemId)
      }

      // Auto-exit select mode if no items selected
      if (newSet.size === 0) {
        setIsSelectMode(false)
      }

      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedItems.size === filteredAndSortedItems.length) {
      setSelectedItems(new Set())
      setIsSelectMode(false)
    } else {
      setSelectedItems(new Set(filteredAndSortedItems.map((item) => item.id)))
      setIsSelectMode(true)
    }
  }

  const handleClearSelection = () => {
    setSelectedItems(new Set())
    setIsSelectMode(false)
  }

  const handleBulkDelete = (itemIds: string[]) => {
    setBulkAction("delete")
  }

  const handleBulkMove = (itemIds: string[]) => {
    setBulkAction("move")
  }

  const handleBulkDownload = (itemIds: string[]) => {
    setBulkAction("download")
  }

  const handleBulkCopy = (itemIds: string[]) => {
    // TODO: Implement bulk copy
    console.log("Bulk copy:", itemIds)
  }

  const handleBulkActionConfirm = (data: any) => {
    const { action, itemIds } = data

    switch (action) {
      case "delete":
        itemIds.forEach((id: string) => onDeleteItem(id))
        break
      case "move":
        itemIds.forEach((id: string) => onMoveItem(id, data.targetFolderId))
        break
      case "download":
        // TODO: Implement bulk download
        console.log("Bulk download:", itemIds)
        break
    }

    setBulkAction(null)
    setSelectedItems(new Set())
    setIsSelectMode(false)
  }

  const getSelectedItemsData = () => {
    return filteredAndSortedItems.filter((item) => selectedItems.has(item.id))
  }

  return (
    <DropZone
      onDrop={handleFilesUpload}
      onItemDrop={handleRootDrop}
      acceptsItems={true}
      className="flex-1 p-6 md:p-8 space-y-6 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen"
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Breadcrumbs with Drop Zones */}
        <div className="flex items-center space-x-2 text-sm">
          <DropZone
            onDrop={handleFilesUpload}
            onItemDrop={(itemId) => handleBreadcrumbDrop(null, itemId)}
            acceptsItems={true}
            className="rounded-lg"
          >
            <Button
              variant="ghost"
              className="p-0 h-auto text-muted-foreground hover:text-foreground rounded-lg px-2 py-1 transition-all duration-200"
              onClick={() => onBreadcrumbClick(null)}
            >
              Root
            </Button>
          </DropZone>
          {currentPath.map((folder, index) => (
            <div key={folder.id} className="flex items-center space-x-2">
              <span className="text-muted-foreground">/</span>
              <DropZone
                onDrop={handleFilesUpload}
                onItemDrop={(itemId) => handleBreadcrumbDrop(folder.id, itemId)}
                acceptsItems={true}
                className="rounded-lg"
              >
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-muted-foreground hover:text-foreground rounded-lg px-2 py-1 transition-all duration-200"
                  onClick={() => onBreadcrumbClick(folder.id)}
                  disabled={index === currentPath.length - 1}
                >
                  {folder.name}
                </Button>
              </DropZone>
            </div>
          ))}
        </div>

        {/* Active Filter Indicator */}
        {fileTypeFilter && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Filtered by: {fileTypeFilter.charAt(0).toUpperCase() + fileTypeFilter.slice(1)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilter}
              className="h-6 w-6 p-0 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search files..."
              className="w-full md:w-64 pl-10 rounded-xl border-border/40 bg-background/50 backdrop-blur"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Bulk Selection Toggle */}
          <Button
            onClick={() => {
              setIsSelectMode(!isSelectMode)
              if (isSelectMode) {
                setSelectedItems(new Set())
              }
            }}
            variant={isSelectMode ? "default" : "outline"}
            className="rounded-xl border-border/40 hover:bg-muted/50 transition-all duration-200"
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            {isSelectMode ? "Exit Select" : "Select"}
          </Button>

          {isSelectMode && (
            <Button
              onClick={handleSelectAll}
              variant="outline"
              className="rounded-xl border-border/40 hover:bg-muted/50 transition-all duration-200"
            >
              {selectedItems.size === filteredAndSortedItems.length ? "Deselect All" : "Select All"}
            </Button>
          )}

          <Button
            onClick={onCreateFolder}
            variant="outline"
            className="rounded-xl border-border/40 hover:bg-muted/50 transition-all duration-200"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Folder
          </Button>
          <Button
            asChild
            className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              <UploadCloud className="mr-2 h-4 w-4" /> Upload File
              <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
            </label>
          </Button>
        </div>
      </div>

      {/* File Table */}
      <Card className="border-border/40 shadow-lg rounded-2xl overflow-hidden bg-background/80 backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 bg-muted/30">
              <TableHead className="w-[50px] rounded-tl-2xl">
                {isSelectMode && (
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filteredAndSortedItems.length && filteredAndSortedItems.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-border/40"
                  />
                )}
              </TableHead>
              <TableHead
                onClick={() => handleSort("name")}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Name
                  {sortBy === "name" && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("type")}
                className="cursor-pointer hover:bg-muted/50 transition-colors hidden md:table-cell"
              >
                <div className="flex items-center gap-2">
                  Type
                  {sortBy === "type" && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("lastModified")}
                className="cursor-pointer hover:bg-muted/50 transition-colors hidden sm:table-cell"
              >
                <div className="flex items-center gap-2">
                  Last Modified
                  {sortBy === "lastModified" && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("size")}
                className="cursor-pointer hover:bg-muted/50 transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-2">
                  Size
                  {sortBy === "size" && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
              <TableHead className="w-[50px] text-right rounded-tr-2xl">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedItems.length > 0 ? (
              filteredAndSortedItems.map((item) => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  isDragging={dragState.draggedItem?.id === item.id}
                  isDragOver={dragState.dragOverItem?.id === item.id}
                  canDrop={canDrop(item)}
                  onDragStart={() => handleItemDragStart(item)}
                  onDragEnd={handleDragEnd}
                  onDragOver={() => handleItemDragOver(item)}
                  onDragLeave={() => handleDragOver(null)}
                  onDrop={() => handleItemDrop(item)}
                >
                  <TableRow
                    onClick={(e) => {
                      if (isSelectMode) {
                        e.preventDefault()
                        e.stopPropagation()
                        handleItemSelect(item.id, !selectedItems.has(item.id))
                      } else {
                        handleRowClick(item, e)
                      }
                    }}
                    className={cn(
                      "cursor-pointer hover:bg-muted/30 transition-all duration-200 border-border/20 group",
                      isSelectMode &&
                        selectedItems.has(item.id) &&
                        "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
                    )}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        {isSelectMode ? (
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleItemSelect(item.id, e.target.checked)
                            }}
                            className="rounded border-border/40"
                          />
                        ) : (
                          <div
                            data-drag-handle
                            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50 transition-colors"
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                        <FileIconWithBackground fileName={item.name} isFolder={item.type === "folder"} size="md" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium py-4">
                      <div className="flex items-center gap-3">
                        <span className="truncate">{item.name}</span>
                        {item.type === "file" && <FileExtensionBadge fileName={item.name} className="shrink-0" />}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-4">
                      <Badge variant="outline" className="rounded-full capitalize">
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-4 text-muted-foreground">
                      {item.lastModified ? format(new Date(item.lastModified), "MMM dd, yyyy HH:mm") : "-"}
                    </TableCell>
                    <TableCell className="text-right py-4 text-muted-foreground">{getFileSize(item.size)}</TableCell>
                    <TableCell className="text-right py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/50">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-border/40">
                          {item.type === "folder" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onItemClick(item)
                              }}
                              className="rounded-lg"
                            >
                              <Folder className="mr-2 h-4 w-4" />
                              Open
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleActionClick("rename", item)
                            }}
                            className="rounded-lg"
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleActionClick("move", item)
                            }}
                            className="rounded-lg"
                          >
                            <Move className="mr-2 h-4 w-4" />
                            Move
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleActionClick("delete", item)
                            }}
                            className="text-red-500 hover:!text-red-500 hover:!bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </DraggableItem>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                      <FileIconWithBackground fileName="empty" size="lg" />
                    </div>
                    <div>
                      <p className="font-medium">No files or folders</p>
                      <p className="text-sm">Upload something or create a new folder to get started!</p>
                      <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">
                        💡 Tip: Drag files here or drag items between folders
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Action Modal */}
      <ActionModal
        isOpen={!!modalAction}
        onClose={handleModalClose}
        action={modalAction}
        item={selectedItem}
        folders={allFolders}
        onConfirm={handleModalConfirm}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedItems={getSelectedItemsData()}
        onClearSelection={handleClearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkMove={handleBulkMove}
        onBulkDownload={handleBulkDownload}
        onBulkCopy={handleBulkCopy}
      />

      {/* Bulk Action Modal */}
      <BulkActionModal
        isOpen={!!bulkAction}
        onClose={() => setBulkAction(null)}
        action={bulkAction}
        selectedItems={getSelectedItemsData()}
        folders={allFolders}
        onConfirm={handleBulkActionConfirm}
      />
    </DropZone>
  )
}
