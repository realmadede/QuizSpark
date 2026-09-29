import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuizSpark: Real-Time Classroom Quizzes That Spark Curiosity" },
      {
        name: "description",
        content:
          "QuizSpark lets teachers run live, real-time quiz games that students join instantly with a PIN. No accounts needed. Leaderboards, confetti, and pure fun.",
      },
      {
        property: "og:title",
        content: "QuizSpark: Real-Time Classroom Quizzes That Spark Curiosity",
      },
      {
        property: "og:description",
        content:
          "Run live quiz games for your class. Students join with a PIN. Leaderboards, confetti and learning made fun.",
      },
    ],
  }),
  component: LandingPage,
});

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    title: "Real-Time Sync",
    desc: "Questions push to every device the instant you trigger them. Zero lag, zero dropped players.",
  },
  {
    title: "Live Leaderboard",
    desc: "Rankings update after every question, keeping every player on the edge of their seat.",
  },
  {
    title: "Auto-Advance Mode",
    desc: "Set a timer and let the game run itself, or keep full manual control of the pace.",
  },
  {
    title: "Multiple Formats",
    desc: "Mix Multiple Choice and True/False questions with custom per-question timers.",
  },
  {
    title: "Podium & Confetti",
    desc: "A cinematic 3-tier podium with confetti showers crowns the winners in style.",
  },
  {
    title: "Secure by Design",
    desc: "Full email verification, secure password reset, and JWT-protected teacher sessions.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create your quiz",
    desc: "Build a quiz from your dashboard with multiple choice or true/false questions. Publish when ready.",
  },
  {
    step: "02",
    title: "Start a session",
    desc: "Hit 'Host' and share the 6-digit Game PIN with your class, on screen or via a QR code.",
  },
  {
    step: "03",
    title: "Play live",
    desc: "Students join on any mobile browser. Watch the leaderboard heat up in real time.",
  },
];

const comparisons = [
  { feature: "Free to use", quizspark: true, kahoot: false, quizizz: false },
  {
    feature: "No student accounts needed",
    quizspark: true,
    kahoot: true,
    quizizz: false,
  },
  { feature: "Self-hostable", quizspark: true, kahoot: false, quizizz: false },
  {
    feature: "Real-time WebSocket sync",
    quizspark: true,
    kahoot: true,
    quizizz: true,
  },
  {
    feature: "QR code game join",
    quizspark: true,
    kahoot: true,
    quizizz: true,
  },
  {
    feature: "Podium & confetti finish",
    quizspark: true,
    kahoot: true,
    quizizz: false,
  },
  {
    feature: "Auto-advance timer mode",
    quizspark: true,
    kahoot: false,
    quizizz: true,
  },
  { feature: "Open source", quizspark: true, kahoot: false, quizizz: false },
];

const faqs = [
  {
    q: "Is QuizSpark really free?",
    a: "Yes, completely free. No credit card, no trial period, no hidden tiers. We built this for education.",
  },
  {
    q: "Do students need to create an account?",
    a: "No. Students enter a 6-digit Game PIN and a nickname and they're instantly in the game. Zero friction.",
  },
  {
    q: "What devices do students need?",
    a: "Any modern mobile browser works: Android, iPhone, tablets. No app download required.",
  },
  {
    q: "How many students can join one game?",
    a: "We have tested sessions with 100+ concurrent players. For most classrooms you will never hit a limit.",
  },
  {
    q: "Can I reuse quizzes across sessions?",
    a: "Yes. Once a quiz is published you can host as many live sessions from it as you like, any time.",
  },
  {
    q: "Is my quiz data safe?",
    a: "All teacher sessions use JWT authentication with email verification. Your quiz data is stored securely in a PostgreSQL database.",
  },
];

const techStack = [
  { name: "React 19", color: "#61dafb" },
  { name: "Node.js", color: "#68a063" },
  { name: "Socket.io", color: "#010101" },
  { name: "PostgreSQL", color: "#336791" },
  { name: "Prisma", color: "#2D3748" },
  { name: "TailwindCSS", color: "#38bdf8" },
];

// ─── FAQ accordion item ────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "faq-open" : ""}`}>
      <button className="faq-q" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          className={`faq-chevron ${open ? "faq-chevron-open" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && <p className="faq-a">{a}</p>}
    </div>
  );
}

// ─── Comparison check/cross ────────────────────────────────────────────────────
function Check() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#00c767"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function Cross() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#d4d4d4"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 6 6 18M6 6l12 12"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing-root">
      <div className="landing-bg" aria-hidden />
      <div className="orb orb-1" aria-hidden />
      <div className="orb orb-2" aria-hidden />
      <div className="orb orb-3" aria-hidden />

      {/* ════ NAV ════ */}
      <nav className="landing-nav glass-nav">
        <div className="nav-inner">
          <span className="nav-logo">QuizSpark</span>
          <div className="nav-links">
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#how" className="nav-link">
              How it works
            </a>
            <a href="#pricing" className="nav-link">
              Pricing
            </a>
            <a href="#faq" className="nav-link">
              FAQ
            </a>
            <Link to={user ? "/dashboard" : "/auth"} className="nav-cta">
              {user ? "Go to Dashboard" : "Teacher Login"}
            </Link>
          </div>
        </div>
      </nav>

      {/* ════ HERO ════ */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="badge-dot" />
          Live · Real-time · Zero sign-up for students
        </div>

        <h1 className="hero-title">
          Learning that
          <br />
          <span className="hero-gradient-text">sparks competition.</span>
        </h1>

        <p className="hero-sub">
          QuizSpark turns any classroom into a live quiz arena. Teachers host,
          students join with a PIN, and everyone fights for the leaderboard. No
          friction. Just fun.
        </p>

        <div className="hero-actions">
          <Link to="/auth" className="btn-primary">
            Start for free
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
          <Link to="/join" className="btn-ghost">
            Join a game
          </Link>
        </div>

        {/* Mock quiz card */}
        <div className="hero-card glass-card">
          <div className="mock-header">
            <span className="mock-dot red" />
            <span className="mock-dot amber" />
            <span className="mock-dot green" />
            <span className="mock-bar" />
          </div>
          <div className="mock-body">
            <div className="mock-question">
              What year did the Moon Landing occur?
            </div>
            <div className="mock-options">
              {["1965", "1969", "1972", "1975"].map((opt, i) => (
                <div
                  key={opt}
                  className={`mock-option opt-color-${i} ${i === 1 ? "mock-option-selected" : ""}`}
                >
                  {opt}
                </div>
              ))}
            </div>
            <div className="mock-players">
              {["Foxie", "Robo", "Leo", "Panda"].map((p) => (
                <span key={p} className="mock-chip">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ TEACHER VS STUDENT SPLIT ════ */}
      <section className="split-section">
        <div className="split-inner">
          <div className="split-card split-teacher glass-card">
            <div className="split-role-badge split-role-teacher">
              For Teachers
            </div>
            <h3 className="split-title">Host a game in seconds</h3>
            <ul className="split-list">
              <li>Create quizzes from a clean dashboard</li>
              <li>Publish and host with one click</li>
              <li>Share a 6-digit PIN or QR code</li>
              <li>Control the pace manually or auto-advance</li>
              <li>See live accuracy and rankings per question</li>
              <li>End with a dramatic podium reveal</li>
            </ul>
            <Link to="/auth" className="btn-primary split-btn">
              Create your first quiz
            </Link>
          </div>

          <div className="split-divider" aria-hidden>
            <span className="split-divider-label">vs</span>
          </div>

          <div className="split-card split-student glass-card">
            <div className="split-role-badge split-role-student">
              For Students
            </div>
            <h3 className="split-title">Jump in, no fuss</h3>
            <ul className="split-list">
              <li>No app download, no account needed</li>
              <li>Works on any phone or tablet browser</li>
              <li>Enter a PIN and nickname to join</li>
              <li>Answer questions as they appear live</li>
              <li>See your rank on the leaderboard instantly</li>
              <li>Compete for the top spot on the podium</li>
            </ul>
            <Link to="/join" className="btn-ghost split-btn">
              Join a live game
            </Link>
          </div>
        </div>
      </section>

      {/* ════ FEATURES ════ */}
      <section id="features" className="features-section">
        <div className="section-label">Features</div>
        <h2 className="section-title">
          Everything you need to run a killer quiz
        </h2>
        <p className="section-sub">
          Built for educators who care about engagement, not setup complexity.
        </p>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card glass-card">
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════ DEMO SCREEN ════ */}
      <section className="demo-section">
        <div className="demo-inner">
          <div className="demo-text">
            <div className="section-label">See it in action</div>
            <h2 className="section-title" style={{ marginBottom: "1rem" }}>
              What it looks like when it clicks
            </h2>
            <p className="demo-desc">
              A live game runs across three screens simultaneously: the teacher
              hosts from their laptop, students answer on phones, and a
              projector screen shows everyone the leaderboard in real time.
            </p>
            <ul className="demo-bullets">
              <li>Questions appear instantly on every device</li>
              <li>Correct answers light up with color</li>
              <li>Rankings shift live between questions</li>
              <li>Podium and confetti fire at the end</li>
            </ul>
            <Link
              to="/auth"
              className="btn-primary"
              style={{ marginTop: "1.5rem" }}
            >
              Try it yourself
            </Link>
          </div>

          <div className="demo-screens">
            <div className="demo-screen demo-screen-back glass-card">
              <div className="demo-screen-label">Projector</div>
              <div className="demo-leaderboard">
                <div className="demo-lb-title">Live Leaderboard</div>
                {[
                  "Leo - 1,200 pts",
                  "Robo - 950 pts",
                  "Foxie - 880 pts",
                  "Panda - 710 pts",
                ].map((row, i) => (
                  <div
                    key={row}
                    className="demo-lb-row"
                    style={{ opacity: 1 - i * 0.15 }}
                  >
                    <span className="demo-lb-rank">#{i + 1}</span>
                    <span>{row}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="demo-screen demo-screen-front glass-card">
              <div className="demo-screen-label">Student phone</div>
              <div className="demo-phone-q">Capital of Tanzania?</div>
              <div className="demo-phone-opts">
                {["Dodoma", "Dar es Salaam", "Arusha", "Mwanza"].map((o, i) => (
                  <div
                    key={o}
                    className={`demo-phone-opt opt-color-${i} ${i === 0 ? "mock-option-selected" : ""}`}
                  >
                    {o}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ HOW IT WORKS ════ */}
      <section id="how" className="how-section">
        <div className="section-label">How it works</div>
        <h2 className="section-title">Up and running in 60 seconds</h2>
        <div className="steps-grid">
          {steps.map((s) => (
            <div key={s.step} className="step-card glass-card">
              <div className="step-num">{s.step}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════ COMPARISON ════ */}
      <section className="comparison-section">
        <div className="comparison-inner">
          <div className="section-label">Comparison</div>
          <h2 className="section-title">How we stack up</h2>
          <p className="section-sub">
            See why QuizSpark is the smarter choice for modern classrooms.
          </p>
          <div className="comparison-table-wrapper glass-card">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="comp-col-feature">Feature</th>
                  <th className="comp-col-qs">QuizSpark</th>
                  <th>Kahoot</th>
                  <th>Quizizz</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr key={row.feature}>
                    <td className="comp-feature-name">{row.feature}</td>
                    <td className="comp-cell">
                      {row.quizspark ? <Check /> : <Cross />}
                    </td>
                    <td className="comp-cell">
                      {row.kahoot ? <Check /> : <Cross />}
                    </td>
                    <td className="comp-cell">
                      {row.quizizz ? <Check /> : <Cross />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ════ TRUST & PRIVACY ════ */}
      <section className="trust-section">
        <div className="trust-inner">
          <div className="trust-grid">
            <div className="trust-card glass-card">
              <div className="trust-icon" aria-hidden>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00c767"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="trust-title">Zero Student Data</h3>
              <p className="trust-desc">
                We collect absolutely no student personal information. There are
                no accounts, no emails, and no tracking. Students are 100%
                anonymous, meaning QuizSpark is inherently safe for any
                classroom.
              </p>
            </div>

            <div className="trust-card glass-card">
              <div className="trust-icon" aria-hidden>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00c767"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
              </div>
              <h3 className="trust-title">Built for Real Networks</h3>
              <p className="trust-desc">
                School Wi-Fi can be unpredictable. QuizSpark uses highly
                optimized WebSockets that consume kilobytes of data, not
                megabytes. It runs flawlessly on older smartphones and 3G
                connections.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ════ PRICING ════ */}
      <section id="pricing" className="pricing-section">
        <div className="pricing-inner">
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Simple, honest pricing</h2>
          <p className="section-sub">
            No tiers. No upsells. Education should be free.
          </p>
          <div className="pricing-card glass-card">
            <div className="pricing-badge">Always free</div>
            <div className="pricing-amount">$0</div>
            <p className="pricing-tagline">For every teacher. Forever.</p>
            <ul className="pricing-perks">
              <li>Unlimited quizzes</li>
              <li>Unlimited live sessions</li>
              <li>Unlimited students per game</li>
              <li>Full leaderboard &amp; analytics</li>
              <li>QR code &amp; PIN sharing</li>
              <li>Podium &amp; confetti finish</li>
            </ul>
            <Link to="/auth" className="btn-primary pricing-cta">
              Get started, it's free
            </Link>
            <p className="pricing-note">
              No credit card. No trial. Just sign up and go.
            </p>
          </div>
        </div>
      </section>

      {/* ════ TECH STACK ════ */}
      <section className="tech-section">
        <div className="tech-inner">
          <p className="tech-label">
            Built on rock-solid open source technology
          </p>
          <div className="tech-pills">
            {techStack.map((t) => (
              <div key={t.name} className="tech-pill glass-card">
                <span className="tech-dot" style={{ background: t.color }} />
                {t.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FAQ ════ */}
      <section id="faq" className="faq-section">
        <div className="faq-inner">
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Questions answered</h2>
          <div className="faq-list">
            {faqs.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ════ TALK TO THE DEVELOPER ════ */}
      <section className="contact-section">
        <div className="contact-inner">
          <div className="contact-card glass-card">
            <div className="contact-avatar" aria-hidden>
              R
            </div>
            <div className="contact-body">
              <div className="section-label" style={{ marginBottom: "0.5rem" }}>
                Talk to the developer
              </div>
              <h2 className="contact-title">Have a question or idea?</h2>
              <p className="contact-desc">
                QuizSpark is built and maintained by one developer. If you have
                feedback, a bug report, a feature request, or you want to use
                this in your institution, reach out directly. Every message is
                read personally.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://github.com/realmadede/QuizSpark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-email-btn"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.6a5.44 5.44 0 0 0-1.5-3.8 5.08 5.08 0 0 0 .1-3.77s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.08 5.08 0 0 0 .1 3.77A5.44 5.44 0 0 0 3.5 9.5c0 5 3 6.2 6 6.5A4.8 4.8 0 0 0 8.5 19v3" />
                  </svg>
                  Visit GitHub
                </a>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `mailto:${atob("YmFnb213YXJhcGhhZWxAZ21haWwuY29t")}`;
                  }}
                  className="contact-email-btn"
                  style={{
                    background: "#f5f5f5",
                    color: "#171717",
                    border: "1px solid #e5e5e5",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Email Developer
                </button>
              </div>
              <p className="contact-note">Usually responds within 24 hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════ CTA BANNER ════ */}
      <section className="cta-section">
        <div className="cta-card glass-card">
          <div className="cta-glow" aria-hidden />
          <h2 className="cta-title">Ready to spark your classroom?</h2>
          <p className="cta-sub">
            Free to use. No credit card required. Students never need an
            account.
          </p>
          <div className="cta-actions">
            <Link to="/auth" className="btn-primary">
              Create your first quiz
            </Link>
            <Link to="/join" className="btn-ghost-dark">
              Already have a PIN? Join →
            </Link>
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer className="landing-footer">
        <span className="footer-logo">QuizSpark</span>
        <p className="footer-tagline">
          Made with love for educators &amp; learners everywhere.
        </p>
        <div className="footer-links">
          <a href="#features" className="footer-link">
            Features
          </a>
          <a href="#pricing" className="footer-link">
            Pricing
          </a>
          <a href="#faq" className="footer-link">
            FAQ
          </a>
          <Link to="/join" className="footer-link">
            Join a game
          </Link>
          <Link to="/auth" className="footer-link">
            Teacher Login
          </Link>
          <Link to="/privacy" className="footer-link">
            Privacy Policy
          </Link>
          <Link to="/terms" className="footer-link">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
