"use client"

import { Progress } from "@/components/ui/progress"
import { storageData } from "@/mock-data/files"

export const NavStorage = () => {
  const storagePercentage = (storageData.used / storageData.total) * 100;

  return (
    <div className="mt-6 overflow-hidden rounded-xl border bg-card p-3 transition-[opacity,transform,height,margin,padding,border-color] duration-200 ease-out group-data-[collapsible=icon]:mt-3 group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:translate-y-2 group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">Storage</span>
        <span className="text-xs text-muted-foreground">
          {storageData.used} GB / {storageData.total} GB
        </span>
      </div>
      <Progress value={storagePercentage} className="h-2" />
      <div className="mt-3 flex flex-wrap gap-2">
        {storageData.breakdown.slice(0, 3).map((item) => (
          <div key={item.type} className="flex items-center gap-1.5">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] text-muted-foreground">
              {item.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
