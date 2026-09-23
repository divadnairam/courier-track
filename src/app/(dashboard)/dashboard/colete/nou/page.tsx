import { PageHeader } from "@/components/shared/page-header";
import { ParcelForm } from "@/components/shared/parcel-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ColetNouPage() {
  const session = await getServerSession(authOptions);
  let clientId: string | undefined;

  if (session?.user.role === "CLIENT") {
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    });
    clientId = client?.id;
  }

  return (
    <div>
      <PageHeader title="Colet Nou" description="Înregistrează un colet nou în sistem" />
      <div className="rounded-lg border bg-white p-6">
        <ParcelForm
          userRole={session?.user.role}
          userClientId={clientId}
        />
      </div>
    </div>
  );
}
