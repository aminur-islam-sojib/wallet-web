import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const monthlyLimitSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
      index: true,
    },
    amountPaisa: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

monthlyLimitSchema.index({ userId: 1, month: 1 }, { unique: true });

export type MonthlyLimitDocument = InferSchemaType<
  typeof monthlyLimitSchema
> & { _id: string };

export const MonthlyLimit =
  (models.MonthlyLimit as Model<MonthlyLimitDocument>) ||
  model<MonthlyLimitDocument>("MonthlyLimit", monthlyLimitSchema);
