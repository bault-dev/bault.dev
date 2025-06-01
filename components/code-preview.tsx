"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { getFileIcon } from "@/lib/file-icons"

interface CodePreviewProps {
  content: string
  fileName: string
  onCopy: () => void
  className?: string
}

// Language detection based on file extension
const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.toLowerCase().split(".").pop() || ""

  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    mjs: "javascript",
    cjs: "javascript",

    // Web technologies
    html: "html",
    htm: "html",
    xml: "xml",
    svg: "xml",
    css: "css",
    scss: "scss",
    sass: "sass",
    less: "less",

    // Data formats
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",

    // Programming languages
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    go: "go",
    rs: "rust",
    sql: "sql",

    // Shell/Config
    sh: "bash",
    bash: "bash",
    zsh: "zsh",
    fish: "fish",
    ps1: "powershell",

    // Documentation
    md: "markdown",
    mdx: "mdx",

    // Config files
    env: "dotenv",
    dockerfile: "dockerfile",
    makefile: "makefile",
    gitignore: "gitignore",
  }

  return languageMap[extension] || "text"
}

// Reemplazar toda la función getFileTypeInfo con:
const getFileTypeInfo = (fileName: string) => {
  return getFileIcon(fileName)
}

export function CodePreview({ content, fileName, onCopy, className }: CodePreviewProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const language = getLanguageFromFileName(fileName)
  const fileTypeInfo = getFileTypeInfo(fileName)
  const lineCount = content.split("\n").length

  useEffect(() => {
    let isMounted = true

    const initializeHighlighter = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Dynamic import of Shiki
        const { codeToHtml } = await import("shiki")

        if (!isMounted) return

        // Highlight the code
        const highlighted = await codeToHtml(content, {
          lang: language as any,
          theme: "github-dark",
          transformers: [
            {
              pre(node) {
                // Add custom classes to the pre element
                if (node.properties) {
                  node.properties.class = cn(
                    node.properties.class,
                    "!bg-transparent !p-0 !m-0 text-sm leading-6 overflow-visible",
                  )
                }
              },
              code(node) {
                // Add custom classes to the code element
                if (node.properties) {
                  node.properties.class = cn(node.properties.class, "block whitespace-pre font-mono")
                }
              },
            },
          ],
        })

        if (isMounted) {
          setHighlightedCode(highlighted)
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Error highlighting code:", err)
        if (isMounted) {
          setError("Failed to highlight code")
          setHighlightedCode(`<pre><code>${content}</code></pre>`)
          setIsLoading(false)
        }
      }
    }

    initializeHighlighter()

    return () => {
      isMounted = false
    }
  }, [content, language])

  const formatFileSize = (content: string) => {
    const bytes = new Blob([content]).size
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Code Content */}
      <ScrollArea className="flex-1">
        <div className="relative">
          {/* Line numbers */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/30 border-r border-border/20 flex flex-col text-xs text-muted-foreground font-mono select-none">
            {Array.from({ length: lineCount }, (_, i) => (
              <div
                key={i + 1}
                className="h-6 flex items-center justify-end px-2 leading-6"
                style={{ minHeight: "1.5rem" }}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code content */}
          <div className="pl-14 pr-4 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Highlighting code...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="font-medium">Syntax highlighting failed</p>
                <p className="text-xs mt-1">{error}</p>
                <pre className="mt-2 text-xs font-mono whitespace-pre-wrap">{content}</pre>
              </div>
            ) : (
              <div
                className="shiki-container"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
                style={{
                  fontSize: "0.875rem",
                  lineHeight: "1.5rem",
                }}
              />
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer with file info */}
      <div className="flex items-center justify-between p-3 border-t border-border/40 bg-muted/10 text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="rounded-full text-xs px-2 py-0.5">
            {fileTypeInfo.label}
          </Badge>
          <span>UTF-8</span>
          {!isLoading && !error && <span>Highlighted</span>}
        </div>
        <div className="flex items-center gap-3">
          <span>{lineCount} lines</span>
          <span>{formatFileSize(content)}</span>
        </div>
      </div>
    </div>
  )
}
