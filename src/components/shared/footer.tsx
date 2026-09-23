import Link from "next/link";
import { Package, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 rounded-lg p-1.5">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Courier<span className="text-blue-400">Track</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              Transport colete și persoane România — Europa. Rapid, sigur, accesibil.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-white">Linkuri Utile</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/tracking" className="hover:text-white transition-colors">Urmărire Colet</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Autentificare</Link></li>
              <li><Link href="/#servicii" className="hover:text-white transition-colors">Servicii</Link></li>
              <li><Link href="/#contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-white">Destinații Populare</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>România — Olanda</li>
              <li>România — Germania</li>
              <li>România — Anglia</li>
              <li>România — Italia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} CourierTrack. Realizat de LunamerMMG. Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
}
