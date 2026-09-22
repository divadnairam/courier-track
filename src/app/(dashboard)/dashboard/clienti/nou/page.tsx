import { PageHeader } from "@/components/shared/page-header";
import { ClientForm } from "@/components/shared/client-form";

export default function ClientNouPage() {
  return (
    <div>
      <PageHeader title="Client Nou" description="Adaugă un client nou în sistem" />
      <div className="rounded-lg border bg-white p-6">
        <ClientForm />
      </div>
    </div>
  );
}
