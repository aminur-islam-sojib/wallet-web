import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const tagSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

tagSchema.index({ userId: 1, name: 1 }, { unique: true });

export type TagDocument = InferSchemaType<typeof tagSchema> & { _id: string };

export const Tag = (models.Tag as Model<TagDocument>) || model<TagDocument>("Tag", tagSchema);
