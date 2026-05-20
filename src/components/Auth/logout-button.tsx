"use client";

import React, { useState } from "react";

import { Button } from "../ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/signin" });
    setIsLogoutOpen(false);
  };

  return (
    <div>
      <Button
        onClick={() => setIsLogoutOpen(true)}
        className="bg-orange-500 hover:bg-orange-600 px-3 py-5"
      >
        Logout
      </Button>

      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Logout Confirmation</DialogTitle>

            <DialogDescription>
              Are you sure you want to logout? You will need to sign in again to
              access your account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Any unsaved changes will be lost. Make sure to save your work
                before logging out.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsLogoutOpen(false)}
              >
                Stay Logged In
              </Button>

              <Button
                onClick={handleLogout}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Logout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
