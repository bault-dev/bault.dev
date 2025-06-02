"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { BaultSidebar } from "@/components/bault-sidebar"
import { FileExplorer } from "@/components/file-explorer"
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import type { FileSystemItem } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { FilePreviewModal } from "@/components/file-preview-modal"
import { toast } from "sonner"

const MAX_STORAGE_BYTES = 20 * 1024 * 1024 // 20MB

const initialFileSystemData: FileSystemItem[] = [
  { id: "1", name: "Documents", type: "folder", parentId: null, children: [] },
  { id: "2", name: "Pictures", type: "folder", parentId: null, children: [] },
  { id: "3", name: "Code", type: "folder", parentId: null, children: [] },
  {
    id: "4",
    name: "config.json",
    type: "file",
    parentId: null,
    size: 1024,
    lastModified: new Date(),
    content: JSON.stringify(
      {
        appName: "Bault",
        version: "1.0.0",
        features: { preview: true, darkMode: true, autoSave: false },
        theme: "dark",
        port: 3000,
        database: {
          host: "localhost",
          port: 5432,
          name: "bault_db",
        },
      },
      null,
      2,
    ),
  },
  { id: "5", name: "My Notes", type: "folder", parentId: "1", children: [] },
  {
    id: "6",
    name: "report.docx",
    type: "file",
    parentId: "1",
    size: 204800,
    lastModified: new Date(Date.now() - 86400000),
    content: "This is a sample report document. \n\nSection 1: Introduction...",
  },
  {
    id: "7",
    name: "image.png",
    type: "file",
    parentId: "2",
    size: 1024000,
    lastModified: new Date(Date.now() - 172800000),
  },
  {
    id: "8",
    name: "component.tsx",
    type: "file",
    parentId: "3",
    size: 2048,
    lastModified: new Date(Date.now() - 3600000),
    content: `import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  title: string
  onSave: (data: any) => void
}

export function ExampleComponent({ title, onSave }: Props) {
  const [count, setCount] = useState(0)
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Fetch data on component mount
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSave = () => {
    onSave({ count, data })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Count: {count}</p>
          <Button onClick={() => setCount(count + 1)}>
            Increment
          </Button>
          <Button onClick={handleSave} variant="outline">
            Save Data
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}`,
  },
  {
    id: "9",
    name: "utils.py",
    type: "file",
    parentId: "3",
    size: 1536,
    lastModified: new Date(Date.now() - 7200000),
    content: `#!/usr/bin/env python3
"""
Utility functions for data processing and file operations.
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataProcessor:
    """A class for processing various data formats."""
    
    def __init__(self, config_path: str = "config.json"):
        self.config_path = config_path
        self.config = self.load_config()
    
    def load_config(self) -> Dict[str, Any]:
        """Load configuration from JSON file."""
        try:
            with open(self.config_path, 'r') as file:
                config = json.load(file)
                logger.info(f"Configuration loaded from {self.config_path}")
                return config
        except FileNotFoundError:
            logger.warning(f"Config file {self.config_path} not found")
            return {}
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing config file: {e}")
            return {}
    
    def process_data(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process a list of data dictionaries."""
        processed = []
        
        for item in data:
            # Add timestamp
            item['processed_at'] = datetime.now().isoformat()
            
            # Validate required fields
            if self.validate_item(item):
                processed.append(item)
            else:
                logger.warning(f"Invalid item skipped: {item}")
        
        return processed
    
    def validate_item(self, item: Dict[str, Any]) -> bool:
        """Validate a single data item."""
        required_fields = self.config.get('required_fields', [])
        return all(field in item for field in required_fields)

def save_to_file(data: Any, filename: str) -> bool:
    """Save data to a JSON file."""
    try:
        with open(filename, 'w') as file:
            json.dump(data, file, indent=2)
        logger.info(f"Data saved to {filename}")
        return True
    except Exception as e:
        logger.error(f"Error saving data: {e}")
        return False

if __name__ == "__main__":
    processor = DataProcessor()
    sample_data = [
        {"id": 1, "name": "Item 1", "value": 100},
        {"id": 2, "name": "Item 2", "value": 200},
    ]
    
    processed = processor.process_data(sample_data)
    save_to_file(processed, "output.json")`,
  },
  {
    id: "10",
    name: "styles.css",
    type: "file",
    parentId: "3",
    size: 1024,
    lastModified: new Date(Date.now() - 10800000),
    content: `/* Modern CSS with custom properties and animations */

:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --background-color: #ffffff;
  --text-color: #1f2937;
  --border-radius: 0.5rem;
  --transition-duration: 0.2s;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background-color: #1f2937;
    --text-color: #f9fafb;
    --secondary-color: #9ca3af;
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
  transition: background-color var(--transition-duration) ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.card {
  background: var(--background-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  transition: transform var(--transition-duration) ease,
              box-shadow var(--transition-duration) ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
}

.button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-duration) ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.button:hover {
  background: color-mix(in srgb, var(--primary-color) 90%, black);
  transform: translateY(-1px);
}

.button:active {
  transform: translateY(0);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .card {
    padding: 1rem;
  }
}`,
  },
]

export default function DashboardPage() {
  const [fileSystemData, setFileSystemData] = useState<FileSystemItem[]>(initialFileSystemData)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [usedStorage, setUsedStorage] = useState<number>(0)
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [previewFile, setPreviewFile] = useState<FileSystemItem | null>(null)
  const [fileTypeFilter, setFileTypeFilter] = useState<string | null>(null)

  useEffect(() => {
    const totalSize = fileSystemData
      .filter((item) => item.type === "file" && item.size)
      .reduce((sum, file) => sum + (file.size || 0), 0)
    setUsedStorage(totalSize)
  }, [fileSystemData])

  const getCurrentPath = useCallback((): FileSystemItem[] => {
    const path: FileSystemItem[] = []
    let folderId = currentFolderId
    while (folderId) {
      const folder = fileSystemData.find((item) => item.id === folderId)
      if (folder) {
        path.unshift(folder)
        folderId = folder.parentId
      } else {
        break
      }
    }
    return path
  }, [currentFolderId, fileSystemData])

  const currentItems = useMemo(() => {
    let items = fileSystemData.filter((item) => item.parentId === currentFolderId)

    if (fileTypeFilter) {
      items = items.filter((item) => {
        if (item.type === "folder") return fileTypeFilter === "folders"

        const extension = item.name.toLowerCase().split(".").pop() || ""

        switch (fileTypeFilter) {
          case "code":
            return [
              "js",
              "jsx",
              "ts",
              "tsx",
              "py",
              "java",
              "c",
              "cpp",
              "cs",
              "php",
              "rb",
              "go",
              "rs",
              "swift",
              "kt",
            ].includes(extension)
          case "styles":
            return ["css", "scss", "sass", "less"].includes(extension)
          case "documents":
            return ["md", "txt", "pdf", "doc", "docx", "rtf"].includes(extension)
          case "images":
            return ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "ico"].includes(extension)
          case "config":
            return (
              ["json", "yaml", "yml", "toml", "env", "ini", "conf", "config"].includes(extension) ||
              item.name.includes("config") ||
              item.name.startsWith(".env")
            )
          case "data":
            return ["csv", "sql", "db", "sqlite", "xml"].includes(extension)
          default:
            return true
        }
      })
    }

    return items
  }, [fileSystemData, currentFolderId, fileTypeFilter])
  const currentPath = getCurrentPath()
  const allFolders = fileSystemData.filter((item) => item.type === "folder")

  const isTextFile = (fileName: string): boolean => {
    const textExtensions = [
      ".txt",
      ".json",
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".md",
      ".env",
      ".config",
      ".xml",
      ".html",
      ".css",
      ".yml",
      ".yaml",
      ".log",
      ".sh",
      ".py",
      ".rb",
      ".java",
      ".c",
      ".cpp",
      ".h",
      ".cs",
      ".go",
      ".php",
      ".sql",
      ".csv",
    ]
    const lowerFileName = fileName.toLowerCase()
    return textExtensions.some((ext) => lowerFileName.endsWith(ext))
  }

  const handleFileUpload = async (file: File) => {
    if (usedStorage + file.size > MAX_STORAGE_BYTES) {
      toast.error("Storage Limit Exceeded", { description: "Cannot upload file, not enough storage space." })
      return
    }

    let fileContent: string | undefined = undefined
    if (isTextFile(file.name)) {
      try {
        fileContent = await file.text()
      } catch (error) {
        console.error("Error reading file content:", error)
        toast.error("Error", { description: "Could not read file content." })
      }
    }

    const newFile: FileSystemItem = {
      id: crypto.randomUUID(),
      name: file.name,
      type: "file",
      parentId: currentFolderId,
      size: file.size,
      lastModified: new Date(file.lastModified),
      content: fileContent,
    }
    setFileSystemData((prev) => [...prev, newFile])
    toast.success("File Uploaded", { description: `${file.name} has been uploaded.` })
  }

  const handleFilesUpload = async (files: FileList) => {
    const fileArray = Array.from(files)
    let totalSize = 0

    for (const file of fileArray) {
      totalSize += file.size
    }

    if (usedStorage + totalSize > MAX_STORAGE_BYTES) {
      toast.error("Storage Limit Exceeded", { description: "Cannot upload files, not enough storage space." })
      return
    }

    const newFiles: FileSystemItem[] = []

    for (const file of fileArray) {
      let fileContent: string | undefined = undefined
      if (isTextFile(file.name)) {
        try {
          fileContent = await file.text()
        } catch (error) {
          console.error("Error reading file content:", error)
        }
      }

      const newFile: FileSystemItem = {
        id: crypto.randomUUID(),
        name: file.name,
        type: "file",
        parentId: currentFolderId,
        size: file.size,
        lastModified: new Date(file.lastModified),
        content: fileContent,
      }
      newFiles.push(newFile)
    }

    setFileSystemData((prev) => [...prev, ...newFiles])
    toast.success("Files Uploaded", { description: `${fileArray.length} file${fileArray.length > 1 ? "s" : ""} uploaded successfully.` })
  }

  const handleCreateNewFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Invalid Name", { description: "Folder name cannot be empty." })
      return
    }
    const newFolder: FileSystemItem = {
      id: crypto.randomUUID(),
      name: newFolderName.trim(),
      type: "folder",
      parentId: currentFolderId,
      children: [],
    }
    setFileSystemData((prev) => [...prev, newFolder])
    setIsNewFolderDialogOpen(false)
    setNewFolderName("")
    toast.success("Folder Created", { description: `Folder "${newFolder.name}" has been created.` })
  }

  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === "folder") {
      setCurrentFolderId(item.id)
    } else if (item.type === "file") {
      if (isTextFile(item.name) && typeof item.content === "string") {
        setPreviewFile(item)
      } else if (isTextFile(item.name) && typeof item.content !== "string") {
        toast.error("Preview Unavailable", { description: `Content for ${item.name} is not available or couldn't be read.` })
      } else {
        // For non-text files, still show the preview modal but it will show "not available"
        setPreviewFile(item)
      }
    }
  }

  const handleBreadcrumbClick = (folderId: string | null) => {
    setCurrentFolderId(folderId)
  }

  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = fileSystemData.find((item) => item.id === itemId)
    if (!itemToDelete) return

    const itemsToRemove = [itemId]
    if (itemToDelete.type === "folder") {
      const findChildrenRecursive = (parentId: string) => {
        const children = fileSystemData.filter((item) => item.parentId === parentId)
        children.forEach((child) => {
          itemsToRemove.push(child.id)
          if (child.type === "folder") {
            findChildrenRecursive(child.id)
          }
        })
      }
      findChildrenRecursive(itemId)
    }

    setFileSystemData((prev) => prev.filter((item) => !itemsToRemove.includes(item.id)))
    toast.success("Item Deleted", { description: `${itemToDelete.name} and its contents have been deleted.` })
  }

  const handleRenameItem = (itemId: string, newName: string) => {
    setFileSystemData((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, name: newName, lastModified: new Date() } : item)),
    )
    toast.success("Item Renamed", { description: `Item renamed to "${newName}".` })
  }

  const handleMoveItem = (itemId: string, targetFolderId: string | null) => {
    console.log("Main: handleMoveItem called", { itemId, targetFolderId })

    const item = fileSystemData.find((item) => item.id === itemId)
    if (!item) {
      console.error("Item not found:", itemId)
      return
    }

    console.log("Moving item:", item.name, "to folder:", targetFolderId)

    // Prevent moving a folder into itself or its children
    if (item.type === "folder" && targetFolderId) {
      const isChildFolder = (folderId: string, potentialParentId: string): boolean => {
        const folder = fileSystemData.find((f) => f.id === folderId)
        if (!folder || !folder.parentId) return false
        if (folder.parentId === potentialParentId) return true
        return isChildFolder(folder.parentId, potentialParentId)
      }

      if (targetFolderId === itemId || isChildFolder(targetFolderId, itemId)) {
        toast.error("Invalid Move", { description: "Cannot move a folder into itself or its children." })
        return
      }
    }

    // Prevent moving to the same location
    if (item.parentId === targetFolderId) {
      toast.info("No Change", { description: "Item is already in this location." })
      return
    }

    // Update the item's parent
    setFileSystemData((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId ? { ...item, parentId: targetFolderId, lastModified: new Date() } : item,
      )
      console.log("Updated file system data:", updated)
      return updated
    })

    const targetFolder = targetFolderId ? fileSystemData.find((f) => f.id === targetFolderId) : null
    const targetName = targetFolder ? targetFolder.name : "Root"

    console.log("Move completed:", item.name, "moved to", targetName)
    toast.success("Item Moved", { description: `${item.name} moved to ${targetName}.` })
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <BaultSidebar
        usedStorage={usedStorage}
        maxStorage={MAX_STORAGE_BYTES}
        onNewFolder={() => setIsNewFolderDialogOpen(true)}
        fileTypeFilter={fileTypeFilter}
        onFileTypeFilterChange={setFileTypeFilter}
        currentItems={currentItems}
      />
      <SidebarInset className="flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/40 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 px-6">
          <SidebarTrigger className="rounded-lg" />
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold">My Files</h1>
          </div>
        </header>
        <FileExplorer
          items={currentItems}
          currentPath={currentPath}
          allFolders={allFolders}
          onFileUpload={handleFileUpload}
          onFilesUpload={handleFilesUpload}
          onItemClick={handleItemClick}
          onBreadcrumbClick={handleBreadcrumbClick}
          onDeleteItem={handleDeleteItem}
          onRenameItem={handleRenameItem}
          onMoveItem={handleMoveItem}
          onCreateFolder={() => setIsNewFolderDialogOpen(true)}
          currentFolderId={currentFolderId}
          fileTypeFilter={fileTypeFilter}
          onClearFilter={() => setFileTypeFilter(null)}
        />
      </SidebarInset>

      {/* New Folder Dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent className="rounded-2xl border-border/40">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreateNewFolder()}
            className="rounded-xl"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleCreateNewFolder}
              className="rounded-xl bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        fileName={previewFile?.name || null}
        content={previewFile?.content || null}
        fileSize={previewFile?.size}
        lastModified={previewFile?.lastModified}
      />
    </div>
  )
}
