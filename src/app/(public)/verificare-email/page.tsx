import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function VerificareEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const config: Record<string, { icon: React.ReactNode; title: string; message: string; color: string }> = {
    success: {
      icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
      title: "Email confirmat!",
      message: "Adresa dumneavoastră de email a fost verificată cu succes. Puteți închide această pagină.",
      color: "green",
    },
    already: {
      icon: <AlertCircle className="h-16 w-16 text-blue-500" />,
      title: "Email deja confirmat",
      message: "Această adresă de email a fost deja verificată anterior.",
      color: "blue",
    },
    invalid: {
      icon: <XCircle className="h-16 w-16 text-red-500" />,
      title: "Link invalid",
      message: "Linkul de verificare este invalid sau a expirat. Vă rugăm să solicitați un nou email de verificare.",
      color: "red",
    },
  };

  const current = config[status || "invalid"] || config.invalid;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            {current.icon}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {current.title}
          </h1>
          <p className="text-gray-600 mb-6">
            {current.message}
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Pagina principală
          </Link>
        </div>
      </div>
    </div>
  );
}
