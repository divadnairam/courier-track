import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  // Create admin user
  await prisma.user.upsert({
    where: { email: "admin@couriertrack.ro" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@couriertrack.ro",
      passwordHash,
      role: "ADMIN",
      phone: "0700000000",
    },
  });

  // Create operator user
  await prisma.user.upsert({
    where: { email: "operator@couriertrack.ro" },
    update: {},
    create: {
      name: "Maria Popescu",
      email: "operator@couriertrack.ro",
      passwordHash: await bcrypt.hash("operator123", 10),
      role: "OPERATOR",
      phone: "0711111111",
    },
  });

  // Create courier user
  await prisma.user.upsert({
    where: { email: "curier@couriertrack.ro" },
    update: {},
    create: {
      name: "Ion Ionescu",
      email: "curier@couriertrack.ro",
      passwordHash: await bcrypt.hash("curier123", 10),
      role: "COURIER",
      phone: "0722222222",
    },
  });

  // Create client user
  const clientUser = await prisma.user.upsert({
    where: { email: "client@couriertrack.ro" },
    update: {},
    create: {
      name: "Andrei Gheorghe",
      email: "client@couriertrack.ro",
      passwordHash: await bcrypt.hash("client123", 10),
      role: "CLIENT",
      phone: "0733333333",
    },
  });

  // Create demo clients
  const client1 = await prisma.client.upsert({
    where: { id: "demo-client-1" },
    update: {},
    create: {
      id: "demo-client-1",
      type: "INDIVIDUAL",
      name: "Andrei Gheorghe",
      phone: "0733333333",
      email: "andrei@example.com",
      address: "Str. Victoriei nr. 10",
      city: "București",
      county: "București",
      userId: clientUser.id,
    },
  });

  const client2 = await prisma.client.upsert({
    where: { id: "demo-client-2" },
    update: {},
    create: {
      id: "demo-client-2",
      type: "COMPANY",
      name: "SC TechSoft SRL",
      companyName: "SC TechSoft SRL",
      cui: "RO12345678",
      phone: "0744444444",
      email: "office@techsoft.ro",
      address: "Bd. Unirii nr. 25",
      city: "Cluj-Napoca",
      county: "Cluj",
    },
  });

  const client3 = await prisma.client.upsert({
    where: { id: "demo-client-3" },
    update: {},
    create: {
      id: "demo-client-3",
      type: "INDIVIDUAL",
      name: "Elena Dumitrescu",
      phone: "0755555555",
      email: "elena@example.com",
      address: "Str. Libertății nr. 5",
      city: "Timișoara",
      county: "Timiș",
    },
  });

  // Create demo parcels
  const now = new Date();
  const parcel1 = await prisma.parcel.upsert({
    where: { awb: "RO-20260919-00001" },
    update: {},
    create: {
      awb: "RO-20260919-00001",
      status: "IN_TRANZIT",
      senderId: client1.id,
      receiverId: client2.id,
      weight: 2.5,
      content: "Documente",
      pickupAddress: "Str. Victoriei nr. 10",
      pickupCity: "București",
      deliveryAddress: "Bd. Unirii nr. 25",
      deliveryCity: "Cluj-Napoca",
      price: 25.0,
      statusHistory: {
        create: [
          { status: "PRELUAT", location: "București", createdAt: new Date(now.getTime() - 86400000) },
          { status: "IN_TRANZIT", location: "Depozit Central", createdAt: new Date(now.getTime() - 43200000) },
        ],
      },
    },
  });

  await prisma.parcel.upsert({
    where: { awb: "RO-20260919-00002" },
    update: {},
    create: {
      awb: "RO-20260919-00002",
      status: "LIVRAT",
      senderId: client2.id,
      receiverId: client3.id,
      weight: 5.0,
      content: "Echipament IT",
      declaredValue: 1500,
      pickupAddress: "Bd. Unirii nr. 25",
      pickupCity: "Cluj-Napoca",
      deliveryAddress: "Str. Libertății nr. 5",
      deliveryCity: "Timișoara",
      price: 35.0,
      statusHistory: {
        create: [
          { status: "PRELUAT", location: "Cluj-Napoca", createdAt: new Date(now.getTime() - 172800000) },
          { status: "IN_TRANZIT", location: "Depozit Cluj", createdAt: new Date(now.getTime() - 129600000) },
          { status: "IN_LIVRARE", location: "Timișoara", createdAt: new Date(now.getTime() - 86400000) },
          { status: "LIVRAT", location: "Timișoara", createdAt: new Date(now.getTime() - 43200000) },
        ],
      },
    },
  });

  await prisma.parcel.upsert({
    where: { awb: "RO-20260919-00003" },
    update: {},
    create: {
      awb: "RO-20260919-00003",
      status: "PRELUAT",
      senderId: client3.id,
      receiverId: client1.id,
      weight: 1.0,
      content: "Colet mic",
      pickupAddress: "Str. Libertății nr. 5",
      pickupCity: "Timișoara",
      deliveryAddress: "Str. Victoriei nr. 10",
      deliveryCity: "București",
      price: 20.0,
      statusHistory: {
        create: [
          { status: "PRELUAT", location: "Timișoara", createdAt: now },
        ],
      },
    },
  });

  // Create demo trip
  const courier = await prisma.user.findFirst({ where: { role: "COURIER" } });
  await prisma.trip.upsert({
    where: { id: "demo-trip-1" },
    update: {},
    create: {
      id: "demo-trip-1",
      status: "PROGRAMAT",
      originCity: "București",
      destinationCity: "Cluj-Napoca",
      route: "București → Pitești → Sibiu → Cluj-Napoca",
      departureDate: new Date(now.getTime() + 86400000),
      departureTime: "08:00",
      totalSeats: 8,
      availableSeats: 5,
      driverId: courier?.id,
      vehicleInfo: "Mercedes Sprinter - B-123-ABC",
      passengers: {
        create: [
          { name: "Mihai Stanescu", phone: "0766666666", seatCount: 2, price: 100 },
          { name: "Ana Vasilescu", phone: "0777777777", seatCount: 1, price: 50 },
        ],
      },
    },
  });

  console.log("Seed completat cu succes!");
  console.log("---");
  console.log("Conturi demo:");
  console.log("  Admin:    admin@couriertrack.ro / admin123");
  console.log("  Operator: operator@couriertrack.ro / operator123");
  console.log("  Curier:   curier@couriertrack.ro / curier123");
  console.log("  Client:   client@couriertrack.ro / client123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
