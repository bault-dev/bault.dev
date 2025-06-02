import {
  Code2,
  FileSpreadsheet,
  Folder,
  FolderOpen,
  FileText,
  Database,
  Settings,
  Globe,
  Palette,
  Terminal,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  Braces,
  Hash,
  Layers,
  Package,
  Shield,
  Zap,
  type LucideIcon,
} from "lucide-react"

export interface FileIconInfo {
  icon: LucideIcon
  color: string
  bgColor: string
  label: string
}

export const getFileIcon = (fileName: string, isFolder = false): FileIconInfo => {
  const extension = fileName.toLowerCase().split(".").pop() || ""
  const baseName = fileName.toLowerCase()

  // Special folder handling with more specific icons
  if (isFolder) {
    if (baseName.includes("node_modules") || baseName.includes("packages")) {
      return {
        icon: Package,
        color: "text-orange-600 dark:text-orange-500",
        bgColor: "bg-orange-100 dark:bg-orange-900/20",
        label: "Package Folder",
      }
    }
    if (baseName.includes("src") || baseName.includes("source")) {
      return {
        icon: Folder,
        color: "text-blue-600 dark:text-blue-500",
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
        label: "Source Folder",
      }
    }
    if (baseName.includes("assets") || baseName.includes("static") || baseName.includes("public")) {
      return {
        icon: Folder,
        color: "text-purple-600 dark:text-purple-500",
        bgColor: "bg-purple-100 dark:bg-purple-900/20",
        label: "Assets Folder",
      }
    }
    if (baseName.includes("components") || baseName.includes("ui")) {
      return {
        icon: Layers,
        color: "text-cyan-600 dark:text-cyan-500",
        bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
        label: "Components Folder",
      }
    }
    if (baseName.includes("config") || baseName.includes("settings")) {
      return {
        icon: Settings,
        color: "text-gray-600 dark:text-gray-500",
        bgColor: "bg-gray-100 dark:bg-gray-900/20",
        label: "Config Folder",
      }
    }
    if (baseName.includes("docs") || baseName.includes("documentation")) {
      return {
        icon: FileText,
        color: "text-green-600 dark:text-green-500",
        bgColor: "bg-green-100 dark:bg-green-900/20",
        label: "Documentation Folder",
      }
    }
    // Default folder
    return {
      icon: Folder,
      color: "text-yellow-600 dark:text-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      label: "Folder",
    }
  }

  // JavaScript & TypeScript Files
  if (["js", "mjs", "cjs"].includes(extension)) {
    return {
      icon: FileCode,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      label: "JavaScript",
    }
  }

  if (["jsx"].includes(extension)) {
    return {
      icon: Braces,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      label: "React JSX",
    }
  }

  if (["ts"].includes(extension)) {
    return {
      icon: FileCode,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "TypeScript",
    }
  }

  if (["tsx"].includes(extension)) {
    return {
      icon: Braces,
      color: "text-blue-700",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "React TSX",
    }
  }

  // Python Files
  if (["py", "pyw", "pyc", "pyo"].includes(extension)) {
    return {
      icon: FileCode,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      label: "Python",
    }
  }

  // Java Files
  if (["java"].includes(extension)) {
    return {
      icon: FileCode,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      label: "Java",
    }
  }

  if (["class", "jar"].includes(extension)) {
    return {
      icon: Package,
      color: "text-orange-700",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      label: "Java Binary",
    }
  }

  // C/C++ Files
  if (["c", "h"].includes(extension)) {
    return {
      icon: FileCode,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
      label: "C",
    }
  }

  if (["cpp", "cc", "cxx", "hpp", "hxx"].includes(extension)) {
    return {
      icon: FileCode,
      color: "text-blue-700",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "C++",
    }
  }

  // C# Files
  if (["cs"].includes(extension)) {
    return {
      icon: FileCode,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      label: "C#",
    }
  }

  // PHP Files
  if (["php", "phtml"].includes(extension)) {
    return {
      icon: FileCode,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      label: "PHP",
    }
  }

  // Ruby Files
  if (["rb", "rbw"].includes(extension)) {
    return {
      icon: FileCode,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      label: "Ruby",
    }
  }

  // Go Files
  if (["go"].includes(extension)) {
    return {
      icon: FileCode,
      color: "text-cyan-700",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      label: "Go",
    }
  }

  // Rust Files
  if (["rs"].includes(extension)) {
    return {
      icon: FileCode,
      color: "text-orange-700",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      label: "Rust",
    }
  }

  // Swift Files
  if (["swift"].includes(extension)) {
    return {
      icon: FileCode,
      color: "text-orange-500",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      label: "Swift",
    }
  }

  // Kotlin Files
  if (["kt", "kts"].includes(extension)) {
    return {
      icon: FileCode,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      label: "Kotlin",
    }
  }

  // Web Technologies
  if (["html", "htm"].includes(extension)) {
    return {
      icon: Globe,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      label: "HTML",
    }
  }

  if (["css"].includes(extension)) {
    return {
      icon: Palette,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "CSS",
    }
  }

  if (["scss", "sass"].includes(extension)) {
    return {
      icon: Palette,
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
      label: "Sass",
    }
  }

  if (["less"].includes(extension)) {
    return {
      icon: Palette,
      color: "text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "Less",
    }
  }

  // Data Formats
  if (["json"].includes(extension)) {
    return {
      icon: Braces,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      label: "JSON",
    }
  }

  if (["xml", "xsl", "xsd"].includes(extension)) {
    return {
      icon: Code2,
      color: "text-orange-500",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      label: "XML",
    }
  }

  if (["yaml", "yml"].includes(extension)) {
    return {
      icon: FileText,
      color: "text-red-500",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      label: "YAML",
    }
  }

  if (["toml"].includes(extension)) {
    return {
      icon: Settings,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
      label: "TOML",
    }
  }

  if (["csv"].includes(extension)) {
    return {
      icon: FileSpreadsheet,
      color: "text-green-700",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      label: "CSV",
    }
  }

  // Database Files
  if (["sql"].includes(extension)) {
    return {
      icon: Database,
      color: "text-blue-800",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "SQL",
    }
  }

  if (["db", "sqlite", "sqlite3"].includes(extension)) {
    return {
      icon: Database,
      color: "text-gray-700",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
      label: "Database",
    }
  }

  // Shell & Scripts
  if (["sh", "bash", "zsh", "fish"].includes(extension)) {
    return {
      icon: Terminal,
      color: "text-gray-700",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
      label: "Shell Script",
    }
  }

  if (["ps1", "psm1"].includes(extension)) {
    return {
      icon: Terminal,
      color: "text-blue-800",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "PowerShell",
    }
  }

  if (["bat", "cmd"].includes(extension)) {
    return {
      icon: Terminal,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
      label: "Batch",
    }
  }

  // Documentation
  if (["md", "markdown"].includes(extension)) {
    return {
      icon: Hash,
      color: "text-gray-700",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
      label: "Markdown",
    }
  }

  if (["mdx"].includes(extension)) {
    return {
      icon: Hash,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "MDX",
    }
  }

  if (["txt", "text"].includes(extension)) {
    return {
      icon: FileText,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
      label: "Text",
    }
  }

  if (["pdf"].includes(extension)) {
    return {
      icon: FileText,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      label: "PDF",
    }
  }

  if (["doc", "docx"].includes(extension)) {
    return {
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "Word Document",
    }
  }

  if (["rtf"].includes(extension)) {
    return {
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      label: "Rich Text",
    }
  }

  // Spreadsheets
  if (["xls", "xlsx"].includes(extension)) {
    return {
      icon: FileSpreadsheet,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      label: "Excel",
    }
  }

  if (["ods"].includes(extension)) {
    return {
      icon: FileSpreadsheet,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "OpenDocument",
    }
  }

  // Images
  if (["jpg", "jpeg"].includes(extension)) {
    return {
      icon: FileImage,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      label: "JPEG Image",
    }
  }

  if (["png"].includes(extension)) {
    return {
      icon: FileImage,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "PNG Image",
    }
  }

  if (["gif"].includes(extension)) {
    return {
      icon: FileImage,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      label: "GIF Image",
    }
  }

  if (["svg"].includes(extension)) {
    return {
      icon: FileImage,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      label: "SVG Vector",
    }
  }

  if (["webp", "bmp", "tiff", "tif"].includes(extension)) {
    return {
      icon: FileImage,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      label: "Image",
    }
  }

  if (["ico"].includes(extension)) {
    return {
      icon: FileImage,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "Icon",
    }
  }

  // Video
  if (["mp4"].includes(extension)) {
    return {
      icon: FileVideo,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      label: "MP4 Video",
    }
  }

  if (["avi", "mov", "wmv"].includes(extension)) {
    return {
      icon: FileVideo,
      color: "text-red-500",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      label: "Video",
    }
  }

  if (["webm", "mkv", "m4v", "flv"].includes(extension)) {
    return {
      icon: FileVideo,
      color: "text-red-700",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      label: "Video",
    }
  }

  // Audio
  if (["mp3"].includes(extension)) {
    return {
      icon: FileAudio,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      label: "MP3 Audio",
    }
  }

  if (["wav", "flac"].includes(extension)) {
    return {
      icon: FileAudio,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "Audio",
    }
  }

  if (["ogg", "aac", "m4a", "wma"].includes(extension)) {
    return {
      icon: FileAudio,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      label: "Audio",
    }
  }

  // Archives
  if (["zip"].includes(extension)) {
    return {
      icon: FileArchive,
      color: "text-yellow-700",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      label: "ZIP Archive",
    }
  }

  if (["rar"].includes(extension)) {
    return {
      icon: FileArchive,
      color: "text-red-700",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      label: "RAR Archive",
    }
  }

  if (["7z"].includes(extension)) {
    return {
      icon: FileArchive,
      color: "text-blue-700",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "7-Zip Archive",
    }
  }

  if (["tar", "gz", "bz2", "xz"].includes(extension)) {
    return {
      icon: FileArchive,
      color: "text-orange-700",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      label: "Archive",
    }
  }

  if (["dmg", "iso"].includes(extension)) {
    return {
      icon: FileArchive,
      color: "text-purple-700",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      label: "Disk Image",
    }
  }

  // Configuration Files
  if (["env"].includes(extension) || baseName.startsWith(".env")) {
    return {
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      label: "Environment",
    }
  }

  if (["ini", "conf", "config", "cfg"].includes(extension) || baseName.includes("config")) {
    return {
      icon: Settings,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
      label: "Config",
    }
  }

  // Special Files
  if (["dockerfile"].includes(extension) || baseName === "dockerfile") {
    return {
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "Docker",
    }
  }

  if (baseName === "makefile" || baseName.includes("makefile")) {
    return {
      icon: Settings,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      label: "Makefile",
    }
  }

  if (baseName === "package.json") {
    return {
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      label: "Package Config",
    }
  }

  if (baseName === "tsconfig.json") {
    return {
      icon: Settings,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      label: "TypeScript Config",
    }
  }

  if (baseName.includes("webpack") || baseName.includes("vite") || baseName.includes("rollup")) {
    return {
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      label: "Build Config",
    }
  }

  if (baseName.includes("eslint") || baseName.includes("prettier") || baseName.includes("lint")) {
    return {
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      label: "Linter Config",
    }
  }

  if (baseName.includes("git") || extension === "gitignore" || baseName.startsWith(".git")) {
    return {
      icon: Settings,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      label: "Git",
    }
  }

  if (["lock"].includes(extension) || baseName.includes("lock")) {
    return {
      icon: Shield,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
      label: "Lock File",
    }
  }

  if (["log"].includes(extension)) {
    return {
      icon: FileText,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      label: "Log File",
    }
  }

  // Default fallback
  return {
    icon: FileText,
    color: "text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-900/20",
    label: "File",
  }
}

// Helper component for rendering file icons
export function FileIcon({
  fileName,
  isFolder,
  className,
  size = "md",
}: {
  fileName: string
  isFolder?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const iconInfo = getFileIcon(fileName, isFolder)
  const Icon = iconInfo.icon

  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return <Icon className={`${sizeClasses[size]} ${iconInfo.color} ${className || ""}`} />
}

// Helper component for rendering file icon with background
export function FileIconWithBackground({
  fileName,
  isFolder,
  className,
  size = "md",
}: {
  fileName: string
  isFolder?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const iconInfo = getFileIcon(fileName, isFolder)
  const Icon = iconInfo.icon

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-lg ${iconInfo.bgColor} ${className || ""}`}
    >
      <Icon className={`${iconSizeClasses[size]} ${iconInfo.color}`} />
    </div>
  )
}

// Helper function to get file extension badge
export function getFileExtensionBadge(fileName: string): string {
  const extension = fileName.toLowerCase().split(".").pop() || ""
  return extension.toUpperCase()
}

// Helper component for file extension badge
export function FileExtensionBadge({ fileName, className }: { fileName: string; className?: string }) {
  const extension = getFileExtensionBadge(fileName)
  const iconInfo = getFileIcon(fileName)

  if (!extension || extension === fileName.toLowerCase()) return null

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${iconInfo.bgColor} ${iconInfo.color} ${className || ""}`}
    >
      {extension}
    </span>
  )
}
