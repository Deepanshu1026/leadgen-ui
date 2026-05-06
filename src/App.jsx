import { useState, useRef, useEffect } from 'react'

const API_URL = "http://localhost:3000/scrape"

const QUICK_SEARCHES = [
  { icon: '🍽', label: 'Restaurants, CP Delhi', q: 'restaurants Connaught Place Delhi' },
  { icon: '🦷', label: 'Dentists, Noida', q: 'dental clinic Noida sector 15' },
  { icon: '💪', label: 'Gyms, Koramangala', q: 'gym Bengaluru Koramangala' },
  { icon: '📊', label: 'CA Firms, Delhi', q: 'ca firm South Delhi' },
  { icon: '🏨', label: 'Hotels, Jaipur', q: 'hotel Jaipur' },
  { icon: '🖥', label: 'Coworking, Bandra', q: 'coworking space Mumbai Bandra' },
]

const SCRAPING_STEPS = [
  { icon: '🌐', label: 'Connecting to Google Maps' },
  { icon: '📡', label: 'Sending search query' },
  { icon: '🔍', label: 'Scanning business listings' },
  { icon: '📞', label: 'Extracting phone numbers' },
  { icon: '📍', label: 'Fetching addresses' },
  { icon: '⭐', label: 'Collecting ratings & reviews' },
  { icon: '🌐', label: 'Resolving websites' },
  { icon: '📦', label: 'Packaging results' },
]

const FAKE_NAMES = [
  'Green Valley Clinic', 'Star Dental Care', 'Royal Gym & Spa',
  'Metro Cafe Hub', 'Sunrise Properties', 'Eagle Eye CA Firm',
  'Blue Sky Hotels', 'TechPark Coworks',
]
const FAKE_PHONES = ['+91 98765 43210', '+91 87654 32109', '+91 76543 21098', '—']
const FAKE_RATINGS = ['4.5', '4.2', '3.8', '4.7', '4.0']
const FAKE_ADDRS = ['Sector 15, Noida', 'Connaught Place, Delhi', 'Koramangala, Bengaluru', 'Bandra West, Mumbai']
const PACKET_ICONS = ['📍', '📞', '⭐', '🌐', '📧', '🏢', '📊', '🔗']

function StarRating({ rating }) {
  if (!rating) return <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
  const r = parseFloat(rating)
  if (isNaN(r)) return <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
  const full = Math.min(5, Math.max(0, Math.round(r)))
  return (
    <span style={{ letterSpacing: -1, fontSize: 13 }}>
      <span style={{ color: '#f59e0b' }}>{'★'.repeat(full)}</span>
      <span style={{ color: '#1e293b' }}>{'★'.repeat(5 - full)}</span>
    </span>
  )
}

function Spinner({ size = 18 }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: `2px solid rgba(255,255,255,0.25)`,
      borderTopColor: '#fff', borderRadius: '50%',
      animation: 'spin 0.65s linear infinite', flexShrink: 0,
    }} />
  )
}

// ── SCRAPING ANIMATION ───────────────────────────────────────────────────────
function ScrapingAnimation({ query }) {
  const [step, setStep] = useState(0)
  const [dots, setDots] = useState(0)
  const [packets, setPackets] = useState([])
  const [rows, setRows] = useState([])
  const [progress, setProgress] = useState(0)
  const packetId = useRef(0)

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % SCRAPING_STEPS.length), 900)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 380)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setProgress(p => p >= 90 ? 90 : p + Math.random() * 2.5), 280)
    return () => clearInterval(t)
  }, [])

  // Spawn flying data packets
  useEffect(() => {
    const spawn = () => {
      const id = packetId.current++
      setPackets(p => [...p, {
        id,
        top: Math.random() * 70 + 15,
        dur: (Math.random() * 1.2 + 1.2).toFixed(2),
        icon: PACKET_ICONS[Math.floor(Math.random() * PACKET_ICONS.length)],
      }])
      setTimeout(() => setPackets(p => p.filter(pk => pk.id !== id)), 2800)
    }
    spawn()
    const t = setInterval(spawn, 550)
    return () => clearInterval(t)
  }, [])

  // Skeleton rows that fill in sequentially
  useEffect(() => {
    const initial = Array.from({ length: 8 }, (_, i) => ({ id: i, filled: false }))
    setRows(initial)
    initial.forEach((_, i) => {
      setTimeout(() => {
        setRows(prev => prev.map(r => r.id === i ? {
          ...r, filled: true,
          name: FAKE_NAMES[i],
          phone: FAKE_PHONES[Math.floor(Math.random() * FAKE_PHONES.length)],
          rating: parseFloat(FAKE_RATINGS[Math.floor(Math.random() * FAKE_RATINGS.length)]),
          addr: FAKE_ADDRS[Math.floor(Math.random() * FAKE_ADDRS.length)],
        } : r))
      }, i * 270 + 350)
    })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)', padding: '1rem 0' }}>

      {/* ── Status card ── */}
      <div style={{
        background: 'rgba(15,15,25,0.7)', border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 20, padding: '22px 26px', backdropFilter: 'blur(24px)',
        boxShadow: '0 0 60px rgba(99,102,241,0.12)', position: 'relative', overflow: 'hidden',
      }}>
        {/* shimmer sweep */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.08) 50%, transparent 100%)',
          backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite', borderRadius: 20,
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, animation: 'float 2.5s ease-in-out infinite',
            }}>
              {SCRAPING_STEPS[step].icon}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', letterSpacing: '0.01em' }}>
                {SCRAPING_STEPS[step].label}{'.'.repeat(dots)}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                Query: <em style={{ color: '#818cf8' }}>"{query}"</em>
              </div>
            </div>
          </div>
          <div style={{
            fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#818cf8',
            background: 'rgba(99,102,241,0.12)', padding: '5px 14px', borderRadius: 99,
            border: '1px solid rgba(99,102,241,0.25)',
          }}>
            {Math.round(progress)}%
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', marginBottom: 18 }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: 'linear-gradient(90deg, #4f46e5, #818cf8, #c084fc)',
            backgroundSize: '200% 100%', animation: 'gradientBg 1.5s ease infinite',
            width: `${progress}%`, transition: 'width 0.28s ease',
            boxShadow: '0 0 12px rgba(129,140,248,0.9)',
          }} />
        </div>

        {/* Step pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SCRAPING_STEPS.map((s, i) => (
            <div key={i} style={{
              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
              background: i === step ? 'rgba(99,102,241,0.2)' : i < step ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${i === step ? 'rgba(99,102,241,0.45)' : i < step ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)'}`,
              color: i === step ? '#a5b4fc' : i < step ? '#34d399' : '#475569',
              transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: 4,
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              {i < step ? '✓' : i === step ? '◉' : '○'} {s.label.split(' ').slice(0, 2).join(' ')}
            </div>
          ))}
        </div>
      </div>

      {/* ── Data stream ── */}
      <div style={{
        background: 'rgba(8,8,16,0.6)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'stretch', height: 72,
      }}>
        <div style={{
          padding: '0 20px', display: 'flex', alignItems: 'center',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(0,0,0,0.2)',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#334155', whiteSpace: 'nowrap', gap: 8,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f46e5', boxShadow: '0 0 6px #4f46e5', display: 'inline-block', animation: 'pulseDot 1s ease infinite' }} />
          Data stream
        </div>

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* center line */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, rgba(99,102,241,0.4), transparent)' }} />

          {/* scanline */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.9), transparent)', animation: 'scanX 2.2s linear infinite', zIndex: 2 }} />

          {/* packets */}
          {packets.map(pk => (
            <div key={pk.id} style={{
              position: 'absolute', top: `${pk.top}%`,
              fontSize: 16, lineHeight: 1,
              filter: 'drop-shadow(0 0 5px rgba(129,140,248,0.8))',
              animation: `packetFly ${pk.dur}s linear forwards`,
              zIndex: 3,
            }}>
              {pk.icon}
            </div>
          ))}
        </div>
      </div>

      {/* ── Skeleton table filling in ── */}
      <div style={{
        background: 'rgba(15,15,25,0.5)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(20px)',
      }}>
        {/* header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.6fr 1.8fr',
          padding: '11px 20px', background: 'rgba(0,0,0,0.25)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          {['Business', 'Rating', 'Phone', 'Address'].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#334155' }}>{h}</div>
          ))}
        </div>

        {rows.map((row, i) => (
          <div key={row.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.6fr 1.8fr',
            padding: '13px 20px', alignItems: 'center',
            borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
            transition: 'background 0.4s ease',
            background: row.filled ? 'transparent' : 'rgba(255,255,255,0.003)',
          }}>
            {/* Name */}
            <div style={{ paddingRight: 12 }}>
              {row.filled
                ? <span style={{ fontSize: 13, fontWeight: 600, color: '#c8c8e0', animation: 'fadeUp 0.4s ease' }}>{row.name}</span>
                : <Skel w="75%" />
              }
            </div>
            {/* Rating */}
            <div>
              {row.filled
                ? <span style={{ fontSize: 13, animation: 'fadeUp 0.4s ease' }}>
                  <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(row.rating))}</span>
                  <span style={{ color: '#1e293b' }}>{'★'.repeat(5 - Math.round(row.rating))}</span>
                </span>
                : <Skel w="55%" />
              }
            </div>
            {/* Phone */}
            <div>
              {row.filled
                ? <span style={{
                  fontSize: 11, fontWeight: 600, animation: 'fadeUp 0.4s ease',
                  color: row.phone === '—' ? '#475569' : '#34d399',
                  background: row.phone === '—' ? 'transparent' : 'rgba(16,185,129,0.1)',
                  border: row.phone === '—' ? 'none' : '1px solid rgba(16,185,129,0.2)',
                  padding: row.phone === '—' ? 0 : '3px 9px', borderRadius: 6, display: 'inline-block',
                }}>{row.phone}</span>
                : <Skel w="70%" />
              }
            </div>
            {/* Address */}
            <div>
              {row.filled
                ? <span style={{ fontSize: 12, color: '#64748b', animation: 'fadeUp 0.4s ease' }}>{row.addr}</span>
                : <Skel w="80%" />
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Skel({ w = '100%' }) {
  return (
    <div style={{
      height: 11, width: w, borderRadius: 6,
      background: 'rgba(255,255,255,0.06)',
      backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s linear infinite',
    }} />
  )
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [query, setQuery] = useState('')
  const [data, setData] = useState([])
  const [skip, setSkip] = useState(0)
  const [lastQuery, setLastQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [noMore, setNoMore] = useState(false)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)

  const [filterPhone, setFilterPhone] = useState(false)
  const [filterSite, setFilterSite] = useState(false)
  const [filterMinRating, setFilterMinRating] = useState(0)
  const [focused, setFocused] = useState(false)

  useEffect(() => { inputRef.current?.focus() }, [])

  const doSearch = async (loadMore = false, overrideQuery = null) => {
    const q = (overrideQuery !== null ? overrideQuery : query).trim()
    if (!q) { inputRef.current?.focus(); return }

    let currentSkip = skip
    if (!loadMore || q !== lastQuery) {
      currentSkip = 0; setData([]); setSkip(0); setLastQuery(q); setNoMore(false)
    }

    loadMore ? setLoadingMore(true) : setLoading(true)
    setError(null); setHasSearched(true)

    try {
      const res = await fetch(`${API_URL}?q=${encodeURIComponent(q)}&limit=10&skip=${currentSkip}`)
      if (!res.ok) {
        let msg = `API error ${res.status}`
        try { const d = await res.json(); if (d.details) msg = d.details } catch (_) { }
        throw new Error(msg)
      }
      const newData = await res.json()
      if (newData.length === 0) {
        setNoMore(true)
      } else {
        const merged = loadMore ? [...data, ...newData] : newData
        setData(merged); setSkip(currentSkip + newData.length)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false); setLoadingMore(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') doSearch(false) }
  const quickSearch = (q) => { setQuery(q); doSearch(false, q); setFocused(false) }

  const POPULAR_SEARCHES = [
    "plumbers New York", "dentists London", "cafes Paris", "gyms Mumbai",
    "restaurants Connaught Place Delhi", "dental clinic Noida",
    "gym Bengaluru Koramangala", "ca firm South Delhi", "hotel Jaipur", "coworking space Mumbai Bandra"
  ]
  const suggestions = POPULAR_SEARCHES.filter(s =>
    s.toLowerCase().includes(query.toLowerCase()) && s.toLowerCase() !== query.toLowerCase()
  ).slice(0, 5)

  const filteredData = data.filter(item => {
    if (filterPhone && !item.phone) return false
    if (filterSite && !item.website) return false
    if (filterMinRating > 0) { const r = parseFloat(item.rating); if (isNaN(r) || r < filterMinRating) return false }
    return true
  })

  const downloadCSV = () => {
    if (!filteredData.length) return
    const headers = ['Name', 'Rating', 'Reviews', 'Phone', 'Address', 'Website', 'Google Maps Link']
    const esc = (s) => `"${String(s || '').replace(/"/g, '""')}"`
    const rows = [headers.join(','), ...filteredData.map(i =>
      [esc(i.name), esc(i.rating), esc(i.reviews), esc(i.phone), esc(i.address), esc(i.website), esc(i.google_link)].join(',')
    )]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const copyPhones = () => {
    const phones = filteredData.map(i => i.phone).filter(Boolean).join('\n')
    if (!phones) return
    navigator.clipboard.writeText(phones).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const clearAll = () => {
    setData([]); setSkip(0); setLastQuery(''); setNoMore(false)
    setError(null); setHasSearched(false); setQuery(''); inputRef.current?.focus()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        @keyframes spin        { to { transform: rotate(360deg); } }
        @keyframes fadeUp      { from { opacity:0; transform:translateY(12px) scale(0.99); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes pulseDot    { 0%,100% { opacity:1; box-shadow:0 0 15px #818cf8; } 50% { opacity:0.5; box-shadow:none; } }
        @keyframes gradientBg  { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
        @keyframes float       { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
        @keyframes panGrid     { 0% { background-position:0 0; } 100% { background-position:0 40px; } }
        @keyframes scanLine    { 0%,100% { opacity:0; } 10%,90% { opacity:0.8; } 0% { transform:translateY(0); } 100% { transform:translateY(500px); } }
        @keyframes shimmer     { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        @keyframes packetFly   { 0% { transform:translateX(-40px) scale(0.8); opacity:0; } 8% { opacity:1; transform:translateX(0) scale(1); } 92% { opacity:1; } 100% { transform:translateX(120vw) scale(0.8); opacity:0; } }
        @keyframes scanX       { 0% { left:0; opacity:0; } 8% { opacity:1; } 92% { opacity:1; } 100% { left:100%; opacity:0; } }

        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#050508; overflow-x:hidden; }
        ::selection { background:#818cf8; color:#fff; }
        ::-webkit-scrollbar { width:8px; }
        ::-webkit-scrollbar-track { background:#050508; }
        ::-webkit-scrollbar-thumb { background:#1e1e2e; border-radius:99px; border:2px solid #050508; }

        .lg-root { font-family:'Geist',system-ui,sans-serif; min-height:100vh; color:#e8e8f0; }

        /* HERO */
        .hero { padding:6rem 2.5rem 4rem; display:flex; justify-content:center; }
        .hero-grid {
          position:absolute; inset:0;
          background-image:linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px);
          background-size:40px 40px;
          mask-image:radial-gradient(circle at center,black,transparent 80%);
          -webkit-mask-image:radial-gradient(circle at center,black,transparent 80%);
          pointer-events:none; animation:panGrid 3s linear infinite;
        }
        .hero-grid::after {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(99,102,241,1),transparent);
          box-shadow:0 0 20px 2px rgba(99,102,241,0.5); animation:scanLine 4s linear infinite;
        }
        .hero-glow { position:absolute; top:-20%; left:50%; transform:translateX(-50%); width:800px; height:600px; background:radial-gradient(circle,rgba(99,102,241,0.15) 0%,rgba(192,132,252,0.05) 40%,transparent 70%); pointer-events:none; filter:blur(40px); }
        .hero-content { position:relative; z-index:1; max-width:800px; width:100%; text-align:center; display:flex; flex-direction:column; align-items:center; }

        .badge { display:inline-flex; align-items:center; gap:8px; font-size:11px; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; color:#c7d2fe; background:rgba(79,70,229,0.1); border:1px solid rgba(129,140,248,0.3); box-shadow:0 0 20px rgba(99,102,241,0.15); border-radius:99px; padding:6px 16px; margin-bottom:2rem; backdrop-filter:blur(10px); animation:float 4s ease-in-out infinite; }
        .badge-dot { width:6px; height:6px; border-radius:50%; background:#a5b4fc; box-shadow:0 0 8px #a5b4fc; animation:pulseDot 2s ease infinite; }

        .hero-title { font-family:'Instrument Serif',Georgia,serif; font-size:clamp(3.5rem,6vw,5rem); font-weight:400; line-height:1.05; color:#fff; margin-bottom:1.2rem; }
        .hero-title em { font-style:italic; background:linear-gradient(135deg,#a5b4fc 0%,#c084fc 50%,#a5b4fc 100%); background-size:200% 200%; -webkit-background-clip:text; -webkit-text-fill-color:transparent; display:inline-block; padding-right:0.1em; animation:gradientBg 3s ease infinite; }

        .hero-content > .badge         { animation:fadeUp .8s cubic-bezier(.16,1,.3,1)      forwards; opacity:0; }
        .hero-content > .hero-title    { animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .1s  forwards; opacity:0; }
        .hero-content > .hero-sub      { animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .2s  forwards; opacity:0; }
        .hero-content > .search-wrapper{ animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .3s  forwards; opacity:0; }
        .hero-content > .hero-meta     { animation:fadeUp .8s cubic-bezier(.16,1,.3,1) .4s  forwards; opacity:0; }

        .hero-sub { font-size:17px; color:#94a3b8; font-weight:400; margin-bottom:3.5rem; line-height:1.6; max-width:540px; }

        .hero-floating-leads { position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:0; mask-image:linear-gradient(to bottom, transparent, black 10%, black 90%, transparent); -webkit-mask-image:linear-gradient(to bottom, transparent, black 10%, black 90%, transparent); }
        .float-lead { position:absolute; bottom:-100px; background:rgba(15,15,25,0.7); border:1px solid rgba(99,102,241,0.2); border-radius:12px; padding:10px 14px; display:flex; gap:12px; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.5); backdrop-filter:blur(8px); animation:floatUp 12s linear infinite; opacity:0; }
        .fl-icon { width:24px; height:24px; border-radius:50%; background:rgba(16,185,129,0.15); color:#34d399; display:flex; align-items:center; justify-content:center; font-size:12px; border:1px solid rgba(16,185,129,0.3); position:relative; }
        .fl-icon::after { content:''; position:absolute; inset:-4px; border-radius:50%; border:1px solid rgba(16,185,129,0.4); animation:pulsePing 2s infinite; }
        .fl-info { display:flex; flex-direction:column; gap:3px; text-align:left; }
        .fl-name { font-size:12px; font-weight:600; color:#e2e8f0; letter-spacing:0.02em; }
        .fl-rating { font-size:10px; color:#64748b; font-family:'Geist',monospace; text-transform:uppercase; }
        @keyframes floatUp { 0% { transform:translateY(0) scale(0.85); opacity:0; } 10% { opacity:1; transform:translateY(-80px) scale(1); } 90% { opacity:1; } 100% { transform:translateY(-800px) scale(1.05); opacity:0; } }
        @keyframes pulsePing { 0% { transform:scale(1); opacity:1; } 100% { transform:scale(2); opacity:0; } }
        .fl-0 { right:calc(50% + 380px); animation-duration:14s; animation-delay:0s; }
        .fl-1 { left:calc(50% + 380px); animation-duration:17s; animation-delay:2s; }
        .fl-2 { right:calc(50% + 460px); animation-duration:15s; animation-delay:6s; }
        .fl-3 { left:calc(50% + 460px); animation-duration:18s; animation-delay:9s; }
        .fl-4 { right:calc(50% + 550px); animation-duration:16s; animation-delay:12s; }
        .fl-5 { left:calc(50% + 550px); animation-duration:19s; animation-delay:15s; }

        @media (max-width: 1024px) {
          .hero-floating-leads { display: none; }
        }

        .search-row { display:flex; gap:12px; width:100%; max-width:640px; background:rgba(15,15,25,0.6); padding:8px; border-radius:20px; border:1px solid rgba(255,255,255,0.08); box-shadow:0 20px 40px rgba(0,0,0,0.4),inset 0 0 0 1px rgba(255,255,255,0.02); backdrop-filter:blur(20px); transition:transform .3s cubic-bezier(.175,.885,.32,1.275),box-shadow .3s ease; }
        .search-row:focus-within { transform:translateY(-2px); border-color:rgba(129,140,248,0.4); box-shadow:0 25px 50px rgba(0,0,0,0.5),0 0 30px rgba(99,102,241,0.2); }
        .search-input { flex:1; height:56px; background:transparent; border:none; padding:0 20px; font-size:16px; font-family:'Geist',sans-serif; color:#fff; outline:none; }
        .search-input::placeholder { color:#64748b; }
        .search-btn { height:56px; padding:0 28px; background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%); background-size:200% 200%; animation:gradientBg 5s ease infinite; color:#fff; border:none; border-radius:14px; font-size:15px; font-weight:500; font-family:'Geist',sans-serif; cursor:pointer; display:flex; align-items:center; gap:10px; transition:all .2s; box-shadow:0 4px 15px rgba(79,70,229,0.3); }
        .search-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 25px rgba(79,70,229,0.5); }
        .search-btn:active:not(:disabled) { transform:translateY(1px); }
        .search-btn:disabled { opacity:0.6; cursor:not-allowed; animation:none; }

        .hero-meta { display:flex; gap:24px; margin-top:2.5rem; flex-wrap:wrap; justify-content:center; }
        .hero-meta-item { font-size:13px; color:#64748b; font-weight:500; display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.03); padding:6px 16px; border-radius:99px; border:1px solid rgba(255,255,255,0.05); }

        /* BODY */
        .body { padding:0 2.5rem 5rem; max-width:1200px; margin:0 auto; position:relative; z-index:2; }

        .error-box { display:flex; align-items:flex-start; gap:12px; background:rgba(220,38,38,0.1); border:1px solid rgba(220,38,38,0.3); border-radius:12px; padding:16px 20px; margin-bottom:2rem; color:#fca5a5; font-size:14px; animation:fadeUp .3s; }

        .empty-state { padding:6rem 2rem; text-align:center; animation:fadeUp .5s cubic-bezier(.16,1,.3,1); }
        .empty-icon { width:80px; height:80px; border-radius:24px; background:linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01)); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem; font-size:36px; }
        .empty-title { font-family:'Instrument Serif',serif; font-size:2.2rem; font-weight:400; color:#fff; margin-bottom:.6rem; }
        .empty-sub { font-size:15px; color:#94a3b8; }

        .pills { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; margin-top:2rem; max-width:700px; margin-inline:auto; }
        .pill { font-size:13px; font-weight:500; padding:10px 20px; border-radius:99px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.02); color:#cbd5e1; cursor:pointer; backdrop-filter:blur(10px); transition:all .2s; display:flex; align-items:center; gap:8px; }
        .pill:hover { border-color:rgba(129,140,248,0.5); color:#fff; background:rgba(99,102,241,0.15); transform:translateY(-2px); box-shadow:0 10px 20px rgba(99,102,241,0.15); }

        .toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; flex-wrap:wrap; gap:16px; animation:fadeUp .4s; }
        .toolbar-left { font-size:15px; color:#94a3b8; }
        .toolbar-left strong { color:#fff; font-weight:600; }
        .toolbar-right { display:flex; gap:12px; flex-wrap:wrap; }

        .btn { height:40px; padding:0 16px; border:1px solid rgba(255,255,255,0.1); border-radius:12px; background:rgba(255,255,255,0.03); font-size:13px; font-weight:500; font-family:'Geist',sans-serif; color:#e2e8f0; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all .2s; backdrop-filter:blur(10px); }
        .btn:hover:not(:disabled) { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.2); transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.2); color:#fff; }
        .btn:active:not(:disabled) { transform:translateY(0); }
        .btn:disabled { opacity:.4; cursor:not-allowed; }
        .btn.accent { background:linear-gradient(135deg,#4f46e5,#7c3aed); border:none; color:#fff; box-shadow:0 4px 15px rgba(79,70,229,0.3); }
        .btn.accent:hover:not(:disabled) { box-shadow:0 6px 20px rgba(79,70,229,0.5); }
        .btn.success { background:rgba(16,185,129,0.15); border-color:rgba(16,185,129,0.4); color:#34d399; }

        .table-wrap { background:rgba(15,15,25,0.4); border:1px solid rgba(255,255,255,0.08); border-radius:20px; overflow:hidden; box-shadow:0 25px 50px rgba(0,0,0,0.3); backdrop-filter:blur(20px); animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards; opacity:0; }
        table { width:100%; border-collapse:separate; border-spacing:0; font-size:14px; table-layout:fixed; }
        thead { background:rgba(0,0,0,0.2); }
        th { padding:16px 20px; text-align:left; font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#64748b; border-bottom:1px solid rgba(255,255,255,0.05); }
        tbody tr { transition:all .2s ease; position:relative; }
        tbody tr::after { content:''; position:absolute; left:0; bottom:0; width:100%; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.05) 10%,rgba(255,255,255,0.05) 90%,transparent); }
        tbody tr:last-child::after { display:none; }
        tbody tr:hover { background:rgba(255,255,255,0.03); }
        td { padding:18px 20px; vertical-align:middle; color:#f1f5f9; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .biz-name { font-weight:600; font-size:14px; color:#fff; }
        .phone-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); color:#34d399; border-radius:8px; padding:6px 12px; font-size:12px; font-weight:600; }
        .muted { color:#475569; font-size:13px; font-style:italic; }
        .link-chip { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:#a5b4fc; background:rgba(79,70,229,0.15); border:1px solid rgba(99,102,241,0.3); border-radius:8px; padding:6px 12px; text-decoration:none; margin-right:8px; transition:all .2s; }
        .link-chip:hover { background:rgba(79,70,229,0.25); border-color:rgba(99,102,241,0.5); color:#fff; transform:translateY(-1px); }

        .footer { display:flex; align-items:center; justify-content:space-between; padding:16px 2.5rem; border:1px solid rgba(255,255,255,0.05); background:rgba(15,15,25,0.4); backdrop-filter:blur(20px); font-size:13px; color:#64748b; flex-wrap:wrap; gap:12px; margin-top:2rem; border-radius:20px; }
        .footer-stat { display:flex; align-items:center; gap:16px; font-weight:500; }
        .no-more { text-align:center; padding:1.5rem; font-size:13px; font-weight:500; color:#64748b; background:rgba(0,0,0,0.2); }
        .lspin { width:14px; height:14px; border:2px solid rgba(99,102,241,0.2); border-top-color:#818cf8; border-radius:50%; animation:spin .8s linear infinite; }

        .col-name { width:28%; } .col-rate { width:17%; } .col-phone { width:20%; } .col-addr { width:20%; } .col-link { width:15%; }
      `}</style>

      <div className="lg-root">
        {/* HERO */}
        <div className="hero">
          <div className="hero-grid" />
          <div className="hero-glow" />

          <div className="hero-floating-leads">
            {FAKE_NAMES.slice(0, 6).map((name, i) => (
              <div key={i} className={`float-lead fl-${i}`}>
                <div className="fl-icon">✓</div>
                <div className="fl-info">
                  <div className="fl-name">{name}</div>
                  <div className="fl-rating">Lead extracted • {FAKE_ADDRS[i % FAKE_ADDRS.length].split(',')[0]}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="hero-content">
            <div className="badge"><span className="badge-dot" />Live scraper</div>
            <h1 className="hero-title">Find local business<br /><em>leads, instantly.</em></h1>
            <p className="hero-sub">Extract contacts, ratings &amp; addresses from Google Maps in seconds.</p>

            <div className="search-wrapper" style={{ position: 'relative', width: '100%', maxWidth: 640 }}>
              <div className="search-row">
                <input
                  ref={inputRef} className="search-input" type="text"
                  value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKey}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 200)}
                  placeholder="e.g. dental clinic sector 15 noida"
                  autoComplete="off"
                />
                <button className="search-btn" onClick={() => doSearch(false)} disabled={loading}>
                  {loading && !loadingMore ? <Spinner size={16} /> : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>}
                  Search
                </button>
              </div>

              {focused && suggestions.length > 0 && query.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(15,15,25,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, marginTop: 8, padding: 8, zIndex: 50, textAlign: 'left', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                  {suggestions.map(s => (
                    <div key={s} onMouseDown={e => { e.preventDefault(); quickSearch(s) }}
                      style={{ padding: '10px 16px', cursor: 'pointer', color: '#cbd5e1', fontSize: 14, borderRadius: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ opacity: 0.4, marginRight: 8 }}>🔍</span>{s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hero-meta">
              {[['📍', 'Google Maps data'], ['⚡', 'Real-time results'], ['📄', 'CSV export ready']].map(([icon, label]) => (
                <div key={label} className="hero-meta-item">{icon} {label}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="body">
          {error && (
            <div className="error-box">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error} — Make sure your backend is running on port 3000.
            </div>
          )}

          {!hasSearched && (
            <div className="empty-state">
              <div className="empty-icon">🏪</div>
              <p className="empty-title">Search for any business type</p>
              <p className="empty-sub">Try a location + category to get started</p>
              <div className="pills">
                {QUICK_SEARCHES.map(({ icon, label, q }) => (
                  <button key={q} className="pill" onClick={() => quickSearch(q)}>{icon} {label}</button>
                ))}
              </div>
            </div>
          )}

          {/* ✨ SCRAPING ANIMATION */}
          {loading && !loadingMore && <ScrapingAnimation query={lastQuery || query} />}

          {hasSearched && !loading && data.length > 0 && (
            <>
              <div className="toolbar">
                <div className="toolbar-left" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    Showing <strong>{filteredData.length} leads</strong>
                    {lastQuery && <span style={{ color: '#94a3b8', marginLeft: 4 }}>for "{lastQuery}"</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#cbd5e1' }}>
                      <input type="checkbox" checked={filterPhone} onChange={e => setFilterPhone(e.target.checked)} style={{ accentColor: '#4f46e5' }} />
                      Has Phone
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#cbd5e1' }}>
                      <input type="checkbox" checked={filterSite} onChange={e => setFilterSite(e.target.checked)} style={{ accentColor: '#4f46e5' }} />
                      Has Website
                    </label>
                    <select value={filterMinRating} onChange={e => setFilterMinRating(parseFloat(e.target.value))}
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
                      <option value={0} style={{ color: '#000' }}>Any Rating</option>
                      <option value={3.0} style={{ color: '#000' }}>3.0+ Stars</option>
                      <option value={4.0} style={{ color: '#000' }}>4.0+ Stars</option>
                      <option value={4.5} style={{ color: '#000' }}>4.5+ Stars</option>
                    </select>
                  </div>
                </div>
                <div className="toolbar-right">
                  <button className="btn" onClick={() => doSearch(true)} disabled={noMore || loadingMore}>
                    {loadingMore
                      ? <><div className="lspin" /> Loading…</>
                      : <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>Load more</>
                    }
                  </button>
                  <button className={`btn ${copied ? 'success' : ''}`} onClick={copyPhones} disabled={!filteredData.some(i => i.phone)}>
                    {copied
                      ? <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Copied!</>
                      : <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>Copy phones</>
                    }
                  </button>
                  <button className="btn accent" onClick={downloadCSV}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    Export CSV ({data.length})
                  </button>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th className="col-name">Business</th>
                      <th className="col-rate">Rating</th>
                      <th className="col-phone">Phone</th>
                      <th className="col-addr">Address</th>
                      <th className="col-link">Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, i) => (
                      <tr key={i}>
                        <td className="col-name"><div className="biz-name" title={item.name}>{item.name || 'Unnamed'}</div></td>
                        <td className="col-rate">
                          <StarRating rating={item.rating} />
                          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                            {item.rating && <span>{item.rating} </span>}
                            {item.reviews && <span>({item.reviews})</span>}
                          </div>
                        </td>
                        <td className="col-phone">
                          {item.phone ? <span className="phone-badge">{item.phone}</span> : <span className="muted">No phone</span>}
                        </td>
                        <td className="col-addr" title={item.address} style={{ fontSize: 12, color: '#64748b' }}>{item.address || '—'}</td>
                        <td className="col-link">
                          {item.website && <a className="link-chip" href={item.website} target="_blank" rel="noreferrer">
                            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>Site</a>}
                          {item.google_link && <a className="link-chip" href={item.google_link} target="_blank" rel="noreferrer">
                            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>Map</a>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {noMore && <div className="no-more">✓ All results loaded</div>}
              </div>
            </>
          )}

          {hasSearched && !loading && filteredData.length === 0 && !error && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p className="empty-title">No results found</p>
              <p className="empty-sub">Try broadening your query or a different location</p>
            </div>
          )}
        </div>

        {data.length > 0 && (
          <div className="footer">
            <div className="footer-stat">
              <span>{data.length} leads collected</span>
              {lastQuery && <span style={{ fontStyle: 'italic' }}>"{lastQuery}"</span>}
            </div>
            <button className="btn" style={{ height: 28, fontSize: 12, padding: '0 10px' }} onClick={clearAll}>✕ Clear</button>
          </div>
        )}
      </div>
    </>
  )
}