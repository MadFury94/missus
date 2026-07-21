import HeroSlideshow from "@/components/home/HeroSlideshow";
import MarqueeStrip from "@/components/home/MarqueeStrip";
import TrustBar from "@/components/home/TrustBar";
import TrendReportCards from "@/components/home/TrendReportCards";
import NewInSection from "@/components/home/NewInSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import WideBanner from "@/components/home/WideBanner";
import ReviewsSection from "@/components/home/ReviewsSection";
import AppDownloadBanner from "@/components/home/AppDownloadBanner";
import NewsletterBar from "@/components/home/NewsletterBar";
import { getNewArrivals } from "@/lib/woocommerce";

export const revalidate = 60;

export default async function HomePage() {
  const newArrivals = await getNewArrivals(10);

  return (
    <>
      {/* 1. Hero — full-screen slideshow with video support */}
      <HeroSlideshow />

      {/* 2. Marquee — trust signals immediately below fold */}
      <MarqueeStrip />

      {/* 3. Trust bar — builds confidence before product content */}
      <TrustBar />

      {/* 4. Trend cards — editorial category entry points */}
      <TrendReportCards />

      {/* 5. New arrivals — live product grid */}
      <NewInSection products={newArrivals} />

      {/* 6. Category grid — browse by category */}
      <CategoryGrid />

      {/* 7. Sale banner — promotional mid-page */}
      <WideBanner />

      {/* 8. Reviews — social proof */}
      <ReviewsSection />

      {/* 9. Social follow — replaces fake app download */}
      <AppDownloadBanner />

      {/* 10. Newsletter */}
      <NewsletterBar />
    </>
  );
}
