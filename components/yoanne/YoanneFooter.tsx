import { BRAND_CONFIG } from "@/lib/brand-config";

export default function YoanneFooter() {
    return (
        <footer id="contact">
            <div className="wrap">
                <div className="footer-grid">
                    <div className="footer-col">
                        <div className="footer-logo">{BRAND_CONFIG.homepage.name}</div>
                        <p style={{ color: "#cfc6b6", fontSize: ".9rem", maxWidth: "280px" }}>Luxury Adire ready-to-wear, handcrafted in Lekki Phase 1, Lagos.</p>
                        <div className="footer-social">
                            <a href={BRAND_CONFIG.homepage.instagram} target="_blank" rel="noopener" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
                            <a href={BRAND_CONFIG.homepage.whatsapp} target="_blank" rel="noopener" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
                            <a href={BRAND_CONFIG.homepage.threads} aria-label="Threads"><i className="fa-brands fa-threads"></i></a>
                        </div>
                    </div>
                    <div className="footer-col">
                        <h4>Shop</h4>
                        <ul>
                            <li><a href="/shop">Ready to Wear</a></li>
                            <li><a href="/shop">Adire Collection</a></li>
                            <li><a href="/shop">New Arrivals</a></li>
                            <li><a href="/shop">Limited Pieces</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Customer Service</h4>
                        <ul>
                            <li><a href="/size-guide">Size Guide</a></li>
                            <li><a href="/shipping">Shipping &amp; Delivery</a></li>
                            <li><a href="/returns">Returns</a></li>
                            <li><a href="/faq">FAQ</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Contact</h4>
                        <ul>
                            <li><i className="fa-solid fa-location-dot" style={{ color: "var(--gold-light)", marginRight: "8px" }}></i>{BRAND_CONFIG.homepage.address}</li>
                            <li><i className="fa-solid fa-phone" style={{ color: "var(--gold-light)", marginRight: "8px" }}></i>{BRAND_CONFIG.homepage.phone}</li>
                            <li><a href={BRAND_CONFIG.homepage.whatsapp} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" style={{ color: "var(--gold-light)", marginRight: "8px" }}></i>Order on WhatsApp</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>© 2026 {BRAND_CONFIG.homepage.name}. All rights reserved.</span>
                    <span>Design mockup by DailyRazor</span>
                </div>
            </div>
        </footer>
    );
}
