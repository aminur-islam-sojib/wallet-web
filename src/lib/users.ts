import { Types } from "mongoose";

import { DEFAULT_CATEGORIES } from "@/lib/defaults";
import { connectToDatabase } from "@/lib/db";
import { hashPassword } from "@/lib/passwords";
import { Category } from "@/features/wallet/server/models/category";
import { User } from "@/models/user";

type GoogleUserInput = {
  googleId?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type CredentialsUserInput = {
  name: string;
  email: string;
  password: string;
};

export async function seedDefaultCategories(userId: string) {
  const userObjectId = new Types.ObjectId(userId);

  await Category.bulkWrite(
    DEFAULT_CATEGORIES.map((category) => ({
      updateOne: {
        filter: {
          userId: userObjectId,
          type: category.type,
          name: category.name,
        },
        update: {
          $setOnInsert: {
            ...category,
            userId: userObjectId,
            isDefault: true,
          },
        },
        upsert: true,
      },
    }))
  );
}

export async function upsertGoogleUser(input: GoogleUserInput) {
  if (!input.email) {
    return null;
  }

  await connectToDatabase();

  const user = await User.findOneAndUpdate(
    { email: input.email.toLowerCase() },
    {
      $set: {
        googleId: input.googleId ?? undefined,
        name: input.name || input.email,
        image: input.image ?? undefined,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await seedDefaultCategories(user._id.toString());

  return user;
}

export async function createCredentialsUser(input: CredentialsUserInput) {
  await connectToDatabase();

  const normalizedEmail = input.email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail }).select("_id passwordHash");

  if (existing?.passwordHash) {
    throw new Error("Email is already registered.");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        name: input.name,
        passwordHash,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await seedDefaultCategories(user._id.toString());

  return user;
}
