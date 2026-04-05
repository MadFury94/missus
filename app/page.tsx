// HERO SECTION
import CategoryHeroImage from "@/components/home/CategoryHeroImage";

import MarqueeStrip from "@/components/home/MarqueeStrip";
import TrendReport from "@/components/home/TrendReport";
import WideBanner from "@/components/home/WideBanner";
import NewInSection from "@/components/home/NewInSection";
import VideoHero from "@/components/home/VideoHero";
import CategoryGrid from "@/components/home/CategoryGrid";
import ReviewsSection from "@/components/home/ReviewsSection";
import AppDownloadBanner from "@/components/home/AppDownloadBanner";
import TrustBar from "@/components/home/TrustBar";
import NewsletterBar from "@/components/home/NewsletterBar";
import { getNewArrivals } from "@/lib/woocommerce";

export const revalidate = 60;

export default async function HomePage() {
  const newArrivals = await getNewArrivals(10);

  return (
    <>
      {/* Full-Width HD Hero Image with Text */}
      <CategoryHeroImage />

      {/* Marquee Strip */}
      <MarqueeStrip />

      {/* TODO: New section here before video */}

      {/* Video Background */}
      <VideoHero />

      {/* Rest of homepage sections */}
      <TrendReport />
      <WideBanner />
      <NewInSection products={newArrivals} />

      <CategoryGrid />
      <ReviewsSection />
      <AppDownloadBanner />
      <TrustBar />
      <NewsletterBar />
    </>
  );
}
