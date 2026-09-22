"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Search,
  Truck,
  MapPin,
  Shield,
  Clock,
  Globe,
  Users,
  ChevronRight,
  Phone,
  Mail,
  Menu,
  X,
} from "lucide-react";

export function LandingPage() {
  const [awb, setAwb] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (awb.trim()) {
      router.push(`/tracking?awb=${encodeURIComponent(awb.trim())}`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 rounded-lg p-1.5">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Courier<span className="text-blue-600">Track</span>
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#servicii" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Servicii
              </a>
              <a href="#transport" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Transport Persoane
              </a>
              <a href="#despre" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Despre Noi
              </a>
              <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </a>
            </nav>

            {/* Desktop buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/tracking"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Urmărire AWB
              </Link>
              <Link
                href="/scan"
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                Scanare QR
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                Înregistrare
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Autentificare
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-3 -mr-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Meniu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-black/30" onClick={() => setMenuOpen(false)}>
          <div className="bg-white border-b shadow-lg px-4 py-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <a href="#servicii" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-blue-600 py-2">
              Servicii
            </a>
            <a href="#transport" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-blue-600 py-2">
              Transport Persoane
            </a>
            <a href="#despre" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-blue-600 py-2">
              Despre Noi
            </a>
            <a href="#contact" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-blue-600 py-2">
              Contact
            </a>
            <hr className="my-2" />
            <Link href="/tracking" className="block text-sm font-medium text-blue-600 py-2">
              Urmărire AWB
            </Link>
            <Link href="/scan" className="block text-sm font-medium text-gray-600 hover:text-blue-600 py-2">
              Scanare QR
            </Link>
            <Link href="/register" className="block text-sm font-medium text-gray-600 hover:text-blue-600 py-2">
              Înregistrare
            </Link>
            <Link
              href="/login"
              className="block text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Autentificare
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>

        {/* City skyline silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-24 opacity-5">
          <svg viewBox="0 0 1440 120" fill="currentColor" className="w-full h-full">
            <path d="M0,120 L0,80 L40,80 L40,60 L60,60 L60,40 L80,40 L80,60 L100,60 L100,20 L120,20 L120,60 L140,60 L140,70 L180,70 L180,50 L200,50 L200,30 L220,30 L220,50 L260,50 L260,60 L280,60 L280,40 L300,40 L300,60 L340,60 L340,80 L380,80 L380,50 L400,50 L400,20 L420,20 L420,50 L440,50 L440,70 L480,70 L480,40 L500,40 L500,10 L520,10 L520,40 L540,40 L540,60 L580,60 L580,80 L620,80 L620,50 L660,50 L660,30 L680,30 L680,60 L720,60 L720,80 L760,80 L760,60 L780,60 L780,20 L800,20 L800,60 L840,60 L840,40 L880,40 L880,70 L920,70 L920,50 L940,50 L940,30 L960,30 L960,50 L1000,50 L1000,80 L1040,80 L1040,60 L1080,60 L1080,40 L1100,40 L1100,20 L1120,20 L1120,50 L1160,50 L1160,70 L1200,70 L1200,80 L1240,80 L1240,50 L1280,50 L1280,30 L1300,30 L1300,60 L1340,60 L1340,80 L1380,80 L1380,60 L1440,60 L1440,120 Z" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Urmărește-ți coletul
              <span className="block text-blue-300">în timp real</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
              Conectăm România cu Europa. Transport colete și persoane rapid, sigur și la prețuri accesibile.
            </p>

            {/* AWB Search Box */}
            <form
              onSubmit={handleTrack}
              className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto shadow-2xl shadow-blue-900/30"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={awb}
                  onChange={(e) => setAwb(e.target.value)}
                  placeholder="Introdu numărul AWB..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
              <button
                type="submit"
                className="h-12 px-8 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Search className="h-4 w-4" />
                Caută
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-16">
        <div className="grid sm:grid-cols-3 gap-6">
          <Link
            href="/tracking"
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group border"
          >
            <div className="bg-blue-100 rounded-xl w-14 h-14 flex items-center justify-center mb-4">
              <Search className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Urmărire Colet</h3>
            <p className="text-sm text-gray-500 mb-3">
              Verifică în orice moment statusul coletului tău cu numărul AWB.
            </p>
            <span className="text-sm font-medium text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Urmărește acum <ChevronRight className="h-4 w-4" />
            </span>
          </Link>

          <div className="bg-white rounded-2xl p-6 shadow-lg border">
            <div className="bg-orange-100 rounded-xl w-14 h-14 flex items-center justify-center mb-4">
              <Package className="h-7 w-7 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Expediază un Colet</h3>
            <p className="text-sm text-gray-500 mb-3">
              Trimite colete în toată Europa. Prețuri de la 40€ pentru până la 25 kg.
            </p>
            <Link
              href="/login"
              className="text-sm font-medium text-orange-600 flex items-center gap-1 hover:gap-2 transition-all"
            >
              Conectează-te <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border">
            <div className="bg-green-100 rounded-xl w-14 h-14 flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Transport Persoane</h3>
            <p className="text-sm text-gray-500 mb-3">
              Curse regulate România — Europa. Călătorește confortabil și sigur.
            </p>
            <a
              href="#transport"
              className="text-sm font-medium text-green-600 flex items-center gap-1 hover:gap-2 transition-all"
            >
              Vezi cursele <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Servicii Section */}
      <section id="servicii" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              De ce să alegi CourierTrack?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Oferim servicii complete de curierat și transport persoane cu acoperire în 14 țări europene.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">14 Țări</h3>
              <p className="text-sm text-gray-500">
                Acoperire în România, Olanda, Irlanda, Anglia, Italia, Spania și multe altele.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Siguranță</h3>
              <p className="text-sm text-gray-500">
                Coletele tale sunt asigurate și monitorizate pe tot parcursul transportului.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Rapiditate</h3>
              <p className="text-sm text-gray-500">
                Livrare rapidă cu notificări în timp real la fiecare schimbare de status.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Tracking Live</h3>
              <p className="text-sm text-gray-500">
                Urmărește coletul cu AWB și primești notificări pe email la fiecare etapă.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transport Persoane Section */}
      <section id="transport" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Transport Persoane
                <span className="block text-blue-600">România — Europa</span>
              </h2>
              <p className="text-gray-500 mb-8 text-lg">
                Curse regulate cu vehicule confortabile și șoferi experimentați. Rezervă-ți locul simplu și rapid.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-lg p-2 mt-1">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Curse regulate</h4>
                    <p className="text-sm text-gray-500">Plecări săptămânale către principalele destinații europene.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-lg p-2 mt-1">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Siguranță maximă</h4>
                    <p className="text-sm text-gray-500">Vehicule verificate tehnic, asigurare completă pentru pasageri.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 rounded-lg p-2 mt-1">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Destinații multiple</h4>
                    <p className="text-sm text-gray-500">Olanda, Germania, Belgia, Franța, Italia, Spania și multe altele.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Solicită o ofertă</h3>
              <p className="text-blue-200 mb-6">
                Contactează-ne pentru o ofertă personalizată în funcție de greutate, destinație și frecvența transporturilor.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-5 py-3">
                  <Package className="h-5 w-5 text-blue-300" />
                  <span className="text-blue-100">Transport colete până la 120 kg</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-5 py-3">
                  <Globe className="h-5 w-5 text-blue-300" />
                  <span className="text-blue-100">14 țări europene deservite</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-5 py-3">
                  <Shield className="h-5 w-5 text-blue-300" />
                  <span className="text-blue-100">Colete asigurate pe tot parcursul</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Despre Noi */}
      <section id="despre" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Despre Noi</h2>
            <p className="text-gray-500 text-lg mb-8">
              CourierTrack este o companie de curierat și transport persoane care conectează România cu cele mai importante destinații din Europa. Cu experiență în domeniu și o echipă dedicată, ne asigurăm că fiecare colet ajunge la destinație în siguranță și la timp.
            </p>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-4xl font-bold text-blue-600">14</p>
                <p className="text-sm text-gray-500 mt-1">Țări deservite</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-600">24/7</p>
                <p className="text-sm text-gray-500 mt-1">Tracking online</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-600">100%</p>
                <p className="text-sm text-gray-500 mt-1">Colete asigurate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Contact</h2>
            <p className="text-gray-500">Suntem aici pentru tine. Contactează-ne oricând.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-3">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Telefon</h4>
              <p className="text-sm text-gray-500">—</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
              <p className="text-sm text-gray-500">—</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Sediu</h4>
              <p className="text-sm text-gray-500">Galați, România</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 rounded-lg p-1.5">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">
                  Courier<span className="text-blue-400">Track</span>
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Transport colete și persoane România — Europa. Rapid, sigur, accesibil.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Linkuri Utile</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/tracking" className="hover:text-white transition-colors">Urmărire Colet</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Autentificare</Link></li>
                <li><a href="#servicii" className="hover:text-white transition-colors">Servicii</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Destinații Populare</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>România — Olanda</li>
                <li>România — Germania</li>
                <li>România — Anglia</li>
                <li>România — Italia</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} CourierTrack. Toate drepturile rezervate.
          </div>
        </div>
      </footer>
    </div>
  );
}
