-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "cui" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'RO',
    "notes" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Client" ("address", "city", "companyName", "county", "createdAt", "cui", "email", "id", "name", "notes", "phone", "type", "updatedAt", "userId") SELECT "address", "city", "companyName", "county", "createdAt", "cui", "email", "id", "name", "notes", "phone", "type", "updatedAt", "userId" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");
CREATE TABLE "new_Parcel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "awb" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PRELUAT',
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "weight" REAL,
    "width" REAL,
    "height" REAL,
    "length" REAL,
    "declaredValue" REAL,
    "cashOnDelivery" REAL,
    "content" TEXT,
    "notes" TEXT,
    "pickupAddress" TEXT NOT NULL,
    "pickupCity" TEXT NOT NULL,
    "pickupCountry" TEXT NOT NULL DEFAULT 'RO',
    "deliveryAddress" TEXT NOT NULL,
    "deliveryCity" TEXT NOT NULL,
    "deliveryCountry" TEXT NOT NULL DEFAULT 'RO',
    "price" REAL NOT NULL DEFAULT 0,
    "tripId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Parcel_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parcel_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Parcel_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Parcel" ("awb", "cashOnDelivery", "content", "createdAt", "declaredValue", "deliveryAddress", "deliveryCity", "height", "id", "length", "notes", "pickupAddress", "pickupCity", "price", "receiverId", "senderId", "status", "tripId", "updatedAt", "weight", "width") SELECT "awb", "cashOnDelivery", "content", "createdAt", "declaredValue", "deliveryAddress", "deliveryCity", "height", "id", "length", "notes", "pickupAddress", "pickupCity", "price", "receiverId", "senderId", "status", "tripId", "updatedAt", "weight", "width" FROM "Parcel";
DROP TABLE "Parcel";
ALTER TABLE "new_Parcel" RENAME TO "Parcel";
CREATE UNIQUE INDEX "Parcel_awb_key" ON "Parcel"("awb");
CREATE TABLE "new_Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'PROGRAMAT',
    "originCity" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL DEFAULT 'RO',
    "destinationCity" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL DEFAULT 'RO',
    "route" TEXT,
    "departureDate" DATETIME NOT NULL,
    "departureTime" TEXT NOT NULL,
    "estimatedArrival" DATETIME,
    "totalSeats" INTEGER NOT NULL DEFAULT 0,
    "availableSeats" INTEGER NOT NULL DEFAULT 0,
    "driverId" TEXT,
    "vehicleInfo" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("availableSeats", "createdAt", "departureDate", "departureTime", "destinationCity", "driverId", "estimatedArrival", "id", "notes", "originCity", "route", "status", "totalSeats", "updatedAt", "vehicleInfo") SELECT "availableSeats", "createdAt", "departureDate", "departureTime", "destinationCity", "driverId", "estimatedArrival", "id", "notes", "originCity", "route", "status", "totalSeats", "updatedAt", "vehicleInfo" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
