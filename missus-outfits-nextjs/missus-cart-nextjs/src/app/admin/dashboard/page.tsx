import AdminDashboardPage from "@/components/admin/AdminDashboardPage";

export const metadata = { title: "Admin Dashboard — Missus Outfits" };

// Admin dashboard takes full height — no shared header/footer
export default function AdminDashboard() {
  return <AdminDashboardPage />;
}
