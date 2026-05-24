import { cache } from "react";
import { Types } from "mongoose";

import { Category } from "@/features/wallet/server/models/category";
import { Tag } from "@/features/wallet/server/models/tag";
import type { CategoryOption, TagOption } from "@/features/wallet/types";

export const getWalletCategories = cache(async function getWalletCategories(
  userId: string,
): Promise<CategoryOption[]> {
  const userObjectId = new Types.ObjectId(userId);
  const categories = await Category.find({ userId: userObjectId })
    .sort({ type: 1, name: 1 })
    .lean();

  return categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    type: category.type as "income" | "expense",
    color: category.color,
    icon: category.icon ?? "circle",
    isDefault: category.isDefault,
  }));
});

export const getWalletTags = cache(async function getWalletTags(
  userId: string,
): Promise<TagOption[]> {
  const userObjectId = new Types.ObjectId(userId);
  const tags = await Tag.find({ userId: userObjectId })
    .sort({ name: 1 })
    .lean();

  return tags.map((tag) => ({
    id: tag._id.toString(),
    name: tag.name,
  }));
});

export async function getWalletOptions(userId: string) {
  const [categories, tags] = await Promise.all([
    getWalletCategories(userId),
    getWalletTags(userId),
  ]);

  return { categories, tags };
}
