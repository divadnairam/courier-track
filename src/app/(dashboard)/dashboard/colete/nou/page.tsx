import { PageHeader } from "@/components/shared/page-header";
import { ParcelForm } from "@/components/shared/parcel-form";

export default function ColetNouPage() {
  return (
    <div>
      <PageHeader title="Colet Nou" description="Înregistrează un colet nou în sistem" />
      <div className="rounded-lg border bg-white p-6">
        <ParcelForm />
      </div>
    </div>
  );
}
