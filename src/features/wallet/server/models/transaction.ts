import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
      index: true,
    },
    amountPaisa: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true, index: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    tagIds: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    note: { type: String, trim: true, maxlength: 240 },
    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "card",
        "bank_transfer",
        "bkash",
        "nagad",
        "rocket",
        "other",
      ],
    },
    place: { type: String, trim: true, maxlength: 120 },
    attachment: {
      name: { type: String, trim: true, maxlength: 180 },
      type: { type: String, trim: true, maxlength: 120 },
      size: { type: Number, min: 0 },
    },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1, categoryId: 1 });

export type TransactionDocument = InferSchemaType<typeof transactionSchema> & {
  _id: string;
};

export const Transaction =
  (models.Transaction as Model<TransactionDocument>) ||
  model<TransactionDocument>("Transaction", transactionSchema);
