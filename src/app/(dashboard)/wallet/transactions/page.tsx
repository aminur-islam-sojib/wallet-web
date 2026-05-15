import { requireUser } from "@/lib/auth";

export default async function WalletTransactionsPage() {
  await requireUser();

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-background p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Wallet
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal">
            Transactions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Review your wallet activity and filter by date, category, or tag.
          </p>
          <div className="mt-6 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            Transaction timeline (coming soon)
          </div>
        </div>
      </div>
    </main>
  );
}
