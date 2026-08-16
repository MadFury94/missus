import HeroSlideshow from "@/components/home/HeroSlideshow";
import MarqueeStrip from "@/components/home/MarqueeStrip";
import TrustBar from "@/components/home/TrustBar";
import TrendReportCards from "@/components/home/TrendReportCards";
import VideoSection from "@/components/home/VideoSection";
import GiftShopBanner from "@/components/home/GiftShopBanner";
import NewInSection from "@/components/home/NewInSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import WideBanner from "@/components/home/WideBanner";
import ReviewsSection from "@/components/home/ReviewsSection";
import AppDownloadBanner from "@/components/home/AppDownloadBanner";
import NewsletterBar from "@/components/home/NewsletterBar";

// No server-side data fetching on the home page — all product data is
// loaded client-side so the page renders instantly even in dev when
// the WP host isn't reachable from this machine.
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      {/* 1. Hero slideshow */}
      <HeroSlideshow />

      {/* 2. Marquee */}
      <MarqueeStrip />

      {/* 3. Trust bar */}
      <TrustBar />

      {/* 4. Trend Report cards */}
      <TrendReportCards />

      {/* 5. Video section */}
      <VideoSection />

      {/* 6. Gift shop hero banner */}
      <GiftShopBanner />

      {/* 7. New arrivals — client-side fetch, renders skeletons first */}
      <NewInSection />

      {/* 8. Shop by category */}
      <CategoryGrid />

      {/* 9. Sale banner */}
      <WideBanner />

      {/* 10. Reviews */}
      <ReviewsSection />

      {/* 11. Social follow */}
      <AppDownloadBanner />

      {/* 12. Newsletter */}
      <NewsletterBar />
    </>
  );
}
