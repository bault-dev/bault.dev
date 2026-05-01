"use client";

import { useFilesStore } from "@/store/files-store";

export function StorageOverview() {
  const storageData = useFilesStore((state) => state.storageStats);
  const usedPercentage = storageData.total > 0 ? (storageData.used / storageData.total) * 100 : 0;

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm">Storage Overview</h3>
        <button type="button" className="text-xs text-violet-500 hover:text-violet-600 transition-colors font-medium">
          Upgrade
        </button>
      </div>

      <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-3">
        <div className="absolute inset-0 flex rounded-full overflow-hidden">
          {storageData.breakdown.map((item, index) => {
            // If total used is 0, give each category an equal sliver of a grayed-out bar or hide the colored portions.
            // For a cleaner look when empty, we just render it but with 0 width, letting the `bg-muted` background show through.
            const width = storageData.used > 0 ? (item.size / storageData.used) * usedPercentage : 0;
            const isFirst = index === 0;
            const isLast = index === storageData.breakdown.length - 1;
            return (
              <div
                key={item.type}
                className={`h-full ${isFirst ? "rounded-l-full" : ""} ${isLast ? "rounded-r-full" : ""
                  }`}
                style={{
                  width: `${width}%`,
                  backgroundColor: item.color,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        <span className="text-muted-foreground">
          {storageData.used} GB of {storageData.total} GB used
        </span>
        <span className="font-medium">{usedPercentage.toFixed(0)}%</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {storageData.breakdown.map((item) => (
          <div
            key={item.type}
            className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
          >
            <div
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground truncate">
              {item.type}
            </span>
            <span className="text-xs font-medium ml-auto">{item.size} GB</span>
          </div>
        ))}
      </div>
    </div>
  );
}