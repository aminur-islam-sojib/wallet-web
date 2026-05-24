"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import CategoryPieChart from "@/features/wallet/statistics/components/category-pie-chart";
import type { CategoryTotalsResponse } from "@/features/wallet/statistics/types";

type Props = {
  data: CategoryTotalsResponse;
  selectedCategoryId?: string;
  children?: React.ReactNode;
};

export default function CategoryDrilldown({
  data,
  selectedCategoryId,
  children,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const detailRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!selectedCategoryId) return;

    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      detailRef.current?.focus({ preventScroll: true });
    });
  }, [selectedCategoryId]);

  const handleGoDeeper = React.useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set("categoryId", categoryId);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="space-y-6">
      <CategoryPieChart data={data} onGoDeeper={handleGoDeeper} />
      {selectedCategoryId ? (
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
