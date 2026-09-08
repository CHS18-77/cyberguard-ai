"use client";

import { useEffect, useMemo, useState } from "react";

type AnalysisResult = {
  riskScore: number;
  verdict: string;
  threatType: string;
  confidence: number;
  summary: string;
  indicators: { title: string; severity: string; explanation: string }[];
  recommendedActions: string[];
  safeAlternative: string;
};

type HistoryItem = Pick<AnalysisResult, "riskScore" | "verdict" | "threatType" | "summary"> & { id: number; date: string };

const navItems = ["Overview", "Analyzer", "Learn", "Password", "Checkup", "Quiz", "History", "About"];
const examples = [
  "URGENT: Your bank account has been blocked. Verify your password now at secure-bank-login.com",
  "Congratulations! You won a $500 gift card. Claim your prize within 10 minutes.",
  "Hi, this is Maya from HR. Please review the attached onboarding document before Friday.",
];
const learnCards = [
  ["01", "Phishing signals", "Urgency, unusual links, requests for secrets, and unexpected attachments are common warning signs."],
  ["02", "Account protection", "Use a unique password for every account, enable MFA, and keep recovery details current."],
  ["03", "Social engineering", "Attackers build trust, create pressure, or impersonate someone you know to change your behavior."],
];
const quizQuestions = [
  { question: "A message asks for your one-time code to ‘cancel’ a payment. What should you do?", choices: ["Share it quickly", "Ignore and verify through the official app", "Forward it to friends"], answer: 1, explanation: "One-time codes are private. Verify unexpected requests using a known, official channel." },
  { question: "Which link is safest to use for your bank?", choices: ["The link in a surprise SMS", "A shortened link from a caller", "The address you type or bookmark yourself"], answer: 2, explanation: "Use a known official address rather than links supplied in unsolicited messages." },
];

function scoreLabel(score: number) {
  if (score <= 20) return "Very safe";
  if (score <= 40) return "Low risk";
  if (score <= 60) return "Suspicious";
  if (score <= 80) return "High risk";
  return "Critical risk";
}

function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div className="section-title"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{copy}</p></div>;
}

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [password, setPassword] = useState("");
  const [checks, setChecks] = useState([false, false, false, false]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.toLowerCase()))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const item = navItems.find((name) => name.toLowerCase() === visible.target.id);
          if (item) setActive(item);
        }
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0.1, 0.35, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));

    queueMicrotask(() => {
      try {
        const stored = JSON.parse(localStorage.getItem("cyberguard-history") || "[]");
        const safeHistory = Array.isArray(stored) ? stored.filter((item): item is HistoryItem => item && typeof item === "object").map((item) => ({
          riskScore: Number.isFinite(item.riskScore) ? item.riskScore : 0,
          verdict: typeof item.verdict === "string" ? item.verdict : "Unknown",
          threatType: typeof item.threatType === "string" ? item.threatType : "Unclassified",
          summary: typeof item.summary === "string" ? item.summary : "No summary available.",
          id: typeof item.id === "number" ? item.id : Date.now(),
          date: typeof item.date === "string" ? item.date : "Unknown date",
        })).slice(0, 20) : [];
        setHistory(safeHistory);
        localStorage.setItem("cyberguard-history", JSON.stringify(safeHistory));
      } catch { setHistory([]); }
    });

    return () => observer.disconnect();
  }, []);

  const passwordScore = useMemo(() => {
    if (!password) return 0;
    return [password.length >= 12, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  }, [password]);
  const checkupScore = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const analyzeMessage = async () => {
    if (!message.trim()) { setError("Enter a message before starting the analysis."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
      const item: HistoryItem = {
        riskScore: data.riskScore,
        verdict: data.verdict,
        threatType: data.threatType,
        summary: data.summary,
        id: Date.now(),
        date: new Date().toLocaleString(),
      };
      const next = [item, ...history].slice(0, 20);
      setHistory(next);
      try { localStorage.setItem("cyberguard-history", JSON.stringify(next)); } catch { /* storage is optional */ }
    } catch (err) { setError(err instanceof Error ? err.message : "Analysis unavailable. Try again."); }
    finally { setLoading(false); }
  };

  const go = (item: string) => {
    const sectionId = item.toLowerCase();
    window.location.hash = sectionId;
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const currentQuiz = quizQuestions[quizIndex];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => go("Overview")} aria-label="Go to overview"><span className="brand-mark">CG</span><span><strong>CyberGuard</strong><small>AI AWARENESS CONSOLE</small></span></button>
        <div className="side-status"><span className="status-dot" /> Systems operational</div>
        <nav aria-label="Main navigation">{navItems.map((item) => { const sectionId = item.toLowerCase(); return <a key={item} href={`#${sectionId}`} className={active === item ? "nav-item active" : "nav-item"} aria-current={active === item ? "page" : undefined}><span className="nav-index">{String(navItems.indexOf(item) + 1).padStart(2, "0")}</span>{item}</a>; })}</nav>
        <div className="sidebar-foot"><span className="tiny-label">PRIVACY MODE</span><p>Message content is processed for analysis and never saved to your history.</p></div>
      </aside>

      <div className="content-area">
        <header className="topbar"><span>CYBERSECURITY AWARENESS / {active.toUpperCase()}</span><span className="topbar-date">LOCAL CONSOLE · 2026</span></header>

        <section id="overview" className="hero page-section"><div className="hero-copy"><span className="eyebrow">PERSONAL THREAT INTELLIGENCE</span><h1>Make the next<br /><em>click</em> a safer one.</h1><p>CyberGuard turns confusing digital threats into clear, practical decisions. Analyze a message, test your habits, and build confidence one signal at a time.</p><div className="hero-actions"><button className="primary-button" onClick={() => go("Analyzer")}>Analyze a message <span>→</span></button><button className="text-button" onClick={() => go("Learn")}>Explore the field <span>↗</span></button></div></div><div className="hero-visual" aria-hidden="true"><div className="radar"><span /><span /><span /><div className="radar-scan" /></div><div className="radar-label"><span className="status-dot" /> ACTIVE SCAN<br /><strong>THREAT SURFACE</strong></div></div></section>

        <section className="metrics"><div><span>01</span><strong>Message analysis</strong><p>AI-assisted pattern detection</p></div><div><span>02</span><strong>Local password check</strong><p>Nothing leaves your browser</p></div><div><span>03</span><strong>Practical learning</strong><p>Short lessons, real signals</p></div></section>

        <section id="analyzer" className="page-section analyzer-section"><SectionTitle eyebrow="01 / SIGNAL ANALYSIS" title="Read between the lines." copy="Paste an email, SMS, or direct message. CyberGuard will surface pressure tactics, impersonation, and other patterns worth a second look." /><div className="analyzer-grid"><div className="analyzer-form panel"><div className="panel-top"><span className="panel-label">INPUT CHANNEL</span><span className="mono">TEXT / 10,000 CHAR MAX</span></div><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Paste a suspicious message here..." aria-label="Message to analyze" /><div className="example-row"><span>TRY AN EXAMPLE</span>{examples.map((example, index) => <button key={index} onClick={() => setMessage(example)}>0{index + 1}</button>)}</div><button className="primary-button full" onClick={analyzeMessage} disabled={loading}>{loading ? "Analyzing signal..." : "Run analysis  →"}</button>{error && <p className="error-message" role="alert">{error}</p>}<p className="disclaimer">Awareness tool only. Never share passwords, OTPs, PINs, or financial data.</p></div><div className="result-panel panel">{result ? <><div className="result-score"><div><span className="panel-label">RISK SCORE</span><strong>{result.riskScore}<small>/100</small></strong><b>{scoreLabel(result.riskScore)}</b></div><div className="score-ring" style={{ "--score": `${result.riskScore * 3.6}deg` } as React.CSSProperties}><span>{result.riskScore}</span></div></div><div className="result-verdict"><span className="panel-label">VERDICT / {result.threatType}</span><h3>{result.verdict}</h3><p>{result.summary}</p></div><div className="result-list"><span className="panel-label">RECOMMENDED NEXT STEPS</span>{result.recommendedActions?.slice(0, 3).map((action, index) => <p key={index}><b>0{index + 1}</b>{action}</p>)}</div></> : <div className="empty-result"><div className="empty-cross">+</div><span>AWAITING INPUT</span><p>Your analysis report will appear here with a risk score, key signals, and safe next steps.</p></div>}</div></div></section>

        <section id="learn" className="page-section"><SectionTitle eyebrow="02 / FIELD NOTES" title="Know the patterns." copy="The strongest defense is a pause. Start with the behaviors attackers rely on most." /><div className="learning-grid">{learnCards.map(([number, title, copy]) => <article className="learn-card" key={number}><span className="card-number">{number}</span><h3>{title}</h3><p>{copy}</p><button className="text-button" onClick={() => go("Quiz")}>Test your knowledge <span>→</span></button></article>)}</div></section>

        <section id="password" className="page-section split-section"><div><SectionTitle eyebrow="03 / LOCAL CHECK" title="Strengthen your first line." copy="Check password habits locally. Your password is evaluated in this browser and is never sent to a server or stored." /><div className="password-check panel"><label htmlFor="password">ENTER A PASSWORD TO TEST</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Type to check strength" /><div className="strength-bars">{[1, 2, 3, 4].map((bar) => <span key={bar} className={passwordScore >= bar ? "filled" : ""} />)}</div><div className="strength-copy"><strong>{password ? ["Needs work", "Fair", "Good", "Strong"][passwordScore - 1] || "Excellent" : "Waiting for input"}</strong><span>{password.length} characters</span></div><ul><li className={password.length >= 12 ? "done" : ""}>At least 12 characters</li><li className={/[A-Z]/.test(password) ? "done" : ""}>Uppercase letter</li><li className={/[0-9]/.test(password) ? "done" : ""}>Number</li><li className={/[^A-Za-z0-9]/.test(password) ? "done" : ""}>Special character</li></ul></div></div><div id="checkup" className="checkup-card page-anchor-target"><SectionTitle eyebrow="04 / SAFETY CHECKUP" title="How ready are you?" copy="A quick self-audit for everyday security habits." /><div className="checkup-score"><strong>{checkupScore}</strong><span>/ 100<br />READINESS</span></div>{["MFA is enabled on important accounts", "Your devices install security updates", "You know how to report a scam", "Your recovery details are current"].map((label, index) => <label className="check-row" key={label}><input type="checkbox" checked={checks[index]} onChange={() => setChecks(checks.map((check, i) => i === index ? !check : check))} /><span>{label}</span></label>)}</div></section>

        <section id="quiz" className="page-section quiz-section"><SectionTitle eyebrow="05 / PRACTICE RANGE" title="Pause. Check. Decide." copy="Build muscle memory with realistic scenarios." /><div className="quiz-card panel"><span className="panel-label">SCENARIO {quizIndex + 1} / {quizQuestions.length}</span><h3>{currentQuiz.question}</h3><div className="quiz-options">{currentQuiz.choices.map((choice, index) => <button key={choice} className={quizChoice === index ? (index === currentQuiz.answer ? "correct" : "incorrect") : ""} onClick={() => setQuizChoice(index)}>{choice}<span>{String.fromCharCode(65 + index)}</span></button>)}</div>{quizChoice !== null && <div className="quiz-feedback"><strong>{quizChoice === currentQuiz.answer ? "Correct call." : "Take another look."}</strong><p>{currentQuiz.explanation}</p><button className="text-button" onClick={() => { setQuizIndex((quizIndex + 1) % quizQuestions.length); setQuizChoice(null); }}>Next scenario →</button></div>}</div></section>

        <section id="history" className="page-section"><SectionTitle eyebrow="06 / PRIVATE LOG" title="Your recent signals." copy="Only analysis metadata is kept here: no message text, secrets, or personal content." /><div className="history-panel panel">{history.length === 0 ? <div className="history-empty">No analyses yet. Your private log will appear after your first successful scan.</div> : <>{history.map((item) => <div className="history-row" key={item.id}><span className="history-score">{item.riskScore}</span><div><strong>{item.verdict}</strong><p>{item.threatType} · {item.date}</p></div><span className="history-summary">{item.summary}</span></div>)}<button className="text-button" onClick={() => { setHistory([]); try { localStorage.removeItem("cyberguard-history"); } catch {} }}>Clear private log</button></>}</div></section>

        <section id="about" className="page-section about-section"><SectionTitle eyebrow="07 / TRUST CENTER" title="Designed for clarity, not certainty." copy="CyberGuard AI is an educational companion. It helps you spot patterns, but no automated system can guarantee that a message is safe." /><div className="about-grid"><div><span className="panel-label">OUR PRINCIPLES</span><p>We keep analysis focused on the message you provide, explain our reasoning in plain language, and encourage verification through official channels.</p></div><div><span className="panel-label">PRIVACY BY DEFAULT</span><p>Analyzer history stores only risk metadata locally in your browser. Password checks never use the network. You stay in control.</p></div></div></section>
        <footer><span>CYBERGUARD AI</span><span>THINK BEFORE YOU CLICK.</span><span>EDUCATION / 2026</span></footer>
      </div>
    </main>
  );
}
