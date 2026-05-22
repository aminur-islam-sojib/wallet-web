"use client";
import { useEffect, useState } from "react";
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
import { WALLET_NAV_ITEMS } from "./wallet-nav";
import { ListTodo, Moon, Sun } from "lucide-react";
import ThemeToggleButton from "@/features/Theme/theme-toggle-button";
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

  return (
    <>
      {renderTrigger ? (
        renderTrigger(openDrawer, isOpen)
      ) : (
        <Button variant="outline" onClick={openDrawer}>
          <ListTodo />
        </Button>
      )}

      <Drawer open={isOpen} onOpenChange={setIsOpen} side="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Account</DrawerTitle>
            <DrawerDescription>Profile and quick actions.</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-6 px-6">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              {user.image ? (
                <div
                  aria-hidden="true"
                  className="size-12 rounded-full border bg-muted bg-cover bg-center"
                  style={{ backgroundImage: `url(${user.image})` }}
                />
              ) : (
                <div className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <ThemeToggleButton />

            <div className="grid gap-2 text-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Wallet navigation
              </p>
              {WALLET_NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/wallet"
                    ? pathname === "/wallet"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "pressable-soft nav-active-transition rounded-md border px-3 py-2 text-sm justify-center",
                      isActive
                        ? "border-foreground/30 bg-foreground text-background"
                        : "hover:bg-muted",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="mt-4 grid gap-2">
                <Link
                  href="/health"
                  className="pressable-soft nav-active-transition rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                  Health tracker
                </Link>
                <div className="  rounded-md border px-3 py-2 text-muted-foreground">
                  Settings (coming soon)
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter className="gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <LogoutButton />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
