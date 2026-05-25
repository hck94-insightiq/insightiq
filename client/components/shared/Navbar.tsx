"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Moon, Sun, Settings, LogOut, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/analysis": "AI Analysis",
  "/recommendations": "Recommendations",
  "/dashboard/chat": "AI Consultant",
  "/settings": "Settings & Account",
  "/admin": "Admin Panel",
  "/admin/users": "Admin Panel",
};

function getPageTitle(pathname: string): { label: string; sublabel?: string } {
  if (pathname.startsWith("/dashboard/analysis"))
    return { label: "Niche & Audience Detection", sublabel: "AI ANALYSIS" };
  if (pathname.startsWith("/recommendations"))
    return {
      label: "Top kategori produk untuk akun kamu",
      sublabel: "PRODUCT RECOMMENDATIONS",
    };
  if (pathname.startsWith("/dashboard/chat"))
    return { label: "Chat with your AI consultant", sublabel: "AI CONSULTANT" };
  if (pathname.startsWith("/settings"))
    return { label: "Settings & Account", sublabel: "SETTINGS" };
  if (pathname.startsWith("/admin"))
    return { label: "Admin Panel", sublabel: "ADMIN" };
  if (pathname === "/dashboard")
    return { label: "Dashboard", sublabel: "OVERVIEW" };
  return { label: "InsightIQ" };
}

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { label, sublabel } = getPageTitle(pathname);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="h-14 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-6 fixed top-0 left-56 right-0 z-10">
      {/* Page title */}
      <div>
        {sublabel && (
          <p className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-white/30 uppercase">
            // {sublabel}
          </p>
        )}
        <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
          {label}
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Avatar dropdown */}
        {session && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-teal-500 text-white text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm text-gray-700 dark:text-white/80 font-medium leading-tight">
                    {session.user?.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-white/30 leading-tight">
                    {session.user?.email}
                  </span>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Settings size={15} />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut size={15} className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
