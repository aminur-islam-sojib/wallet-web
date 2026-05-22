"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { Tag } from "@/features/wallet/server/models/tag";
import { Transaction } from "@/features/wallet/server/models/transaction";

const tagSchema = z.object({
  name: z.string().trim().min(1).max(32),
});

const tagUpdateSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(32),
});

const tagDeleteSchema = z.object({
  id: z.string().trim().min(1),
});

function revalidateWalletViews() {
  revalidatePath("/(dashboard)", "layout");
  revalidatePath("/wallet");
  revalidatePath("/wallet/transactions");
  revalidatePath("/wallet/more");
}

export async function createTag(formData: FormData) {
  const user = await requireUser();
  const parsed = tagSchema.parse({
    name: formData.get("name"),
  });

  await Tag.updateOne(
    { userId: user._id, name: parsed.name },
    {
      $setOnInsert: {
        userId: user._id,
        name: parsed.name,
      },
    },
    { upsert: true },
  );

  revalidateWalletViews();
}

export async function updateTag(formData: FormData) {
  const user = await requireUser();
  const parsed = tagUpdateSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
  });

  const tag = await Tag.findOne({ _id: parsed.id, userId: user._id });

  if (!tag) {
    throw new Error("Tag not found.");
  }

  await Tag.updateOne({ _id: tag._id }, { $set: { name: parsed.name } });

  revalidateWalletViews();
}

export async function deleteTag(formData: FormData) {
  const user = await requireUser();
  const parsed = tagDeleteSchema.parse({
    id: formData.get("id"),
  });

  const tag = await Tag.findOne({ _id: parsed.id, userId: user._id });

  if (!tag) {
    throw new Error("Tag not found.");
  }

  const hasTransactions = await Transaction.exists({
    userId: user._id,
    tagIds: tag._id,
  });

  if (hasTransactions) {
    throw new Error("This tag is used in transactions. Remove it first.");
  }

  await Tag.deleteOne({ _id: tag._id });

  revalidateWalletViews();
}
