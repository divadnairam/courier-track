import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { FooterCompact } from "@/components/shared/footer-compact";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Sidebar />
      <div className="md:pl-64 flex flex-col flex-1">
        <Topbar />
        <main className="p-4 md:p-6 flex-1">{children}</main>
        <FooterCompact />
      </div>
    </div>
  );
}
