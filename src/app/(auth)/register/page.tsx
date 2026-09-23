"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/shared/footer";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Parolele nu coincid");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Eroare la crearea contului");
        setLoading(false);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Eroare la crearea contului");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la pagina principală
        </Link>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Înregistrare</CardTitle>
            <div className="mt-3 space-y-1 text-sm text-gray-500">
              <p className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Control complet asupra coletelor tale
              </p>
              <p className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Primește actualizări de transport
              </p>
              <p className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Urmărește coletul în timp real
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Nume complet</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ion Popescu"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@exemplu.ro"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Parola</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minim 6 caractere"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmă parola</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repetă parola"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Se creează contul..." : "Continuă"}
              </Button>

              <div className="text-center text-sm text-gray-500 pt-2">
                Ai deja un cont?{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Conectează-te aici
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
      <Footer />
    </div>
  );
}
