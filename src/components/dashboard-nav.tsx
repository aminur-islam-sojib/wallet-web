"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { label: "Wallet", href: "/dashboard" },
  { label: "Health", href: "/health" },
];

const isActiveTab = (pathname: string, href: string) => {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }

  return pathname.startsWith(href);
};

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-full flex-wrap gap-2 sm:w-auto">
      {tabs.map((tab) => {
        const isActive = isActiveTab(pathname, tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              isActive
                ? "border-foreground/20 bg-foreground text-background"
                : "border-foreground/10 bg-background text-foreground hover:bg-muted",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
