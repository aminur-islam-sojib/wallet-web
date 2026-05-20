"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  updateCategory,
  updateTag,
} from "@/features/wallet/server/actions";
import type { CategoryOption, TagOption } from "@/types/wallet";
import { cn } from "@/lib/utils";

type WalletMoreManagerProps = {
  categories: CategoryOption[];
  tags: TagOption[];
};

type Notice = {
  tone: "success" | "error";
  message: string;
};

type CategoryEditState = {
  id: string;
  name: string;
  color: string;
};

type TagEditState = {
  id: string;
  name: string;
};

export default function WalletMoreManager({
  categories,
  tags,
}: WalletMoreManagerProps) {
  const router = useRouter();
  const categoryFormRef = useRef<HTMLFormElement>(null);
  const tagFormRef = useRef<HTMLFormElement>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [categoryEdit, setCategoryEdit] = useState<CategoryEditState | null>(
    null,
  );
  const [tagEdit, setTagEdit] = useState<TagEditState | null>(null);

  async function runAction(
    action: (formData: FormData) => Promise<void>,
    formData: FormData,
    successMessage: string,
    next?: () => void,
  ) {
    setNotice(null);

    try {
      await action(formData);
      setNotice({ tone: "success", message: successMessage });
      next?.();
      router.refresh();
    } catch (error) {
      setNotice({ tone: "error", message: getErrorMessage(error) });
    }
  }

  async function handleCreateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await runAction(createCategory, formData, "Category added.", () => {
      categoryFormRef.current?.reset();
    });
  }

  async function handleCreateTag(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await runAction(createTag, formData, "Tag added.", () => {
      tagFormRef.current?.reset();
    });
  }

  async function handleUpdateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryEdit) return;

    const formData = new FormData(event.currentTarget);
    await runAction(updateCategory, formData, "Category updated.", () => {
      setCategoryEdit(null);
    });
  }

  async function handleUpdateTag(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tagEdit) return;

    const formData = new FormData(event.currentTarget);
    await runAction(updateTag, formData, "Tag updated.", () => {
      setTagEdit(null);
    });
  }

  async function handleDeleteCategory(category: CategoryOption) {
    if (category.isDefault) {
      setNotice({
        tone: "error",
        message: "Default categories cannot be deleted.",
      });
      return;
    }

    const confirmed = window.confirm(
      `Delete ${category.name}? This cannot be undone.`,
    );

    if (!confirmed) return;

    const formData = new FormData();
    formData.set("id", category.id);
    await runAction(deleteCategory, formData, "Category deleted.");
  }

  async function handleDeleteTag(tag: TagOption) {
    const confirmed = window.confirm(
      `Delete ${tag.name}? This cannot be undone.`,
    );

    if (!confirmed) return;

    const formData = new FormData();
    formData.set("id", tag.id);
    await runAction(deleteTag, formData, "Tag deleted.");
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Wallet
          </p>
          <h2 className="text-2xl font-semibold tracking-normal">More</h2>
          <p className="text-base text-muted-foreground">
            Manage your wallet categories and tags. Changes update your filters
            and transaction forms.
          </p>
        </div>

        {notice ? (
          <div
            className={cn(
              "mt-4 rounded-lg border px-3 py-2 text-sm",
              notice.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800",
            )}
            role="status"
          >
            {notice.message}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 rounded-2xl border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Categories</h3>
          <p className="text-sm text-muted-foreground">
            Add, rename, or remove categories. Default categories cannot be
            deleted.
          </p>
        </div>

        <form
          ref={categoryFormRef}
          onSubmit={handleCreateCategory}
          className="grid gap-3 rounded-xl border bg-muted/40 p-4"
        >
          <div className="grid gap-2">
            <label className="text-sm font-medium">Name</label>
            <input
              name="name"
              placeholder="Groceries"
              required
              className="min-h-11 w-full rounded-lg border bg-background px-3 text-base"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Type</label>
              <select
                name="type"
                className="min-h-11 w-full rounded-lg border bg-background px-3 text-base"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Color</label>
              <input
                type="color"
                name="color"
                defaultValue="#64748b"
                className="min-h-11 w-full rounded-lg border bg-background p-1"
              />
            </div>
          </div>
          <Button type="submit" className="min-h-11" size="lg">
            Add category
          </Button>
        </form>

        <div className="grid gap-3">
          {categories.length ? (
            categories.map((category) => {
              const isEditing = categoryEdit?.id === category.id;
              const editState = isEditing ? categoryEdit : null;

              return (
                <div
                  key={category.id}
                  className="grid gap-3 rounded-xl border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <p className="text-base font-semibold">{category.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border px-2 py-1 text-xs">
                        {category.type}
                      </span>
                      {category.isDefault ? (
                        <span className="rounded-full border px-2 py-1 text-xs">
                          Default
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {isEditing && editState ? (
                    <form
                      onSubmit={handleUpdateCategory}
                      className="grid gap-3"
                    >
                      <input type="hidden" name="id" value={editState.id} />
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Name</label>
                        <input
                          name="name"
                          value={editState.name}
                          onChange={(event) =>
                            setCategoryEdit({
                              ...editState,
                              name: event.target.value,
                            })
                          }
                          className="min-h-11 w-full rounded-lg border bg-background px-3 text-base"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Color</label>
                        <input
                          type="color"
                          name="color"
                          value={editState.color}
                          onChange={(event) =>
                            setCategoryEdit({
                              ...editState,
                              color: event.target.value,
                            })
                          }
                          className="min-h-11 w-full rounded-lg border bg-background p-1"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" className="min-h-11" size="lg">
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="min-h-11"
                          onClick={() => setCategoryEdit(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="min-h-11"
                        onClick={() =>
                          setCategoryEdit({
                            id: category.id,
                            name: category.name,
                            color: category.color,
                          })
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="lg"
                        className="min-h-11"
                        disabled={category.isDefault}
                        onClick={() => handleDeleteCategory(category)}
                      >
                        Delete
                      </Button>
                      {category.isDefault ? (
                        <span className="text-xs text-muted-foreground">
                          Default categories cannot be deleted.
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No categories yet. Add your first category above.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Tags</h3>
          <p className="text-sm text-muted-foreground">
            Keep tags short to make filtering easier.
          </p>
        </div>

        <form
          ref={tagFormRef}
          onSubmit={handleCreateTag}
          className="grid gap-3 rounded-xl border bg-muted/40 p-4"
        >
          <div className="grid gap-2">
            <label className="text-sm font-medium">Tag name</label>
            <input
              name="name"
              placeholder="Office"
              required
              className="min-h-11 w-full rounded-lg border bg-background px-3 text-base"
            />
          </div>
          <Button type="submit" className="min-h-11" size="lg">
            Add tag
          </Button>
        </form>

        <div className="grid gap-3">
          {tags.length ? (
            tags.map((tag) => {
              const isEditing = tagEdit?.id === tag.id;
              const editState = isEditing ? tagEdit : null;

              return (
                <div key={tag.id} className="grid gap-3 rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold">{tag.name}</p>
                  </div>

                  {isEditing && editState ? (
                    <form onSubmit={handleUpdateTag} className="grid gap-3">
                      <input type="hidden" name="id" value={editState.id} />
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Name</label>
                        <input
                          name="name"
                          value={editState.name}
                          onChange={(event) =>
                            setTagEdit({
                              ...editState,
                              name: event.target.value,
                            })
                          }
                          className="min-h-11 w-full rounded-lg border bg-background px-3 text-base"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" className="min-h-11" size="lg">
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="min-h-11"
                          onClick={() => setTagEdit(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="min-h-11"
                        onClick={() =>
                          setTagEdit({ id: tag.id, name: tag.name })
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="lg"
                        className="min-h-11"
                        onClick={() => handleDeleteTag(tag)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No tags yet. Add a tag above.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Try again.";
}
