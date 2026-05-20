"use client";

import { createTransaction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CategoryOption, TagOption } from "@/lib/dashboard";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  TrendingDown,
  TrendingUp,
  CalendarIcon,
  Tag,
  StickyNote,
  Layers,
  CircleDollarSign,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const today = new Date().toISOString().slice(0, 10);

type TransactionType = "expense" | "income";

type FormErrors = {
  amount?: string;
  date?: string;
  categoryId?: string;
};

type TransactionFormProps = {
  incomeCategories: CategoryOption[];
  expenseCategories: CategoryOption[];
  tags: TagOption[];
};

export default function TransactionForm({
  incomeCategories,
  expenseCategories,
  tags,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [categoryId, setCategoryId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const categories = type === "expense" ? expenseCategories : incomeCategories;

  function validate(): FormErrors {
    const errs: FormErrors = {};
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0)
      errs.amount = "Enter a valid amount greater than 0.";
    if (!date) errs.date = "Please pick a date.";
    if (!categoryId) errs.categoryId = "Please select a category.";
    return errs;
  }

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const formData = new FormData(e.currentTarget);
    // Inject selected tags manually (since custom UI)
    selectedTags.forEach((id) => formData.append("tagIds", id));
    formData.set("type", type);

    await createTransaction(formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAmount("");
      setDate(today);
      setCategoryId("");
      setSelectedTags([]);
      setErrors({});
    }, 2000);
  }

  const isExpense = type === "expense";

  return (
    <Card className="w-full max-w-md border border-border/60 bg-card shadow-xl shadow-black/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-300",
              isExpense
                ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
            )}
          >
            {isExpense ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
          </div>
          <div>
            <CardTitle className="text-base">Add Transaction form</CardTitle>
            <CardDescription className="text-xs">
              Track your {isExpense ? "spending" : "earnings"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-5">
          {/* Hidden type input */}
          <input type="hidden" name="type" value={type} />

          {/* Type Tabs */}
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Transaction Type
            </Label>
            <Tabs
              value={type}
              onValueChange={(v) => {
                setType(v as TransactionType);
                setCategoryId("");
                setErrors((e) => ({ ...e, categoryId: undefined }));
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 h-10">
                <TabsTrigger
                  value="expense"
                  className={cn(
                    "gap-1.5 text-sm font-medium transition-all duration-200",
                    type === "expense" && "text-rose-600 dark:text-rose-400",
                  )}
                >
                  <TrendingDown className="h-3.5 w-3.5" />
                  Expense
                </TabsTrigger>
                <TabsTrigger
                  value="income"
                  className={cn(
                    "gap-1.5 text-sm font-medium transition-all duration-200",
                    type === "income" &&
                      "text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Income
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Amount */}
          <div className="grid gap-1.5">
            <Label
              htmlFor="amount"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Amount
            </Label>
            <div className="relative">
              <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                name="amount"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount)
                    setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                className={cn(
                  "pl-9 font-mono text-base tabular-nums",
                  errors.amount &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
            </div>
            {errors.amount && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="grid gap-1.5">
            <Label
              htmlFor="date"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Date
            </Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="date"
                type="date"
                name="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date)
                    setErrors((prev) => ({ ...prev, date: undefined }));
                }}
                className={cn(
                  "pl-9",
                  errors.date &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
            </div>
            {errors.date && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.date}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                Category
                <Badge
                  variant="outline"
                  className={cn(
                    "ml-1 text-[10px] px-1.5 py-0 h-4 font-normal border",
                    isExpense
                      ? "text-rose-600 border-rose-200 dark:text-rose-400 dark:border-rose-900"
                      : "text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-900",
                  )}
                >
                  {isExpense ? "Expense only" : "Income only"}
                </Badge>
              </span>
            </Label>
            <Select
              name="categoryId"
              value={categoryId}
              onValueChange={(v) => {
                setCategoryId(v);
                if (errors.categoryId)
                  setErrors((prev) => ({ ...prev, categoryId: undefined }));
              }}
            >
              <SelectTrigger
                className={cn(
                  errors.categoryId &&
                    "border-destructive focus:ring-destructive",
                )}
              >
                <SelectValue
                  placeholder={`Select ${isExpense ? "expense" : "income"} category`}
                />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <div className="py-3 text-center text-sm text-muted-foreground">
                    No categories found
                  </div>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.categoryId}
              </p>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <Tag className="h-3.5 w-3.5" />
                Tags
                <span className="font-normal normal-case tracking-normal ml-0.5 text-muted-foreground/60">
                  (optional)
                </span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active = selectedTags.includes(String(tag.id));
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(String(tag.id))}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                      )}
                    >
                      {active && <CheckCircle2 className="h-3 w-3" />}
                      {tag.name}
                    </button>
                  );
                })}
              </div>
              {/* Hidden inputs for selected tags */}
              {selectedTags.map((id) => (
                <input key={id} type="hidden" name="tagIds" value={id} />
              ))}
            </div>
          )}

          {/* Note */}
          <div className="grid gap-1.5">
            <Label
              htmlFor="note"
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              <StickyNote className="h-3.5 w-3.5" />
              Note
              <span className="font-normal normal-case tracking-normal ml-0.5 text-muted-foreground/60">
                (optional)
              </span>
            </Label>
            <Textarea
              id="note"
              name="note"
              maxLength={240}
              rows={3}
              placeholder="Add a description…"
              className="resize-none text-sm"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className={cn(
              "mt-1 w-full gap-2 font-semibold transition-all duration-200",
              isExpense
                ? "bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-600 dark:hover:bg-rose-700"
                : "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700",
            )}
          >
            {submitted ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Saved!
              </>
            ) : isExpense ? (
              <>
                <TrendingDown className="h-4 w-4" />
                Save Expense
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Save Income
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
