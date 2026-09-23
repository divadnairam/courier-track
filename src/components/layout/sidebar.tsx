"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  BarChart3,
  Settings,
  Search,
  Archive,
  Radio,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  BarChart3,
  Settings,
  Search,
  Archive,
  Radio,
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", roles: ["ADMIN", "OPERATOR", "COURIER", "CLIENT"] },
  { href: "/dashboard/colete", label: "Colete", icon: "Package", roles: ["ADMIN", "OPERATOR", "COURIER", "CLIENT"] },
  { href: "/dashboard/arhiva", label: "Arhivă", icon: "Archive", roles: ["ADMIN", "OPERATOR", "COURIER", "CLIENT"] },
  { href: "/dashboard/curse", label: "Curse", icon: "Truck", roles: ["ADMIN", "OPERATOR", "COURIER"] },
  { href: "/dashboard/live-tracking", label: "Tracking Live", icon: "Radio", roles: ["ADMIN", "OPERATOR", "COURIER"] },
  { href: "/dashboard/clienti", label: "Clienți", icon: "Users", roles: ["ADMIN", "OPERATOR"] },
  { href: "/dashboard/rapoarte", label: "Rapoarte", icon: "BarChart3", roles: ["ADMIN", "OPERATOR"] },
  { href: "/dashboard/tracking", label: "Urmărire AWB", icon: "Search", roles: ["ADMIN", "OPERATOR", "COURIER", "CLIENT"] },
  { href: "/dashboard/setari/utilizatori", label: "Utilizatori", icon: "Settings", roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "CLIENT";

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-gradient-to-b from-blue-900 to-blue-950">
      <Link href="/" className="flex h-16 items-center gap-2 px-6 border-b border-white/10 hover:bg-white/5 transition-colors">
        <Package className="h-6 w-6 text-blue-300" />
        <span className="text-lg font-semibold text-white">CourierTrack</span>
      </Link>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
