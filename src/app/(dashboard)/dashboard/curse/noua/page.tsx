import { PageHeader } from "@/components/shared/page-header";
import { TripForm } from "@/components/shared/trip-form";

export default function CursaNouaPage() {
  return (
    <div>
      <PageHeader title="Cursă Nouă" description="Creează o cursă nouă" />
      <div className="rounded-lg border bg-white p-6">
        <TripForm />
      </div>
    </div>
  );
}
