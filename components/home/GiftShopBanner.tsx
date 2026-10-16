import Link from "next/link";

const DEFAULT_IMAGE = "/missus-giftbox.png";

export default function GiftShopBanner({ images }: {
    images?: { desktopSrc?: string; mobileSrc?: string };
}) {
    const desktopSrc = images?.desktopSrc?.trim() || DEFAULT_IMAGE;
    const mobileSrc = images?.mobileSrc?.trim() || desktopSrc;

    return (
        <Link href="/category/gift-shop" style={{ display: "block", textDecoration: "none" }}>
            <picture>
                <source media="(max-width: 768px)" srcSet={mobileSrc} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={desktopSrc}
                    alt="Shop the Gift Shop"
                    style={{
                        display: "block",
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                    }}
                />
            </picture>
        </Link>
    );
}
