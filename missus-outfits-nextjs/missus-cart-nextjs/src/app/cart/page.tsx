import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import CartUnlockBar from "@/components/cart/CartUnlockBar";
import CartItemRow from "@/components/cart/CartItemRow";
import PromoCodeInput from "@/components/cart/PromoCodeInput";
import OrderSummary from "@/components/cart/OrderSummary";
import UpsellGrid from "@/components/cart/UpsellGrid";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart-context";
import CartPageClient from "./CartPageClient";

export default function CartPage() {
  return (
    <CartProvider>
      <AnnouncementBar />
      <Header />
      <CartUnlockBar />
      <CartPageClient />
      <Footer />
    </CartProvider>
  );
}
