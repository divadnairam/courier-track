import { RecurringTripForm } from "@/components/shared/recurring-trip-form";

export default function NewRecurringTripPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Șablon Cursă Recurentă</h1>
        <p className="text-sm text-gray-500 mt-1">
          Creează un șablon pentru generare automată de curse
        </p>
      </div>
      <RecurringTripForm />
    </div>
  );
}
