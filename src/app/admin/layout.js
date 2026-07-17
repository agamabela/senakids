import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata = {
  title: "Admin Dashboard - Sena Kids",
};

export default async function AdminLayout({ children }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/login?callbackUrl=/admin");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
