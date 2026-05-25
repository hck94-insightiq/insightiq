"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  MessageSquare,
  ShoppingBag,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/onboarding", label: "My Account", icon: User },
  { href: "/dashboard/products", label: "Products", icon: ShoppingBag },
  { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex flex-col w-64 h-screen bg-gray-900 text-white px-4 py-6 fixed left-0 top-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">InsightIQ</h1>
        <p className="text-gray-400 text-sm">TikTok Analytics</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}

        {session?.user?.role === "admin" && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mt-2 border-t border-gray-700 pt-4",
              pathname.startsWith("/admin")
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white",
            )}
          >
            <ShieldCheck size={18} />
            Admin
          </Link>
        )}
      </nav>

    </aside>
  );
}
