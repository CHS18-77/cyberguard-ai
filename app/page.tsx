"use client";

import { useState } from "react";

type AnalysisResult = {
  riskScore: number;
  verdict: string;
  threatType: string;
  confidence: number;
  summary: string;
  indicators: {
    title: string;
    severity: string;
    explanation: string;
  }[];
  recommendedActions: string[];
  safeAlternative: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeMessage = async () => {
    if (!message.trim()) {
      setError("Please enter a message first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRiskLabel = (score: number) => {
    if (score <= 20) return "Very Safe";
    if (score <= 40) return "Low Risk";
    if (score <= 60) return "Suspicious";
    if (score <= 80) return "High Risk";
    return "Critical Risk";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-xl">
              🛡️
            </div>

            <div>
              <h1 className="text-xl font-bold">CyberGuard AI</h1>
              <p className="text-xs text-slate-400">
                Think before you click.
              </p>
            </div>
          </div>

          <div className="hidden gap-6 text-sm text-slate-300 md:flex">
            <a href="#" className="hover:text-cyan-400">
              Home
            </a>

            <a href="#analyzer" className="hover:text-cyan-400">
              Analyzer
            </a>

            <a href="#learn" className="hover:text-cyan-400">
              Learn
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
            🛡️ AI-Powered Cybersecurity Awareness
          </div>

          <h2 className="text-5xl font-bold leading-tight md:text-6xl">
            Is this message
            <span className="text-cyan-400"> safe?</span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Paste a suspicious email, SMS, WhatsApp message, or social media
            message. CyberGuard AI analyzes common cybersecurity warning signs
            and explains them in simple language.
          </p>
        </div>
      </section>

      {/* Analyzer */}
      <section id="analyzer" className="mx-auto max-w-4xl px-6 pb-20">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl md:p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold">🔍 Message Analyzer</h3>

            <p className="mt-2 text-sm text-slate-400">
              Paste the message below and let CyberGuard AI check it.
            </p>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: URGENT! Your bank account has been blocked. Verify your password now..."
            className="min-h-48 w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 p-5 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
          />

          <button
            onClick={analyzeMessage}
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing with AI..." : "Analyze Message →"}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
              ⚠️ {error}
            </div>
          )}

          {/* AI Result */}
          {result && (
            <div className="mt-8 space-y-6">
              {/* Risk Score */}
              <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">
                <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
                  <div>
                    <p className="text-sm text-slate-400">Risk Score</p>

                    <div className="mt-2 text-5xl font-bold text-cyan-400">
                      {result.riskScore}
                      <span className="text-xl text-slate-500">/100</span>
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      {getRiskLabel(result.riskScore)}
                    </p>
                  </div>

                  <div className="text-center sm:text-right">
                    <p className="text-sm text-slate-400">Threat Type</p>

                    <p className="mt-2 text-xl font-bold">
                      {result.threatType}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      AI Confidence: {result.confidence}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Verdict */}
              <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">
                <p className="text-sm text-slate-400">Verdict</p>

                <h4 className="mt-2 text-2xl font-bold">
                  {result.verdict}
                </h4>

                <p className="mt-4 leading-7 text-slate-300">
                  {result.summary}
                </p>
              </div>

              {/* Indicators */}
              {result.indicators?.length > 0 && (
                <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">
                  <h4 className="text-xl font-bold">
                    🚩 Warning Signs
                  </h4>

                  <div className="mt-5 space-y-4">
                    {result.indicators.map((indicator, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-800 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-semibold">
                            {indicator.title}
                          </p>

                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase text-slate-300">
                            {indicator.severity}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {indicator.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Actions */}
              <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">
                <h4 className="text-xl font-bold">
                  ✅ Recommended Actions
                </h4>

                <ul className="mt-5 space-y-3">
                  {result.recommendedActions?.map((action, index) => (
                    <li
                      key={index}
                      className="rounded-xl bg-slate-900 p-4 text-sm leading-6 text-slate-300"
                    >
                      {index + 1}. {action}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safer Alternative */}
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6">
                <h4 className="text-xl font-bold text-cyan-300">
                  💡 Safer Alternative
                </h4>

                <p className="mt-3 leading-7 text-slate-300">
                  {result.safeAlternative}
                </p>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            AI analysis is for cybersecurity awareness and does not guarantee
            that a message is safe.
          </p>
        </div>
      </section>

      {/* Learn */}
      <section id="learn" className="mx-auto max-w-6xl px-6 pb-20">
        <h3 className="text-center text-3xl font-bold">
          Stay safer online
        </h3>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-3xl">🎣</div>
            <h4 className="mt-4 text-xl font-bold">Spot Phishing</h4>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Learn how attackers use urgency, fake links, and impersonation.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-3xl">🔐</div>
            <h4 className="mt-4 text-xl font-bold">Protect Accounts</h4>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Use strong, unique passwords and enable multi-factor
              authentication.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-3xl">🧠</div>
            <h4 className="mt-4 text-xl font-bold">Build Awareness</h4>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Understand common social engineering techniques and stay alert.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        CyberGuard AI • Built for cybersecurity awareness
      </footer>
    </main>
  );
}