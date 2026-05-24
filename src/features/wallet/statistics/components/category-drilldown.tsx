"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import CategoryPieChart from "@/features/wallet/statistics/components/category-pie-chart";
import TagPieChart from "@/features/wallet/statistics/components/tag-pie-chart";
import type {
  CategoryTotalsResponse,
  TagTotalsResponse,
} from "@/features/wallet/statistics/types";

type Props = {
  categoryData: CategoryTotalsResponse;
  tagData: TagTotalsResponse;
  selectedCategoryId?: string;
  selectedTagId?: string;
  children?: React.ReactNode;
};

export default function CategoryDrilldown({
  categoryData,
  tagData,
  selectedCategoryId,
  selectedTagId,
  children,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const detailRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!selectedCategoryId && !selectedTagId) return;

    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      detailRef.current?.focus({ preventScroll: true });
    });
  }, [selectedCategoryId, selectedTagId]);

  const handleCategoryGoDeeper = React.useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set("categoryId", categoryId);
      params.delete("tagId");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );
  const handleTagGoDeeper = React.useCallback(
    (tagId: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set("tagId", tagId);
      params.delete("categoryId");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );
  const hasSelection = Boolean(selectedCategoryId || selectedTagId);

  return (
    <div className="space-y-6">
      <CategoryPieChart
        data={categoryData}
        onGoDeeper={handleCategoryGoDeeper}
      />
      <TagPieChart data={tagData} onGoDeeper={handleTagGoDeeper} />
      {hasSelection ? (
        <div
          ref={detailRef}
          tabIndex={-1}
          className="scroll-mt-20 outline-none"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
