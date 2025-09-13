import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    try {
      const token = window.localStorage.getItem("access_token");
      setIsAuthed(Boolean(token));
    } catch (_) {
      setIsAuthed(false);
    }
  }, []);

  const content = useMemo(
    () => ({
      brand: "AI Budget App",
      hero: {
        headline: "Take control of your money with AI",
        subhead:
          "Connect your bank accounts, auto-categorize transactions, and plan ‘what-if’ scenarios—all in one place.",
        primary: isAuthed ? "Go to Dashboard" : "Ready to try? Log in",
        primaryHref: isAuthed ? "/dashboard" : "/login",
        secondary: "Learn more",
        secondaryHref: "#features",
      },
      features: [
        {
          title: "Bank sync (Plaid)",
          desc: "Securely link accounts; real-time balances.",
          icon: "🔗",
        },
        {
          title: "Smart categorization",
          desc: "Override categories anytime.",
          icon: "🧠",
        },
        {
          title: "Transactions table",
          desc: "Filter by date, category, payment method.",
          icon: "📋",
        },
        {
          title: "Simulation mode",
          desc: "Try hypothetical payments without changing real balances.",
          icon: "🧪",
        },
        {
          title: "Dashboards",
          desc: "Spend by category; monthly income vs. expenses.",
          icon: "📊",
        },
        {
          title: "Balance logic by account",
          desc: "Credit cards increase with spend; checking uses available balance.",
          icon: "⚖️",
        },
      ],
      how: [
        {
          title: "Connect accounts",
          icon: "🔐",
          text: "Link via secure Plaid flow.",
        },
        {
          title: "Review & edit",
          icon: "✏️",
          text: "Tweak categories and details.",
        },
        {
          title: "Plan & track",
          icon: "🎯",
          text: "Simulate and monitor progress.",
        },
      ],
      security: {
        title: "Your data stays protected",
        body: "We use token-based authentication and read-only bank access through trusted aggregators (like Plaid). We follow pragmatic security best practices and avoid storing credentials.",
      },
      faq: [
        {
          q: "What banks are supported?",
          a: "Most major U.S. institutions are available through Plaid. You'll see supported options during account linking.",
        },
        {
          q: "Can I edit categories?",
          a: "Yes. AI suggests categories, and you can override them at any time.",
        },
        {
          q: "What is Simulation Mode?",
          a: "It lets you add future or hypothetical transactions (e.g., rent or a card payment) without affecting real balances, so you can forecast cash flow.",
        },
      ],
      footerLinks: [
        { href: "#", label: "Privacy" },
        { href: "#", label: "Terms" },
        { href: "#", label: "Contact" },
      ],
    }),
    [isAuthed]
  );

  const onSkipToContent = (e) => {
    e.preventDefault();
    const el = document.getElementById("main-content");
    if (el)
      el.focus({ preventScroll: true }),
        el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home" data-page="home">
      <a href="#main-content" className="skip" onClick={onSkipToContent}>
        Skip to content
      </a>

      <Nav brand={content.brand} />

      <header
        className="hero container hero--center"
        role="banner"
        aria-label="Hero"
      >
        <div className="hero__copy">
          <h1 className="hero__title">{content.hero.headline}</h1>
          <p className="hero__subtitle">{content.hero.subhead}</p>
          <div className="hero__cta">
            <Link
              to={content.hero.primaryHref}
              className="btn btn--primary"
              aria-label={content.hero.primary}
            >
              {content.hero.primary}
            </Link>
            <a
              href={content.hero.secondaryHref}
              className="btn btn--ghost"
              aria-label="Learn more: features section"
            >
              {content.hero.secondary}
            </a>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="main"
        aria-label="Main content"
      >
        <section
          className="hero__screenshot"
          aria-label="Feature preview image"
        >
          {/* Place feature.png in your Vite public/ folder so it resolves as /feature.png */}
          <img src="../assets/feature.png" alt="App features preview" />
        </section>
        <section
          id="features"
          className="features container"
          aria-labelledby="features-h"
        >
          <h2 id="features-h">Features</h2>
          <div className="grid">
            {content.features.map((f, i) => (
              <article key={i} className="card feature" aria-label={f.title}>
                <div className="feature__icon" aria-hidden>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="how container" aria-labelledby="how-h">
          <h2 id="how-h">How it works</h2>
          <div className="steps">
            {content.how.map((s, i) => (
              <div
                key={i}
                className="step card"
                role="group"
                aria-label={s.title}
              >
                <div className="step__icon" aria-hidden>
                  {s.icon}
                </div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="security"
          className="security container"
          aria-labelledby="security-h"
        >
          <h2 id="security-h">{content.security.title}</h2>
          <p className="muted">{content.security.body}</p>
        </section>

        <section id="faq" className="faq container" aria-labelledby="faq-h">
          <h2 id="faq-h">FAQ</h2>
          <div className="faq__list">
            {content.faq.map((item, i) => (
              <details key={i} className="card faq__item">
                <summary>
                  <strong>{item.q}</strong>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="cta container" aria-label="Call to action">
          <div className="card cta__card">
            <div>
              <h2>{isAuthed ? "Jump back in" : "Ready to try it?"}</h2>
              <p className="muted">
                {isAuthed
                  ? "You're already signed in on this device. Head to your dashboard to continue."
                  : "Log in and connect an account in under two minutes."}
              </p>
            </div>
            <div className="cta__buttons">
              <Link
                to={isAuthed ? "/dashboard" : "/login"}
                className="btn btn--primary"
              >
                {isAuthed ? "Go to Dashboard" : "Log in"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer links={content.footerLinks} />
    </div>
  );
}

function Nav({ brand }) {
  return (
    <nav className="nav" aria-label="Main navigation">
      <div className="container nav__row">
        {/* Replace /logo.svg with your logo file path */}
        <Link to="/" className="nav__brand" aria-label={`${brand} home`}>
          <img src="/logo.svg" alt="" className="nav__logo" />
          <span className="sr-only">{brand}</span>
        </Link>
        <div className="nav__links" role="menubar" aria-label="Primary">
          <a role="menuitem" href="#features">
            Features
          </a>
          <a role="menuitem" href="#how">
            How it works
          </a>
          <a role="menuitem" href="#security">
            Security
          </a>
          <a role="menuitem" href="#faq">
            FAQ
          </a>
          <Link role="menuitem" to="/login" className="btn btn--sm btn--ghost">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer({ links }) {
  return (
    <footer className="footer" aria-label="Footer">
      <div className="container footer__row">
        <span className="muted">
          © {new Date().getFullYear()} AI Budget App
        </span>
        <div className="footer__links" role="menubar" aria-label="Footer links">
          {links.map((l) => (
            <a role="menuitem" key={l.label} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
