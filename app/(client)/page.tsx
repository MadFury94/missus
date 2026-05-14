import HeroSlideshow from "@/components/home/HeroSlideshow";
import MarqueeStrip from "@/components/home/MarqueeStrip";
import TrendReportCards from "@/components/home/TrendReportCards";
import WideBanner from "@/components/home/WideBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import StarsOfTheShow from "@/components/home/StarsOfTheShow";
import SaleBanner from "@/components/home/SaleBanner";
import ReviewsSection from "@/components/home/ReviewsSection";
import TrustBar from "@/components/home/TrustBar";
import NewsletterBar from "@/components/home/NewsletterBar";
import { getProducts } from "@/lib/woocommerce";

export const revalidate = 60;

export default async function HomePage() {
  const popularProducts = await getProducts({ perPage: 10, orderby: "popularity" });

  return (
    <>
      {/* 1. Hero Banner — slideshow of images + video */}
      <HeroSlideshow />

      {/* Marquee Strip */}
      <MarqueeStrip />

      {/* 2. Trend Report */}
      <TrendReportCards />

      {/* 3. Sub-hero banner */}
      <WideBanner />

      {/* 4. Product Categories */}
      <CategoryGrid />

      {/* 5. Stars of the Show — popular products */}
      <StarsOfTheShow products={popularProducts} />

      {/* 6. Sale Banner */}
      <SaleBanner />

      {/* Reviews + Trust + Newsletter */}
      <ReviewsSection />
      <TrustBar />
      <NewsletterBar />
    </>
  );
}
