import { Progress } from "@/components/ui/progress"
import { HardDrive } from "lucide-react"

interface StorageIndicatorProps {
  usedStorage: number // in bytes
  maxStorage: number // in bytes
}

export function StorageIndicator({ usedStorage, maxStorage }: StorageIndicatorProps) {
  const usedPercentage = (usedStorage / maxStorage) * 100
  const usedMB = (usedStorage / (1024 * 1024)).toFixed(2)
  const maxMB = (maxStorage / (1024 * 1024)).toFixed(0)

  const getStorageColor = () => {
    if (usedPercentage < 50) return "bg-green-500"
    if (usedPercentage < 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="p-4 space-y-4 bg-muted/30 rounded-xl border border-border/40">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Storage</h3>
          <p className="text-xs text-muted-foreground">
            {usedMB} MB of {maxMB} MB used
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={usedPercentage} className="w-full h-2 bg-muted" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{usedPercentage.toFixed(1)}% used</span>
          <span>{(maxMB - Number.parseFloat(usedMB)).toFixed(1)} MB free</span>
        </div>
      </div>
    </div>
  )
}
