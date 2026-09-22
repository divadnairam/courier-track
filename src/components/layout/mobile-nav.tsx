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
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", roles: ["ADMIN", "OPERATOR", "COURIER", "CLIENT"] },
  { href: "/dashboard/colete", label: "Colete", icon: "Package", roles: ["ADMIN", "OPERATOR", "COURIER", "CLIENT"] },
  { href: "/dashboard/arhiva", label: "Arhivă", icon: "Archive", roles: ["ADMIN", "OPERATOR", "COURIER", "CLIENT"] },
  { href: "/dashboard/curse", label: "Curse", icon: "Truck", roles: ["ADMIN", "OPERATOR", "COURIER"] },
  { href: "/dashboard/clienti", label: "Clienți", icon: "Users", roles: ["ADMIN", "OPERATOR"] },
  { href: "/dashboard/rapoarte", label: "Rapoarte", icon: "BarChart3", roles: ["ADMIN", "OPERATOR"] },
  { href: "/tracking", label: "Urmărire AWB", icon: "Search", roles: ["ADMIN", "OPERATOR", "COURIER", "CLIENT"] },
  { href: "/dashboard/setari/utilizatori", label: "Utilizatori", icon: "Settings", roles: ["ADMIN"] },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "CLIENT";

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center gap-2 px-6 border-b">
        <Package className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-semibold">CourierTrack</span>
      </div>
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
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
