"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodePreview } from "./code-preview"
import { useToast } from "@/components/ui/use-toast"
import { X, FileText, Eye, Download, Copy } from "lucide-react"
import { getFileIcon } from "@/lib/file-icons"

interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  fileName: string | null
  content: string | null
  fileSize?: number
  lastModified?: Date
}

export function FilePreviewModal({
  isOpen,
  onClose,
  fileName,
  content,
  fileSize,
  lastModified,
}: FilePreviewModalProps) {
  const [activeTab, setActiveTab] = useState("preview")
  const { toast } = useToast()

  if (!fileName || !content) return null

  // Determine file type
  const getFileType = (fileName: string): "code" | "text" | "image" | "video" | "audio" | "archive" | "unknown" => {
    const extension = fileName.toLowerCase().split(".").pop() || ""

    const codeExtensions = [
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
      "html",
      "css",
      "scss",
      "sass",
      "less",
      "json",
      "xml",
      "yaml",
      "yml",
      "sql",
      "sh",
      "bash",
      "zsh",
      "fish",
      "ps1",
      "dockerfile",
      "makefile",
      "env",
      "gitignore",
      "toml",
      "mdx",
    ]

    const textExtensions = ["txt", "md", "log", "csv", "tsv", "ini", "conf", "config"]
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "ico"]
    const videoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"]
    const audioExtensions = ["mp3", "wav", "ogg", "flac", "aac", "m4a"]
    const archiveExtensions = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"]

    if (codeExtensions.includes(extension)) return "code"
    if (textExtensions.includes(extension)) return "text"
    if (imageExtensions.includes(extension)) return "image"
    if (videoExtensions.includes(extension)) return "video"
    if (audioExtensions.includes(extension)) return "audio"
    if (archiveExtensions.includes(extension)) return "archive"

    return "unknown"
  }

  const fileType = getFileType(fileName)
  const isCodeFile = fileType === "code"
  const isTextFile = fileType === "text" || fileType === "code"

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      toast({ title: "Copied", description: "Content copied to clipboard." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy content.", variant: "destructive" })
    }
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: "Downloaded", description: `${fileName} has been downloaded.` })
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (date?: Date) => {
    if (!date) return "Unknown"
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const fileIconInfo = getFileIcon(fileName)
  const FileIconComponent = fileIconInfo.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 rounded-2xl border-border/40 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${fileIconInfo.bgColor} shrink-0`}>
              <FileIconComponent className={`h-4 w-4 ${fileIconInfo.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold truncate">{fileName}</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatFileSize(fileSize)}</span>
                <span>•</span>
                <span>{formatDate(lastModified)}</span>
                {isCodeFile && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary" className="rounded-full text-xs px-2 py-0.5">
                      Code
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleDownload} className="rounded-lg h-8 px-3">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-lg h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isTextFile ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-4 pt-3 pb-0 shrink-0">
                <TabsList className="grid w-fit grid-cols-2 rounded-lg h-8">
                  <TabsTrigger value="preview" className="rounded-md text-xs px-3 py-1">
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="raw" className="rounded-md text-xs px-3 py-1">
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    Raw
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="preview" className="flex-1 mt-3 mx-0 overflow-hidden">
                {isCodeFile ? (
                  <div className="h-full">
                    <CodePreview content={content} fileName={fileName} onCopy={handleCopy} className="h-full" />
                  </div>
                ) : (
                  <ScrollArea className="h-full px-4">
                    <div className="rounded-lg bg-muted/30 border border-border/40 p-4 mx-0 mb-4">
                      <pre className="text-sm whitespace-pre-wrap break-words font-mono leading-relaxed">{content}</pre>
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="raw" className="flex-1 mt-3 mx-0 overflow-hidden">
                <ScrollArea className="h-full px-4">
                  <div className="rounded-lg bg-muted/30 border border-border/40 p-4 mx-0 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">Raw Content</span>
                      <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-md h-7 px-2">
                        <Copy className="mr-1.5 h-3 w-3" />
                        <span className="text-xs">Copy</span>
                      </Button>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap break-all font-mono leading-relaxed text-muted-foreground">
                      {content}
                    </pre>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${fileIconInfo.bgColor} mx-auto mb-4`}
                >
                  <FileIconComponent className={`h-8 w-8 ${fileIconInfo.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Preview Not Available</h3>
                <p className="text-muted-foreground mb-4 text-sm">This file type cannot be previewed in the browser.</p>
                <Button onClick={handleDownload} className="rounded-lg">
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
