"use client";

import React, { useState } from "react";

function toggleFeatureOpen(e: React.MouseEvent<HTMLLIElement>) {
  e.currentTarget.classList.toggle("open");
}

export default function PutsadLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Playfair+Display:ital@1&display=swap");

        :root {
          --primary-blue: #0f172a;
          --primary-blue-hover: #1e2e4a;
          --tech-blue: #113768;
          --tech-blue-hover: #0d2c52;
          --black: #000000;
          --white: #ffffff;
          --light-gray: #f5f5f7;
          --border: #e5e5e5;
          --green-check: #008000;
          --green-check-bright: #008000;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }

        body {
          font-family: "Inter", sans-serif;
          color: var(--black);
          background-color: var(--white);
          line-height: 1.5;
          overflow-x: hidden;
        }

        /* --- NAVIGATION --- */
        header {
          position: sticky;
          top: 0;
          width: 100%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          z-index: 1000;
          padding: 1.2rem 0;
          box-sizing: border-box;
        }

        .header-inner {
          width: min(1320px, calc(100% - 2.5rem));
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* PUNKT 1: Logo – byt src mot din logofil när du laddar upp den */
        .logo-img {
          height: 36px;
          width: auto;
          display: block;
        }

        /* Fallback om ingen bild laddas */
        .logo-fallback {
          font-weight: 800;
          font-size: 1.4rem;
          text-decoration: none;
          color: var(--black);
          letter-spacing: -1px;
        }

        nav ul {
          display: flex;
          list-style: none;
          gap: 2.8rem;
          align-items: center;
        }

        nav a {
          text-decoration: none;
          color: var(--black);
          font-weight: 500;
          font-size: 1rem;
          transition: color 0.2s;
        }

        nav ul li > a:not(.btn-cta) {
          position: relative;
          display: inline-block;
        }

        nav ul li > a:not(.btn-cta)::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 100%;
          height: 1px;
          background: var(--tech-blue);
          border-radius: 999px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        nav ul li > a:not(.btn-cta):hover::after {
          opacity: 1;
        }

        .nav-desktop {
          display: flex;
          align-items: center;
        }

        .header-mobile {
          display: none;
          align-items: center;
          gap: 0.65rem;
        }

        .nav-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          padding: 0;
          border: none;
          background: transparent;
          color: var(--black);
          cursor: pointer;
          border-radius: 10px;
          transition: background 0.2s ease;
        }

        .nav-toggle:hover {
          background: rgba(0, 0, 0, 0.06);
        }

        .nav-toggle svg {
          width: 24px;
          height: 24px;
        }

        .mobile-menu-panel {
          display: none;
          position: absolute;
          left: 0;
          right: 0;
          top: 100%;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
          z-index: 999;
        }

        .mobile-menu-panel.is-open {
          display: block;
        }

        .mobile-menu-inner {
          width: min(1320px, calc(100% - 2.5rem));
          margin: 0 auto;
          padding: 0.75rem 0 1.25rem;
        }

        .mobile-menu-panel ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .mobile-menu-panel li {
          text-align: center;
          border-bottom: 1px solid var(--black);
        }

        .mobile-menu-panel li:last-child {
          border-bottom: none;
        }

        .mobile-menu-panel a {
          display: block;
          padding: 1rem 0.75rem;
          text-decoration: none;
          text-align: center;
          color: var(--primary-blue);
          font-family: "Playfair Display", serif;
          font-style: italic;
          font-weight: 400;
          font-size: 1.4rem;
          line-height: 1.3;
        }

        .mobile-menu-panel a:hover {
          background: rgba(0, 0, 0, 0.03);
        }

        /* PUNKT 4: Alla knappar – enhetlig hover: lite ljusare färg, ingen scale */
        .btn-cta {
          background: var(--tech-blue);
          color: var(--white);
          padding: 0.8rem 3.4rem;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: background 0.2s ease;
          display: inline-block;
        }

        .btn-cta:hover {
          background: var(--tech-blue-hover);
          transform: none;
        }

        .hero-actions {
          margin-top: 2.1rem;
          display: flex;
          gap: 0.9rem;
          align-items: center;
        }

        .btn-outline {
          background: var(--white);
          color: var(--black);
          padding: 0.8rem 3.4rem;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          border: 1px solid var(--black);
          display: inline-block;
          transition: background 0.2s ease;
        }

        .btn-outline:hover {
          background: #f6f6f6;
        }

        /* --- HERO SECTION --- */
        .hero {
          display: grid;
          grid-template-columns: 1fr;
          width: min(1320px, calc(100% - 2.5rem));
          margin: 0 auto;
          padding: 130px 0 100px;
          align-items: center;
          gap: 4rem;
          min-height: 100vh;
        }

        .hero-text h1 {
          font-size: 3.6rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 1.1rem;
        }

        /* PUNKT 3: Dubbelt så stor, Playfair Display italic */
        .script-sub {
          font-family: "Playfair Display", serif;
          font-style: italic;
          font-size: 4.8rem;
          color: var(--primary-blue);
          display: block;
          line-height: 1.1;
        }

        .guarantee-note {
          font-family: "Playfair Display", serif;
          font-style: italic;
          font-size: 2rem;
          color: var(--primary-blue);
          display: block;
          margin-top: 0.8rem;
          line-height: 1.2;
        }

        .guarantee-note .highlight {
          font-size: 2.4rem;
        }

        .hero-always {
          margin-top: 0.6rem;
        }

        .hero-always-title {
          font-family: "Inter", sans-serif;
          font-weight: 600;
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .hero-always-list {
          font-family: "Inter", sans-serif;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          font-size: 1.12rem;
          color: #111;
        }

        .hero-always-list li {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }

        .hero-always-list .hero-step-num {
          font-weight: 800;
          flex: 0 0 2.75em;
          text-align: left;
        }

        /* --- KALKYLATOR --- */
        .calc-box {
          background: var(--white);
          border: 1px solid var(--border);
          padding: 2.5rem;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
        }

        .calc-placeholder {
          height: 250px;
          background: var(--light-gray);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 1.5rem 0;
          border: 2px dashed #ccc;
          color: #666;
        }

        /* PUNKT 4: CTA-knapp i kalkylatorn */
        .calc-box .btn-cta {
          width: 100%;
          border: none;
          cursor: pointer;
          padding: 1.2rem;
          font-size: 1rem;
          text-align: center;
        }

        /* --- REVIEWS --- */
        .google-strip {
          padding: 40px 5%;
          background: var(--light-gray);
          text-align: center;
        }

        .review-stars {
          color: #fab005;
          margin-right: 10px;
        }

        /* --- PACKAGES --- */
        .section-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 800;
          margin: 80px 0 0.5rem;
        }

        .section-intro {
          text-align: center;
          color: #666;
          font-size: 1rem;
          max-width: 36rem;
          margin: 0 auto 2.5rem;
          line-height: 1.5;
          padding: 0 1rem;
        }

        .package-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding: 0 5% 80px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .package-card {
          border: 1px solid var(--border);
          padding: 2.5rem;
          border-radius: 24px;
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
          position: relative;
        }

        .package-card:hover {
          border-color: var(--primary-blue);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        .package-card h3 {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
        }

        /* PUNKT 5: Feature list med gröna bockar, separatorlinjer, hover-mörkna, klick öppnar text */
        .feature-list {
          list-style: none;
        }

        .feature-list li {
          display: flex;
          align-items: center;
          font-weight: 500;
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid #1a1a1a20;
          cursor: pointer;
          transition: background 0.15s ease;
          border-radius: 6px;
          gap: 10px;
          flex-wrap: wrap;
        }

        .feature-list li:first-child {
          border-top: 1px solid #1a1a1a20;
        }

        .feature-list li:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        /* Grön bock */
        .feature-list li::before {
          content: "✓";
          color: var(--green-check);
          font-weight: 800;
          font-size: 1rem;
          flex-shrink: 0;
        }

        /* Dold expanderingstext per rad */
        .feature-detail {
          display: none;
          width: 100%;
          font-size: 0.82rem;
          font-weight: 400;
          color: #555;
          margin-top: 0.4rem;
          padding-left: 1.4rem;
          line-height: 1.5;
        }

        .feature-list li.open .feature-detail {
          display: block;
        }

        .feature-list li.open {
          background: rgba(0, 0, 0, 0.04);
        }

        .price-tag {
          display: block;
          margin-top: 2rem;
          font-weight: 800;
          font-size: 1.2rem;
        }

        .price-from {
          font-size: 0.8rem;
          font-weight: 400;
          color: #666;
        }

        /* --- COMPARISON SECTION --- */
        .comparison-section {
          background: transparent;
          color: var(--primary-blue);
          width: min(1320px, calc(100% - 2.5rem));
          margin: 2rem auto 2.5rem;
          padding: 0;
          text-align: center;
          border: none;
          border-radius: 0;
          box-shadow: none;
        }

        .comp-box {
          max-width: 800px;
          margin: 1.6rem auto 0;
          text-align: left;
        }

        .comp-bar-container {
          margin-bottom: 2rem;
        }

        .bar-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }

        .bar-bg {
          width: 100%;
          height: 24px;
          background: #cfdcf4;
          border-radius: 999px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: var(--tech-blue);
          border-radius: 999px;
          transition: width 1s ease;
        }

        /* --- FOOTER --- */
        footer {
          padding: 80px 5% 40px;
          border-top: 1px solid var(--border);
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 2rem;
        }

        .footer-logo {
          font-weight: 800;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }
        .footer-links {
          list-style: none;
        }
        .footer-links li {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }

        /* --- RESPONSIVE --- */
        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
            text-align: center;
            padding-top: 60px;
          }
          .hero-text h1 {
            font-size: 3rem;
          }
          .script-sub {
            font-size: 4rem;
          }
          .hero-actions {
            justify-content: center;
            flex-wrap: wrap;
          }
          .package-container {
            grid-template-columns: 1fr;
          }
          .comparison-section {
            margin: 1.5rem auto 2rem;
            width: calc(100% - 2rem);
          }
          .nav-desktop {
            display: none;
          }
          .header-mobile {
            display: flex;
          }
          footer {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }
      `}</style>

      <header>
        <div className="header-inner">
          <a
            href="#hem"
            className="logo-fallback"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800 }}
          >
            Moberg Fönsterputs
          </a>
          <nav className="nav-desktop" aria-label="Huvudmeny">
            <ul>
              <li>
                <a href="#hem">Hem</a>
              </li>
              <li>
                <a href="#paket">Beräkna pris</a>
              </li>
              <li>
                <a href="#paket">Detta ingår</a>
              </li>
              <li>
                <a href="#kontakt">Kontakt</a>
              </li>
              <li>
                <a href="#kontakt" className="btn-cta">
                  Boka puts
                </a>
              </li>
            </ul>
          </nav>
          <div className="header-mobile">
            <a href="#kontakt" className="btn-cta">
              Boka puts
            </a>
            <button
              type="button"
              className="nav-toggle"
              id="nav-toggle"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu-panel"
              aria-label={mobileMenuOpen ? "Stäng meny" : "Öppna meny"}
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <div
          className={`mobile-menu-panel${mobileMenuOpen ? " is-open" : ""}`}
          id="mobile-menu-panel"
          role="navigation"
          aria-label="Mobilmeny"
        >
          <div className="mobile-menu-inner">
            <ul>
              <li>
                <a
                  href="#hem"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hem
                </a>
              </li>
              <li>
                <a
                  href="#paket"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Beräkna pris
                </a>
              </li>
              <li>
                <a
                  href="#paket"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Detta ingår
                </a>
              </li>
              <li>
                <a
                  href="#kontakt"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kontakt
                </a>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="hem">
          <div className="hero-text">
            {/* PUNKT 3: "med rena fönster" i Playfair Display italic, dubbelt så stor */}
            <h1>
              Släpp in våren <span className="script-sub">med rena fönster</span>
            </h1>
            <div className="hero-always">
              <div className="hero-always-title">Smidigt till ett bra pris.</div>
              <ul className="hero-always-list">
                <li>
                  <span className="hero-step-num">1.</span> Boka online
                </li>
                <li>
                  <span className="hero-step-num">2.</span> Vi putsar
                </li>
                <li>
                  <span className="hero-step-num">3.</span> Du betalar
                </li>
              </ul>
            </div>
            <div className="hero-actions">
              <a href="#kontakt" className="btn-cta">
                Boka puts
              </a>
              <a href="#paket" className="btn-outline">
                Beräkna pris
              </a>
            </div>
            <span className="guarantee-note">
              <span className="highlight">100%</span> nöjdhetsgaranti
            </span>
          </div>
        </section>

        <section className="comparison-section">
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800 }}>
            Samma resultat, bättre pris.
          </h2>
          <p style={{ opacity: 0.8, marginTop: "1rem" }}>
            Med smarta system kapar vi kostnader som traditionella fönsterputsbolag har,
            vilket gör att vi kan ge våra kunder ett bättre pris.
          </p>

          <div className="comp-box">
            <div className="comp-bar-container">
              <div className="bar-label">
                <span>Vårt pris</span> <span>Marknadens snitt</span>
              </div>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: "75%" }} />
              </div>
            </div>
            <p
              style={{
                fontSize: "0.95rem",
                opacity: 0.5,
                textAlign: "center",
              }}
            >
              Vi är i snitt 20-30% billigare än traditionella fönsterputsbolag.
            </p>
          </div>
        </section>

        <section className="google-strip" id="recensioner">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "3rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <strong>&quot;Bästa jag testat!&quot;</strong> – Johan V.
            </div>
            <div>
              <strong>&quot;Sjukt smidigt.&quot;</strong> – Maria K.
            </div>
            <div>
              <strong>&quot;Bokade på mobilen.&quot;</strong> – Ahmed L.
            </div>
          </div>
        </section>

        <h2 className="section-title" id="paket">
          Våra Paket
        </h2>
        <p className="section-intro">
          Välj det paket som passar dig. Tryck på texten för mer info.
        </p>
        <div className="package-container">
          <div className="package-card">
            <h3>Standard</h3>
            {/* PUNKT 5: Gröna bockar, separatorlinjer, hover mörknar, klick öppnar text */}
            <ul className="feature-list">
              <li onClick={toggleFeatureOpen}>
                <span>Synligt rena fönster</span>
                <span className="feature-detail">
                  Vi putsar alla glasrutor inifrån och utifrån för kristallklar sikt och ett
                  fräscht intryck.
                </span>
              </li>
              <li onClick={toggleFeatureOpen}>
                <span>Rena fönsterkarmar</span>
                <span className="feature-detail">
                  Fönsterkarmarna avtorkas noggrant från damm, smuts och fläckar.
                </span>
              </li>
              <li onClick={toggleFeatureOpen}>
                <span>Rena fönsterbrädor</span>
                <span className="feature-detail">
                  Fönsterbrädorna sopas och torkas av för ett komplett helhetsintryck.
                </span>
              </li>
            </ul>
            <div className="price-tag">
              <span className="price-from">pris från</span> 495 kr
            </div>
          </div>

          <div className="package-card">
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "var(--tech-blue)",
                color: "white",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.7rem",
                fontWeight: 800,
              }}
            >
              Rekommenderas 1:a gången
            </div>
            <h3>Deep Clean</h3>
            <ul className="feature-list">
              <li onClick={toggleFeatureOpen}>
                <span>Allt i Standard</span>
                <span className="feature-detail">
                  Inkluderar all service från Standard-paketet: glas, karmar och
                  fönsterbrädor.
                </span>
              </li>
              <li onClick={toggleFeatureOpen}>
                <span>Hård smuts försvinner helt</span>
                <span className="feature-detail">
                  Med specialverktyg och professionella medel tar vi bort ingrodd smuts som
                  vanlig puts inte klarar.
                </span>
              </li>
              <li onClick={toggleFeatureOpen}>
                <span>Färgstänk försvinner helt</span>
                <span className="feature-detail">
                  Vi använder specialskrapor för att försiktigt ta bort färgrester och
                  silikonrester utan att skada glaset.
                </span>
              </li>
            </ul>
            <div className="price-tag">
              <span className="price-from">pris från</span> 895 kr
            </div>
          </div>
        </div>
      </main>

      <footer id="kontakt">
        <div>
          <div className="footer-logo">PUTSAD.</div>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            Modern fönsterputs för en ny generation husägare. Enkelhet i varje drag.
          </p>
        </div>
        <div>
          <h4 style={{ marginBottom: "1rem" }}>Meny</h4>
          <ul className="footer-links">
            <li>Hem</li>
            <li>Paket</li>
            <li>Villkor</li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: "1rem" }}>Kontakt</h4>
          <ul className="footer-links">
            <li>
              Email:{" "}
              <a href={"mailto:[email\u00a0protected]"}>
                {"[email\u00a0protected]"}
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
}
