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

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createTransaction } from "@/features/wallet/server/actions";
import type {
  CategoryOption,
  PaymentMethod,
  TagOption,
  TransactionType,
} from "@/types/wallet";

const today = new Date().toISOString().slice(0, 10);
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
    <form ref={formRef} action={handleAction} className="flex h-full flex-col">
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

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 pt-2">
        <div className="grid min-h-11 grid-cols-2 rounded-lg bg-muted p-1">
          {(["expense", "income"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectType(item)}
              className={cn(
                "min-h-11 rounded-md px-4 text-base font-semibold capitalize transition",
                type === item
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <section className="rounded-lg border bg-background p-4">
          <p className="min-h-6 break-all text-right text-base text-muted-foreground">
            {expression || "0"}
          </p>
          <p className="mt-2 min-h-12 break-all text-right text-4xl font-semibold tracking-normal">
            {amount ? formatAmount(amount) : "0"}
          </p>
          {error ? (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          ) : null}
        </section>

        <section className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold">Category</h3>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setDetailsOpen(true)}
              className="min-h-11 gap-2 px-3"
            >
              <Settings2 className="size-4" />
              Details
            </Button>
          </div>
          <div className="grid gap-1">
            {selectedCategory ? (
              <button
                type="button"
                onClick={() => setCategoryDrawerOpen(true)}
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 text-base"
                aria-label="Change category"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  {selectedCategory.name}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 text-base text-muted-foreground"
                aria-label="No categories available"
              >
                Add a category first
              </button>
            )}
            <p className="text-xs text-muted-foreground">Tap to change.</p>
          </div>
        </section>

        <CalculatorPad
          canSave={canSave && !isSaving}
          isSaving={isSaving}
          onPress={press}
        />
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
          "fixed inset-0 z-80 bg-black/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-0 z-90 flex flex-col bg-background transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!open}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-lg border"
            aria-label="Close category drawer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6 pt-4">
          <section className="grid gap-2">
            <p className="text-sm font-semibold text-muted-foreground">
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
                      "flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-base",
                      selectedCategoryId === category.id
                        ? "border-foreground bg-foreground text-background"
                        : "bg-background text-foreground",
                    )}
                    aria-label={`Select ${category.name}`}
                  >
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                None selected yet.
              </p>
            )}
          </section>

          <section className="grid gap-2">
            <p className="text-sm font-semibold text-muted-foreground">
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
                      "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-3 text-base",
                      selectedCategoryId === category.id
                        ? "border-foreground bg-foreground text-background"
                        : "bg-background text-foreground",
                    )}
                    aria-label={`Select ${category.name}`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </span>
                    {selectedCategoryId === category.id ? (
                      <span className="text-xs font-semibold">Selected</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
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
    "0",
    ".",
  ];

  return (
    <section className="grid grid-cols-4 gap-2">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onPress(key)}
          className={cn(
            "flex min-h-14 items-center justify-center rounded-lg border bg-background text-xl font-semibold transition active:scale-[0.98]",
            key === "=" && "row-span-2 bg-foreground text-background",
            ["+", "-", "*", "/"].includes(key) && "bg-muted",
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
        className="col-span-2 flex min-h-14 items-center justify-center rounded-lg bg-emerald-600 px-4 text-base font-semibold text-white transition active:scale-[0.98] disabled:opacity-45"
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
          "fixed inset-0 z-60 bg-black/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-70 flex w-[88vw] max-w-sm flex-col border-l bg-background transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-lg font-semibold">Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-lg border"
            aria-label="Close details"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-4 py-4">
          <label className="grid gap-2 text-base font-medium">
            Note
            <textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              maxLength={240}
              rows={4}
              className="min-h-24 w-full resize-none rounded-lg border bg-background px-3 py-3 text-base font-normal"
              placeholder="Optional note"
            />
          </label>

          <section className="grid gap-2">
            <div className="flex items-center gap-2 text-base font-medium">
              <Tags className="size-4" />
              Labels
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.length ? (
                tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onToggleTag(tag.id)}
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
                <p className="text-sm text-muted-foreground">No labels yet.</p>
              )}
            </div>
          </section>

          <label className="grid gap-2 text-base font-medium">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              className="min-h-11 w-full rounded-lg border bg-background px-3 text-base font-normal"
            />
          </label>

          <label className="grid gap-2 text-base font-medium">
            Payment
            <select
              value={paymentMethod}
              onChange={(event) =>
                onPaymentMethodChange(event.target.value as PaymentMethod | "")
              }
              className="min-h-11 w-full rounded-lg border bg-background px-3 text-base font-normal"
            >
              <option value="">No payment method</option>
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-base font-medium">
            <span className="flex items-center gap-2">
              <MapPin className="size-4" />
              Place
            </span>
            <input
              value={place}
              onChange={(event) => onPlaceChange(event.target.value)}
              maxLength={120}
              className="min-h-11 w-full rounded-lg border bg-background px-3 text-base font-normal"
              placeholder="Shop, city, or account"
            />
          </label>

          <label className="grid gap-2 text-base font-medium">
            <span className="flex items-center gap-2">
              <Paperclip className="size-4" />
              Attachment
            </span>
            <span className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 text-base font-normal">
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
              <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm font-normal">
                <span className="min-w-0 truncate">{attachment.name}</span>
                <button
                  type="button"
                  onClick={() => onAttachmentChange(null)}
                  className="min-h-11 px-2 font-medium"
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
