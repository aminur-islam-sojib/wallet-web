"use client";
import { useState } from "react";
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
type AccountDrawerProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
};

export default function DrawerRight({ user }: AccountDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Account
      </Button>

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

            <div className="grid gap-2 text-sm">
              <Link
                href="/wallet"
                className="rounded-md border px-3 py-2 hover:bg-muted"
              >
                Wallet dashboard
              </Link>
              <Link
                href="/health"
                className="rounded-md border px-3 py-2 hover:bg-muted"
              >
                Health tracker
              </Link>
              <div className="rounded-md border px-3 py-2 text-muted-foreground">
                Settings (coming soon)
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
