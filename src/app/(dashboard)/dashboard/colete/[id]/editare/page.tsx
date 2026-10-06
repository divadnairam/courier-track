import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ParcelForm } from "@/components/shared/parcel-form";

export default async function EditParcelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const parcel = await prisma.parcel.findUnique({
    where: { id },
    select: {
      id: true,
      senderId: true,
      receiverId: true,
      weight: true,
      width: true,
      height: true,
      length: true,
      declaredValue: true,
      cashOnDelivery: true,
      content: true,
      notes: true,
      pickupAddress: true,
      pickupCity: true,
      pickupCountry: true,
      deliveryAddress: true,
      deliveryCity: true,
      deliveryCountry: true,
      price: true,
      sender: { select: { userId: true } },
    },
  });

  if (!parcel) notFound();

  let clientId: string | undefined;

  // CLIENT users can only edit their own parcels
  if (session.user.role === "CLIENT") {
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    });
    if (!client || parcel.senderId !== client.id) {
      redirect("/dashboard/colete");
    }
    clientId = client.id;
  }

  return (
    <div>
      <PageHeader
        title={`Editare Colet`}
        description="Modifică detaliile coletului"
      />
      <div className="rounded-lg border bg-white p-6">
        <ParcelForm
          initialData={{
            id: parcel.id,
            senderId: parcel.senderId,
            receiverId: parcel.receiverId,
            weight: parcel.weight,
            width: parcel.width,
            height: parcel.height,
            length: parcel.length,
            declaredValue: parcel.declaredValue,
            cashOnDelivery: parcel.cashOnDelivery,
            content: parcel.content,
            notes: parcel.notes,
            pickupAddress: parcel.pickupAddress,
            pickupCity: parcel.pickupCity,
            pickupCountry: parcel.pickupCountry,
            deliveryAddress: parcel.deliveryAddress,
            deliveryCity: parcel.deliveryCity,
            deliveryCountry: parcel.deliveryCountry,
            price: parcel.price,
          }}
          userRole={session.user.role}
          userClientId={clientId}
        />
      </div>
    </div>
  );
}
