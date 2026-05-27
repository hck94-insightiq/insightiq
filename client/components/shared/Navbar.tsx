"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Moon, Sun, Settings, LogOut, ShieldCheck } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

const PAGE_TITLES: Record<string, { label: string; sublabel: string }> = {
  "/dashboard": { label: "Overview", sublabel: "DASHBOARD" },
  "/analysis": {
    label: "Analysis reports and insights",
    sublabel: "AI ANALYSIS",
  },
  "/recommendations": {
    label: "Top products based on your niche",
    sublabel: "RECOMMENDATIONS",
  },
  "/chat": {
    label: "Chat with your AI consultant",
    sublabel: "AI CONSULTANT",
  },
  "/settings": { label: "Settings & Account", sublabel: "SETTINGS" },
  "/admin": { label: "Admin Panel", sublabel: "ADMIN" },
  "/admin/users": { label: "Admin Panel", sublabel: "ADMIN" },
  "/wishlist": { label: "Saved products", sublabel: "WISHLIST" },
};

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/analysis")) return PAGE_TITLES["/analysis"];
  if (pathname.startsWith("/recommendations"))
    return PAGE_TITLES["/recommendations"];
  if (pathname.startsWith("/chat")) return PAGE_TITLES["/chat"];
  if (pathname.startsWith("/settings")) return PAGE_TITLES["/settings"];
  if (pathname.startsWith("/admin")) return PAGE_TITLES["/admin"];
  if (pathname.startsWith("/wishlist")) return PAGE_TITLES["/wishlist"];
  if (pathname === "/dashboard") return PAGE_TITLES["/dashboard"];
  return { label: "InsightIQ", sublabel: "" };
}

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { label, sublabel } = getPageTitle(pathname);
  const [mounted, setMounted] = useState(false);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  useEffect(() => setMounted(true), []);

  return (
    <header className="fixed left-0 right-0 top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 md:left-56 md:px-8 backdrop-blur">
      {/* Page title */}
      <div className="flex flex-col gap-0.5">
        {sublabel && (
          <span className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground">
            // {sublabel}
          </span>
        )}
        <h2 className="text-[15px] font-semibold leading-tight tracking-tight">
          {label}
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun size={17} />
            ) : (
              <Moon size={17} />
            )
          ) : (
            <Moon size={17} />
          )}
        </button>

        {/* Avatar dropdown */}
        {session && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 inline-flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-muted transition-colors">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-700 text-xs font-semibold text-white">
                  {initials}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold leading-tight">
                  {session.user?.name}
                </p>
                <p className="truncate font-mono text-[11px] leading-tight text-muted-foreground">
                  {session.user?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Settings size={15} />
                  Settings
                </Link>
              </DropdownMenuItem>
              {/* Admin link — only visible to admin role */}
              {(session.user as any)?.role === "admin" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <ShieldCheck size={15} />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
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
