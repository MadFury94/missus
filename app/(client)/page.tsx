import CategoryHeroImage from "@/components/home/CategoryHeroImage";
import MarqueeStrip from "@/components/home/MarqueeStrip";
import TrendReportCards from "@/components/home/TrendReportCards";
import VideoHero from "@/components/home/VideoHero";
import TrendReport from "@/components/home/TrendReport";
import WideBanner from "@/components/home/WideBanner";
import NewInSection from "@/components/home/NewInSection";
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
      <CategoryHeroImage />
      <MarqueeStrip />
      <TrendReportCards />
      <VideoHero />
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
