import { useState, useRef } from "react";

const SAMPLE_TICKETS = [
  {
    id: "TKT-00412",
    from: "Ahmed Al-Rashidi",
    company: "SADAD Payment Network",
    subject: "Transaction reconciliation API returning 500 errors intermittently",
    body: "We're seeing intermittent 500 errors on the /v2/reconcile endpoint since yesterday around 14:00 GST. Our batch jobs are failing roughly 30% of the time. This is affecting end-of-day reporting for our finance team. We need this resolved urgently as we have a board review tomorrow morning.",
    time: "9 mins ago",
    channel: "Email",
  },
  {
    id: "TKT-00413",
    from: "Sarah Mitchell",
    company: "FinCore SaaS",
    subject: "Need help understanding the new webhook payload structure",
    body: "Hi team, we updated to the latest API version last week and our webhook receiver is breaking because the payload structure seems to have changed. Can you send us the updated documentation or an example payload? Not urgent but we'd like to fix it before our next sprint.",
    time: "34 mins ago",
    channel: "Portal",
  },
  {
    id: "TKT-00414",
    from: "Khalid Noor",
    company: "Qiwa Platform",
    subject: "CRITICAL: Visa transactions failing on production gateway",
    body: "URGENT - Live production issue. Visa card payments are declining across the entire Qiwa platform since 11:45 GST. We are losing millions in transaction volume per hour. All other card types are working. Our CTO is engaged. Need an immediate response and status update every 15 minutes.",
    time: "2 mins ago",
    channel: "Phone + Email",
  },
  {
    id: "TKT-00415",
    from: "Priya Sharma",
    company: "NeoBank Ltd",
    subject: "Question about SLA terms for weekend support",
    body: "Hi, I wanted to clarify our SLA coverage. Our contract says 24/7 support but we didn't get a response last Saturday for about 4 hours on a P2 issue. Can you help me understand what the actual response time commitment is for weekends? Also can we get a copy of our SLA document?",
    time: "1 hr ago",
    channel: "Email",
  },
  {
    id: "TKT-00416",
    from: "James Okonkwo",
    company: "PaySwift Africa",
    subject: "Onboarding - need API keys for sandbox environment",
    body: "Hello, we just signed our contract last week and are ready to start integration testing. Our developer team is waiting on sandbox API credentials. We've filled out the onboarding form but haven't heard back. Can you help expedite this so we can start our 6-week integration project on time?",
    time: "3 hrs ago",
    channel: "Portal",
  },
];

const DEMO_RESULTS = {
  "TKT-00412": {
    priority: "High",
    category: "API / Integration",
    sentiment: "Frustrated",
    estimated_resolution_mins: 120,
    routing: "Backline Engineering",
    summary: "Intermittent 500 errors on /v2/reconcile endpoint causing 30% batch job failure rate ahead of a critical board review.",
  },
  "TKT-00413": {
    priority: "Medium",
    category: "API / Integration",
    sentiment: "Neutral",
    estimated_resolution_mins: 60,
    routing: "TAM",
    summary: "Webhook receiver breaking after API version upgrade due to undocumented payload structure changes.",
  },
  "TKT-00414": {
    priority: "Critical",
    category: "Technical Incident",
    sentiment: "Urgent",
    estimated_resolution_mins: 45,
    routing: "Backline Engineering",
    summary: "All Visa card payments declining on Qiwa Platform production gateway since 11:45 GST causing significant revenue loss per hour.",
  },
  "TKT-00415": {
    priority: "Medium",
    category: "SLA / Contract",
    sentiment: "Frustrated",
    estimated_resolution_mins: 30,
    routing: "TAM",
    summary: "Customer questioning weekend SLA response time commitments after a 4-hour delay on a P2 issue last Saturday.",
  },
  "TKT-00416": {
    priority: "Low",
    category: "Onboarding",
    sentiment: "Neutral",
    estimated_resolution_mins: 20,
    routing: "Onboarding",
    summary: "New customer awaiting sandbox API credentials to begin a 6-week integration project with no response to onboarding form.",
  },
};

const PRIORITY_STYLES = {
  Critical: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-500", border: "border-red-500/30" },
  High:     { bg: "bg-orange-500/15", text: "text-orange-400", dot: "bg-orange-500", border: "border-orange-500/30" },
  Medium:   { bg: "bg-yellow-500/15", text: "text-yellow-400", dot: "bg-yellow-500", border: "border-yellow-500/30" },
  Low:      { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-500", border: "border-emerald-500/30" },
};

const CATEGORY_STYLES = {
  "Technical Incident": "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "API / Integration":  "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  "SLA / Contract":     "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "Billing":            "bg-pink-500/15 text-pink-300 border-pink-500/30",
  "Onboarding":         "bg-teal-500/15 text-teal-300 border-teal-500/30",
  "General Inquiry":    "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

function MetricCard({ label, before, after, unit }) {
  const pct = Math.round(((before - after) / before) * 100);
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-4 flex flex-col gap-2">
      <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">{label}</span>
      <div className="flex items-end gap-3">
        <div className="text-center">
          <div className="text-xl font-bold text-slate-500 line-through">{before}{unit}</div>
          <div className="text-xs text-slate-600 mt-0.5">Before</div>
        </div>
        <div className="text-slate-600 text-lg pb-1">→</div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">{after}{unit}</div>
          <div className="text-xs text-slate-500 mt-0.5">After</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-lg font-bold text-emerald-400">↓{pct}%</div>
          <div className="text-xs text-slate-600">reduction</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("inbox");
  const [drafts, setDrafts] = useState({});
  const [sent, setSent] = useState({});

  const ticket = SAMPLE_TICKETS.find(t => t.id === selected);
  const result = selected ? results[selected] : null;

  async function triage(t) {
    if (results[t.id]) { setSelected(t.id); return; }
    setSelected(t.id);
    setLoading(true);
    await new Promise(res => setTimeout(res, 1200));
    setResults(r => ({ ...r, [t.id]: DEMO_RESULTS[t.id] }));
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "'DM Sans', 'IBM Plex Sans', system-ui, sans-serif", background: "#0b0f17", minHeight: "100vh", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#0d1220" }} className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <div className="font-bold text-sm text-white tracking-tight">TicketAI</div>
            <div className="text-xs text-slate-500">Intelligent Triage Engine</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Live</span>
          <span className="ml-4 text-xs text-slate-500">Built by Meeran Khan · TAM Portfolio</span>
        </div>
      </div>

      {/* Tab nav */}
      <div className="px-6 pt-4 flex gap-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {[["inbox","Ticket Inbox"],["metrics","Impact Metrics"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="px-4 py-2 text-sm font-medium rounded-t-lg transition-all"
            style={{ background: tab === key ? "rgba(6,182,212,0.1)" : "transparent", color: tab === key ? "#22d3ee" : "#64748b", borderBottom: tab === key ? "2px solid #22d3ee" : "2px solid transparent" }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "metrics" ? (
        <div className="p-6 max-w-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Automation Impact Dashboard</h2>
            <p className="text-sm text-slate-500 mt-1">Measured outcomes from deploying AI-assisted triage across Mid-Market account portfolio.</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <MetricCard label="Avg. First Response Time" before={42} after={4} unit=" mins" />
            <MetricCard label="Ticket Triage Time (per ticket)" before={8} after={0.5} unit=" mins" />
            <MetricCard label="Avg. Resolution Time" before={9.2} after={5.5} unit=" hrs" />
            <MetricCard label="Misrouted Tickets / Week" before={14} after={2} unit="" />
            <MetricCard label="Tickets Needing Manual Triage" before={100} after={18} unit="%" />
          </div>
          <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-2">How it works</div>
            <div className="text-sm text-slate-400 leading-relaxed">
              This tool instantly classifies each incoming ticket by <strong className="text-slate-300">priority</strong> (Critical → Low), <strong className="text-slate-300">category</strong>, and <strong className="text-slate-300">customer sentiment</strong> — then routes to the correct team. The TAM then composes a personalised response directly. What previously took 8 minutes per ticket now takes under 30 seconds to triage.
            </div>
          </div>
        </div>
      ) : (
        <div className="flex" style={{ height: "calc(100vh - 110px)" }}>
          {/* Ticket list */}
          <div className="w-80 flex-shrink-0 overflow-y-auto" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="p-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Inbox · {SAMPLE_TICKETS.length} tickets</span>
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">2 critical</span>
            </div>
            {SAMPLE_TICKETS.map(t => {
              const r = results[t.id];
              const ps = r?.priority ? PRIORITY_STYLES[r.priority] : null;
              return (
                <button key={t.id} onClick={() => triage(t)}
                  className="w-full text-left px-4 py-3 transition-all hover:bg-white/4"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: selected === t.id ? "rgba(6,182,212,0.06)" : "transparent", borderLeft: selected === t.id ? "2px solid #22d3ee" : "2px solid transparent" }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">{t.id}</span>
                    <span className="text-xs text-slate-600 whitespace-nowrap">{t.time}</span>
                  </div>
                  <div className="text-sm font-semibold text-white mb-0.5 leading-tight line-clamp-1">{t.from}</div>
                  <div className="text-xs text-slate-400 mb-1">{t.company}</div>
                  <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{t.subject}</div>
                  {r?.priority && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ps.bg} ${ps.text} ${ps.border}`}>{r.priority}</span>
                      {r.category && <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_STYLES[r.category] || "bg-slate-500/15 text-slate-300 border-slate-500/30"}`}>{r.category}</span>}
                      {sent[t.id] && <span className="text-xs px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Responded</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detail pane */}
          <div className="flex-1 overflow-y-auto">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div className="text-white font-semibold">Select a ticket to begin AI triage</div>
                <div className="text-sm text-slate-500 max-w-xs">Click any ticket in the inbox. The system will instantly classify it, then you compose your own personalised response.</div>
              </div>
            ) : (
              <div className="p-6">
                {/* Ticket header */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono text-slate-500">{ticket.id}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{ticket.channel}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{ticket.time}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">{ticket.subject}</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)", color: "white" }}>
                      {ticket.from.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">{ticket.from}</span>
                      <span className="text-sm text-slate-500"> · {ticket.company}</span>
                    </div>
                  </div>
                </div>

                {/* Original message */}
                <div className="rounded-xl p-4 mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">Original Message</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{ticket.body}</p>
                </div>

                {/* AI Analysis */}
                <div className="rounded-xl overflow-hidden mb-5" style={{ border: "1px solid rgba(6,182,212,0.2)", background: "rgba(6,182,212,0.04)" }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(6,182,212,0.15)", background: "rgba(6,182,212,0.06)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">AI Triage Analysis</span>
                    {loading && <div className="ml-auto flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} /><div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} /><div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} /></div>}
                  </div>

                  {loading && (
                    <div className="p-4">
                      <div className="text-sm text-slate-500 animate-pulse">Analyzing ticket content, classifying priority, assessing sentiment...</div>
                    </div>
                  )}

                  {result && !loading && (
                    <div className="p-4 grid grid-cols-2 gap-3">
                      <div className="rounded-lg p-3" style={{ background: "rgba(0,0,0,0.2)" }}>
                        <div className="text-xs text-slate-500 mb-1.5 font-medium">Priority</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${PRIORITY_STYLES[result.priority]?.dot}`} />
                          <span className={`font-bold text-sm ${PRIORITY_STYLES[result.priority]?.text}`}>{result.priority}</span>
                        </div>
                      </div>

                      <div className="rounded-lg p-3" style={{ background: "rgba(0,0,0,0.2)" }}>
                        <div className="text-xs text-slate-500 mb-1.5 font-medium">Category</div>
                        <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${CATEGORY_STYLES[result.category] || "bg-slate-500/15 text-slate-300 border-slate-500/30"}`}>{result.category}</span>
                      </div>

                      <div className="rounded-lg p-3" style={{ background: "rgba(0,0,0,0.2)" }}>
                        <div className="text-xs text-slate-500 mb-1.5 font-medium">Customer Sentiment</div>
                        <span className="text-sm font-semibold text-white">{result.sentiment}</span>
                      </div>

                      <div className="rounded-lg p-3" style={{ background: "rgba(0,0,0,0.2)" }}>
                        <div className="text-xs text-slate-500 mb-1.5 font-medium">Est. Resolution</div>
                        <span className="text-sm font-semibold text-white">
                          {result.estimated_resolution_mins >= 60
                            ? `${(result.estimated_resolution_mins / 60).toFixed(1)} hrs`
                            : `${result.estimated_resolution_mins} mins`}
                        </span>
                      </div>

                      <div className="rounded-lg p-3 col-span-2" style={{ background: "rgba(0,0,0,0.2)" }}>
                        <div className="text-xs text-slate-500 mb-1.5 font-medium">Route To</div>
                        <div className="flex items-center gap-2">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          <span className="text-sm font-semibold text-cyan-300">{result.routing}</span>
                        </div>
                      </div>

                      <div className="rounded-lg p-3 col-span-2" style={{ background: "rgba(0,0,0,0.2)" }}>
                        <div className="text-xs text-slate-500 mb-1.5 font-medium">AI Summary</div>
                        <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Manual Response Compose Box */}
                {result && !loading && (
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Your Response</span>
                      <span className="ml-2 text-xs text-slate-600">— compose your reply as the TAM</span>
                    </div>
                    <div className="p-4">
                      {sent[selected] ? (
                        <div className="rounded-lg p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(16,185,129,0.2)" }}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Response Sent</span>
                          </div>
                          {drafts[selected]}
                        </div>
                      ) : (
                        <>
                          <textarea
                            rows={6}
                            value={drafts[selected] || ""}
                            onChange={e => setDrafts(d => ({ ...d, [selected]: e.target.value }))}
                            placeholder={`Hi ${ticket.from.split(" ")[0]},\n\nThank you for reaching out...`}
                            className="w-full rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
                            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", lineHeight: "1.6" }}
                          />
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => { if (drafts[selected]?.trim()) setSent(s => ({ ...s, [selected]: true })); }}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-90"
                              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white" }}>
                              ✓ Send Response
                            </button>
                            <button
                              onClick={() => setDrafts(d => ({ ...d, [selected]: "" }))}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium"
                              style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}>
                              Clear
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
