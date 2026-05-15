import { requireUser } from "@/lib/auth";

export default async function WalletAnalyticsPage() {
  await requireUser();

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-background p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Wallet
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal">
            Analytics
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Visualize spending trends and category breakdowns here.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              Monthly trend chart (coming soon)
            </div>
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              Category split (coming soon)
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
