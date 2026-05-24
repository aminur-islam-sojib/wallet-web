import { requireUser } from "@/lib/auth";
import { formatDateInputValueInTimeZone } from "@/lib/date";
import CategoryPieChart from "@/features/wallet/statistics/components/category-pie-chart";
import { getCategoryTotalsByRange } from "@/features/wallet/statistics/server/category-totals";

const WALLET_TIME_ZONE = "Asia/Dhaka";

function getCurrentMonthRange() {
  const today = formatDateInputValueInTimeZone(new Date(), WALLET_TIME_ZONE);
  const [year, month] = today.split("-").map(Number);
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);

  return { startDate, endDate };
}

export default async function WalletStaisticsPage() {
  const user = await requireUser();
  const { startDate, endDate } = getCurrentMonthRange();
  const data = await getCategoryTotalsByRange(user._id.toString(), {
    startDate,
    endDate,
    type: "expense",
  });

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mt-6">
          <CategoryPieChart data={data} />
        </div>
      </div>
    </main>
  );
}
