"use client";

import { useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Eraser,
  FileUp,
  MapPin,
  Paperclip,
  Settings2,
  Tags,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { formatDateInputValue } from "@/lib/date";
import { createTransaction } from "@/features/wallet/server/transactions";
import { CategoryIcon } from "@/features/wallet/categories/components/category-icon";
import type {
  CategoryOption,
  PaymentMethod,
  TagOption,
  TransactionType,
} from "@/features/wallet/types";

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "other", label: "Other" },
];

type MobileAddTransactionCalculatorProps = {
  incomeCategories: CategoryOption[];
  expenseCategories: CategoryOption[];
  tags: TagOption[];
  onSaved?: () => void;
};

type Token = number | "+" | "-" | "*" | "/";
type AttachmentMeta = {
  name: string;
  type: string;
  size: number;
};

export default function MobileAddTransactionCalculator({
  incomeCategories,
  expenseCategories,
  tags,
  onSaved,
}: MobileAddTransactionCalculatorProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const today = formatDateInputValue();
  const [type, setType] = useState<TransactionType>("expense");
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState(
    expenseCategories[0]?.id ?? incomeCategories[0]?.id ?? "",
  );
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [recentCategoryIds, setRecentCategoryIds] = useState<
    Record<TransactionType, string[]>
  >({ expense: [], income: [] });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [place, setPlace] = useState("");
  const [attachment, setAttachment] = useState<AttachmentMeta | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const categories = type === "income" ? incomeCategories : expenseCategories;
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId],
  );
  const evaluated = useMemo(() => evaluateExpression(expression), [expression]);
  const amount = result ?? evaluated.value;
  const canSave = Boolean(
    categoryId && amount && amount > 0 && !evaluated.error,
  );
  const hasDetails = Boolean(
    note || paymentMethod || selectedTagIds.length || place,
  );
  const detailPills = useMemo(() => {
    const pills: { key: string; label: string }[] = [];

    if (note) {
      pills.push({
        key: "note",
        label: note.length > 14 ? `${note.slice(0, 14)}…` : note,
      });
    }

    if (paymentMethod) {
      const paymentLabel =
        paymentOptions.find((option) => option.value === paymentMethod)
          ?.label ?? "";
      if (paymentLabel) {
        pills.push({ key: "payment", label: paymentLabel });
      }
    }

    if (selectedTagIds.length) {
      pills.push({
        key: "tags",
        label: `${selectedTagIds.length} label${
          selectedTagIds.length > 1 ? "s" : ""
        }`,
      });
    }

    if (place) {
      pills.push({
        key: "place",
        label: place.length > 12 ? `${place.slice(0, 12)}…` : place,
      });
    }

    return pills;
  }, [note, paymentMethod, selectedTagIds.length, place]);

  function selectType(nextType: TransactionType) {
    const nextCategories =
      nextType === "income" ? incomeCategories : expenseCategories;
    const recentForType = recentCategoryIds[nextType] ?? [];
    const recentMatch = recentForType.find((id) =>
      nextCategories.some((category) => category.id === id),
    );
    const nextCategoryId = recentMatch ?? nextCategories[0]?.id ?? "";

    setType(nextType);
    setCategoryId(nextCategoryId);
  }

  function selectCategory(nextCategoryId: string) {
    setCategoryId(nextCategoryId);
    setRecentCategoryIds((current) => {
      const updated = [
        nextCategoryId,
        ...current[type].filter((id) => id !== nextCategoryId),
      ].slice(0, 4);

      return { ...current, [type]: updated };
    });
    setCategoryDrawerOpen(false);
  }

  function press(value: string) {
    setError("");
    setResult(null);

    if (value === "clear") {
      setExpression("");
      return;
    }

    if (value === "backspace") {
      setExpression((current) => current.slice(0, -1));
      return;
    }

    if (value === "=") {
      if (evaluated.error || evaluated.value === null) {
        setError("Enter a valid amount.");
        return;
      }

      setResult(evaluated.value);
      setExpression(formatAmount(evaluated.value));
      return;
    }

    setExpression((current) => appendCalculatorValue(current, value));
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

    if (!canSave || amount === null) {
      setError("Choose a category and enter a valid amount.");
      return;
    }

    formData.set("type", type);
    formData.set("amount", formatAmount(amount));
    formData.set("date", date);
    formData.set("categoryId", categoryId);

    setIsSaving(true);
    try {
      await createTransaction(formData);
      formRef.current?.reset();
      setExpression("");
      setResult(null);
      setNote("");
      setSelectedTagIds([]);
      setPaymentMethod("");
      setPlace("");
      setAttachment(null);
      setDate(today);
      router.refresh();
      onSaved?.();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not save this transaction.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={handleAction}
      className={cn(
        "flex h-full flex-col bg-(--calc-bg) text-(--calc-text)",
        "[--calc-bg:#f6f7fb] [--calc-surface:#ffffff] [--calc-surface-2:#f0f2f7] [--calc-surface-3:#e9ecf3]",
        "[--calc-border:#e1e6f0] [--calc-border-strong:#cfd6e4]",
        "[--calc-text:#0f172a] [--calc-muted:#6b7280] [--calc-subtle:#9aa0b2]",
        "[--calc-accent:var(--primary)] [--calc-accent-2:var(--primary)] [--calc-accent-glow:rgba(83,74,183,0.14)]",
        "[--calc-expense:#e5484d] [--calc-income:#16a34a] [--calc-income-strong:#12b76a] [--calc-income-text:#0f3d1f]",
        "[--calc-warning:#f59e0b]",
        "dark:[--calc-bg:#0e0f11] dark:[--calc-surface:#17181c] dark:[--calc-surface-2:#1f2026] dark:[--calc-surface-3:#27282f]",
        "dark:[--calc-border:#2e2f38] dark:[--calc-border-strong:#3a3b46]",
        "dark:[--calc-text:#f0f0f4] dark:[--calc-muted:#9a9ab0] dark:[--calc-subtle:#5c5c70]",
        "dark:[--calc-accent:var(--primary)] dark:[--calc-accent-2:var(--primary)] dark:[--calc-accent-glow:rgba(83,74,183,0.16)]",
        "dark:[--calc-expense:#ff6b6b] dark:[--calc-income:#39d98a] dark:[--calc-income-strong:#20c472] dark:[--calc-income-text:#0a2617]",
        "dark:[--calc-warning:#ff9f43]",
      )}
    >
      <input type="hidden" name="type" value={type} />
      <input
        type="hidden"
        name="amount"
        value={amount ? formatAmount(amount) : ""}
      />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="note" value={note} />
      {paymentMethod ? (
        <input type="hidden" name="paymentMethod" value={paymentMethod} />
      ) : null}
      <input type="hidden" name="place" value={place} />
      {attachment ? (
        <>
          <input type="hidden" name="attachmentName" value={attachment.name} />
          <input type="hidden" name="attachmentType" value={attachment.type} />
          <input type="hidden" name="attachmentSize" value={attachment.size} />
        </>
      ) : null}
      {selectedTagIds.map((tagId) => (
        <input key={tagId} type="hidden" name="tagIds" value={tagId} />
      ))}

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 pt-4">
        <div className="grid min-h-11 grid-cols-2 gap-2">
          {(["expense", "income"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectType(item)}
              className={cn(
                "min-h-11 rounded-xl border px-4 text-sm font-semibold uppercase tracking-wide transition",
                item === "expense"
                  ? "border-(--calc-border-strong) text-(--calc-expense)"
                  : "border-(--calc-border-strong) text-(--calc-income)",
                type === item &&
                  (item === "expense"
                    ? "bg-(--calc-expense) text-white border-transparent"
                    : "bg-(--calc-income) text-(--calc-income-text) border-transparent"),
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <section className="relative overflow-hidden rounded-2xl border border-(--calc-border) bg-(--calc-surface) p-5">
          <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 bg-[radial-gradient(circle_at_top_right,var(--calc-accent-glow),transparent_70%)]" />
          <p className="min-h-6 break-all text-right font-mono text-xs text-(--calc-subtle)">
            {expression || "0"}
          </p>
          <p
            className={cn(
              "mt-2 min-h-12 break-all text-right font-mono text-4xl font-normal tracking-tight",
              type === "expense"
                ? "text-(--calc-expense)"
                : "text-(--calc-income)",
            )}
          >
            {amount ? formatAmount(amount) : "0"}
          </p>
          {error ? (
            <p className="mt-2 text-right text-xs text-(--calc-expense)">
              {error}
            </p>
          ) : null}
        </section>

        <section className="grid gap-2">
          <div className="flex items-center gap-2">
            {selectedCategory ? (
              <button
                type="button"
                onClick={() => setCategoryDrawerOpen(true)}
                className="flex min-h-11 flex-1 items-center gap-3 rounded-2xl border border-(--calc-border) bg-(--calc-surface) px-4 text-base transition hover:border-(--calc-border-strong)"
                aria-label="Change category"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  <span className="text-sm font-semibold">
                    {selectedCategory.name}
                  </span>
                </span>
                <ChevronRight className="size-4 text-(--calc-subtle)" />
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex min-h-11 flex-1 items-center justify-between gap-3 rounded-2xl border border-(--calc-border) bg-(--calc-surface) px-4 text-sm text-(--calc-muted)"
                aria-label="No categories available"
              >
                Add a category first
              </button>
            )}
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className={cn(
                "flex size-11 items-center justify-center rounded-2xl border bg-(--calc-surface) text-(--calc-muted) transition hover:bg-(--calc-surface-2)",
                hasDetails
                  ? "border-(--calc-accent) text-(--calc-accent)"
                  : "border-(--calc-border)",
              )}
              aria-label="Open details"
              title="Add details"
            >
              <Settings2 className="size-5" />
            </button>
          </div>
        </section>

        <CalculatorPad
          canSave={canSave && !isSaving}
          isSaving={isSaving}
          onPress={press}
        />

        {detailPills.length ? (
          <div className="flex flex-wrap gap-2">
            {detailPills.map((pill) => (
              <span
                key={pill.key}
                className="flex min-h-8 items-center gap-2 rounded-full border border-(--calc-border) bg-(--calc-surface-2) px-3 text-xs text-(--calc-muted)"
              >
                <span className="size-1.5 rounded-full bg-(--calc-subtle)" />
                {pill.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <CategoryDrawer
        open={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
        title="Select category"
        categories={categories}
        recentIds={recentCategoryIds[type]}
        selectedCategoryId={categoryId}
        onSelect={selectCategory}
      />

      <DetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        note={note}
        onNoteChange={setNote}
        tags={tags}
        selectedTagIds={selectedTagIds}
        onToggleTag={toggleTag}
        date={date}
        onDateChange={setDate}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        place={place}
        onPlaceChange={setPlace}
        attachment={attachment}
        onAttachmentChange={setAttachment}
      />
    </form>
  );
}

function CategoryDrawer({
  open,
  onClose,
  title,
  categories,
  recentIds,
  selectedCategoryId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  categories: CategoryOption[];
  recentIds: string[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
}) {
  const recentCategories = recentIds
    .map((id) => categories.find((category) => category.id === id))
    .filter((category): category is CategoryOption => Boolean(category));

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-80 bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-x-0 bottom-0 z-90 flex max-h-[86vh] flex-col rounded-t-[22px] border-t border-(--calc-border) bg-(--calc-surface) transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!open}
      >
        <div className="mt-3 h-1 w-10 self-center rounded-full bg-(--calc-border-strong)" />
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-(--calc-border) bg-(--calc-surface) px-5 py-4">
          <h2 className="text-base font-semibold text-(--calc-text)">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg border border-(--calc-border) bg-(--calc-surface-2) text-(--calc-muted)"
            aria-label="Close category drawer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-8 pt-5">
          <section className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--calc-subtle)">
              Recent
            </p>
            {recentCategories.length ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {recentCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onSelect(category.id)}
                    className={cn(
                      "flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm",
                      selectedCategoryId === category.id
                        ? "border-(--calc-accent) bg-(--calc-surface-2) text-(--calc-text)"
                        : "border-(--calc-border) bg-(--calc-surface) text-(--calc-text)",
                    )}
                    aria-label={`Select ${category.name}`}
                  >
                    <span
                      className="grid size-8 place-items-center rounded-full border"
                      style={{
                        borderColor: category.color,
                        color: category.color,
                      }}
                    >
                      <CategoryIcon
                        icon={category.icon}
                        iconClassName="size-4"
                      />
                    </span>
                    {category.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-(--calc-muted)">None selected yet.</p>
            )}
          </section>

          <section className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--calc-subtle)">
              All categories
            </p>
            {categories.length ? (
              <div className="grid gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onSelect(category.id)}
                    className={cn(
                      "flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-3 text-sm",
                      selectedCategoryId === category.id
                        ? "border-(--calc-accent) bg-(--calc-surface-2) text-(--calc-text)"
                        : "border-(--calc-border) bg-(--calc-surface) text-(--calc-text)",
                    )}
                    aria-label={`Select ${category.name}`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="grid size-8 place-items-center rounded-full border"
                        style={{
                          borderColor: category.color,
                          color: category.color,
                        }}
                      >
                        <CategoryIcon
                          icon={category.icon}
                          iconClassName="size-4"
                        />
                      </span>
                      {category.name}
                    </span>
                    {selectedCategoryId === category.id ? (
                      <span className="text-xs font-semibold text-(--calc-accent-2)">
                        Selected
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-(--calc-muted)">
                Add a category first.
              </p>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}

function CalculatorPad({
  canSave,
  isSaving,
  onPress,
}: {
  canSave: boolean;
  isSaving: boolean;
  onPress: (value: string) => void;
}) {
  const keys = [
    "clear",
    "backspace",
    "/",
    "*",
    "7",
    "8",
    "9",
    "-",
    "4",
    "5",
    "6",
    "+",
    "1",
    "2",
    "3",
    "=",
    ".",
    "0",
  ];

  return (
    <section className="grid grid-cols-4 gap-2">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onPress(key)}
          className={cn(
            "flex min-h-16 items-center justify-center rounded-2xl border text-xl font-semibold transition active:scale-[0.96]",
            key === "=" &&
              "row-span-2 border-transparent bg-(--calc-accent) text-white text-2xl",
            ["+", "-", "*", "/"].includes(key) &&
              "border-(--calc-border) bg-(--calc-surface-3) text-(--calc-accent-2)",
            key === "clear" &&
              "border-(--calc-border) bg-(--calc-surface-3) text-(--calc-warning)",
            key === "backspace" &&
              "border-(--calc-border) bg-(--calc-surface-3) text-(--calc-muted)",
            !["+", "-", "*", "/", "clear", "backspace", "="].includes(key) &&
              "border-(--calc-border) bg-(--calc-surface-2)",
          )}
          aria-label={calculatorLabel(key)}
        >
          {key === "backspace" ? (
            <ChevronRight className="size-5 rotate-180" />
          ) : key === "clear" ? (
            <Eraser className="size-5" />
          ) : (
            displayKey(key)
          )}
        </button>
      ))}
      <button
        type="submit"
        disabled={!canSave}
        className="col-span-4 flex min-h-16 items-center justify-center rounded-2xl bg-linear-to-br from-(--calc-income) to-(--calc-income-strong) px-4 text-base font-semibold text-(--calc-income-text) transition active:scale-[0.97] disabled:opacity-40"
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
    </section>
  );
}

function DetailsDrawer({
  open,
  onClose,
  note,
  onNoteChange,
  tags,
  selectedTagIds,
  onToggleTag,
  date,
  onDateChange,
  paymentMethod,
  onPaymentMethodChange,
  place,
  onPlaceChange,
  attachment,
  onAttachmentChange,
}: {
  open: boolean;
  onClose: () => void;
  note: string;
  onNoteChange: (value: string) => void;
  tags: TagOption[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  paymentMethod: PaymentMethod | "";
  onPaymentMethodChange: (value: PaymentMethod | "") => void;
  place: string;
  onPlaceChange: (value: string) => void;
  attachment: AttachmentMeta | null;
  onAttachmentChange: (value: AttachmentMeta | null) => void;
}) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-60 bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-x-0 bottom-0 z-70 flex max-h-[86vh] flex-col rounded-t-[22px] border-t border-(--calc-border) bg-(--calc-surface) transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!open}
      >
        <div className="mt-3 h-1 w-10 self-center rounded-full bg-(--calc-border-strong)" />
        <div className="flex items-center justify-between border-b border-(--calc-border) px-5 py-4">
          <h2 className="text-base font-semibold text-(--calc-text)">
            Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg border border-(--calc-border) bg-(--calc-surface-2) text-(--calc-muted)"
            aria-label="Close details"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-5 py-5">
          <label className="grid gap-2 text-sm font-semibold text-(--calc-muted)">
            <span className="flex items-center gap-2 text-(--calc-muted)">
              <span className="text-(--calc-muted)">Note</span>
            </span>
            <textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              maxLength={240}
              rows={4}
              className="min-h-24 w-full resize-none rounded-xl border border-(--calc-border) bg-(--calc-surface-2) px-3 py-3 text-sm font-normal text-(--calc-text) outline-none transition focus:border-(--calc-accent)"
              placeholder="Optional note"
            />
          </label>

          <section className="grid gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-(--calc-muted)">
              <Tags className="size-4" />
              <span>Labels</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.length ? (
                tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onToggleTag(tag.id)}
                    className={cn(
                      "min-h-9 rounded-full border px-3 text-sm",
                      selectedTagIds.includes(tag.id)
                        ? "border-(--calc-accent) bg-[color-mix(in_srgb,var(--calc-accent)_15%,transparent)] text-(--calc-accent-2)"
                        : "border-(--calc-border) bg-(--calc-surface-2) text-(--calc-muted)",
                    )}
                  >
                    {tag.name}
                  </button>
                ))
              ) : (
                <p className="text-sm text-(--calc-muted)">No labels yet.</p>
              )}
            </div>
          </section>

          <label className="grid gap-2 text-sm font-semibold text-(--calc-muted)">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-(--calc-border) bg-(--calc-surface-2) px-3 text-sm font-normal text-(--calc-text) outline-none transition focus:border-(--calc-accent)"
            />
          </label>

          <section className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--calc-subtle)">
              Payment Method
            </p>
            <div className="grid grid-cols-3 gap-2">
              {paymentOptions.map((option) => {
                const selected = paymentMethod === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      onPaymentMethodChange(selected ? "" : option.value)
                    }
                    className={cn(
                      "min-h-10 rounded-xl border text-sm font-semibold transition",
                      selected
                        ? "border-(--calc-accent) bg-[color-mix(in_srgb,var(--calc-accent)_15%,transparent)] text-(--calc-accent-2)"
                        : "border-(--calc-border) bg-(--calc-surface-2) text-(--calc-muted)",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          <label className="grid gap-2 text-sm font-semibold text-(--calc-muted)">
            <span className="flex items-center gap-2">
              <MapPin className="size-4" />
              Place
            </span>
            <input
              value={place}
              onChange={(event) => onPlaceChange(event.target.value)}
              maxLength={120}
              className="min-h-11 w-full rounded-xl border border-(--calc-border) bg-(--calc-surface-2) px-3 text-sm font-normal text-(--calc-text) outline-none transition focus:border-(--calc-accent)"
              placeholder="Shop, city, or account"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-(--calc-muted)">
            <span className="flex items-center gap-2">
              <Paperclip className="size-4" />
              Attachment
            </span>
            <span className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-(--calc-border-strong) bg-(--calc-surface-2) px-3 text-sm font-normal text-(--calc-muted)">
              <FileUp className="size-4" />
              Pick file
              <input
                type="file"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  onAttachmentChange(
                    file
                      ? { name: file.name, type: file.type, size: file.size }
                      : null,
                  );
                }}
              />
            </span>
            {attachment ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-(--calc-border) bg-(--calc-surface-2) px-3 py-2 text-sm font-normal text-(--calc-text)">
                <span className="min-w-0 truncate">{attachment.name}</span>
                <button
                  type="button"
                  onClick={() => onAttachmentChange(null)}
                  className="min-h-11 px-2 text-sm font-semibold text-(--calc-expense)"
                >
                  Remove
                </button>
              </div>
            ) : null}
          </label>
        </div>
      </aside>
    </>
  );
}

function appendCalculatorValue(current: string, value: string) {
  const operators = ["+", "-", "*", "/"];
  const last = current.slice(-1);

  if (operators.includes(value)) {
    if (!current && value !== "-") return current;
    if (operators.includes(last)) return current.slice(0, -1) + value;
    return current + value;
  }

  if (value === ".") {
    const segment = current.split(/[+\-*/]/).at(-1) ?? "";
    if (segment.includes(".")) return current;
    return current + (segment ? "." : "0.");
  }

  return current + value;
}

function evaluateExpression(expression: string): {
  value: number | null;
  error: boolean;
} {
  if (!expression) return { value: null, error: false };
  if (/[+\-*/.]$/.test(expression)) return { value: null, error: true };

  const tokens = tokenize(expression);
  if (!tokens.length) return { value: null, error: true };

  const collapsed = collapse(tokens, ["*", "/"]);
  if (!collapsed) return { value: null, error: true };

  const value = collapse(collapsed, ["+", "-"])?.[0];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { value: null, error: true };
  }

  return { value: Math.round(value * 100) / 100, error: false };
}

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let numberBuffer = "";

  for (let index = 0; index < expression.length; index += 1) {
    const char = expression[index];
    const previous = expression[index - 1];
    const isUnaryMinus =
      char === "-" && (index === 0 || ["+", "-", "*", "/"].includes(previous));

    if (/\d|\./.test(char) || isUnaryMinus) {
      numberBuffer += char;
      continue;
    }

    if (["+", "-", "*", "/"].includes(char)) {
      if (!numberBuffer) return [];
      tokens.push(Number(numberBuffer), char as Token);
      numberBuffer = "";
      continue;
    }

    return [];
  }

  if (numberBuffer) tokens.push(Number(numberBuffer));
  return tokens.every(
    (token) => typeof token !== "number" || Number.isFinite(token),
  )
    ? tokens
    : [];
}

function collapse(tokens: Token[], operators: string[]) {
  const output: Token[] = [];
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];
    if (
      typeof token === "string" &&
      operators.includes(token) &&
      typeof output.at(-1) === "number" &&
      typeof tokens[index + 1] === "number"
    ) {
      const left = output.pop() as number;
      const right = tokens[index + 1] as number;

      if (token === "/" && right === 0) return null;
      output.push(applyOperator(left, right, token));
      index += 2;
      continue;
    }

    output.push(token);
    index += 1;
  }

  return output;
}

function applyOperator(left: number, right: number, operator: string) {
  if (operator === "+") return left + right;
  if (operator === "-") return left - right;
  if (operator === "*") return left * right;
  return left / right;
}

function formatAmount(value: number) {
  return value
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
}

function displayKey(key: string) {
  if (key === "*") return "x";
  if (key === "/") return "/";
  return key;
}

function calculatorLabel(key: string) {
  if (key === "*") return "Multiply";
  if (key === "/") return "Divide";
  if (key === "-") return "Minus";
  if (key === "+") return "Plus";
  if (key === ".") return "Decimal";
  if (key === "=") return "Equals";
  if (key === "clear") return "Clear";
  if (key === "backspace") return "Backspace";
  return key;
}
