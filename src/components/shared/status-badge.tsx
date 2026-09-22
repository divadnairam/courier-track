import { Badge } from "@/components/ui/badge";
import {
  PARCEL_STATUS_LABELS,
  PARCEL_STATUS_COLORS,
  TRIP_STATUS_LABELS,
  TRIP_STATUS_COLORS,
  type ParcelStatus,
  type TripStatus,
} from "@/lib/constants";

export function ParcelStatusBadge({ status }: { status: string }) {
  const label = PARCEL_STATUS_LABELS[status as ParcelStatus] || status;
  const color = PARCEL_STATUS_COLORS[status as ParcelStatus] || "bg-gray-100 text-gray-800";

  return (
    <Badge variant="outline" className={`${color} border-0`}>
      {label}
    </Badge>
  );
}

export function TripStatusBadge({ status }: { status: string }) {
  const label = TRIP_STATUS_LABELS[status as TripStatus] || status;
  const color = TRIP_STATUS_COLORS[status as TripStatus] || "bg-gray-100 text-gray-800";

  return (
    <Badge variant="outline" className={`${color} border-0`}>
      {label}
    </Badge>
  );
}
