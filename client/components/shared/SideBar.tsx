"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  ShoppingBag,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/analysis", label: "AI Analysis", icon: Sparkles },
  { href: "/recommendations", label: "Recommendations", icon: ShoppingBag },
  { href: "/dashboard/chat", label: "AI Consultant", icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-56 flex-col border-r border-border bg-muted/40 px-3 py-5">
      {/* Logo */}
      <Link href="/dashboard" className="mb-6 flex items-center gap-2.5 px-2">
        <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-foreground font-mono text-sm font-semibold text-background">
          IQ
          <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-teal-500" />
        </span>
        <span className="text-base font-bold tracking-tight">InsightIQ</span>
      </Link>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-teal-500/10 text-teal-700 dark:text-teal-400"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}

        {/* Admin */}
        {session?.user?.role === "admin" && (
          <>
            <p className="mt-4 mb-1 px-2 text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase">
              Admin
            </p>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-teal-500/10 text-teal-700 dark:text-teal-400"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
              )}
            >
              <ShieldCheck size={16} />
              Admin Panel
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
