"use client";

export default function AboutPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; }

        .about-wrap {
          font-family: 'DM Sans', sans-serif;
          background: #fff;
          min-height: 100vh;
          color: #18181b;
        }

        /* NAV */
        .about-nav {
          background: white;
          border-bottom: 1px solid #e4e4e7;
          padding: 0 40px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .about-nav-logo {
          font-size: 1.2rem;
          color: #18181b;
          text-decoration: none;
          font-weight: 800;
        }
        .about-nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .about-nav-links a {
          font-size: 14px;
          font-weight: 500;
          color: #52525b;
          text-decoration: none;
          transition: color 0.15s;
        }
        .about-nav-links a:hover { color: #18181b; }
        .about-nav-cta {
          background: #e91e8c;
          color: white !important;
          padding: 7px 18px;
          border-radius: 8px;
          font-weight: 600 !important;
          font-size: 13px !important;
          transition: background 0.15s !important;
        }
        .about-nav-cta:hover { background: #c2185b !important; color: white !important; }

        /* HERO */
        .about-hero {
          text-align: center;
          padding: 80px 24px 64px;
          max-width: 680px;
          margin: 0 auto;
        }
        .about-hero-badge {
          display: inline-block;
          background: #fdf2f8;
          color: #e91e8c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 999px;
          margin-bottom: 20px;
          border: 1px solid #fce7f3;
        }
        .about-hero h1 {
          font-size: 2.6rem;
          font-weight: 800;
          color: #18181b;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 18px;
        }
        .about-hero h1 span {
          color: #e91e8c;
        }
        .about-hero p {
          font-size: 1rem;
          color: #52525b;
          line-height: 1.75;
          max-width: 520px;
          margin: 0 auto;
        }

        /* DIVIDER */
        .about-divider {
          height: 1px;
          background: #f0f0f2;
          max-width: 880px;
          margin: 0 auto;
        }

        /* MISSION */
        .about-mission {
          max-width: 880px;
          margin: 0 auto;
          padding: 64px 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .about-mission-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #e91e8c;
          margin-bottom: 12px;
        }
        .about-mission h2 {
          font-size: 1.8rem;
          font-weight: 800;
          color: #18181b;
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
        }
        .about-mission p {
          font-size: 0.95rem;
          color: #52525b;
          line-height: 1.8;
        }
        .about-mission-visual {
          background: linear-gradient(135deg, #fdf2f8 0%, #ede9fe 100%);
          border-radius: 20px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .about-mission-stat {
          background: white;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 1px 8px rgba(0,0,0,0.06);
        }
        .about-mission-stat-num {
          font-size: 1.8rem;
          font-weight: 800;
          color: #18181b;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 4px;
        }
        .about-mission-stat-num span { color: #e91e8c; }
        .about-mission-stat-label {
          font-size: 13px;
          color: #71717a;
          font-weight: 500;
        }

        /* VALUES */
        .about-values {
          background: #fafafa;
          border-top: 1px solid #f0f0f2;
          border-bottom: 1px solid #f0f0f2;
          padding: 64px 24px;
        }
        .about-values-inner { max-width: 880px; margin: 0 auto; }
        .about-values-header {
          text-align: center;
          margin-bottom: 44px;
        }
        .about-values-header .label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #e91e8c;
          margin-bottom: 10px;
        }
        .about-values-header h2 {
          font-size: 1.8rem;
          font-weight: 800;
          color: #18181b;
          letter-spacing: -0.02em;
        }
        .about-values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .about-value-card {
          background: white;
          border: 1px solid #e4e4e7;
          border-radius: 16px;
          padding: 28px 24px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .about-value-card:hover {
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
        .about-value-icon {
          font-size: 1.8rem;
          margin-bottom: 14px;
        }
        .about-value-card h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #18181b;
          margin-bottom: 8px;
        }
        .about-value-card p {
          font-size: 0.875rem;
          color: #71717a;
          line-height: 1.7;
        }

        /* STORY */
        .about-story {
          max-width: 640px;
          margin: 0 auto;
          padding: 64px 24px;
          text-align: center;
        }
        .about-story .label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #e91e8c;
          margin-bottom: 12px;
        }
        .about-story h2 {
          font-size: 1.8rem;
          font-weight: 800;
          color: #18181b;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
        }
        .about-story p {
          font-size: 0.95rem;
          color: #52525b;
          line-height: 1.85;
          margin-bottom: 16px;
        }

        /* CTA */
        .about-cta {
          background: #18181b;
          padding: 64px 24px;
          text-align: center;
        }
        .about-cta h2 {
          font-size: 1.8rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
          margin-bottom: 10px;
        }
        .about-cta p {
          font-size: 0.95rem;
          color: #a1a1aa;
          margin-bottom: 28px;
        }
        .about-cta-btns {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .about-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #e91e8c;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 13px 28px;
          border-radius: 10px;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, transform 0.1s;
        }
        .about-cta-primary:hover { background: #c2185b; transform: translateY(-1px); }
        .about-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 13px 28px;
          border-radius: 10px;
          text-decoration: none;
          border: 1px solid #3f3f46;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s, background 0.15s;
        }
        .about-cta-secondary:hover { border-color: #71717a; background: #27272a; }

        /* COMPACT FOOTER */
        .about-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 16px 24px;
          border-top: 1px solid #f0f0f0;
          font-family: 'DM Sans', sans-serif;
        }
        .about-footer-sell {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #2563eb;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .about-footer-sell:hover { opacity: 0.75; }
        .about-footer-dot { color: #d1d5db; font-size: 12px; }
        .about-footer-powered { font-size: 14px; color: #9ca3af; font-weight: 500; }
        .about-footer-powered a {
          color: #111;
          font-weight: 800;
          text-decoration: none;
          font-size: 15px;
          letter-spacing: -0.02em;
          transition: opacity 0.15s;
        }
        .about-footer-powered a:hover { opacity: 0.7; }

        @media (max-width: 700px) {
          .about-hero h1 { font-size: 1.9rem; }
          .about-mission { grid-template-columns: 1fr; gap: 36px; }
          .about-values-grid { grid-template-columns: 1fr; }
          .about-nav { padding: 0 20px; }
          .about-nav-links { display: none; }
        }
      `}</style>

      <div className="about-wrap">

        {/* NAV */}
        <nav className="about-nav">
          <a href="/" className="about-nav-logo">Zelteb</a>
          <div className="about-nav-links">
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/login" className="about-nav-cta">Get Started</a>
          </div>
        </nav>

        {/* HERO */}
        <section className="about-hero">
          <div className="about-hero-badge">About Us</div>
          <h1>Built for <span>Indian creators</span> who deserve more</h1>
          <p>
            Zelteb is a platform that lets creators sell digital products directly to their audience — videos, files, courses, and more. No middlemen. No complexity. Just you and your buyers.
          </p>
        </section>

        <div className="about-divider" />

        {/* MISSION */}
        <section className="about-mission">
          <div>
            <div className="about-mission-label">Our Mission</div>
            <h2>Empowering every creator to earn online</h2>
            <p>
              We believe anyone with knowledge, a skill, or a passion should be able to monetize it. Zelteb was built to remove every barrier — no tech skills needed, no high fees, no complicated setup.
            </p>
            <br />
            <p>
              Whether you're a teacher, designer, filmmaker, or fitness coach — if you create value, Zelteb helps you get paid for it.
            </p>
          </div>
          <div className="about-mission-visual">
            <div className="about-mission-stat">
              <div className="about-mission-stat-num">100<span>%</span></div>
              <div className="about-mission-stat-label">Free to start — no setup fees</div>
            </div>
        
            <div className="about-mission-stat">
              <div className="about-mission-stat-num">24<span>/7</span></div>
              <div className="about-mission-stat-label">Your store is always open</div>
            </div>
          </div>
        </section>

        <div className="about-divider" />

        {/* VALUES */}
        <section className="about-values">
          <div className="about-values-inner">
            <div className="about-values-header">
              <div className="label">What We Stand For</div>
              <h2>Our values</h2>
            </div>
            <div className="about-values-grid">
              <div className="about-value-card">
                <div className="about-value-icon">🇮🇳</div>
                <h3>Made for India</h3>
                <p>Built with INR pricing, UPI-friendly payments, and the Indian creator economy in mind from day one.</p>
              </div>
              <div className="about-value-card">
                <div className="about-value-icon">⚡</div>
                <h3>Simple by design</h3>
                <p>No bloated dashboards. No confusing settings. Upload your product, set a price, share your link — done.</p>
              </div>
              <div className="about-value-card">
                <div className="about-value-icon">🔒</div>
                <h3>Secure & reliable</h3>
                <p>Your products and your buyers' payments are protected with industry-standard security at every step.</p>
              </div>
              <div className="about-value-card">
                <div className="about-value-icon">💸</div>
                <h3>Fair pricing</h3>
                <p>We keep our fees low so creators keep more of what they earn. Your success is our success.</p>
              </div>
              <div className="about-value-card">
                <div className="about-value-icon">🤝</div>
                <h3>Creator-first</h3>
                <p>Every feature we build starts with one question: does this help creators earn more and grow faster?</p>
              </div>
              <div className="about-value-card">
                <div className="about-value-icon">🚀</div>
                <h3>Always improving</h3>
                <p>We ship fast, listen to feedback, and continuously improve so you always have the best tools available.</p>
              </div>
            </div>
          </div>
        </section>

        {/* STORY */}
        <section className="about-story">
          <div className="label">Our Story</div>
          <h2>Why we built Zelteb</h2>
          <p>
            We saw talented creators struggling to sell their work online. Existing platforms were either too expensive, too complex, or simply not built for the Indian market.
          </p>
          <p>
            So we built Zelteb — a dead-simple way to sell digital products, collect payments in INR, and grow an audience. No monthly fees to get started. No unnecessary hoops to jump through.
          </p>
          <p>
            Today, Zelteb is home to creators across India selling videos, templates, courses, and more — earning on their own terms.
          </p>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <h2>Ready to start selling?</h2>
          <p>Join creators already earning on Zelteb. It's free to get started.</p>
          <div className="about-cta-btns">
            <a href="/login" className="about-cta-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Start selling for free
            </a>
            <a href="/" className="about-cta-secondary">Browse products</a>
          </div>
        </section>

        {/* COMPACT FOOTER */}
        <div className="about-footer">
          <a href="/login" className="about-footer-sell">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Sell your own product
          </a>
          <span className="about-footer-dot">·</span>
          <span className="about-footer-powered">
            Powered by{" "}
            <a href="https://zelteb.com" target="_blank" rel="noopener noreferrer">
              Zelteb
            </a>
          </span>
        </div>

      </div>
    </>
  );
}