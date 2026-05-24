export const categoryIconOptions = [
  { id: "circle", label: "Basic" },
  { id: "shopping-bag", label: "Shopping" },
  { id: "shopping-cart", label: "Groceries" },
  { id: "utensils", label: "Food" },
  { id: "coffee", label: "Coffee" },
  { id: "home", label: "Home" },
  { id: "car", label: "Car" },
  { id: "bus", label: "Transit" },
  { id: "plane", label: "Travel" },
  { id: "fuel", label: "Fuel" },
  { id: "receipt", label: "Bills" },
  { id: "briefcase", label: "Work" },
  { id: "laptop", label: "Freelance" },
  { id: "wallet", label: "Wallet" },
  { id: "piggy-bank", label: "Savings" },
  { id: "gift", label: "Gifts" },
  { id: "heart", label: "Health" },
  { id: "heart-pulse", label: "Wellness" },
  { id: "stethoscope", label: "Medical" },
  { id: "graduation-cap", label: "Education" },
  { id: "book", label: "Books" },
  { id: "music", label: "Music" },
  { id: "smartphone", label: "Phone" },
  { id: "shield", label: "Insurance" },
  { id: "ticket", label: "Entertainment" },
] as const;

export type CategoryIconId = (typeof categoryIconOptions)[number]["id"];

export const categoryIconIds = categoryIconOptions.map(
  (option) => option.id,
) as [CategoryIconId, ...CategoryIconId[]];
