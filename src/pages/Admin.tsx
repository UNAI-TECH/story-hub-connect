import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw, LogOut, Search, CheckCircle2, XCircle, Clock,
  Eye, Users, Shield, AlertCircle, Loader2, Tag, ExternalLink,
} from "lucide-react";

const SCRIPT_URL  = import.meta.env.VITE_GOOGLE_SCRIPT_URL as string;
const ADMIN_PASS  = import.meta.env.VITE_ADMIN_PASSWORD  as string;

interface Registration {
  rowIndex: number;
  timestamp: string;
  studentName: string;
  standard: string;
  section: string;
  schoolName: string;
  parentName: string;
  email: string;
  mobile: string;
  address: string;
  promoCode: string;
  promoApplied: string;
  transactionId: string;
  screenshotLink: string;
  verificationStatus: string;
}

const STATUS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Pending:  { bg: "bg-amber-50",   text: "text-amber-800",   border: "border-amber-300",   dot: "bg-amber-500"   },
  Verified: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300", dot: "bg-emerald-500" },
  Rejected: { bg: "bg-red-50",     text: "text-red-800",     border: "border-red-300",     dot: "bg-red-500"     },
};

const BTN: Record<string, string> = {
  Verified: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  Rejected: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
  Pending:  "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
};

export default function Admin() {
  // ── Auth ──────────────────────────────────────────────────────
  const [authed, setAuthed]       = useState(() => sessionStorage.getItem("adminAuthed") === "true");
  const [password, setPassword]   = useState("");
  const [authErr, setAuthErr]     = useState("");

  const login = () => {
    if (password === ADMIN_PASS) {
      sessionStorage.setItem("adminAuthed", "true");
      setAuthed(true);
      setAuthErr("");
    } else {
      setAuthErr("Incorrect password.");
      setPassword("");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("adminAuthed");
    setAuthed(false);
    setRows([]);
    setPassword("");
  };

  // ── Data ──────────────────────────────────────────────────────
  const [rows,        setRows]        = useState<Registration[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [fetchErr,    setFetchErr]    = useState("");
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("All");
  const [updatingRow, setUpdatingRow] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchErr("");
    try {
      const res  = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "getRegistrations", password: ADMIN_PASS }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load data");
      setRows(json.data || []);
    } catch (e: any) {
      setFetchErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (authed) fetchData(); }, [authed, fetchData]);

  const updateStatus = async (rowIndex: number, status: string) => {
    setUpdatingRow(rowIndex);
    try {
      const res  = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "updateStatus", password: ADMIN_PASS, rowIndex, status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRows(prev => prev.map(r => r.rowIndex === rowIndex ? { ...r, verificationStatus: status } : r));
    } catch (e: any) {
      alert("Update failed: " + e.message);
    } finally {
      setUpdatingRow(null);
    }
  };

  // ── Derived ───────────────────────────────────────────────────
  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q ||
      r.studentName.toLowerCase().includes(q) ||
      r.schoolName.toLowerCase().includes(q)  ||
      r.email.toLowerCase().includes(q)       ||
      r.mobile.includes(q)                    ||
      r.transactionId.toLowerCase().includes(q);
    const matchS = statusFilter === "All" || r.verificationStatus === statusFilter;
    return matchQ && matchS;
  });

  const counts = {
    total:    rows.length,
    pending:  rows.filter(r => r.verificationStatus === "Pending").length,
    verified: rows.filter(r => r.verificationStatus === "Verified").length,
    rejected: rows.filter(r => r.verificationStatus === "Rejected").length,
  };

  // ── Login screen ──────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-premium-gradient flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/Untitled design (3).png" alt="Logo" className="w-44 mx-auto mb-5 drop-shadow-lg object-contain" />
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-yellow-400" />
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <p className="text-white/50 text-sm">Future Forge 2026</p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-3">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Admin Password
            </label>
            <input
              id="adminPassword"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && login()}
              placeholder="Enter admin password"
              autoFocus
              className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-background text-foreground
                outline-none transition-all duration-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
            />
            {authErr && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <XCircle className="w-3 h-3" /> {authErr}
              </p>
            )}
            <button onClick={login} className="btn-premium w-full mt-1">
              Access Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-[#7B0D0D] to-[#3a0606] shadow-lg">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/Untitled design (3).png" alt="Logo" className="h-10 object-contain" />
            <div>
              <p className="text-white font-bold text-sm leading-none">Admin Dashboard</p>
              <p className="text-white/40 text-xs">Future Forge 2026</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {([
            ["Total Students", counts.total,    Users,        "blue"],
            ["Pending",        counts.pending,  Clock,        "amber"],
            ["Verified",       counts.verified, CheckCircle2, "emerald"],
            ["Rejected",       counts.rejected, XCircle,      "red"],
          ] as const).map(([label, value, Icon, c]) => (
            <div key={label} className={`rounded-2xl border border-${c}-200 bg-${c}-50 p-4 flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-xl bg-${c}-100 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 text-${c}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{loading ? "—" : value}</p>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, school, email, mobile, transaction ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800
                outline-none focus:border-[#7B0D0D] focus:ring-2 focus:ring-[#7B0D0D]/10 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none
              focus:border-[#7B0D0D] cursor-pointer min-w-[160px]"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Error */}
        {fetchErr && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {fetchErr} — Check that you've redeployed Code.gs as a new version.
          </div>
        )}

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading registrations…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-400 text-sm">
                {search || statusFilter !== "All"
                  ? "No registrations match your filters."
                  : "No registrations yet."}
              </div>
            ) : (
              <table className="w-full text-sm min-w-[1100px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["#","Time","Student","Std","School","Contact","Promo","Txn ID","Screenshot","Status","Action"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(r => {
                    const s = STATUS[r.verificationStatus] ?? STATUS.Pending;
                    return (
                      <tr key={r.rowIndex} className="hover:bg-gray-50/80 transition-colors">
                        {/* # */}
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{r.rowIndex - 1}</td>

                        {/* Timestamp */}
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{r.timestamp}</td>

                        {/* Student */}
                        <td className="px-4 py-3 min-w-[140px]">
                          <p className="font-semibold text-gray-800">{r.studentName}</p>
                          <p className="text-xs text-gray-400">{r.parentName}</p>
                          <p className="text-xs text-gray-400">{r.email}</p>
                        </td>

                        {/* Standard */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-medium text-gray-700">{r.standard}</span>
                          {r.section && <span className="text-xs text-gray-400"> – {r.section}</span>}
                        </td>

                        {/* School + mobile */}
                        <td className="px-4 py-3 min-w-[140px]">
                          <p className="text-gray-700 text-xs font-medium">{r.schoolName}</p>
                          <p className="text-xs text-gray-400">{r.mobile}</p>
                        </td>

                        {/* Contact (address) */}
                        <td className="px-4 py-3 max-w-[120px]">
                          <p className="text-xs text-gray-500 truncate" title={r.address}>{r.address || "—"}</p>
                        </td>

                        {/* Promo */}
                        <td className="px-4 py-3">
                          {r.promoApplied === "YES" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-300">
                              <Tag className="w-3 h-3" /> YES
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>

                        {/* Transaction ID */}
                        <td className="px-4 py-3">
                          {r.transactionId ? (
                            <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                              {r.transactionId}
                            </span>
                          ) : <span className="text-xs text-gray-300">—</span>}
                        </td>

                        {/* Screenshot */}
                        <td className="px-4 py-3">
                          {r.screenshotLink && r.screenshotLink !== "UPLOAD_FAILED" ? (
                            <a
                              href={r.screenshotLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600
                                hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg
                                transition-colors border border-blue-200"
                            >
                              <Eye className="w-3 h-3" /> View <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-xs text-red-400">
                              {r.screenshotLink === "UPLOAD_FAILED" ? "Failed ⚠" : "—"}
                            </span>
                          )}
                        </td>

                        {/* Status badge */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1
                            rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {r.verificationStatus}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {(["Verified", "Rejected", "Pending"] as const)
                              .filter(st => st !== r.verificationStatus)
                              .map(st => (
                                <button
                                  key={st}
                                  onClick={() => updateStatus(r.rowIndex, st)}
                                  disabled={updatingRow === r.rowIndex}
                                  className={`text-[11px] font-medium px-2 py-1 rounded-lg border transition-colors
                                    whitespace-nowrap disabled:opacity-40 ${BTN[st]}`}
                                >
                                  {updatingRow === r.rowIndex
                                    ? <Loader2 className="w-3 h-3 animate-spin inline" />
                                    : `→ ${st}`}
                                </button>
                              ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                Showing <strong>{filtered.length}</strong> of <strong>{counts.total}</strong> registrations
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
