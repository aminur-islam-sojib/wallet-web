"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Edit3, FileUp, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateTransaction } from "@/features/wallet/server/transactions";
import type {
  PaymentMethod,
  TransactionRow,
  TransactionType,
  TransactionsCategoryOption,
  TransactionsTagOption,
} from "@/features/wallet/transactions/types";

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "other", label: "Other" },
];

type AttachmentMeta = {
  name: string;
  type: string;
  size: number;
};

type TransactionEditDrawerProps = {
  transaction: TransactionRow;
  categories: TransactionsCategoryOption[];
  tags: TransactionsTagOption[];
};

export default function TransactionEditDrawer({
  transaction,
  categories,
  tags,
}: TransactionEditDrawerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [amount, setAmount] = useState(formatAmount(transaction.amountPaisa));
  const [date, setDate] = useState(transaction.date);
  const [note, setNote] = useState(transaction.note);
  const [selectedTagIds, setSelectedTagIds] = useState(transaction.tagIds);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(
    transaction.paymentMethod ?? "",
  );
  const [place, setPlace] = useState(transaction.place ?? "");
  const [attachment, setAttachment] = useState<AttachmentMeta | null>(
    transaction.attachment ?? null,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const typeCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  );
  const canSave = Boolean(amount && categoryId && date);

  function selectType(nextType: TransactionType) {
    const nextCategories = categories.filter(
      (category) => category.type === nextType,
    );

    setType(nextType);
    setCategoryId(nextCategories[0]?.id ?? "");
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    );
  }

  async function handleAction(formData: FormData) {
    setError("");

    if (!canSave) {
      setError("Amount, date, and category are required.");
      return;
    }

    setSaving(true);
    try {
      await updateTransaction(formData);
      router.refresh();
      setOpen(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not update this transaction.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        onClick={() => setOpen(true)}
        aria-label={`Edit ${transaction.categoryName} transaction`}
        className="min-h-11 min-w-11"
      >
        <Edit3 className="size-4" />
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-60 bg-black/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-70 flex w-[92vw] max-w-md flex-col border-l bg-background transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <div>
            <h2 className="text-lg font-semibold">Edit transaction</h2>
            <p className="text-sm text-muted-foreground">
              Update amount, category, labels, and details.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex size-11 items-center justify-center rounded-lg border"
            aria-label="Close edit transaction"
          >
            <X className="size-5" />
          </button>
        </div>

        <form action={handleAction} className="flex min-h-0 flex-1 flex-col">
          <input type="hidden" name="id" value={transaction.id} />
          {selectedTagIds.map((tagId) => (
            <input key={tagId} type="hidden" name="tagIds" value={tagId} />
          ))}
          {attachment ? (
            <>
              <input
                type="hidden"
                name="attachmentName"
                value={attachment.name}
              />
              <input
                type="hidden"
                name="attachmentType"
                value={attachment.type}
              />
              <input
                type="hidden"
                name="attachmentSize"
                value={attachment.size}
              />
            </>
          ) : null}

          <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-4 py-4">
            <div className="grid grid-cols-2 rounded-lg bg-muted p-1">
              {(["expense", "income"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => selectType(item)}
                  className={cn(
                    "min-h-11 rounded-md px-4 text-base font-semibold capitalize",
                    type === item
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
            <input type="hidden" name="type" value={type} />

            <Field label="Amount">
              <input
                name="amount"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                className="min-h-11 w-full rounded-lg border bg-background px-3 text-base"
              />
            </Field>

            <Field label="Category">
              <select
                name="categoryId"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
                className="min-h-11 w-full rounded-lg border bg-background px-3 text-base"
              >
                {typeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Date">
              <input
                type="date"
                name="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                className="min-h-11 w-full rounded-lg border bg-background px-3 text-base"
              />
            </Field>

            <Field label="Note">
              <textarea
                name="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={240}
                rows={4}
                className="min-h-24 w-full resize-none rounded-lg border bg-background px-3 py-3 text-base"
              />
            </Field>

            <section className="grid gap-2">
              <p className="text-base font-medium">Labels</p>
              <div className="flex flex-wrap gap-2">
                {tags.length ? (
                  tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        "min-h-11 rounded-lg border px-3 text-base",
                        selectedTagIds.includes(tag.id)
                          ? "border-foreground bg-foreground text-background"
                          : "bg-background",
                      )}
                    >
                      {tag.name}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No labels yet.
                  </p>
                )}
              </div>
            </section>

            <Field label="Payment method">
              <select
                name="paymentMethod"
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value as PaymentMethod | "")
                }
                className="min-h-11 w-full rounded-lg border bg-background px-3 text-base"
              >
                <option value="">No payment method</option>
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Place">
              <input
                name="place"
                value={place}
                onChange={(event) => setPlace(event.target.value)}
                maxLength={120}
                className="min-h-11 w-full rounded-lg border bg-background px-3 text-base"
              />
            </Field>

            <Field label="Attachment">
              <span className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 text-base">
                <FileUp className="size-4" />
                Pick file
                <input
                  type="file"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setAttachment(
                      file
                        ? { name: file.name, type: file.type, size: file.size }
                        : null,
                    );
                  }}
                />
              </span>
              {attachment ? (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm">
                  <span className="min-w-0 truncate">{attachment.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="min-h-11 px-2 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
            </Field>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="border-t p-4">
            <Button
              type="submit"
              disabled={!canSave || saving}
              className="min-h-11 w-full"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </aside>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-base font-medium">
      {label}
      {children}
    </label>
  );
}

function formatAmount(amountPaisa: number) {
  const amount = amountPaisa / 100;
  return amount
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
}
