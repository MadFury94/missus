"use client";

import { useEffect, useRef, useState, type MouseEvent, type FormEvent } from "react";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { YOANNE_FEATURED } from "@/lib/yoanne-home-content";
import { getWishlist, toggleWishlist } from "@/lib/wishlist";
import { addToCart } from "@/lib/cart";
import { Search, Heart, ShoppingBag, Sprout, Sparkles, Feather, Truck, Scissors, LockKeyhole } from "lucide-react";
import "./fonts.css";
import "./home.css";

export default function YoanneHome() {
    const root = useRef<HTMLDivElement>(null);
    const [wishes, setWishes] = useState<number[]>([]);
    const [notice, setNotice] = useState("");
    const [newsletterMessage, setNewsletterMessage] = useState("");
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        const sync = () => setWishes(getWishlist().map(item => item.productId));
        sync();
        window.addEventListener("wishlistUpdated", sync);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let observer: IntersectionObserver | undefined;
        if (!reduceMotion && "IntersectionObserver" in window) {
            observer = new IntersectionObserver(entries => entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove("reveal-pending");
                    observer?.unobserve(entry.target);
                }
            }), { threshold: 0.08 });
            root.current?.querySelectorAll(".fade-up").forEach(element => {
                if (element.getBoundingClientRect().top > window.innerHeight) {
                    element.classList.add("reveal-pending");
                    observer?.observe(element);
                }
            });
        }
        return () => { observer?.disconnect(); window.removeEventListener("wishlistUpdated", sync); };
    }, []);

    useEffect(() => {
        if (!notice) return;
        const timer = window.setTimeout(() => setNotice(""), 5000);
        return () => window.clearTimeout(timer);
    }, [notice]);

    function handleClick(event: MouseEvent<HTMLDivElement>) {
        const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action], [data-product], [data-wishlist]");
        if (!target) return;
        event.preventDefault();
        if (target.dataset.wishlist) {
            const product = YOANNE_FEATURED.find(item => item.id === Number(target.dataset.wishlist));
            if (product) toggleWishlist({ productId: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug });
        } else if (target.dataset.product !== undefined) {
            const product = YOANNE_FEATURED[Number(target.dataset.product)];
            if (product) {
                addToCart({ productId: product.id, variationId: product.id * 10 + 1, name: product.name, slug: product.slug, image: product.image, price: product.price, regularPrice: product.price, quantity: 1, size: "M", color: "Indigo" });
                window.dispatchEvent(new Event("cart-updated"));
                window.dispatchEvent(new Event("open-cart-drawer"));
                setNotice(`${product.name} added to your bag.`);
            }
        } else if (target.dataset.action === "search") {
            window.dispatchEvent(new Event("open-site-search"));
        } else if (target.dataset.action === "cart") {
            window.dispatchEvent(new Event("open-cart-drawer"));
        } else if (target.dataset.action === "film") {
            document.getElementById("lookbook")?.scrollIntoView({ behavior: "smooth" });
            setNotice("Explore the Yoanne campaign lookbook below.");
        }
    }

    async function subscribe(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (subscribing) return;
        const email = String(new FormData(event.currentTarget).get("email") || "");
        setSubscribing(true);
        setNewsletterMessage("");
        try {
            const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
            const data = await response.json();
            setNewsletterMessage(data.demo ? "Newsletter sign-ups will open when the studio launches." : response.ok ? "Thank you. You're on the list." : data.error || "Please try again shortly.");
        } catch { setNewsletterMessage("We couldn't send your request. Please try again."); }
        finally { setSubscribing(false); }
    }

    return <div className="yoanne-home" ref={root} onClick={handleClick}>
<header className="nav solid">
  <div className="wrap nav-inner">
    <a href="/" className="logo">{BRAND_CONFIG.homepage.name}</a>
    <nav className="navlinks">
      <a href="/" className="active">Home</a>
      <a href="/shop">Shop</a>
      <a href="/shop">Collections</a>
      <a href="#about">About</a>
      <a href="#lookbook">Lookbook</a>
      <a href="#contact">Contact</a>
    </nav>
    <div className="navright">
      <div className="navicons">
        <a href="/search" data-action="search" aria-label="Search"><Search size={18} strokeWidth={1.5} /></a>
        <a href="/wishlist" aria-label="Wishlist"><Heart size={18} strokeWidth={1.5} /></a>
        <a href="/cart" data-action="cart" aria-label="Cart"><ShoppingBag size={18} strokeWidth={1.5} /></a>
      </div>
      <a href="/shop" className="btn btn-gold">Shop Collection</a>
    </div>
  </div>
</header><main><div className="view active" id="view-home">
    
<section className="hero" style={{"padding": "0"}}>
  <div className="hero-media">
    <div className="fabric-swatch fabric-butterfly"><span className="fabric-name">Adire Butterfly Print</span></div>
  </div>
  <div className="hero-copy">
    <span className="eyebrow">Lekki Phase 1 · Lagos</span>
    <h1>Crafted for<br />comfort.<br /><em style={{"color": "var(--indigo)"}}>Designed</em> for<br />elegance.</h1>
    <p>{BRAND_CONFIG.homepage.name} reworks the indigo Adire tradition into ready-to-wear silhouettes for the modern Nigerian woman — easy to wear, impossible to overlook.</p>
    <div className="hero-ctas">
      <a href="/shop" className="btn btn-primary">Explore Collection</a>
      <a href="#contact" className="btn btn-outline">Book Appointment</a>
    </div>
  </div>
  <div className="hero-scroll"><span className="line"></span> Scroll</div>
</section>


<section>
  <div className="wrap">
    <div className="section-head fade-up">
      <div>
        <span className="eyebrow">The Edit</span>
        <h2>Featured Collections</h2>
      </div>
      <p style={{"maxWidth": "360px"}}>Four ways to wear the house's signature indigo — from everyday ready-to-wear to one-of-one limited pieces.</p>
    </div>
  </div>
  <div className="collections-grid fade-up">
    <a href="/shop" className="collection-card">
      <div className="fabric-swatch fabric-pleat"><span className="fabric-name">Wine Pleat Weave</span></div>
      <div className="collection-label"><div className="cname">Ready to Wear</div><div className="ccount">18 Pieces</div></div>
    </a>
    <a href="/shop" className="collection-card">
      <div className="fabric-swatch fabric-butterfly"><span className="fabric-name">Adire Butterfly Print</span></div>
      <div className="collection-label"><div className="cname">Adire Collection</div><div className="ccount">12 Pieces</div></div>
    </a>
    <a href="/shop" className="collection-card">
      <div className="fabric-swatch fabric-patchwork"><span className="fabric-name">Patchwork Adire</span></div>
      <div className="collection-label"><div className="cname">New Arrivals</div><div className="ccount">9 Pieces</div></div>
    </a>
    <a href="/shop" className="collection-card">
      <div className="fabric-swatch fabric-sequin"><span className="fabric-name">Champagne Sequin</span></div>
      <div className="collection-label"><div className="cname">Limited Pieces</div><div className="ccount">5 Pieces</div></div>
    </a>
  </div>
</section>


<section id="about" className="adire-wash">
  <div className="wrap about-split">
    <div className="about-media fade-up">
      <div className="fabric-swatch fabric-sequin"><span className="fabric-name">Champagne Sequin Atelier</span></div>
      <div className="frame"></div>
    </div>
    <div className="about-copy fade-up">
      <span className="eyebrow">Our Story</span>
      <h2>An old dye, worn new.</h2>
      <p className="lede">"Adire has always been a language — we simply gave it a modern accent."</p>
      <p>Founded in Lekki Phase 1, {BRAND_CONFIG.homepage.name} began with a single conviction: that Adire, Nigeria's centuries-old resist-dye textile, deserved a place in the everyday wardrobe of the contemporary woman — not only in archives and galleries. Every piece is hand-finished, cut for movement, and dyed in small, deliberate batches.</p>
      <p style={{"marginTop": "16px"}}>Our atelier works directly with indigo dyers across the Southwest, pairing their craft with premium bases — silk-cotton blends, brushed linen, and hand-beaten cotton — so that heritage feels like luxury, not costume.</p>
      <a href="/shop" className="btn btn-outline" style={{"marginTop": "30px"}}>Discover the Craft</a>
    </div>
  </div>
</section>


<section style={{"paddingTop": "0"}}>
  <div className="wrap">
    <div className="section-head fade-up">
      <div><span className="eyebrow">The Difference</span><h2>Why {BRAND_CONFIG.homepage.name}</h2></div>
    </div>
  </div>
  <div className="why-grid fade-up">
    <div className="why-card"><div className="why-icon"><Sprout size={22} strokeWidth={1.4} /></div><h3>Premium Fabrics</h3><p>Silk-cotton, brushed linen and hand-beaten cotton, sourced for drape and longevity.</p></div>
    <div className="why-card"><div className="why-icon"><Sparkles size={22} strokeWidth={1.4} /></div><h3>Handcrafted Quality</h3><p>Every wax-resist pattern and dye bath is worked by hand across small batches.</p></div>
    <div className="why-card"><div className="why-icon"><Feather size={22} strokeWidth={1.4} /></div><h3>Comfort Meets Luxury</h3><p>Considered cuts that move with the body — nothing stiff, nothing precious.</p></div>
    <div className="why-card"><div className="why-icon"><Truck size={22} strokeWidth={1.4} /></div><h3>Nationwide Delivery</h3><p>Dispatched from Lagos to every state, with express options within Lekki.</p></div>
    <div className="why-card"><div className="why-icon"><Scissors size={22} strokeWidth={1.4} /></div><h3>Custom Styling</h3><p>Book an in-atelier fitting for bespoke lengths, sleeves and embellishment.</p></div>
    <div className="why-card"><div className="why-icon"><LockKeyhole size={22} strokeWidth={1.4} /></div><h3>Secure Shopping</h3><p>Protected checkout, transparent sizing, and easy WhatsApp support.</p></div>
  </div>
</section>


<section>
  <div className="wrap">
    <div className="section-head fade-up">
      <div><span className="eyebrow">Just In</span><h2>Featured Pieces</h2></div>
      <a href="/shop" className="btn btn-outline">View All</a>
    </div>
    <div className="products-grid fade-up">

      <div className="product-card">
        <div className="product-media">
          <span className="badge">New</span>
          <button className={wishes.includes(900013) ? "wish-btn active" : "wish-btn"} data-wishlist="900013" aria-pressed={wishes.includes(900013)} aria-label={wishes.includes(900013) ? "Remove from wishlist" : "Add to wishlist"}><i className="fa-regular fa-heart"></i></button>
          <a href="/product/adire-butterfly-wrap-kaftan" aria-label="View featured piece" style={{ display: "block", height: "100%" }}><div className="fabric-swatch fabric-butterfly"><span className="fabric-name">Adire Butterfly Print</span></div></a>
          <button className="quick-add" data-product="0">Quick Add</button>
        </div>
        <div className="product-info">
          <span className="fabric-tag">Adire Butterfly Print</span>
          <h3><a href="/product/adire-butterfly-wrap-kaftan">Adire Butterfly Wrap Kaftan</a></h3>
          <div className="price">₦185,000</div>
          <div className="rating"><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-regular fa-star"></i></div>
        </div>
      </div>

      <div className="product-card">
        <div className="product-media">
          <button className={wishes.includes(900014) ? "wish-btn active" : "wish-btn"} data-wishlist="900014" aria-pressed={wishes.includes(900014)} aria-label={wishes.includes(900014) ? "Remove from wishlist" : "Add to wishlist"}><i className="fa-regular fa-heart"></i></button>
          <a href="/product/wine-pleated-boubou" aria-label="View featured piece" style={{ display: "block", height: "100%" }}><div className="fabric-swatch fabric-pleat"><span className="fabric-name">Wine Pleat Weave</span></div></a>
          <button className="quick-add" data-product="1">Quick Add</button>
        </div>
        <div className="product-info">
          <span className="fabric-tag">Wine Pleat Weave</span>
          <h3><a href="/product/wine-pleated-boubou">Wine Pleated Boubou</a></h3>
          <div className="price">₦142,000</div>
          <div className="rating"><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i></div>
        </div>
      </div>

      <div className="product-card">
        <div className="product-media">
          <span className="badge">Limited</span>
          <button className={wishes.includes(900015) ? "wish-btn active" : "wish-btn"} data-wishlist="900015" aria-pressed={wishes.includes(900015)} aria-label={wishes.includes(900015) ? "Remove from wishlist" : "Add to wishlist"}><i className="fa-regular fa-heart"></i></button>
          <a href="/product/patchwork-adire-column-dress" aria-label="View featured piece" style={{ display: "block", height: "100%" }}><div className="fabric-swatch fabric-patchwork"><span className="fabric-name">Patchwork Adire</span></div></a>
          <button className="quick-add" data-product="2">Quick Add</button>
        </div>
        <div className="product-info">
          <span className="fabric-tag">Patchwork Adire</span>
          <h3><a href="/product/patchwork-adire-column-dress">Patchwork Adire Column Dress</a></h3>
          <div className="price">₦168,000</div>
          <div className="rating"><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-regular fa-star-half-stroke"></i></div>
        </div>
      </div>

      <div className="product-card">
        <div className="product-media">
          <button className={wishes.includes(900016) ? "wish-btn active" : "wish-btn"} data-wishlist="900016" aria-pressed={wishes.includes(900016)} aria-label={wishes.includes(900016) ? "Remove from wishlist" : "Add to wishlist"}><i className="fa-regular fa-heart"></i></button>
          <a href="/product/champagne-sequin-wrap-set" aria-label="View featured piece" style={{ display: "block", height: "100%" }}><div className="fabric-swatch fabric-sequin"><span className="fabric-name">Champagne Sequin</span></div></a>
          <button className="quick-add" data-product="3">Quick Add</button>
        </div>
        <div className="product-info">
          <span className="fabric-tag">Champagne Sequin</span>
          <h3><a href="/product/champagne-sequin-wrap-set">Champagne Sequin Wrap Set</a></h3>
          <div className="price">₦210,000</div>
          <div className="rating"><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-regular fa-star"></i></div>
        </div>
      </div>

    </div>
  </div>
</section>


<section style={{"padding": "0"}}>
  <div className="video-banner">
    <div className="fabric-swatch fabric-patchwork"><span className="fabric-name">Patchwork Adire</span></div>
    <div className="video-copy">
      <span className="eyebrow" style={{"color": "var(--gold-light)"}}>The Campaign</span>
      <h2>Indigo, in motion.</h2>
      <a href="#lookbook" className="btn btn-light" data-action="film" style={{"marginTop": "26px"}}>Explore the Campaign</a>
    </div>
  </div>
</section>


<section id="lookbook">
  <div className="wrap">
    <div className="section-head fade-up">
      <div><span className="eyebrow">Styled</span><h2>Lookbook</h2></div>
    </div>
    <div className="lookbook fade-up">
      <a href="/shop"><div className="fabric-swatch fabric-butterfly"><span className="fabric-name">Adire Butterfly Print</span></div></a>
      <a href="/shop"><div className="fabric-swatch fabric-pleat"><span className="fabric-name">Wine Pleat Weave</span></div></a>
      <a href="/shop"><div className="fabric-swatch fabric-patchwork"><span className="fabric-name">Patchwork Adire</span></div></a>
      <a href="/shop"><div className="fabric-swatch fabric-sequin"><span className="fabric-name">Champagne Sequin</span></div></a>
      <a href="/shop"><div className="fabric-swatch fabric-butterfly-alt"><span className="fabric-name">Adire Butterfly Print</span></div></a>
      <a href="/shop"><div className="fabric-swatch fabric-patchwork-alt"><span className="fabric-name">Patchwork Adire</span></div></a>
      <a href="/shop"><div className="fabric-swatch fabric-butterfly"><span className="fabric-name">Adire Butterfly Print</span></div></a>
      <a href="/shop"><div className="fabric-swatch fabric-pleat"><span className="fabric-name">Wine Pleat Weave</span></div></a>
    </div>
  </div>
</section>


<section className="adire-wash">
  <div className="wrap">
    <div className="section-head fade-up">
      <div><span className="eyebrow">Kind Words</span><h2>From Our Clients</h2></div>
    </div>
    <div className="testi-grid fade-up">
      <div className="testi-card">
        <div className="testi-quote">"</div>
        <p>The fit is unlike anything off-the-rack I've owned — and the Adire pattern placement is clearly intentional, not just cut and sewn.</p>
        <div className="testi-person">
          <div className="testi-avatar avatar-initial" style={{"background": "var(--indigo)"}}>AO</div>
          <div><div className="testi-name">Adaeze O.</div><div className="testi-loc">Lekki, Lagos</div></div>
        </div>
      </div>
      <div className="testi-card">
        <div className="testi-quote">"</div>
        <p>I wore the butterfly-print kaftan to a wedding and three people asked for the designer before the reception started.</p>
        <div className="testi-person">
          <div className="testi-avatar avatar-initial" style={{"background": "var(--burgundy)"}}>FA</div>
          <div><div className="testi-name">Funmi A.</div><div className="testi-loc">Abuja</div></div>
        </div>
      </div>
      <div className="testi-card">
        <div className="testi-quote">"</div>
        <p>Delivery was fast even outside Lagos, and the styling advice over WhatsApp made ordering my size effortless.</p>
        <div className="testi-person">
          <div className="testi-avatar avatar-initial" style={{"background": "var(--gold)"}}>CN</div>
          <div><div className="testi-name">Chiamaka N.</div><div className="testi-loc">Port Harcourt</div></div>
        </div>
      </div>
    </div>
  </div>
</section>


<section style={{"paddingTop": "0"}}>
  <div className="wrap">
    <div className="section-head fade-up">
      <div><span className="eyebrow">{BRAND_CONFIG.homepage.instagramHandle}</span><h2>Follow the Studio</h2></div>
      <a href={BRAND_CONFIG.homepage.instagram} target="_blank" rel="noopener" className="btn btn-outline">Follow Us</a>
    </div>
  </div>
  <div className="ig-grid fade-up">
    <a className="ig-item" href={BRAND_CONFIG.homepage.instagram} target="_blank" rel="noopener noreferrer" aria-label="View the studio on Instagram"><div className="fabric-swatch fabric-pleat"><span className="fabric-name">Wine Pleat Weave</span></div></a>
    <a className="ig-item" href={BRAND_CONFIG.homepage.instagram} target="_blank" rel="noopener noreferrer" aria-label="View the studio on Instagram"><div className="fabric-swatch fabric-butterfly"><span className="fabric-name">Adire Butterfly Print</span></div></a>
    <a className="ig-item" href={BRAND_CONFIG.homepage.instagram} target="_blank" rel="noopener noreferrer" aria-label="View the studio on Instagram"><div className="fabric-swatch fabric-butterfly-alt"><span className="fabric-name">Adire Butterfly Print</span></div></a>
    <a className="ig-item" href={BRAND_CONFIG.homepage.instagram} target="_blank" rel="noopener noreferrer" aria-label="View the studio on Instagram"><div className="fabric-swatch fabric-patchwork"><span className="fabric-name">Patchwork Adire</span></div></a>
    <a className="ig-item" href={BRAND_CONFIG.homepage.instagram} target="_blank" rel="noopener noreferrer" aria-label="View the studio on Instagram"><div className="fabric-swatch fabric-patchwork-alt"><span className="fabric-name">Patchwork Adire</span></div></a>
    <a className="ig-item" href={BRAND_CONFIG.homepage.instagram} target="_blank" rel="noopener noreferrer" aria-label="View the studio on Instagram"><div className="fabric-swatch fabric-sequin"><span className="fabric-name">Champagne Sequin</span></div></a>
  </div>
</section>


<section className="newsletter">
  <div className="wrap">
    <span className="eyebrow" style={{"color": "var(--gold-light)"}}>Stay Close</span>
    <h2>Be first to know about new drops and atelier events.</h2>
    <form className="news-form" onSubmit={subscribe}>
      <input type="email" placeholder="Your email address" aria-label="Your email address" name="email" autoComplete="email" required />
      <button type="submit" disabled={subscribing}>{subscribing ? "Sending..." : "Subscribe"}</button>
    </form>
{newsletterMessage && <p role="status" className="newsletter-status">{newsletterMessage}</p>}
  </div>
</section>


  </div>

  </main><footer id="contact">
  <div className="wrap">
    <div className="footer-grid">
      <div className="footer-col">
        <div className="footer-logo">{BRAND_CONFIG.homepage.name}</div>
        <p style={{"color": "#cfc6b6", "fontSize": ".9rem", "maxWidth": "280px"}}>Luxury Adire ready-to-wear, handcrafted in Lekki Phase 1, Lagos.</p>
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
          <li><a href="/shipping">Shipping & Delivery</a></li>
          <li><a href="/returns">Returns</a></li>
          <li><a href="/faq">FAQ</a></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Contact</h4>
        <ul>
          <li><i className="fa-solid fa-location-dot" style={{"color": "var(--gold-light)", "marginRight": "8px"}}></i>{BRAND_CONFIG.homepage.address}</li>
          <li><i className="fa-solid fa-phone" style={{"color": "var(--gold-light)", "marginRight": "8px"}}></i>{BRAND_CONFIG.homepage.phone}</li>
          <li><a href={BRAND_CONFIG.homepage.whatsapp} target="_blank" rel="noopener"><i className="fa-brands fa-whatsapp" style={{"color": "var(--gold-light)", "marginRight": "8px"}}></i>Order on WhatsApp</a></li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <span>© 2026 {BRAND_CONFIG.homepage.name}. All rights reserved.</span>
      <span>Design mockup by DailyRazor</span>
    </div>
  </div>
</footer>
{notice && <div role="status" className="home-notice">{notice}</div>}
</div>;
}
