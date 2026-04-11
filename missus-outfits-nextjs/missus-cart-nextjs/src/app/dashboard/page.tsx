import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import UserDashboardPage from "@/components/user/UserDashboardPage";
import { CartProvider } from "@/lib/cart-context";

export const metadata = { title: "My Account — Missus Outfits" };

export default function Dashboard() {
  return (
    <CartProvider>
      <AnnouncementBar />
      <Header />
      <UserDashboardPage />
      <Footer />
    </CartProvider>
  );
}
