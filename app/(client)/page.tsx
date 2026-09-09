import { getHomepageContent } from "@/lib/homepage-content.server";
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
import StructuredData from "@/components/seo/StructuredData";
import { getLocalBusinessSchema } from "@/lib/structured-data";
import DynamicTitle from "@/components/layout/DynamicTitle";
import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo-config";

export const revalidate = 60;

export const metadata: Metadata = generatePageMetadata({
  title: "Missus - Premium Women's Fashion & Contemporary Style",
  description: "Discover premium women's fashion at Missus Nigeria. Shop curated collections of dresses, matching sets, tops, and contemporary styles. Free shipping on orders over ₦50,000. Your destination for trendy, affordable fashion.",
  keywords: [
    "women's fashion Nigeria",
    "premium dresses Lagos",
    "contemporary fashion",
    "trendy outfits Nigeria",
    "designer clothing online",
    "fashion boutique Nigeria",
    "women's designer wear",
    "stylish clothing Lagos",
    "online fashion store Nigeria",
    "luxury women's fashion"
  ],
  path: "/",
});

export default async function HomePage() {
  const content = await getHomepageContent();

  return (
    <>
      <DynamicTitle enabled={true} />
      <StructuredData schema={getLocalBusinessSchema()} />
      <HeroSlideshow slides={content.hero} />
      <MarqueeStrip items={content.marquee} />
      <TrendReportCards cards={content.styleRadar} />
      <VideoSection />
      <GiftShopBanner />
      <CategoryGrid />
      <WideBanner />
      <NewInSection />
      <ReviewsSection />
      <AppDownloadBanner />
      <NewsletterBar heading={content.newsletter.heading} sub={content.newsletter.sub} />
    </>
  );
}
