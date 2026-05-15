"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { bdtToPaisa } from "@/lib/money";
import { Category } from "@/models/category";
import { Tag } from "@/models/tag";
import { Transaction } from "@/models/transaction";

const amountSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Use a valid BDT amount.");

const paymentMethodSchema = z.enum([
  "cash",
  "card",
  "bank_transfer",
  "bkash",
  "nagad",
  "rocket",
  "other",
]);

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: amountSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  categoryId: z.string().min(1),
  tagIds: z.array(z.string()).default([]),
  note: z.string().trim().max(240).optional(),
  paymentMethod: paymentMethodSchema.optional(),
  place: z.string().trim().max(120).optional(),
  attachmentName: z.string().trim().max(180).optional(),
  attachmentType: z.string().trim().max(120).optional(),
  attachmentSize: z.coerce.number().int().nonnegative().optional(),
});

const categorySchema = z.object({
  name: z.string().trim().min(1).max(40),
  type: z.enum(["income", "expense"]),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/),
});

const tagSchema = z.object({
  name: z.string().trim().min(1).max(32),
});

export async function createTransaction(formData: FormData) {
  const user = await requireUser();
  const parsed = transactionSchema.parse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    categoryId: formData.get("categoryId"),
    tagIds: formData.getAll("tagIds"),
    note: formData.get("note") || undefined,
    paymentMethod: formData.get("paymentMethod") || undefined,
    place: formData.get("place") || undefined,
    attachmentName: formData.get("attachmentName") || undefined,
    attachmentType: formData.get("attachmentType") || undefined,
    attachmentSize: formData.get("attachmentSize") || undefined,
  });

  const category = await Category.findOne({
    _id: parsed.categoryId,
    userId: user._id,
    type: parsed.type,
  });

  if (!category) {
    throw new Error("Choose a valid category for this transaction type.");
  }

  const tags = parsed.tagIds.length
    ? await Tag.find({ _id: { $in: parsed.tagIds }, userId: user._id }).select(
        "_id",
      )
    : [];

  await Transaction.create({
    userId: user._id,
    type: parsed.type,
    amountPaisa: bdtToPaisa(parsed.amount),
    date: new Date(`${parsed.date}T00:00:00.000Z`),
    categoryId: category._id,
    tagIds: tags.map((tag) => tag._id),
    note: parsed.note,
    paymentMethod: parsed.paymentMethod,
    place: parsed.place,
    attachment: parsed.attachmentName
      ? {
          name: parsed.attachmentName,
          type: parsed.attachmentType ?? "",
          size: parsed.attachmentSize ?? 0,
        }
      : undefined,
  });

  revalidatePath("/wallet");
}

export async function createCategory(formData: FormData) {
  const user = await requireUser();
  const parsed = categorySchema.parse({
    name: formData.get("name"),
    type: formData.get("type"),
    color: formData.get("color") || "#64748b",
  });

  await Category.updateOne(
    { userId: user._id, type: parsed.type, name: parsed.name },
    {
      $setOnInsert: {
        userId: user._id,
        name: parsed.name,
        type: parsed.type,
        color: parsed.color,
        icon: "circle",
        isDefault: false,
      },
    },
    { upsert: true },
  );

  revalidatePath("/dashboard");
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

  revalidatePath("/dashboard");
}
