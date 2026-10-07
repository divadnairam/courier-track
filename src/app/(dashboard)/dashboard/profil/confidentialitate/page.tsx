"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Trash2, Shield, AlertTriangle } from "lucide-react";

export default function ConfidentialitatePage() {
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleExport() {
    window.location.href = "/api/gdpr/export";
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/gdpr/stergere", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Eroare la ștergere");
      }
      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Eroare");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Confidențialitate și Date Personale"
        description="Gestionează datele tale personale conform GDPR"
      />

      <div className="space-y-6 max-w-2xl">
        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-blue-600" />
              Exportă datele personale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Descarcă o copie a tuturor datelor personale pe care le deținem despre tine,
              în format JSON. Aceasta include: datele contului, profilul de client,
              coletele și rezervările asociate.
            </p>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Descarcă datele mele
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-green-600" />
              Drepturile tale
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>Conform Regulamentului General privind Protecția Datelor (GDPR), ai următoarele drepturi:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Dreptul de acces</strong> — poți descărca datele tale folosind butonul de mai sus</li>
              <li><strong>Dreptul la rectificare</strong> — poți edita datele din secțiunea Profil</li>
              <li><strong>Dreptul la ștergere</strong> — poți solicita ștergerea contului mai jos</li>
              <li><strong>Dreptul la portabilitate</strong> — datele exportate sunt în format standard JSON</li>
            </ul>
            <p className="mt-3">
              Pentru alte solicitări sau întrebări, contactează-ne la{" "}
              <strong>contact@couriertrack.ro</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-600">
              <Trash2 className="h-5 w-5" />
              Ștergere cont
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Ștergerea contului este permanentă și ireversibilă. Datele personale vor fi
              anonimizate conform GDPR, iar contul va fi dezactivat imediat.
              Istoricul coletelor va fi păstrat în formă anonimizată pentru evidențe legale.
            </p>

            {deleteError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 mb-4">{deleteError}</div>
            )}

            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vreau să-mi șterg contul
              </Button>
            ) : (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800">Ești sigur că vrei să-ți ștergi contul?</p>
                    <p className="text-red-600 mt-1">
                      Această acțiune nu poate fi anulată. Toate datele personale vor fi șterse
                      sau anonimizate permanent.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    disabled={deleting}
                    onClick={handleDelete}
                  >
                    {deleting ? "Se șterge..." : "Da, șterge contul meu"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    Anulează
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
