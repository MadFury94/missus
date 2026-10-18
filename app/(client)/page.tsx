import { getHomepageContent } from "@/lib/homepage-content.server";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import MarqueeStrip from "@/components/home/MarqueeStrip";
import TrendReportCards from "@/components/home/TrendReportCards";
import VideoSection from "@/components/home/VideoSection";
import GiftShopBanner from "@/components/home/GiftShopBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import PromoBand from "@/components/home/PromoBand";
import NewInSection from "@/components/home/NewInSection";
import ReviewsSection from "@/components/home/ReviewsSection";
import AppDownloadBanner from "@/components/home/AppDownloadBanner";
import NewsletterBar from "@/components/home/NewsletterBar";
import StructuredData from "@/components/seo/StructuredData";
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/structured-data";

import type { Metadata } from "next";
import { HOME_TITLE, HOME_DESCRIPTION, generatePageMetadata } from "@/lib/seo-config";

export const revalidate = 60;

export function generateMetadata(): Metadata {
  return generatePageMetadata({ title: HOME_TITLE, description: HOME_DESCRIPTION, path: "/" });
}

export default async function HomePage() {
  const content = await getHomepageContent();

  return (
    <>
      <StructuredData schema={[getOrganizationSchema(), getWebsiteSchema()]} />
      <HeroSlideshow slides={content.hero} />
      <MarqueeStrip items={content.marquee} />
      <TrendReportCards cards={content.styleRadar} />
      <VideoSection />
      <GiftShopBanner images={content.categories.giftBox} />
      <CategoryGrid categories={content.categories} />
      <PromoBand band={content.promoBand} />
      <NewInSection />
      <ReviewsSection />
      <AppDownloadBanner />
      <NewsletterBar heading={content.newsletter.heading} sub={content.newsletter.sub} />
    </>
  );
}
