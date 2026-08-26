import HeroSlideshow from "@/components/home/HeroSlideshow";
import MarqueeStrip from "@/components/home/MarqueeStrip";
import TrendReportCards from "@/components/home/TrendReportCards";
import VideoSection from "@/components/home/VideoSection";
import GiftShopBanner from "@/components/home/GiftShopBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import WideBanner from "@/components/home/WideBanner";
import NewInSection from "@/components/home/NewInSection";
import ReviewsSection from "@/components/home/ReviewsSection";
import AppDownloadBanner from "@/components/home/AppDownloadBanner";
import NewsletterBar from "@/components/home/NewsletterBar";

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <HeroSlideshow />
      <MarqueeStrip />
      <TrendReportCards />
      <VideoSection />
      <GiftShopBanner />
      <CategoryGrid />
      <WideBanner />
      <NewInSection />
      <ReviewsSection />
      <AppDownloadBanner />
      <NewsletterBar />
    </>
  );
}
