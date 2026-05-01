"use client";

import { useFilesStore } from "@/store/files-store";
import { fileCategories } from "@/lib/file-categories";
import type { CategoryName } from "@/lib/file-categories";
import { File } from "lucide-react";

export function StorageCards() {
  const storageData = useFilesStore((state) => state.storageStats);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {storageData.breakdown.map((item) => {
        const catSpec = fileCategories[item.type as CategoryName];
        const Icon = catSpec ? catSpec.icon : File;
        const percentage = storageData.total > 0 ? ((item.size / storageData.total) * 100).toFixed(0) : "0";

        return (
          <div
            key={item.type}
            className="p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
          >
            <div
              className="size-10 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: `${item.color}15` }}
            >
              <Icon
                className="size-5"
                style={{ color: item.color }}
              />
            </div>
            <p className="font-medium text-sm mb-0.5">{item.type}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {item.size} GB
              </span>
              <span className="text-xs text-muted-foreground">
                {percentage}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
