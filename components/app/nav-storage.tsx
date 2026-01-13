"use client"

import { Progress } from "@/components/ui/progress"
import { storageData } from "@/mock-data/files"
import React from 'react'

export const NavStorage = () => {
  const storagePercentage = (storageData.used / storageData.total) * 100;

  return (
    <div className="mt-6 p-3 rounded-xl border bg-card group-data-[collapsible=icon]:hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Storage</span>
        <span className="text-xs text-muted-foreground">
          {storageData.used} GB / {storageData.total} GB
        </span>
      </div>
      <Progress value={storagePercentage} className="h-2" />
      <div className="flex flex-wrap gap-2 mt-3">
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
