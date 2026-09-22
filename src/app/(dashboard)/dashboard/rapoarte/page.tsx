import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, Users } from "lucide-react";

export default function RapoartePage() {
  const reports = [
    {
      title: "Raport Livrări",
      description: "Statistici zilnice despre colete și livrări din ultimele 30 de zile",
      href: "/dashboard/rapoarte/livrari",
      icon: <Package className="h-6 w-6 text-blue-600" />,
    },
    {
      title: "Raport Venituri",
      description: "Veniturile lunare din ultimul an",
      href: "/dashboard/rapoarte/venituri",
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
    },
    {
      title: "Performanță Curieri",
      description: "Statistici per curier: curse, livrări, performanță",
      href: "/dashboard/rapoarte/curieri",
      icon: <Users className="h-6 w-6 text-purple-600" />,
    },
  ];

  return (
    <div>
      <PageHeader title="Rapoarte" description="Analize și statistici" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-3">
                {report.icon}
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{report.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
