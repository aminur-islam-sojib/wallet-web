"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { categoryIconIds } from "@/features/wallet/categories/lib/category-icons";
import { Category } from "@/features/wallet/server/models/category";
import { Transaction } from "@/features/wallet/server/models/transaction";

const categorySchema = z.object({
  name: z.string().trim().min(1).max(40),
  type: z.enum(["income", "expense"]),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.enum(categoryIconIds),
});

const categoryUpdateSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(40),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.enum(categoryIconIds),
});

const categoryDeleteSchema = z.object({
  id: z.string().trim().min(1),
});

function revalidateWalletViews() {
  revalidatePath("/(dashboard)", "layout");
  revalidatePath("/wallet");
  revalidatePath("/wallet/transactions");
  revalidatePath("/wallet/more");
}

export async function createCategory(formData: FormData) {
  const user = await requireUser();
  const parsed = categorySchema.parse({
    name: formData.get("name"),
    type: formData.get("type"),
    color: formData.get("color") || "#64748b",
    icon: formData.get("icon") || "circle",
  });

  await Category.updateOne(
    { userId: user._id, type: parsed.type, name: parsed.name },
    {
      $setOnInsert: {
        userId: user._id,
        name: parsed.name,
        type: parsed.type,
        color: parsed.color,
        icon: parsed.icon,
        isDefault: false,
      },
    },
    { upsert: true },
  );

  revalidateWalletViews();
}

export async function updateCategory(formData: FormData) {
  const user = await requireUser();
  const parsed = categoryUpdateSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    color: formData.get("color"),
    icon: formData.get("icon") || "circle",
  });

  const category = await Category.findOne({
    _id: parsed.id,
    userId: user._id,
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  await Category.updateOne(
    { _id: category._id },
    {
      $set: {
        name: parsed.name,
        color: parsed.color,
        icon: parsed.icon,
      },
    },
  );

  revalidateWalletViews();
}

export async function deleteCategory(formData: FormData) {
  const user = await requireUser();
  const parsed = categoryDeleteSchema.parse({
    id: formData.get("id"),
  });

  const category = await Category.findOne({
    _id: parsed.id,
    userId: user._id,
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  if (category.isDefault) {
    throw new Error("Default categories cannot be deleted.");
  }

  const hasTransactions = await Transaction.exists({
    userId: user._id,
    categoryId: category._id,
  });

  if (hasTransactions) {
    throw new Error("This category has transactions. Move them first.");
  }

  await Category.deleteOne({ _id: category._id });

  revalidateWalletViews();
}
