"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<"brand" | "influencer" | null>(null);
  const [loading, setLoading] = useState<"brand" | "influencer" | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: brand } = await supabase
          .from("brands")
          .select("id")
          .eq("user_id", data.user.id)
          .single();
        setUserRole(brand ? "brand" : "influencer");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          setUserRole(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Direct OAuth sign-in — no redirect to /login page
  const signUpWith = async (role: "brand" | "influencer") => {
    setLoading(role);
    const callbackUrl = `${window.location.origin}/auth/callback?role=${role}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
    setLoading(null);
  };

  return (
    <div className="bg-white min-h-screen font-sans text-black">
      <style>{`
        @media (max-width: 768px) {
          .hero-h1 { font-size: 56px !important; line-height: 0.92 !important; }
          .hero-p { font-size: 18px !important; }
          .hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .hero-btns button { text-align: center !important; width: 100% !important; }
          .hero-search { max-width: 100% !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 16px 0 !important; }
          .stats-grid > div { border-right: none !important; border-bottom: 1px solid #f3f4f6 !important; padding-bottom: 16px !important; }
          .stats-grid > div:nth-child(odd) { border-right: 1px solid #f3f4f6 !important; }
          .stats-grid > div:last-child { border-bottom: none !important; }
          .big-statement h2 { font-size: 28px !important; line-height: 1.3 !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .steps-grid > div { border-right: none !important; border-bottom: 1px solid #f3f4f6 !important; }
          .steps-grid > div:last-child { border-bottom: none !important; }
          .sell-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .cta-h2 { font-size: 36px !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .footer-email { flex-direction: column !important; }
          .footer-email input { border-radius: 6px 6px 0 0 !important; }
          .footer-email button { border-radius: 0 0 6px 6px !important; padding: 12px !important; }
          .mobile-menu { display: flex !important; }
          .desktop-nav { display: none !important; }
          .navbar-inner { padding: 16px 20px !important; }
          .section-px { padding-left: 20px !important; padding-right: 20px !important; }
          .hero-section { padding-top: 48px !important; padding-bottom: 40px !important; padding-left: 20px !important; padding-right: 20px !important; }
        }
        .mobile-menu { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: white; border-bottom: 1px solid #f3f4f6; padding: 16px 20px; gap: 16px; z-index: 100; }
        .mobile-menu a { font-size: 16px; font-weight: 500; color: #374151; text-decoration: none; padding: 8px 0; border-bottom: 1px solid #f9fafb; }
        .mobile-menu a:last-child { border-bottom: none; }
        .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
        @media (max-width: 768px) {
          .hamburger { display: flex; flex-direction: column; gap: 5px; }
        }
        .signup-btn { display: flex; align-items: center; justify-content: center; gap: 12px; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; }
        .signup-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(0,0,0,0.2); border-top-color: #000; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        .spinner-white { border-color: rgba(255,255,255,0.3); border-top-color: #fff; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Zelteb", url: "https://zelteb.com", description: "Zelteb is the best platform to sell digital products, video courses, and digital downloads online — built for Indian creators.", potentialAction: { "@type": "SearchAction", target: "https://zelteb.com/discover?q={search_term_string}", "query-input": "required name=search_term_string" } }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "Zelteb", url: "https://zelteb.com", description: "Creator marketplace platform to sell digital products, video courses, and digital downloads online — free to start, no coding needed.", contactPoint: { "@type": "ContactPoint", email: "helpzelteb@gmail.com", contactType: "customer support" } }) }} />

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100" style={{ position: "sticky" }}>
        <div className="navbar-inner max-w-7xl mx-auto flex items-center justify-between px-8 py-5" style={{ position: "relative" }}>
          <Link href="/" className="text-3xl font-black tracking-tighter">
            Zelteb
          </Link>

          {/* Desktop nav */}
          <nav className="desktop-nav hidden md:flex gap-10 text-[15px] font-medium text-gray-600">
            <Link href="/discover" className="hover:text-black">Discover</Link>
            <Link href="/pricing" className="hover:text-black">Pricing</Link>
            <Link href="/purchased" className="hover:text-black">Purchased</Link>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user ? (
              <Link href={userRole === "brand" ? "/brand/dashboard" : "/dashboard"} className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 transition-all">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 transition-all">
                Login
              </Link>
            )}
            {/* Hamburger */}
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span style={{ width: 22, height: 2, background: "#000", borderRadius: 2, display: "block", transition: "all 0.2s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
              <span style={{ width: 22, height: 2, background: "#000", borderRadius: 2, display: "block", transition: "all 0.2s", opacity: menuOpen ? 0 : 1 }} />
              <span style={{ width: 22, height: 2, background: "#000", borderRadius: 2, display: "block", transition: "all 0.2s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu" style={{ display: "flex" }}>
            <Link href="/discover" onClick={() => setMenuOpen(false)}>Discover</Link>
            <Link href="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <Link href="/purchased" onClick={() => setMenuOpen(false)}>Purchased</Link>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="hero-section text-center pt-32 pb-24 px-6">
        <div className="inline-block bg-gray-50 border border-gray-200 rounded-full px-5 py-2 text-sm font-semibold text-gray-600 mb-8 tracking-wide">
          The best digital marketplace for Indian creators
        </div>
        <h1 className="hero-h1 text-[64px] md:text-[100px] font-bold leading-[0.88] tracking-tighter max-w-4xl mx-auto">
          Go from 0 to{" "}
          <span className="underline decoration-[#f398e4] decoration-[6px] underline-offset-4">
            earning
          </span>
        </h1>
        <p className="hero-p mt-10 max-w-xl mx-auto text-xl md:text-2xl text-gray-500 leading-relaxed">
          The easiest platform to{" "}
          <strong className="text-gray-700">sell digital products online</strong> —
          videos, PDFs, and digital files delivered instantly to your audience
        </p>

        <div className="hero-btns mt-12 flex justify-center gap-4 flex-wrap">
          {user ? (
            <Link href={userRole === "brand" ? "/brand/dashboard" : "/dashboard"} className="px-10 py-4 bg-black text-white rounded-2xl text-lg font-bold hover:bg-gray-800 transition-all">
              Go to dashboard
            </Link>
          ) : (
            <>
              {/* Sign up as Brand — directly triggers Google OAuth for brand role */}
              <button
                onClick={() => signUpWith("brand")}
                disabled={loading !== null}
                className="signup-btn px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl text-lg font-bold hover:border-gray-900 transition-all"
              >
                {loading === "brand" ? (
                  <div className="spinner" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{loading === "brand" ? "Signing in..." : "Sign up as a Brand"}</span>
                {loading !== "brand" && <span>→</span>}
              </button>

              {/* Sign up as Creator — directly triggers Google OAuth for influencer role */}
              <button
                onClick={() => signUpWith("influencer")}
                disabled={loading !== null}
                className="signup-btn px-8 py-4 bg-[#f5ff4e] border-2 border-[#f5ff4e] rounded-2xl text-lg font-bold hover:bg-[#eeff00] hover:border-[#eeff00] transition-all text-black"
              >
                {loading === "influencer" ? (
                  <div className="spinner" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{loading === "influencer" ? "Signing in..." : "Sign up as a Creator"}</span>
                {loading !== "influencer" && <span>→</span>}
              </button>
            </>
          )}
        </div>

        {/* SEARCH */}
        <div className="mt-8 flex justify-center px-4">
          <div className="hero-search flex items-center border-2 border-gray-100 rounded-2xl px-5 py-4 w-full max-w-[420px] bg-gray-50/50">
            <input
              className="flex-1 bg-transparent outline-none text-lg placeholder:text-gray-400"
              placeholder="Search marketplace..."
            />
            <span className="text-xl">🔍</span>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-t border-b border-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-8 section-px">
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-0">
            <div className="text-center px-6 border-r border-gray-100">
              <div className="text-4xl md:text-5xl font-bold tracking-tighter">450<span className="text-[#f398e4]">+</span></div>
              <div className="text-gray-500 mt-1 text-sm font-medium">Creators</div>
            </div>
            <div className="text-center px-6 border-r border-gray-100">
              <div className="text-4xl md:text-5xl font-bold tracking-tighter">₹10<span className="text-[#f398e4]">L+</span></div>
              <div className="text-gray-500 mt-1 text-sm font-medium">Distributed to creators</div>
            </div>
            <div className="text-center px-6 border-r border-gray-100">
              <div className="text-4xl md:text-5xl font-bold tracking-tighter">2k<span className="text-[#f398e4]">+</span></div>
              <div className="text-gray-500 mt-1 text-sm font-medium">Products sold</div>
            </div>
            <div className="text-center px-6">
              <div className="text-4xl md:text-5xl font-bold tracking-tighter">100<span className="text-[#f398e4]">%</span></div>
              <div className="text-gray-500 mt-1 text-sm font-medium">Free to start</div>
            </div>
          </div>
        </div>
      </section>

      {/* BIG STATEMENT */}
      <section className="big-statement py-32 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-8 section-px text-center">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            Zelteb is the{" "}
            <span className="underline decoration-[#f398e4] decoration-4 underline-offset-8">all-in-one</span>{" "}
            creator marketplace platform that helps Indian creators{" "}
            <strong>earn money selling video courses</strong> and digital products online — without{" "}
            <span className="line-through text-gray-300 decoration-4">
              messy checkouts, multiple tools, or wasted setup time
            </span>.
          </h2>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-32 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-8 section-px">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Upload and sell videos online in 3 steps
            </h2>
            <p className="text-gray-400 mt-3 text-lg">No coding needed. No complicated setup.</p>
          </div>
          <div className="steps-grid grid md:grid-cols-3 gap-0 border border-gray-100 rounded-2xl overflow-hidden">
            <div className="p-10 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="text-4xl font-black text-gray-100 mb-6">01</div>
              <h3 className="text-xl font-bold mb-3">Create your account</h3>
              <p className="text-gray-500 leading-relaxed">Sign up in seconds. No credit card required. Your store is ready instantly.</p>
            </div>
            <div className="p-10 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="text-4xl font-black text-gray-100 mb-6">02</div>
              <h3 className="text-xl font-bold mb-3">Upload your digital product</h3>
              <p className="text-gray-500 leading-relaxed">Upload a video, PDF, or file. Add a title, description, thumbnail, and set your price in INR.</p>
            </div>
            <div className="p-10">
              <div className="text-4xl font-black text-gray-100 mb-6">03</div>
              <h3 className="text-xl font-bold mb-3">Share & get paid</h3>
              <p className="text-gray-500 leading-relaxed">Share your product link anywhere. Buyers pay and get instant access. You get paid directly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU CAN SELL */}
      <section className="py-32 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-8 section-px">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">What you can sell</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Any digital product or downloadable file
            </h2>
          </div>
          <div className="sell-grid grid md:grid-cols-3 gap-6">
            {[
              { title: "Videos & Courses", desc: "Tutorials, masterclasses, workout videos, cooking guides — if you can teach it, sell it as a video course online.", tag: "Most popular" },
              { title: "PDFs & Ebooks", desc: "Guides, templates, planners, workbooks, research reports — sell your knowledge as a digital download.", tag: "" },
              { title: "Files & Resources", desc: "Presets, design files, code snippets, spreadsheets — sell digital assets your audience actually needs.", tag: "" },
            ].map((item) => (
              <div key={item.title} className="p-8 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                {item.tag && (
                  <span className="inline-block bg-black text-white text-xs font-bold px-3 py-1 rounded-full mb-4">{item.tag}</span>
                )}
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-32 border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-8 section-px">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Everything you need</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              The online platform for creators in India
            </h2>
          </div>
          <div className="features-grid grid md:grid-cols-2 gap-6">
            {[
              { title: "INR payments", desc: "Accept payments directly in Indian Rupees. No currency conversion, no hidden fees." },
              { title: "Instant delivery", desc: "Buyers get instant access to their purchase. Automatic download links, always." },
              { title: "Secure file storage", desc: "Your files are stored securely and only accessible by people who have purchased." },
              { title: "Ratings & reviews", desc: "Build trust with your audience through verified buyer ratings on every product." },
              { title: "Creator profile page", desc: "Your own public profile page to showcase all your products in one place." },
              { title: "Zero setup cost", desc: "Free to create an account and list your first product. Pay only when you earn." },
            ].map((f) => (
              <div key={f.title} className="flex gap-5 p-6 bg-white border border-gray-100 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-[#f398e4] mt-2.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-lg mb-1">{f.title}</h4>
                  <p className="text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-8 section-px">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Creators love Zelteb</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Real people, real earnings</h2>
          </div>
          <div className="testimonials-grid grid md:grid-cols-3 gap-6">
            {[
              { name: "Arjun S", role: "Video creator", quote: "I made my first ₹5,000 online within a week of joining Zelteb. The setup took me 10 minutes." },
              { name: "Priya M", role: "Design educator", quote: "Finally a platform that actually works for Indian creators. INR payments, simple dashboard — love it." },
              { name: "Rohit K", role: "Fitness coach", quote: "I sell my workout plans here and it just works. Buyers get instant access and I get paid fast." },
            ].map((t) => (
              <div key={t.name} className="p-8 border border-gray-100 rounded-2xl">
                <div className="flex gap-1 mb-5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#f398e4" stroke="#f398e4" strokeWidth="1">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-gray-400 text-sm">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO TEXT BLOCK */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-8 section-px text-center">
          <p className="text-gray-400 text-base leading-relaxed">
            Zelteb is a <strong className="text-gray-600">digital product marketplace</strong> built for creators who want to{" "}
            <strong className="text-gray-600">monetize digital content</strong> without the hassle.
            Whether you want to <strong className="text-gray-600">sell video courses online</strong>,{" "}
            <strong className="text-gray-600">sell digital downloads</strong>, or find the{" "}
            <strong className="text-gray-600">best platform to sell digital products in India</strong> —
            Zelteb gives you everything you need in one place.
            It's the <strong className="text-gray-600">platform to sell digital goods globally</strong>,
            starting from India.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 border-b border-gray-100 text-center px-8 section-px">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Ready?</p>
        <h2 className="cta-h2 text-5xl md:text-7xl font-bold tracking-tighter mb-8 max-w-3xl mx-auto leading-tight">
          Your first sale is closer than you think.
        </h2>
        <p className="text-gray-500 text-xl max-w-xl mx-auto mb-12">
          Join 450+ creators already earning on Zelteb. Free to start, no credit card needed.
        </p>
        {user ? (
          <Link href={userRole === "brand" ? "/brand/dashboard" : "/dashboard"} className="inline-block px-12 py-5 bg-black text-white rounded-2xl text-xl font-bold hover:bg-gray-800 transition-all">
            Go to dashboard
          </Link>
        ) : (
          <button
            onClick={() => signUpWith("influencer")}
            disabled={loading !== null}
            className="signup-btn inline-flex px-12 py-5 bg-black text-white rounded-2xl text-xl font-bold hover:bg-gray-800 transition-all"
          >
            {loading === "influencer" ? <div className="spinner spinner-white" /> : null}
            <span>{loading === "influencer" ? "Signing in..." : "Start selling for free"}</span>
          </button>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white py-24">
        <div className="footer-grid max-w-7xl mx-auto px-8 section-px grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight max-w-md">
              Subscribe to get tips and tactics to grow the way you want.
            </h2>
            <div className="footer-email mt-10 flex max-w-lg bg-white rounded-md overflow-hidden p-1">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 text-black outline-none text-lg"
              />
              <button className="px-6 py-3 bg-[#f398e4] hover:bg-[#ef7cdb] text-black transition-colors flex items-center justify-center rounded-sm">
                <span className="text-2xl">→</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-20 gap-y-6 pt-2">
            <div className="flex flex-col space-y-5 text-lg font-medium">
              <Link href="/discover" className="hover:text-gray-400">Discover</Link>
              <Link href="/pricing" className="hover:text-gray-400">Pricing</Link>
              <Link href="/about" className="hover:text-gray-400">About</Link>
            </div>
            <div className="flex flex-col space-y-5 text-lg font-medium">
              <Link href="/help" className="hover:text-gray-400">Contact us</Link>
              <Link href="/terms" className="hover:text-gray-400">Terms of Service</Link>
              <Link href="/priv" className="hover:text-gray-400">Privacy Policy</Link>
              <Link href="/faq" className="hover:text-gray-400">FAQ section</Link>
              <Link href="/zelteb-employees" className="hover:text-gray-400">Zelteb Employees</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}