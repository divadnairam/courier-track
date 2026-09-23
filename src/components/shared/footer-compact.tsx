import Link from "next/link";
import { Package } from "lucide-react";

export function FooterCompact() {
  return (
    <footer className="bg-blue-950 text-blue-200 py-6 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <Link href="/" className="flex items-center gap-2 hover:text-white transition-colors">
          <Package className="h-4 w-4" />
          <span className="font-semibold">CourierTrack</span>
        </Link>
        <div className="flex gap-6">
          <Link href="/tracking" className="hover:text-white transition-colors">Urmărire Colet</Link>
          <Link href="/#servicii" className="hover:text-white transition-colors">Servicii</Link>
          <Link href="/#contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <span className="text-blue-300 text-xs">
          © {new Date().getFullYear()} Realizat de LunamerMMG
        </span>
      </div>
    </footer>
  );
}
