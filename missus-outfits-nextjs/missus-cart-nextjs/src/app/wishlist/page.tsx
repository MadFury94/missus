import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WishlistPage from "@/components/wishlist/WishlistPage";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CartProvider } from "@/lib/cart-context";

export const metadata = {
  title: "My Wishlist — Missus Outfits",
};

export default function Wishlist() {
  return (
    <CartProvider>
      <WishlistProvider>
        <AnnouncementBar />
        <Header />
        <WishlistPage />
        <Footer />
      </WishlistProvider>
    </CartProvider>
  );
}
