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
    <aside className="flex flex-col w-56 h-screen bg-gray-950 text-white px-3 py-5 fixed left-0 top-0 border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">IQ</span>
        </div>
        <span className="text-white font-semibold tracking-tight">
          InsightIQ
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        <p className="text-white/30 text-[10px] font-semibold tracking-widest px-2 mb-1">
          MAIN
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-teal-500/15 text-teal-400 font-medium"
                  : "text-white/50 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}

        {/* Admin — only visible to admin role */}
        {session?.user?.role === "admin" && (
          <>
            <p className="text-white/30 text-[10px] font-semibold tracking-widest px-2 mt-4 mb-1">
              ADMIN
            </p>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-teal-500/15 text-teal-400 font-medium"
                  : "text-white/50 hover:bg-white/5 hover:text-white",
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
