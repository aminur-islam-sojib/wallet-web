import { requireUser } from "@/lib/auth";
import { Category } from "@/features/wallet/server/models/category";
import { Tag } from "@/features/wallet/server/models/tag";
import WalletMoreManager from "@/features/wallet/categories/components/wallet-more-manager";
import type { CategoryOption, TagOption } from "@/features/wallet/types";

export default async function WalletMorePage() {
  const user = await requireUser();
  const [categories, tags] = await Promise.all([
    Category.find({ userId: user._id }).sort({ type: 1, name: 1 }).lean(),
    Tag.find({ userId: user._id }).sort({ name: 1 }).lean(),
  ]);

  const categoryOptions: CategoryOption[] = categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    type: category.type as "income" | "expense",
    color: category.color,
    icon: category.icon,
    isDefault: category.isDefault,
  }));

  const tagOptions: TagOption[] = tags.map((tag) => ({
    id: tag._id.toString(),
    name: tag.name,
  }));

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <WalletMoreManager categories={categoryOptions} tags={tagOptions} />
      </div>
    </main>
  );
}
