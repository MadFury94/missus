import { getHomepageContent } from "@/lib/homepage-content.server";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import WearluxHero from "@/components/home/WearluxHero";
import { IS_DEMO_STORE } from "@/lib/store-config";
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
import StructuredData from "@/components/seo/StructuredData";
import { getLocalBusinessSchema } from "@/lib/structured-data";
import DynamicTitle from "@/components/layout/DynamicTitle";
import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo-config";
import { BRAND_CONFIG } from "@/lib/brand-config";

export const revalidate = 60;

export const metadata: Metadata = generatePageMetadata({
  title: `${BRAND_CONFIG.name} - Style for the Modern Man`,
  description: `Discover premium fashion at ${BRAND_CONFIG.name} Nigeria. Shop curated collections and contemporary styles. Free shipping on orders over ₦50,000.`,
  keywords: [
    "men's fashion Nigeria", "men's clothing Lagos", "Nigerian menswear",
    "affordable luxury menswear", "men's native wear", "senator wear", "agbada",
    "men's kaftans", "men's shirts", "men's trousers", "men's footwear",
    "men's accessories", "online men's fashion Nigeria", "modern men's style"
  ],
  path: "/",
});

export default async function HomePage() {
  const content = await getHomepageContent();

  return (
    <>
      <DynamicTitle enabled={true} />
      <StructuredData schema={getLocalBusinessSchema()} />
      {IS_DEMO_STORE ? <WearluxHero /> : <HeroSlideshow slides={content.hero} />}
      <MarqueeStrip items={content.marquee} />
      <TrendReportCards cards={content.styleRadar} />
      <VideoSection />
      <GiftShopBanner />
      <CategoryGrid categories={content.categories} />
      <WideBanner />
      <NewInSection />
      <ReviewsSection />
      <AppDownloadBanner />
      <NewsletterBar heading={content.newsletter.heading} sub={content.newsletter.sub} />
    </>
  );
}
