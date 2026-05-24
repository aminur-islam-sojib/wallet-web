"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  Button,
} from "./Drawe";
import Link from "next/link";
import LogoutButton from "@/components/Auth/logout-button";
import { cn } from "@/lib/utils";
import { WALLET_NAV_ITEMS } from "@/features/wallet/navigation/lib/wallet-nav";
import { ListTodo } from "lucide-react";
import ThemeToggleButton from "@/features/Theme/theme-toggle-button";
import { APP_INFO } from "@/config/app";

type AccountDrawerProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  renderTrigger?: (open: () => void, isOpen: boolean) => ReactNode;
};

export default function DrawerRight({
  user,
  renderTrigger,
}: AccountDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {renderTrigger ? (
        renderTrigger(openDrawer, isOpen)
      ) : (
        <Button
          variant="outline"
          onClick={openDrawer}
          aria-label="Open account menu"
        >
          <ListTodo className="size-4" />
        </Button>
      )}

      <Drawer open={isOpen} onOpenChange={setIsOpen} side="right">
        <DrawerOverlay />
        <DrawerContent className="flex flex-col">
          {/* ── Header ── */}
          <DrawerHeader className="border-b pb-4">
            <DrawerTitle className="text-base">Account</DrawerTitle>
            <DrawerDescription className="sr-only">
              Profile and quick actions
            </DrawerDescription>
          </DrawerHeader>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-5 px-5 py-5">
              {/* Profile card */}
              <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
                {user.image ? (
                  <div
                    aria-hidden="true"
                    className="size-11 shrink-0 rounded-full border bg-muted bg-cover bg-center"
                    style={{ backgroundImage: `url(${user.image})` }}
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-foreground text-sm font-semibold text-background"
                  >
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Theme toggle */}
              <ThemeToggleButton />

              {/* Wallet nav */}
              <div className="space-y-2">
                <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Wallet
                </p>
                <nav className="grid gap-1">
                  {WALLET_NAV_ITEMS.map((item) => {
                    const isActive =
                      item.href === "/wallet"
                        ? pathname === "/wallet"
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={closeDrawer}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex h-10 items-center rounded-lg   px-3 border-border border text-foreground text-sm transition-colors",
                          isActive
                            ? "border-foreground/20 bg-foreground font-medium text-background"
                            : " hover:border-border hover:bg-muted",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Other nav */}
              <div className="space-y-2">
                <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Other
                </p>
                <nav className="grid gap-1">
                  <Link
                    href="/health"
                    onClick={closeDrawer}
                    className="flex h-10 items-center text-foreground border-border rounded-lg border px-3 text-sm transition-colors hover:border-border hover:bg-muted"
                  >
                    Health tracker
                    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                      soon
                    </span>
                  </Link>
                  <div className="flex h-10 cursor-not-allowed items-center rounded-lg px-3 text-sm text-muted-foreground">
                    Settings
                    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                      soon
                    </span>
                  </div>
                </nav>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <DrawerFooter className="border-t pt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closeDrawer}
              >
                Close
              </Button>
              <LogoutButton />
            </div>
            <p className="text-center text-[11px] text-muted-foreground">
              {APP_INFO.name} · {APP_INFO.version}
            </p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
