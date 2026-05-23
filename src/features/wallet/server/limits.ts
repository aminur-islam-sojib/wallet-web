"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { bdtToPaisa } from "@/lib/money";
import { MonthlyLimit } from "@/features/wallet/server/models/monthly-limit";

const amountSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Use a valid BDT amount.");

const monthlyLimitSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Choose a valid month."),
  amount: amountSchema,
});

export type MonthlyLimitActionState = {
  success: boolean;
  message?: string;
};

function revalidateWalletViews() {
  revalidatePath("/(dashboard)", "layout");
  revalidatePath("/wallet");
  revalidatePath("/wallet/transactions");
  revalidatePath("/wallet/more");
}

export async function saveMonthlyLimit(
  _previousState: MonthlyLimitActionState,
  formData: FormData,
): Promise<MonthlyLimitActionState> {
  try {
    const user = await requireUser();
    const parsed = monthlyLimitSchema.parse({
      month: formData.get("month"),
      amount: formData.get("amount"),
    });

    await MonthlyLimit.updateOne(
      { userId: user._id, month: parsed.month },
      {
        $set: {
          amountPaisa: bdtToPaisa(parsed.amount),
        },
        $setOnInsert: {
          userId: user._id,
          month: parsed.month,
        },
      },
      { upsert: true },
    );

    revalidateWalletViews();

    return { success: true, message: "Monthly limit saved." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message ?? "Check the limit details.",
      };
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not save monthly limit.",
    };
  }
}
