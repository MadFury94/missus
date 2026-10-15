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
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px", lineHeight: 1.7 }}>
        <h1 style={{ fontSize: "clamp(26px, 4vw, 40px)", marginBottom: 16 }}>Affordable Women's Fashion in Nigeria</h1>
        <p>Meet Missus Outfits, your destination for trendy, affordable women's fashion in Nigeria. Discover dresses for your next outing, matching sets that make getting ready easy, and tops and bottoms you can mix your way. From busy weekdays in Lagos to weekend plans in Abuja or Port Harcourt, find outfits that fit your style and your budget. Explore our athleisure and loungewear for relaxed days, browse the Gift Shop for a thoughtful treat, or discover fresh finds in the sale. Shop your favourites online and enjoy free shipping on orders ₦150,000+.</p>
      </section>
      <MarqueeStrip items={content.marquee} />
      <TrendReportCards cards={content.styleRadar} />
      <VideoSection />
      <GiftShopBanner images={content.categories.giftBox} />
      <CategoryGrid categories={content.categories} />
      <WideBanner />
      <NewInSection />
      <ReviewsSection />
      <AppDownloadBanner />
      <NewsletterBar heading={content.newsletter.heading} sub={content.newsletter.sub} />
    </>
  );
}
