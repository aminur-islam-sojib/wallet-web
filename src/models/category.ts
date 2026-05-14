import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const categorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["income", "expense"], required: true, index: true },
    color: { type: String, required: true, default: "#64748b" },
    icon: { type: String, required: true, default: "circle" },
    isDefault: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

categorySchema.index({ userId: 1, type: 1, name: 1 }, { unique: true });

export type CategoryDocument = InferSchemaType<typeof categorySchema> & { _id: string };

export const Category =
  (models.Category as Model<CategoryDocument>) ||
  model<CategoryDocument>("Category", categorySchema);
