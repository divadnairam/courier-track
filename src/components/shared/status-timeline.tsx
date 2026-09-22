import { PARCEL_STATUS_LABELS, type ParcelStatus } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { CheckCircle, Circle, MapPin } from "lucide-react";

interface StatusEntry {
  status: string;
  location?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  user?: { name: string } | null;
}

export function StatusTimeline({ entries }: { entries: StatusEntry[] }) {
  return (
    <div className="space-y-0">
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        return (
          <div key={index} className="flex gap-3">
            <div className="flex flex-col items-center">
              {isLast ? (
                <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 shrink-0" />
              )}
              {index < entries.length - 1 && (
                <div className="w-px h-full min-h-[24px] bg-gray-200" />
              )}
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium">
                {PARCEL_STATUS_LABELS[entry.status as ParcelStatus] || entry.status}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span>{formatDateTime(entry.createdAt)}</span>
                {entry.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {entry.location}
                  </span>
                )}
                {entry.user && <span>de {entry.user.name}</span>}
              </div>
              {entry.notes && (
                <p className="text-xs text-gray-600 mt-1">{entry.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
