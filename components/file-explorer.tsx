"use client"

import React, { useState, type ChangeEvent, useMemo, useEffect } from "react"
import type { FileSystemItem, SortByType, SortOrderType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  FolderPlus,
  Move,
  List,
  LayoutGrid,
  Star,
  Share2,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { FileIconWithBackground, FileExtensionBadge } from "@/lib/file-icons"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

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
  onToggleStar: (itemId: string) => void
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
  onToggleStar,
}: FileExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortByType>("name")
  const [sortOrder, setSortOrder] = useState<SortOrderType>("asc")
  const [modalAction, setModalAction] = useState<"rename" | "move" | "delete" | "share" | null>(null)
  const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)
  const [bulkAction, setBulkAction] = useState<"move" | "delete" | "download" | "share" | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

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

  const handleActionClick = (action: "rename" | "move" | "delete" | "share", item: FileSystemItem) => {
    setSelectedItem(item)
    setModalAction(action)
  }

  const handleToggleStar = (item: FileSystemItem) => {
    if (!item) return
    onToggleStar(item.id)
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

  const handleRowSelect = (
    e: React.MouseEvent,
    itemId: string,
    rowIndex: number
  ) => {
    if (e.shiftKey && lastSelectedIndex !== null) {
      // Shift + click: seleccionar rango
      const start = Math.min(lastSelectedIndex, rowIndex)
      const end = Math.max(lastSelectedIndex, rowIndex)
      const idsInRange = filteredAndSortedItems.slice(start, end + 1).map((item) => item.id)
      setSelectedItems((prev) => {
        const newSet = new Set(prev)
        idsInRange.forEach((id) => newSet.add(id))
        return newSet
      })
    } else if (e.metaKey || e.ctrlKey) {
      // Cmd/Ctrl + click: alternar selección
      setSelectedItems((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(itemId)) {
          newSet.delete(itemId)
        } else {
          newSet.add(itemId)
        }
        return newSet
      })
      setLastSelectedIndex(rowIndex)
    } else {
      // Click simple: si solo esa está seleccionada, deselecciona todo; si no, selecciona solo esa
      setSelectedItems((prev) => {
        if (prev.size === 1 && prev.has(itemId)) {
          setLastSelectedIndex(null);
          return new Set();
        }
        setLastSelectedIndex(rowIndex);
        return new Set([itemId]);
      });
    }
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

  const handleBulkShare = (itemIds: string[]) => {
    setBulkAction("share")
  }

  const handleBulkActionConfirm = (data: any) => {
    const { action, itemIds, email } = data

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
      case "share":
        // Aquí irá la lógica real de compartir
        alert(`Compartido: ${itemIds.length} elemento(s) con ${email}`)
        break
    }

    setBulkAction(null)
    setSelectedItems(new Set())
  }

  const getSelectedItemsData = () => {
    return filteredAndSortedItems.filter((item) => selectedItems.has(item.id))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedItems(new Set());
        setLastSelectedIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <DropZone
      onDrop={handleFilesUpload}
      onItemDrop={handleRootDrop}
      acceptsItems={true}
      className="flex-1 p-6 md:p-8 bg-linear-to-br from-background via-background to-muted/20 min-h-screen"
    >
      <div
        onClick={() => {
          setSelectedItems(new Set());
          setLastSelectedIndex(null);
        }}
        className="space-y-6 h-full"
      >
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          {/* Breadcrumb a la izquierda, ocupa todo el espacio */}
          <div className="flex-1 min-w-0">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <DropZone
                    onDrop={handleFilesUpload}
                    onItemDrop={(itemId) => handleBreadcrumbDrop(null, itemId)}
                    acceptsItems={true}
                    className="rounded-lg"
                  >
                    {currentPath.length === 0 ? (
                      <BreadcrumbPage className="px-2 py-2 rounded-lg transition-all duration-200 text-base">Mi Unidad</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild className="text-base">
                        <Button
                          variant="ghost"
                          className="text-base text-muted-foreground hover:text-foreground rounded-lg px-2 py-2 transition-all duration-200"
                          onClick={() => onBreadcrumbClick(null)}
                        >
                          Mi Unidad
                        </Button>
                      </BreadcrumbLink>
                    )}
                  </DropZone>
                </BreadcrumbItem>
                {currentPath.map((folder, index) => (
                  <React.Fragment key={folder.id}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <DropZone
                        onDrop={handleFilesUpload}
                        onItemDrop={(itemId) => handleBreadcrumbDrop(folder.id, itemId)}
                        acceptsItems={true}
                        className="rounded-lg"
                      >
                        {index === currentPath.length - 1 ? (
                          <BreadcrumbPage className="px-2 py-2 rounded-lg transition-all duration-200 text-base">{folder.name}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild className="text-base">
                            <Button
                              variant="ghost"
                              className="text-base text-muted-foreground hover:text-foreground rounded-lg px-2 py-2 transition-all duration-200"
                              onClick={() => onBreadcrumbClick(folder.id)}
                            >
                              {folder.name}
                            </Button>
                          </BreadcrumbLink>
                        )}
                      </DropZone>
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {/* Acciones alineadas a la derecha */}
          <div className="flex items-center gap-3 flex-shrink-0">

            <div className="*:not-first:mt-2">
              <div className="relative">
                <Input
                  id="search"
                  className="pe-11"
                  placeholder="Search..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2">
                  <kbd className="text-muted-foreground/70 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>

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
              className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                <UploadCloud className="mr-2 h-4 w-4" /> Upload File
                <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
            </Button>
            <ToggleGroup
              type="single"
              value={viewMode}
              variant="outline"
              onValueChange={(val) => val && setViewMode(val as "list" | "grid")}
              className="bg-transparent"
            >
              <ToggleGroupItem
                value="list"
                aria-label="Vista de lista"
                className={cn(
                  "transition-all duration-200 hover:bg-muted/50 active:scale-95"
                )}
              >
                <List
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    viewMode === "list" ? "" : "text-muted-foreground"
                  )}
                />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="grid"
                aria-label="Vista de cuadrícula"
                className={cn(
                  "transition-all duration-200 hover:bg-muted/50 active:scale-95"
                )}
              >
                <LayoutGrid
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    viewMode === "grid" ? "" : "text-muted-foreground"
                  )}
                />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* File Table or Grid */}
        {viewMode === "list" ? (
          <Card className="border-border/40 shadow-lg py-0 rounded-2xl overflow-hidden bg-background/80 backdrop-blur-sm">
            <Table onClick={(e) => e.stopPropagation()}>
              <TableHeader>
                <TableRow className="border-border/40 bg-muted/30">
                  <TableHead className="w-[50px] text-muted-foreground rounded-tl-2xl px-4 h-12"></TableHead>
                  <TableHead
                    onClick={() => handleSort("name")}
                    className="cursor-pointer hover:bg-muted/50 transition-colors px-4 h-12 text-muted-foreground"
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {sortBy === "name" && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("type")}
                    className="cursor-pointer hover:bg-muted/50 transition-colors hidden md:table-cell px-4 h-12 text-muted-foreground"
                  >
                    <div className="flex items-center gap-2">
                      Type
                      {sortBy === "type" && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell px-4 h-12 text-muted-foreground">Owner</TableHead>
                  <TableHead
                    onClick={() => handleSort("lastModified")}
                    className="cursor-pointer hover:bg-muted/50 transition-colors hidden sm:table-cell px-4 h-12 text-muted-foreground w-50"
                  >
                    <div className="flex items-center gap-2">
                      Last Modified
                      {sortBy === "lastModified" && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("size")}
                    className="cursor-pointer hover:bg-muted/50 transition-colors text-right px-4 h-12 text-muted-foreground"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Size
                      {sortBy === "size" && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead className="w-[50px] text-right rounded-tr-2xl px-4 h-12 text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedItems.length > 0 ? (
                  filteredAndSortedItems.map((item, idx) => (
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
                        onClick={(e) => handleRowSelect(e, item.id, idx)}
                        onDoubleClick={(e) => handleRowClick(item, e)}
                        className={cn(
                          "cursor-pointer hover:bg-muted/30 transition-all duration-200 border-border/20 group",
                          selectedItems.has(item.id) &&
                          "bg-blue-50 dark:bg-blue-950/20",
                        )}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
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
                          <Badge variant="outline" className="rounded-lg capitalize text-muted-foreground">
                            {item.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-4 text-muted-foreground">
                          {item.owner}
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
                                  handleToggleStar(item)
                                }}
                                className="rounded-lg"
                              >
                                <Star className={cn("mr-2 h-4 w-4", item.starred ? "text-yellow-400 fill-yellow-400" : "")} />
                                {item.starred ? "Remove from Favorites" : "Add to Favorites"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleActionClick("share", item)
                                }}
                                className="rounded-lg"
                              >
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleActionClick("delete", item)
                                }}
                                className="text-red-500 hover:text-red-500! hover:bg-red-500/10! rounded-lg"
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
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredAndSortedItems.length > 0 ? (
              filteredAndSortedItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={(e) => handleRowSelect(e, item.id, idx)}
                  onDoubleClick={(e) => handleRowClick(item, e)}
                  className={cn(
                    "group cursor-pointer rounded-2xl border border-border/40 bg-background/80 shadow-md hover:bg-muted/30 transition-all duration-200 p-4 flex flex-col items-center justify-center",
                    selectedItems.has(item.id) && "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                  )}
                >
                  <FileIconWithBackground fileName={item.name} isFolder={item.type === "folder"} size="lg" />
                  <div className="mt-3 w-full text-center">
                    <span className="block font-medium truncate">{item.name}</span>
                    <div className="text-xs text-muted-foreground mt-1 truncate">{item.owner}</div>
                    {item.type === "file" && <FileExtensionBadge fileName={item.name} className="shrink-0" />}
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.lastModified ? format(new Date(item.lastModified), "MMM dd, yyyy HH:mm") : "-"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getFileSize(item.size)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 mx-auto">
                    <FileIconWithBackground fileName="empty" size="lg" />
                  </div>
                  <p className="font-medium">No files or folders</p>
                  <p className="text-sm">Upload something or create a new folder to get started!</p>
                  <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">
                    💡 Tip: Drag files here or drag items between folders
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

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
          onClearSelection={() => setSelectedItems(new Set())}
          onBulkDelete={handleBulkDelete}
          onBulkMove={handleBulkMove}
          onBulkDownload={handleBulkDownload}
          onBulkCopy={handleBulkCopy}
          onBulkShare={handleBulkShare}
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
      </div>
    </DropZone>
  )
}
