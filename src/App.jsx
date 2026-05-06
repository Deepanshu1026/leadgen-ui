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

function StarRating({ rating }) {
  if (!rating) return <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
  const r = parseFloat(rating)
  if (isNaN(r)) return <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>

  const full = Math.min(5, Math.max(0, Math.round(r)))
  const empty = 5 - full

  return (
    <span style={{ letterSpacing: -1, fontSize: 13 }}>
      <span style={{ color: '#f59e0b' }}>{'★'.repeat(full)}</span>
      <span style={{ color: '#cbd5e1' }}>{'★'.repeat(empty)}</span>
    </span>
  )
}

function Spinner({ size = 18 }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      border: `2px solid rgba(255,255,255,0.25)`,
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.65s linear infinite',
      flexShrink: 0,
    }} />
  )
}

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
      currentSkip = 0
      setData([])
      setSkip(0)
      setLastQuery(q)
      setNoMore(false)
    }

    loadMore ? setLoadingMore(true) : setLoading(true)
    setError(null)
    setHasSearched(true)

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
        const merged = loadMore ? [...(data), ...newData] : newData
        setData(merged)
        setSkip(currentSkip + newData.length)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') doSearch(false) }

  const quickSearch = (q) => {
    setQuery(q)
    doSearch(false, q)
    setFocused(false)
  }

  const POPULAR_SEARCHES = [
    "plumbers New York", "dentists London", "cafes Paris", "gyms Mumbai", "real estate agents Dubai",
    "software companies San Francisco", "marketing agencies Toronto", "restaurants Connaught Place Delhi",
    "dental clinic Noida", "gym Bengaluru Koramangala", "ca firm South Delhi", "hotel Jaipur", "coworking space Mumbai Bandra"
  ]
  const suggestions = POPULAR_SEARCHES.filter(s => s.toLowerCase().includes(query.toLowerCase()) && s.toLowerCase() !== query.toLowerCase()).slice(0, 5)

  const filteredData = data.filter(item => {
    if (filterPhone && !item.phone) return false
    if (filterSite && !item.website) return false
    if (filterMinRating > 0) {
      const r = parseFloat(item.rating)
      if (isNaN(r) || r < filterMinRating) return false
    }
    return true
  })

  const downloadCSV = () => {
    if (!filteredData.length) return
    const headers = ['Name', 'Rating', 'Reviews', 'Phone', 'Address', 'Website', 'Google Maps Link']
    const esc = (s) => `"${String(s || '').replace(/"/g, '""')}"`
    const rows = [
      headers.join(','),
      ...filteredData.map(i => [
        esc(i.name), esc(i.rating), esc(i.reviews), esc(i.phone),
        esc(i.address), esc(i.website), esc(i.google_link)
      ].join(','))
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const copyPhones = () => {
    const phones = filteredData.map(i => i.phone).filter(Boolean).join('\n')
    if (!phones) return
    navigator.clipboard.writeText(phones).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const clearAll = () => {
    setData([]); setSkip(0); setLastQuery(''); setNoMore(false)
    setError(null); setHasSearched(false); setQuery('')
    inputRef.current?.focus()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; box-shadow: 0 0 15px #818cf8; } 
          50% { opacity: 0.5; box-shadow: 0 0 0px #818cf8; }
        }
        @keyframes gradientBg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes panGrid {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        @keyframes scanLine {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(500px); opacity: 0; }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050508; overflow-x: hidden; }
        ::selection { background: #818cf8; color: #fff; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #050508; }
        ::-webkit-scrollbar-thumb { background: #1e1e2e; border-radius: 99px; border: 2px solid #050508; }
        ::-webkit-scrollbar-thumb:hover { background: #3a3a5a; }

        .lg-root {
          font-family: 'Geist', system-ui, sans-serif;
          min-height: 100vh;
          color: #e8e8f0;
          position: relative;
          overflow: hidden;
        }

        /* HERO */
        .hero {
          padding: 6rem 2.5rem 4rem;
          position: relative;
          display: flex;
          justify-content: center;
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(circle at center, black, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black, transparent 80%);
          pointer-events: none;
          animation: panGrid 3s linear infinite;
        }
        .hero-grid::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,1), transparent);
          box-shadow: 0 0 20px 2px rgba(99,102,241,0.5);
          animation: scanLine 4s linear infinite;
        }
        .hero-glow {
          position: absolute; top: -20%; left: 50%; transform: translateX(-50%);
          width: 800px; height: 600px;
          background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(192,132,252,0.05) 40%, transparent 70%);
          pointer-events: none;
          filter: blur(40px);
          animation: pulseDot 8s ease-in-out infinite alternate;
        }
        .hero-content { 
          position: relative; z-index: 1; max-width: 800px; width: 100%; 
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }

        .badge {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #c7d2fe;
          background: rgba(79, 70, 229, 0.1);
          border: 1px solid rgba(129, 140, 248, 0.3);
          box-shadow: 0 0 20px rgba(99,102,241,0.15);
          border-radius: 99px; padding: 6px 16px;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
          animation: float 4s ease-in-out infinite;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #a5b4fc;
          box-shadow: 0 0 8px #a5b4fc;
          animation: pulseDot 2s ease infinite;
        }

        .hero-title {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(3.5rem, 6vw, 5rem);
          font-weight: 400;
          line-height: 1.05;
          color: #ffffff;
          margin-bottom: 1.2rem;
          text-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .hero-title em {
          font-style: italic;
          background: linear-gradient(135deg, #a5b4fc 0%, #c084fc 50%, #a5b4fc 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          padding-right: 0.1em;
          animation: gradientBg 3s ease infinite;
        }
        
        .hero-content > .badge { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .hero-content > .hero-title { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
        .hero-content > .hero-sub { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
        .hero-content > .search-wrapper { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
        .hero-content > .hero-meta { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }
        .hero-sub {
          font-size: 17px; color: #94a3b8; font-weight: 400;
          margin-bottom: 3.5rem; line-height: 1.6; max-width: 540px;
        }

        /* SEARCH */
        .search-row {
          display: flex; gap: 12px; width: 100%; max-width: 640px;
          background: rgba(15, 15, 25, 0.6);
          padding: 8px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
        }
        .search-row:focus-within {
          transform: translateY(-2px);
          border-color: rgba(129, 140, 248, 0.4);
          box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.2);
        }
        .search-input {
          flex: 1; height: 56px;
          background: transparent;
          border: none;
          padding: 0 20px;
          font-size: 16px;
          font-family: 'Geist', sans-serif;
          color: #fff;
          outline: none;
        }
        .search-input::placeholder { color: #64748b; font-weight: 400; }
        .search-btn {
          height: 56px; padding: 0 28px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          background-size: 200% 200%;
          animation: gradientBg 5s ease infinite;
          color: #fff;
          border: none; border-radius: 14px;
          font-size: 15px; font-weight: 500;
          font-family: 'Geist', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; gap: 10px;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
        }
        .search-btn:hover:not(:disabled) { 
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5); 
        }
        .search-btn:active:not(:disabled) { transform: translateY(1px); }
        .search-btn:disabled { opacity: 0.6; cursor: not-allowed; animation: none; }

        .hero-meta {
          display: flex; gap: 24px; margin-top: 2.5rem; flex-wrap: wrap; justify-content: center;
        }
        .hero-meta-item {
          font-size: 13px; color: #64748b; font-weight: 500;
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.03);
          padding: 6px 16px; border-radius: 99px;
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
        }
        .hero-meta-item svg { opacity: 0.8; }

        /* BODY */
        .body { 
          padding: 0 2.5rem 5rem; 
          max-width: 1200px; margin: 0 auto;
          position: relative; z-index: 2;
        }

        /* ERROR */
        .error-box {
          display: flex; align-items: flex-start; gap: 12px;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 2rem;
          color: #fca5a5; font-size: 14px; font-weight: 500;
          animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.1);
          backdrop-filter: blur(10px);
        }

        /* INITIAL / EMPTY STATE */
        .empty-state {
          padding: 6rem 2rem; text-align: center;
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .empty-icon {
          width: 80px; height: 80px; border-radius: 24px;
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 20px 40px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 36px;
          position: relative;
        }
        .empty-icon::after {
          content: ''; position: absolute; inset: -1px; border-radius: 24px;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          padding: 1px; pointer-events: none;
        }
        .empty-title {
          font-family: 'Instrument Serif', serif;
          font-size: 2.2rem; font-weight: 400;
          color: #fff; margin-bottom: 0.6rem;
        }
        .empty-sub { font-size: 15px; color: #94a3b8; }

        .pills {
          display: flex; flex-wrap: wrap; gap: 12px;
          justify-content: center; margin-top: 2rem; max-width: 700px; margin-inline: auto;
        }
        .pill {
          font-size: 13px; font-weight: 500; padding: 10px 20px;
          border-radius: 99px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          color: #cbd5e1; cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; align-items: center; gap: 8px;
        }
        .pill:hover {
          border-color: rgba(129, 140, 248, 0.5);
          color: #fff;
          background: rgba(99,102,241,0.15);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(99,102,241,0.15);
        }

        /* LOADING */
        .loading-state {
          display: flex; flex-direction: column; align-items: center; gap: 18px;
          padding: 6rem; justify-content: center;
          color: #94a3b8; font-size: 15px; font-weight: 500;
          animation: fadeUp 0.3s ease;
        }
        .loading-spinner {
          width: 36px; height: 36px;
          border: 3px solid rgba(99,102,241,0.2);
          border-top-color: #818cf8;
          border-radius: 50%;
          animation: spin 0.8s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;
        }

        /* TOOLBAR */
        .toolbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.5rem; flex-wrap: wrap; gap: 16px;
          animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .toolbar-left { font-size: 15px; color: #94a3b8; }
        .toolbar-left strong { color: #fff; font-weight: 600; }
        .toolbar-right { display: flex; gap: 12px; flex-wrap: wrap; }

        .btn {
          height: 40px; padding: 0 16px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          font-size: 13px; font-weight: 500;
          font-family: 'Geist', sans-serif;
          color: #e2e8f0; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }
        .btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          color: #fff;
        }
        .btn:active:not(:disabled) { transform: translateY(0); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn.accent {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          border: none;
          color: #fff; 
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
        }
        .btn.accent:hover:not(:disabled) { 
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5); 
        }
        .btn.success {
          background: rgba(16,185,129,0.15);
          border-color: rgba(16,185,129,0.4);
          color: #34d399;
          box-shadow: 0 0 15px rgba(16,185,129,0.1);
        }

        /* TABLE */
        .table-wrap {
          background: rgba(15, 15, 25, 0.4);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
          backdrop-filter: blur(20px);
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; table-layout: fixed; }
        thead { background: rgba(0,0,0,0.2); backdrop-filter: blur(10px); }
        th {
          padding: 16px 20px; text-align: left;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #64748b;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        tbody tr {
          transition: all 0.2s ease;
          position: relative;
        }
        tbody tr::after {
          content: ''; position: absolute; left: 0; bottom: 0; width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 10%, rgba(255,255,255,0.05) 90%, transparent);
        }
        tbody tr:last-child::after { display: none; }
        tbody tr:hover { 
          background: rgba(255,255,255,0.03); 
          transform: scale(1.002);
          z-index: 10;
          box-shadow: 0 0 20px rgba(0,0,0,0.2);
        }
        td {
          padding: 18px 20px; vertical-align: middle;
          color: #f1f5f9; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }

        .biz-name { font-weight: 600; font-size: 14px; color: #fff; letter-spacing: 0.01em; }

        .phone-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          color: #34d399;
          border-radius: 8px; padding: 6px 12px;
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.02em;
        }
        .muted { color: #475569; font-size: 13px; font-style: italic; }

        .link-chip {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600;
          color: #a5b4fc;
          background: rgba(79, 70, 229, 0.15);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 8px; padding: 6px 12px;
          text-decoration: none; margin-right: 8px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .link-chip:hover { 
          background: rgba(79, 70, 229, 0.25);
          border-color: rgba(99,102,241,0.5);
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
        }

        /* FOOTER */
        .footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 2.5rem;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(15, 15, 25, 0.4);
          backdrop-filter: blur(20px);
          font-size: 13px; color: #64748b;
          flex-wrap: wrap; gap: 12px;
          margin-top: 2rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .footer-stat { display: flex; align-items: center; gap: 16px; font-weight: 500; }
        .no-more {
          text-align: center; padding: 1.5rem;
          font-size: 13px; font-weight: 500; color: #64748b;
          background: rgba(0,0,0,0.2);
        }

        .col-name  { width: 28%; }
        .col-rate  { width: 17%; }
        .col-phone { width: 20%; }
        .col-addr  { width: 20%; }
        .col-link  { width: 15%; }
      `}</style>

      <div className="lg-root">
        {/* HERO */}
        <div className="hero">
          <div className="hero-grid" />
          <div className="hero-glow" />
          <div className="hero-content">
            <div className="badge">
              <span className="badge-dot" />
              Live scraper
            </div>
            <h1 className="hero-title">
              Find local business<br />
              <em>leads, instantly.</em>
            </h1>
            <p className="hero-sub">
              Extract contacts, ratings &amp; addresses from Google Maps in seconds.
            </p>

            <div className="search-wrapper" style={{ position: 'relative', width: '100%', maxWidth: 640 }}>
              <div className="search-row">
                <input
                  ref={inputRef}
                  className="search-input"
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKey}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 200)}
                  placeholder="e.g. dental clinic sector 15 noida"
                  autoComplete="off"
                />
                <button
                  className="search-btn"
                  onClick={() => doSearch(false)}
                  disabled={loading}
                >
                  {loading && !loadingMore
                    ? <Spinner size={16} />
                    : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                  }
                  Search
                </button>
              </div>

              {focused && suggestions.length > 0 && query.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: 'rgba(15,15,25,0.95)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
                  marginTop: 8, padding: 8, zIndex: 50, textAlign: 'left',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}>
                  {suggestions.map(s => (
                    <div key={s}
                      onMouseDown={(e) => { e.preventDefault(); quickSearch(s); }}
                      style={{ padding: '10px 16px', cursor: 'pointer', color: '#cbd5e1', fontSize: 14, borderRadius: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ opacity: 0.5, marginRight: 8 }}>🔍</span> {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hero-meta">
              {[
                ['📍', 'Google Maps data'],
                ['⚡', 'Real-time results'],
                ['📄', 'CSV export ready'],
              ].map(([icon, label]) => (
                <div key={label} className="hero-meta-item">{icon} {label}</div>
              ))}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="body">
          {/* Error */}
          {error && (
            <div className="error-box">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error} — Make sure your backend is running on port 3000.
            </div>
          )}

          {/* Initial state */}
          {!hasSearched && (
            <div className="empty-state">
              <div className="empty-icon">🏪</div>
              <p className="empty-title">Search for any business type</p>
              <p className="empty-sub">Try a location + category to get started</p>
              <div className="pills">
                {QUICK_SEARCHES.map(({ icon, label, q }) => (
                  <button
                    key={q}
                    className="pill"
                    onClick={() => { quickSearch(q) }}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && !loadingMore && (
            <div className="loading-state">
              <div className="loading-spinner" />
              <span>Connecting to Google Maps…</span>
            </div>
          )}

          {/* Results */}
          {hasSearched && !loading && data.length > 0 && (
            <>
              <div className="toolbar">
                <div className="toolbar-left" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    Showing <strong>{filteredData.length} leads</strong>
                    {lastQuery && <span style={{ color: '#94a3b8', marginLeft: 4 }}>for "{lastQuery}"</span>}
                  </div>

                  {/* Filters */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#cbd5e1' }}>
                      <input type="checkbox" checked={filterPhone} onChange={e => setFilterPhone(e.target.checked)} style={{ accentColor: '#4f46e5' }} />
                      Has Phone
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#cbd5e1' }}>
                      <input type="checkbox" checked={filterSite} onChange={e => setFilterSite(e.target.checked)} style={{ accentColor: '#4f46e5' }} />
                      Has Website
                    </label>
                    <select
                      value={filterMinRating}
                      onChange={e => setFilterMinRating(parseFloat(e.target.value))}
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', fontSize: 13, outline: 'none', cursor: 'pointer' }}
                    >
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
                      ? <><div className="loading-spinner" style={{ width: 14, height: 14, borderTopColor: '#4f46e5' }} /> Loading…</>
                      : <>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                        Load more
                      </>
                    }
                  </button>
                  <button
                    className={`btn ${copied ? 'success' : ''}`}
                    onClick={copyPhones}
                    disabled={!filteredData.some(i => i.phone)}
                  >
                    {copied
                      ? <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> Copied!</>
                      : <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg> Copy phones</>
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
                        <td className="col-name">
                          <div className="biz-name" title={item.name}>{item.name || 'Unnamed'}</div>
                        </td>
                        <td className="col-rate">
                          <StarRating rating={item.rating} />
                          <div style={{ fontSize: 11, color: '#3a3a5a', marginTop: 2 }}>
                            {item.rating && <span>{item.rating} </span>}
                            {item.reviews && <span>({item.reviews})</span>}
                          </div>
                        </td>
                        <td className="col-phone">
                          {item.phone
                            ? <span className="phone-badge">{item.phone}</span>
                            : <span className="muted">No phone</span>
                          }
                        </td>
                        <td className="col-addr" title={item.address} style={{ fontSize: 12, color: '#64648a' }}>
                          {item.address || '—'}
                        </td>
                        <td className="col-link">
                          {item.website && (
                            <a className="link-chip" href={item.website} target="_blank" rel="noreferrer">
                              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
                              Site
                            </a>
                          )}
                          {item.google_link && (
                            <a className="link-chip" href={item.google_link} target="_blank" rel="noreferrer">
                              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                              Map
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {noMore && <div className="no-more">✓ All results loaded</div>}
              </div>
            </>
          )}

          {/* Empty search result */}
          {hasSearched && !loading && filteredData.length === 0 && !error && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p className="empty-title">No results found</p>
              <p className="empty-sub">Try broadening your query or a different location</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {data.length > 0 && (
          <div className="footer">
            <div className="footer-stat">
              <span>{data.length} leads collected</span>
              {lastQuery && <span style={{ fontStyle: 'italic' }}>"{lastQuery}"</span>}
            </div>
            <button className="btn" style={{ height: 28, fontSize: 12, padding: '0 10px' }} onClick={clearAll}>
              ✕ Clear
            </button>
          </div>
        )}
      </div>
    </>
  )
}