import { requireUser } from "@/lib/auth";
import { formatDateInputValueInTimeZone } from "@/lib/date";
import CategoryDetailPanel from "@/features/wallet/statistics/components/category-detail-panel";
import CategoryDrilldown from "@/features/wallet/statistics/components/category-drilldown";
import { getCategoryDetailByRange } from "@/features/wallet/statistics/server/category-detail";
import { getCategoryTotalsByRange } from "@/features/wallet/statistics/server/category-totals";

const WALLET_TIME_ZONE = "Asia/Dhaka";

export const dynamic = "force-dynamic";

type WalletStatisticsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getCurrentMonthRange() {
  const today = formatDateInputValueInTimeZone(new Date(), WALLET_TIME_ZONE);
  const [year, month] = today.split("-").map(Number);
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);

  return { startDate, endDate };
}

export default async function WalletStaisticsPage({
  searchParams,
}: WalletStatisticsPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const selectedCategoryId = firstParam(params.categoryId);
  const { startDate, endDate } = getCurrentMonthRange();
  const data = await getCategoryTotalsByRange(user._id.toString(), {
    startDate,
    endDate,
    type: "expense",
  });
  const detail = selectedCategoryId
    ? await getCategoryDetailByRange(user._id.toString(), {
        startDate,
        endDate,
        type: "expense",
        categoryId: selectedCategoryId,
      })
    : null;

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mt-6">
          <CategoryDrilldown
            data={data}
            selectedCategoryId={selectedCategoryId}
          >
            {selectedCategoryId ? <CategoryDetailPanel detail={detail} /> : null}
          </CategoryDrilldown>
        </div>
      </div>
    </main>
  );
}
