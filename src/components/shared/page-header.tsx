import Link from "next/link";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
}

export function PageHeader({
  title,
  description,
  createHref,
  createLabel,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      {createHref && createLabel && (
        <Link
          href={createHref}
          className="inline-flex items-center justify-center rounded-lg h-8 gap-1.5 px-2.5 bg-primary text-primary-foreground hover:bg-primary/80 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          {createLabel}
        </Link>
      )}
    </div>
  );
}
