"use client";

import { signOut, useSession } from "next-auth/react";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { LogOut, Menu, Package } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileNav } from "./mobile-nav";
import Link from "next/link";

export function Topbar() {
  const { data: session } = useSession();

  async function handleLogout() {
    await signOut({ redirect: false });
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-white/10 bg-blue-900 px-4 md:px-6">
      <Sheet>
        <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-lg h-8 w-8 text-blue-100 hover:bg-white/10">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <MobileNav />
        </SheetContent>
      </Sheet>

      <Link href="/" className="md:hidden flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Package className="h-5 w-5 text-blue-300" />
        <span className="text-sm font-semibold text-white">CourierTrack</span>
      </Link>

      <div className="flex-1" />

      {session?.user && (
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">{session.user.name}</p>
            <p className="text-xs text-blue-200">
              {ROLE_LABELS[session.user.role as Role] || session.user.role}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="relative z-50 inline-flex items-center justify-center rounded-lg p-2 text-blue-100 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      )}
    </header>
  );
}
