import { requireUser } from "@/lib/auth";
import { getWalletOptions } from "@/features/wallet/server/options";

import WalletMoreManager from "@/features/wallet/categories/components/wallet-more-manager";
import { WalletMoreSkeleton } from "@/features/wallet/loading/components/wallet-loading-skeletons";
import { Suspense } from "react";

export default function WalletMorePage() {
  return (
    <Suspense fallback={<WalletMoreSkeleton />}>
      <WalletMoreData />
    </Suspense>
  );
}

async function WalletMoreData() {
  const user = await requireUser();
  const { categories, tags } = await getWalletOptions(user._id.toString());

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-4  sm:px-6 lg:px-8">
        <WalletMoreManager categories={categories} tags={tags} />
      </div>
    </main>
  );
}
