import type { ReactNode } from "react";
import { CategoryOption, TagOption } from "@/types";
import { Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCategory, createTag } from "../../server/actions";

export default function ManageLists({
  categories,
  tags,
}: {
  categories: CategoryOption[];
  tags: TagOption[];
}) {
  return (
    <section className="rounded-lg border bg-background p-4">
      <div className="mb-4 flex items-center gap-2">
        <Tags className="size-4" />
        <h2 className="font-semibold">Categories and tags</h2>
      </div>
      <form action={createCategory} className="grid gap-3">
        <Field label="New category">
          <input
            name="name"
            placeholder="Books"
            required
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </Field>
        <div className="grid grid-cols-[1fr_88px] gap-2">
          <select
            name="type"
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input
            type="color"
            name="color"
            defaultValue="#64748b"
            aria-label="Category color"
            className="h-9 w-full rounded-md border bg-background p-1"
          />
        </div>
        <Button type="submit" variant="secondary">
          Add category
        </Button>
      </form>
      <form action={createTag} className="mt-5 grid gap-3 border-t pt-5">
        <Field label="New tag">
          <input
            name="name"
            placeholder="Office"
            required
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </Field>
        <Button type="submit" variant="secondary">
          Add tag
        </Button>
      </form>
      <div className="mt-5 grid gap-3 border-t pt-5 text-sm">
        <div>
          <p className="mb-2 font-medium">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category.id}
                className="rounded-md border px-2 py-1"
                style={{ borderColor: category.color }}
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-medium">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.length ? (
              tags.map((tag) => (
                <span key={tag.id} className="rounded-md border px-2 py-1">
                  {tag.name}
                </span>
              ))
            ) : (
              <p className="text-muted-foreground">No tags yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
