"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Hash,
  Lock,
  Plus,
  Tag,
  Trash2,
  Wallet,
} from "lucide-react";

import { CategoryIcon } from "@/features/wallet/categories/components/category-icon";
import { CategoryIconPicker } from "@/features/wallet/categories/components/category-icon-picker";
import type { CategoryIconId } from "@/features/wallet/categories/lib/category-icons";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/features/wallet/server/categories";
import { createTag, deleteTag, updateTag } from "@/features/wallet/server/tags";
import type { CategoryOption, TagOption } from "@/features/wallet/types";
import { cn } from "@/lib/utils";

type Tab = "categories" | "tags";

type Notice = {
  tone: "success" | "error";
  message: string;
};

type CategoryDraft = {
  id: string;
  name: string;
  color: string;
  icon: CategoryIconId;
};

type WalletMoreManagerProps = {
  categories: CategoryOption[];
  tags: TagOption[];
};

function errorMessage(err: unknown) {
  return err instanceof Error
    ? err.message
    : "Something went wrong. Try again.";
}

function NoticeBar({ notice }: { notice: Notice }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-xl border px-3.5 py-2.5 text-sm font-medium",
        notice.tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
      )}
    >
      {notice.message}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

function Badge({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {icon}
      {children}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export default function WalletMoreManager({
  categories: initialCategories,
  tags: initialTags,
}: WalletMoreManagerProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("categories");
  const [notice, setNotice] = useState<Notice | null>(null);
  const categoryFormRef = useRef<HTMLFormElement>(null);
  const [createIcon, setCreateIcon] = useState<CategoryIconId>("circle");
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);
  const [catDraft, setCatDraft] = useState<CategoryDraft | null>(null);
  const [expandedTagId, setExpandedTagId] = useState<string | null>(null);
  const [tagDraftName, setTagDraftName] = useState<string>("");
  const tagFormRef = useRef<HTMLFormElement>(null);

  async function runAction(
    action: (fd: FormData) => Promise<void>,
    formData: FormData,
    successMessage: string,
    onSuccess?: () => void,
  ) {
    setNotice(null);
    try {
      await action(formData);
      setNotice({ tone: "success", message: successMessage });
      onSuccess?.();
      router.refresh();
    } catch (err) {
      setNotice({ tone: "error", message: errorMessage(err) });
    }
  }

  async function handleCreateCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("icon", createIcon);
    await runAction(createCategory, fd, "Category added.", () => {
      categoryFormRef.current?.reset();
      setCreateIcon("circle");
    });
  }

  function openCatEdit(cat: CategoryOption) {
    setExpandedCatId(cat.id);
    setCatDraft({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon as CategoryIconId,
    });
  }

  function closeCatEdit() {
    setExpandedCatId(null);
    setCatDraft(null);
  }

  async function handleUpdateCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!catDraft) return;
    const fd = new FormData(e.currentTarget);
    await runAction(updateCategory, fd, "Category updated.", closeCatEdit);
  }

  async function handleDeleteCategory(cat: CategoryOption) {
    if (cat.isDefault) {
      setNotice({
        tone: "error",
        message: "Default categories cannot be deleted.",
      });
      return;
    }
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    const fd = new FormData();
    fd.set("id", cat.id);
    await runAction(deleteCategory, fd, "Category deleted.", closeCatEdit);
  }

  async function handleCreateTag(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await runAction(createTag, fd, "Tag added.", () =>
      tagFormRef.current?.reset(),
    );
  }

  function openTagEdit(tag: TagOption) {
    setExpandedTagId(tag.id);
    setTagDraftName(tag.name);
  }

  function closeTagEdit() {
    setExpandedTagId(null);
    setTagDraftName("");
  }

  async function handleUpdateTag(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!expandedTagId) return;
    const fd = new FormData(e.currentTarget);
    await runAction(updateTag, fd, "Tag updated.", closeTagEdit);
  }

  async function handleDeleteTag(tag: TagOption) {
    if (!confirm(`Delete "${tag.name}"? This cannot be undone.`)) return;
    const fd = new FormData();
    fd.set("id", tag.id);
    await runAction(deleteTag, fd, "Tag deleted.", closeTagEdit);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 py-10">
      <div className="flex items-center gap-3 ">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Wallet size={20} />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Manage wallet</h1>
          <p className="text-xs text-muted-foreground">Categories &amp; tags</p>
        </div>
      </div>

      {notice ? <NoticeBar notice={notice} /> : null}

      <div
        role="tablist"
        className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1"
      >
        {(["categories", "tags"] as Tab[]).map((nextTab) => (
          <button
            key={nextTab}
            role="tab"
            aria-selected={tab === nextTab}
            onClick={() => setTab(nextTab)}
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors",
              tab === nextTab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {nextTab === "categories" ? <Tag size={14} /> : <Hash size={14} />}
            {nextTab.charAt(0).toUpperCase() + nextTab.slice(1)}
          </button>
        ))}
      </div>

      {tab === "categories" ? (
        <>
          <form
            ref={categoryFormRef}
            onSubmit={handleCreateCategory}
            className="flex flex-col gap-3 rounded-2xl border bg-background p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              New category
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Name
              </label>
              <input
                name="name"
                placeholder="e.g. Groceries"
                required
                className="h-11 w-full rounded-lg border bg-muted/40 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Type
                </label>
                <select
                  name="type"
                  className="h-11 w-full rounded-lg border bg-muted/40 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Color
                </label>
                <input
                  type="color"
                  name="color"
                  defaultValue="#6366f1"
                  className="h-11 w-full cursor-pointer rounded-lg border bg-muted/40 p-1.5"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Icon
              </label>
              <CategoryIconPicker value={createIcon} onChange={setCreateIcon} />
            </div>

            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              <Plus size={16} /> Add category
            </button>
          </form>

          <SectionLabel>Your categories</SectionLabel>
          <div className="flex flex-col gap-2">
            {initialCategories.length === 0 ? (
              <EmptyState message="No categories yet. Add your first above." />
            ) : (
              initialCategories.map((cat) => {
                const isOpen = expandedCatId === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={cn(
                      "overflow-hidden rounded-2xl border transition-shadow",
                      isOpen && "shadow-sm",
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        isOpen ? closeCatEdit() : openCatEdit(cat)
                      }
                      className="flex w-full items-center gap-3 bg-background px-4 py-3 text-left"
                    >
                      <span
                        className="grid size-9 shrink-0 place-items-center rounded-full border-2"
                        style={{ borderColor: cat.color, color: cat.color }}
                      >
                        <CategoryIcon icon={cat.icon} />
                      </span>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-semibold">
                          {cat.name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          <Badge>{cat.type}</Badge>
                          {cat.isDefault ? (
                            <Badge icon={<Lock size={10} />}>default</Badge>
                          ) : null}
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp
                          size={16}
                          className="shrink-0 text-muted-foreground"
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          className="shrink-0 text-muted-foreground"
                        />
                      )}
                    </button>

                    {isOpen && catDraft ? (
                      <form
                        onSubmit={handleUpdateCategory}
                        className="border-t bg-muted/30 px-4 pb-4 pt-3"
                      >
                        <input type="hidden" name="id" value={catDraft.id} />

                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                              Name
                            </label>
                            <input
                              name="name"
                              value={catDraft.name}
                              onChange={(e) =>
                                setCatDraft({
                                  ...catDraft,
                                  name: e.target.value,
                                })
                              }
                              className="h-11 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                              Color
                            </label>
                            <input
                              type="color"
                              name="color"
                              value={catDraft.color}
                              onChange={(e) =>
                                setCatDraft({
                                  ...catDraft,
                                  color: e.target.value,
                                })
                              }
                              className="h-11 w-full cursor-pointer rounded-lg border bg-background p-1.5"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                              Icon
                            </label>
                            <CategoryIconPicker
                              value={catDraft.icon}
                              onChange={(icon) =>
                                setCatDraft({ ...catDraft, icon })
                              }
                            />
                            <input
                              type="hidden"
                              name="icon"
                              value={catDraft.icon}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="submit"
                              className="flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              disabled={cat.isDefault}
                              className={cn(
                                "flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-opacity active:scale-[0.98]",
                                cat.isDefault
                                  ? "cursor-not-allowed border bg-background text-muted-foreground opacity-40"
                                  : "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-400",
                              )}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={closeCatEdit}
                            className="h-9 w-full rounded-xl border text-sm text-muted-foreground hover:bg-muted/60"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          <form
            ref={tagFormRef}
            onSubmit={handleCreateTag}
            className="flex flex-col gap-3 rounded-2xl border bg-background p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              New tag
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Name
              </label>
              <input
                name="name"
                placeholder="e.g. Office"
                required
                className="h-11 w-full rounded-lg border bg-muted/40 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              <Plus size={16} /> Add tag
            </button>
          </form>

          <SectionLabel>Your tags</SectionLabel>
          <div className="flex flex-col gap-2">
            {initialTags.length === 0 ? (
              <EmptyState message="No tags yet. Add a tag above." />
            ) : (
              initialTags.map((tag) => {
                const isOpen = expandedTagId === tag.id;
                return (
                  <div
                    key={tag.id}
                    className={cn(
                      "overflow-hidden rounded-2xl border transition-shadow",
                      isOpen && "shadow-sm",
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        isOpen ? closeTagEdit() : openTagEdit(tag)
                      }
                      className="flex w-full items-center gap-3 bg-background px-4 py-3 text-left"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                        <Hash size={14} />
                      </span>
                      <p className="flex-1 text-sm font-semibold">{tag.name}</p>
                      {isOpen ? (
                        <ChevronUp
                          size={16}
                          className="shrink-0 text-muted-foreground"
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          className="shrink-0 text-muted-foreground"
                        />
                      )}
                    </button>

                    {isOpen ? (
                      <form
                        onSubmit={handleUpdateTag}
                        className="border-t bg-muted/30 px-4 pb-4 pt-3"
                      >
                        <input type="hidden" name="id" value={tag.id} />
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                              Name
                            </label>
                            <input
                              name="name"
                              value={tagDraftName}
                              onChange={(e) => setTagDraftName(e.target.value)}
                              className="h-11 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="submit"
                              className="flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTag(tag)}
                              className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-rose-100 text-sm font-semibold text-rose-700 hover:bg-rose-200 active:scale-[0.98] dark:bg-rose-950 dark:text-rose-400"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={closeTagEdit}
                            className="h-9 w-full rounded-xl border text-sm text-muted-foreground hover:bg-muted/60"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
