"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const getPageTitle = (pathname: string) => {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.startsWith("/dashboard/products"))
    return "Product Recommendations";
  if (pathname.startsWith("/dashboard/chat")) return "AI Chat";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  if (pathname.startsWith("/onboarding")) return "My Account";
  if (pathname.startsWith("/admin")) return "Admin Panel";
  return "InsightIQ";
};

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-10">
      <h2 className="text-lg font-semibold text-gray-800">{pageTitle}</h2>
      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-700 font-medium">
            {session?.user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}
