"use client";

import { CategoryIcon } from "@/features/wallet/components/category-icon";
import {
  categoryIconOptions,
  type CategoryIconId,
} from "@/features/wallet/lib/category-icons";
import { cn } from "@/lib/utils";

type CategoryIconPickerProps = {
  value: CategoryIconId;
  onChange: (value: CategoryIconId) => void;
  name?: string;
};

export function CategoryIconPicker({
  value,
  onChange,
  name = "icon",
}: CategoryIconPickerProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Icon</label>
        <span className="text-xs text-muted-foreground">Tap to choose</span>
      </div>
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {categoryIconOptions.map((option) => {
          const isSelected = option.id === value;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              aria-label={option.label}
              title={option.label}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex min-h-11 items-center justify-center rounded-lg border bg-background text-foreground transition",
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : "hover:border-foreground/50",
              )}
            >
              <CategoryIcon
                icon={option.id}
                className={cn(
                  "size-6",
                  isSelected ? "text-background" : "text-foreground",
                )}
                iconClassName="size-5"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
