// Validator queue — single-page HITL review of pending Finanzaonline signals.
// Auth: browser-native HTTP Basic. On 401, we trigger the browser auth dialog
// by making a fetch that the user can re-authenticate via the URL bar; for v0
// we keep it simple and ask for the password in-page, stash it in sessionStorage.

const { useState, useEffect, useCallback, useMemo } = React;

const THEME_LABELS = {
  A: 'Income volatility',
  B: 'Tasso fisso vs variabile',
  C: 'Garante / Consap / ISEE',
  D: 'Hidden costs / polizze',
  E: 'Identity language',
  F: 'Market context',
  OTHER: 'Other',
};

const THEME_COLORS = {
  A: 'bg-amber-100 text-amber-700',
  B: 'bg-paper-100 text-ink-700',
  C: 'bg-brand-surface text-navy-900',
  D: 'bg-amber-100 text-amber-700',
  E: 'bg-paper-100 text-ink-700',
  F: 'bg-brand-surface text-navy-900',
  OTHER: 'bg-paper-100 text-ink-500',
};

function authHeader(password) {
  return 'Basic ' + btoa('validator:' + password);
}

function useAuth() {
  const [password, setPassword] = useState(() => {
    try { return sessionStorage.getItem('validator_pw') || ''; } catch (e) { return ''; }
  });
  const save = useCallback((pw) => {
    setPassword(pw);
    try { sessionStorage.setItem('validator_pw', pw); } catch (e) {}
  }, []);
  const clear = useCallback(() => {
    setPassword('');
    try { sessionStorage.removeItem('validator_pw'); } catch (e) {}
  }, []);
  return { password, save, clear };
}

function Login({ onSubmit, error }) {
  const [pw, setPw] = useState('');
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={(e)=>{ e.preventDefault(); if (pw) onSubmit(pw); }}
        className="w-full max-w-sm rounded-2xl bg-paper-0 hairline p-6 space-y-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium">SASP</div>
          <h1 className="text-[20px] font-semibold text-ink-900 mt-0.5">Signal validator</h1>
          <p className="text-[12px] text-ink-500 mt-1">Native-Italian HITL queue. Single shared password.</p>
        </div>
        <input
          autoFocus
          type="password"
          value={pw}
          onChange={(e)=>setPw(e.target.value)}
          placeholder="Validator password"
          className="w-full rounded-md hairline bg-paper-0 px-3 py-2 text-[13px] text-ink-900 outline-none focus:ring-2 focus:ring-brand"/>
        {error && <div className="text-[12px] text-amber-700">{error}</div>}
        <button type="submit" disabled={!pw}
          className={`w-full py-2 rounded-md text-[13px] font-semibold ${pw ? 'bg-brand text-ink-900 hover:bg-brand-emphasis' : 'bg-paper-100 text-ink-400 cursor-not-allowed'}`}>
          Sign in
        </button>
      </form>
    </div>
  );
}

function ThemeBadge({ theme }) {
  const cls = THEME_COLORS[theme] || THEME_COLORS.OTHER;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
      {theme} · {THEME_LABELS[theme] || 'Other'}
    </span>
  );
}

function SignalCard({ signal, onDecide, busy }) {
  const [edited, setEdited] = useState('');
  const [editing, setEditing] = useState(false);

  const handleApprove = () => onDecide(signal.id, 'approve', editing && edited.trim() ? edited.trim() : undefined);
  const handleReject = () => onDecide(signal.id, 'reject');

  return (
    <article className="rounded-2xl bg-paper-0 hairline p-5 space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <ThemeBadge theme={signal.theme}/>
            <span className="text-[11px] text-ink-400 num">
              captured {new Date(signal.captured_at).toLocaleString()}
            </span>
          </div>
          {signal.thread_title && (
            <div className="text-[12px] text-ink-500 mt-1.5 truncate">
              {signal.thread_title}
            </div>
          )}
        </div>
        <a href={signal.source_url} target="_blank" rel="noopener noreferrer"
          className="text-[12px] text-navy-700 hover:underline shrink-0">
          Open original ↗
        </a>
      </header>

      <div>
        <div className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium mb-1.5">Paraphrase</div>
        {editing ? (
          <textarea
            value={edited}
            onChange={(e)=>setEdited(e.target.value)}
            rows={4}
            className="w-full rounded-md hairline bg-paper-0 px-3 py-2 text-[13px] text-ink-900 outline-none focus:ring-2 focus:ring-brand"/>
        ) : (
          <p className="text-[13px] text-ink-800 leading-relaxed border-l-2 border-navy-700 pl-3.5">
            {signal.paraphrase}
          </p>
        )}
      </div>

      <details className="text-[11px] text-ink-500">
        <summary className="cursor-pointer hover:text-ink-900">Original excerpt (validator-only)</summary>
        <p className="mt-2 italic text-ink-700">{signal.original_excerpt}</p>
      </details>

      <div className="flex items-center gap-2 pt-1">
        {!editing ? (
          <button onClick={()=>{ setEditing(true); setEdited(signal.paraphrase); }}
            disabled={busy}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium hairline bg-paper-0 text-ink-700 hover:bg-paper-50">
            Edit paraphrase
          </button>
        ) : (
          <button onClick={()=>{ setEditing(false); setEdited(''); }}
            disabled={busy}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium hairline bg-paper-0 text-ink-700 hover:bg-paper-50">
            Cancel edit
          </button>
        )}
        <button onClick={handleReject} disabled={busy}
          className="px-3 py-1.5 rounded-md text-[12px] font-medium hairline bg-paper-0 text-amber-700 hover:bg-amber-100">
          Reject
        </button>
        <button onClick={handleApprove} disabled={busy}
          className="ml-auto px-3.5 py-1.5 rounded-md text-[12px] font-semibold bg-brand text-ink-900 hover:bg-brand-emphasis">
          Approve{editing && edited.trim() && edited.trim() !== signal.paraphrase ? ' (with edits)' : ''}
        </button>
      </div>
    </article>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">{label}</div>
      <div className="text-[18px] font-semibold text-ink-900 num leading-tight">{value}</div>
    </div>
  );
}

function App() {
  const { password, save, clear } = useAuth();
  const [signals, setSignals] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [lastRun, setLastRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [busyIds, setBusyIds] = useState(new Set());

  const fetchPending = useCallback(async () => {
    if (!password) return;
    setLoading(true);
    try {
      const res = await fetch('/api/signals?status=pending&limit=50', {
        headers: { 'Authorization': authHeader(password) },
      });
      if (res.status === 401) {
        clear();
        setAuthError('Wrong password.');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSignals(data.signals || []);
      setCounts(data.counts || { pending: 0, approved: 0, rejected: 0 });
      setLastRun(data.last_run || null);
      setAuthError('');
    } catch (e) {
      setAuthError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }, [password, clear]);

  useEffect(() => { if (password) fetchPending(); }, [password, fetchPending]);

  const decide = useCallback(async (id, decision, edited_paraphrase) => {
    setBusyIds(prev => new Set(prev).add(id));
    try {
      const res = await fetch('/api/signals', {
        method: 'POST',
        headers: {
          'Authorization': authHeader(password),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, decision, edited_paraphrase }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSignals(prev => prev.filter(s => s.id !== id));
      setCounts(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        [decision === 'approve' ? 'approved' : 'rejected']: prev[decision === 'approve' ? 'approved' : 'rejected'] + 1,
      }));
    } catch (e) {
      alert('Failed: ' + (e.message || e));
    } finally {
      setBusyIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  }, [password]);

  // NOTE: this useMemo must stay BEFORE any conditional return — Rules of Hooks.
  const lastRunSummary = useMemo(() => {
    if (!lastRun) return 'never';
    const when = new Date(lastRun.ts).toLocaleString();
    const parts = [`${lastRun.posts_added} added`, `${lastRun.posts_seen} seen`];
    if (lastRun.error) parts.push('⚠ ' + lastRun.error.split('|')[0].trim());
    return `${when} · ${parts.join(' · ')}`;
  }, [lastRun]);

  if (!password) {
    return <Login onSubmit={save} error={authError}/>;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-100 bg-paper-0">
        <div className="max-w-[960px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium">SASP · Validator</div>
            <h1 className="text-[18px] font-semibold text-ink-900 leading-tight">Signal queue</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchPending} disabled={loading}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium hairline bg-paper-0 text-ink-700 hover:bg-paper-50">
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button onClick={clear}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium text-ink-500 hover:text-ink-900 hover:bg-paper-100">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[960px] mx-auto px-6 py-8 space-y-6">
        <section className="rounded-2xl bg-paper-0 hairline p-5 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Stat label="Pending" value={counts.pending}/>
          <Stat label="Approved" value={counts.approved}/>
          <Stat label="Rejected" value={counts.rejected}/>
          <div className="ml-auto text-right">
            <div className="text-[11px] uppercase tracking-[0.12em] text-ink-400 font-medium">Last ingest</div>
            <div className="text-[12px] text-ink-700 num">{lastRunSummary}</div>
          </div>
        </section>

        {signals.length === 0 ? (
          <div className="rounded-2xl bg-paper-0 hairline py-16 px-8 text-center space-y-2">
            <div className="text-[15px] font-semibold text-ink-900">Queue empty</div>
            <div className="text-[12px] text-ink-500 max-w-md mx-auto">
              No pending signals. The cron runs daily at 04:00 UTC — refresh after the next run, or trigger ingest manually.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {signals.map(sig => (
              <SignalCard key={sig.id} signal={sig} onDecide={decide} busy={busyIds.has(sig.id)}/>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
