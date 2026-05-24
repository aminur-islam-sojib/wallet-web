"use client";

import DrawerRight from "@/components/ui/Shared/Drawer";

type WalletHomeAccountTriggerProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  greeting: string;
};

export function WalletHomeAccountTrigger({
  user,
  greeting,
}: WalletHomeAccountTriggerProps) {
  return (
    <DrawerRight
      user={user}
      renderTrigger={(open) => (
        <button
          type="button"
          className="flex min-w-0 items-center gap-3 rounded-full pr-3 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label="Open account menu"
          onClick={open}
        >
          <WalletHomeAvatar user={user} />
          <span className="min-w-0">
            <span className="block text-sm text-white/55">{greeting},</span>
            <span className="block truncate text-base font-medium text-white">
              {user.name}
            </span>
          </span>
        </button>
      )}
    />
  );
}

function WalletHomeAvatar({
  user,
}: {
  user: WalletHomeAccountTriggerProps["user"];
}) {
  if (user.image) {
    return (
      <span
        aria-hidden="true"
        className="size-11 shrink-0 rounded-full bg-cover bg-center ring-1 ring-white/20"
        style={{ backgroundImage: `url(${user.image})` }}
      />
    );
  }

  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
      {getInitials(user.name)}
    </span>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "U";
}
