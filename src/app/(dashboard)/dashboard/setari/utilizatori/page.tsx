import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserFormDialog } from "@/components/shared/user-form-dialog";

export default async function UtilizatoriPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Utilizatori"
        description={`${users.length} utilizatori în sistem`}
      />

      <div className="mb-4">
        <UserFormDialog />
      </div>

      <div className="rounded-lg border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nume</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {ROLE_LABELS[user.role as Role] || user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.phone || "-"}</TableCell>
                <TableCell>
                  <Badge variant={user.active ? "default" : "outline"} className={user.active ? "bg-green-100 text-green-800 border-0" : "bg-red-100 text-red-800 border-0"}>
                    {user.active ? "Activ" : "Inactiv"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
