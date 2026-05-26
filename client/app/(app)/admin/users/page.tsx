import { getDb } from "@/lib/mongodb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

async function getUsers() {
  const db = await getDb();
  const [users, accounts] = await Promise.all([
    db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray(),
    db.collection("accounts").find({}).toArray(),
  ]);

  const accountMap = new Map(accounts.map((a) => [a.userId.toString(), a]));

  return users.map((u) => {
    const account = accountMap.get(u._id.toString());
    return {
      ...u,
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      tiktok: account?.tiktokUsername ?? "-",
      followers: account?.followers ?? 0,
    };
  });
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">
          Total {users.length} user terdaftar
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <CardTitle>Daftar User</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>TikTok</TableHead>
                <TableHead>Follower</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Bergabung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-gray-400 py-8"
                  >
                    Belum ada user terdaftar.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u._id.toString()}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-gray-600">{u.email}</TableCell>
                    <TableCell className="text-gray-600">{u.tiktok}</TableCell>
                    <TableCell className="text-gray-600">
                      {u.followers}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.role === "admin" ? "default" : "secondary"}
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
