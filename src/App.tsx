import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Server, Cpu, Download, ChevronRight, Rocket, Home, Info, FileText, Database, Network, Plane, Truck, Lock } from 'lucide-react';
import { CapabilityStatementModal } from './components/CapabilityStatementModal';
import { ClientPortalModal } from './components/ClientPortalModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const tacticalIcon = new L.DivIcon({
  className: 'custom-tactical-icon',
  html: `<div style="background-color: #C5B358; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #0B1426; box-shadow: 0 0 15px rgba(197,179,88,0.8); position: relative;"><div style="position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px; border: 1px solid rgba(197,179,88,0.4); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const AnimatedTruckMarker = ({ start, end, duration, delay }: { start: [number, number], end: [number, number], duration: number, delay: number }) => {
  const [pos, setPos] = useState<[number, number]>(start);
  const [isFlipped, setIsFlipped] = useState(end[1] > start[1]);
  
  React.useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      
      if (elapsed < delay) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      
      const cycle = ((elapsed - delay) % duration) / duration;
      const progress = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2;
      
      const lat = start[0] + (end[0] - start[0]) * progress;
      const lng = start[1] + (end[1] - start[1]) * progress;
      
      setPos([lat, lng]);
      setIsFlipped(cycle < 0.5 ? end[1] > start[1] : start[1] > end[1]);
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [start, end, duration, delay]);

  const truckIcon = React.useMemo(() => new L.DivIcon({
    html: `<div style="color: #94a3b8; filter: drop-shadow(0 0 8px rgba(148,163,184,0.6)); transform: scaleX(${isFlipped ? -1 : 1});"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>`,
    className: 'custom-truck-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  }), [isFlipped]);

  return <Marker position={pos} icon={truckIcon} />;
};

const RadialDockItem = ({ label, icon: Icon, onClick, active, x, y, index }: any) => (
  <motion.button
    initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
    animate={{ opacity: 1, x, y, scale: 1 }}
    exit={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
    transition={{ type: "spring", stiffness: 280, damping: 22, delay: index * 0.045 }}
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={{ position: 'absolute', right: 0, top: 0 }}
    className={`group flex items-center gap-2.5 px-5 py-2.5 -skew-x-12 transition-colors duration-300 rounded-sm whitespace-nowrap ${
      active 
        ? 'border border-vanguardGold bg-gradient-to-br from-vanguardGold via-yellow-500 to-yellow-600 text-missionNavy shadow-[0_0_25px_rgba(197,179,88,0.75)]' 
        : 'border border-vanguardGold/40 bg-missionNavy/95 text-gray-200 hover:bg-tacticalSlate hover:text-vanguardGold hover:border-vanguardGold hover:shadow-[0_0_20px_rgba(197,179,88,0.45)] backdrop-blur-md'
    }`}
  >
    <span className={`w-2 h-2 rounded-full skew-x-12 ${active ? 'bg-missionNavy' : 'bg-vanguardGold shadow-[0_0_8px_rgba(197,179,88,0.9)]'}`} />
    {Icon && <Icon className={`w-3.5 h-3.5 skew-x-12 ${active ? 'text-missionNavy' : 'text-vanguardGold'}`} />}
    <span className="skew-x-12 font-serif font-bold italic tracking-[0.18em] text-xs md:text-sm uppercase drop-shadow-md relative z-10">
      {label}
    </span>
  </motion.button>
);

interface LiveNewsItem {
  id: string;
  source: string;
  sourceCode: string;
  accentColor: string;
  title: string;
  summary: string;
  time: string;
  pubTimestamp: number;
  agency: string;
  track: string;
  status: string;
  url: string;
  isKeyStory?: boolean;
}

const LIVE_RSS_FEEDS = [
  { url: 'https://federalnewsnetwork.com/feed/', source: 'Federal News Network', code: 'FNN', accent: '#38bdf8' },
  { url: 'https://defensescoop.com/feed/', source: 'DefenseScoop', code: 'DSCOOP', accent: '#C5B358' },
  { url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', source: 'CISA Advisories', code: 'CISA', accent: '#f87171' },
  { url: 'https://www.nextgov.com/rss/all/', source: 'Nextgov / FCW', code: 'NXTGOV', accent: '#34d399' },
  { url: 'https://breakingdefense.com/feed/', source: 'Breaking Defense', code: 'BRKDEF', accent: '#a78bfa' },
];

const FALLBACK_LIVE_ITEMS: LiveNewsItem[] = [
  {
    id: 'seed-1',
    source: 'Federal News Network',
    sourceCode: 'FNN',
    accentColor: '#38bdf8',
    title: 'Army Launches Project Gatekeeper to Accelerate Tactical Software Approvals',
    summary: 'New continuous authority-to-operate pipeline cuts weapon and enterprise software accreditation timelines.',
    time: 'LIVE • TODAY',
    pubTimestamp: Date.now() - 1800 * 1000,
    agency: 'U.S. Army / DoD',
    track: 'NAICS 541519',
    status: 'KEY BRIEFING',
    url: 'https://federalnewsnetwork.com/',
    isKeyStory: true,
  },
  {
    id: 'seed-2',
    source: 'CISA Advisories',
    sourceCode: 'CISA',
    accentColor: '#f87171',
    title: 'CISA Adds Known Exploited Vulnerabilities to Federal Remediation Catalog',
    summary: 'Binding Operational Directive 22-01 mandates rapid patching across federal civilian executive branch networks.',
    time: 'LIVE • TODAY',
    pubTimestamp: Date.now() - 3600 * 1000,
    agency: 'DHS / CISA',
    track: 'NAICS 541512',
    status: 'CYBER ALERT',
    url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml',
    isKeyStory: true,
  },
  {
    id: 'seed-3',
    source: 'DefenseScoop',
    sourceCode: 'DSCOOP',
    accentColor: '#C5B358',
    title: 'Pentagon Expands Space Operations & Tactical SATCOM Acquisition Architecture',
    summary: 'Combatant commands prioritize resilient commercial and defense satellite integration across theater networks.',
    time: 'LIVE • 2h ago',
    pubTimestamp: Date.now() - 7200 * 1000,
    agency: 'DoD / Space Ops',
    track: 'NAICS 334220',
    status: 'ACQUISITION',
    url: 'https://defensescoop.com/',
    isKeyStory: false,
  },
  {
    id: 'seed-4',
    source: 'Nextgov / FCW',
    sourceCode: 'NXTGOV',
    accentColor: '#34d399',
    title: 'Federal Agencies Spearhead Enterprise AI & Cloud Modernization Directives',
    summary: 'OMB and GSA acquisition vehicles streamline small-business VAR participation in high-security AI workloads.',
    time: 'LIVE • 3h ago',
    pubTimestamp: Date.now() - 10800 * 1000,
    agency: 'OMB / GSA',
    track: 'NAICS 541519',
    status: 'MODERNIZATION',
    url: 'https://www.nextgov.com/',
    isKeyStory: true,
  },
  {
    id: 'seed-5',
    source: 'Breaking Defense',
    sourceCode: 'BRKDEF',
    accentColor: '#a78bfa',
    title: 'Autonomous Systems & Secure Supply Chain Resilience Top Defense Priorities',
    summary: 'NIST 800-171 and CMMC 2.0 compliance enforced across prime and sub-tier hardware procurement.',
    time: 'LIVE • 4h ago',
    pubTimestamp: Date.now() - 14400 * 1000,
    agency: 'Pentagon / DLA',
    track: 'NAICS 334111',
    status: 'POLICY',
    url: 'https://breakingdefense.com/',
    isKeyStory: false,
  },
];

const stripHtmlText = (raw: string = '') =>
  raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#8217;|&rsquo;/gi, "'")
    .replace(/&#8220;|&#8221;/gi, '"')
    .replace(/&#8211;|&#8212;/gi, '—')
    .replace(/\s+/g, ' ')
    .trim();

const formatRelativeTime = (pubDateStr: string) => {
  const parsed = Date.parse(pubDateStr.replace(' ', 'T') + (pubDateStr.includes('Z') ? '' : 'Z'));
  if (isNaN(parsed)) return 'LIVE • TODAY';
  const diffMins = Math.max(1, Math.floor((Date.now() - parsed) / 60000));
  if (diffMins < 60) return `LIVE • ${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `LIVE • ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const inferProcurementMetadata = (title: string, sourceCode: string) => {
  const t = title.toLowerCase();
  let agency = 'Federal / DoD';
  if (t.includes('army') || t.includes('ausa')) agency = 'U.S. Army';
  else if (t.includes('navy') || t.includes('marine')) agency = 'U.S. Navy';
  else if (t.includes('air force') || t.includes('space')) agency = 'USAF / Space';
  else if (t.includes('cisa') || t.includes('vulnerabilit') || t.includes('cyber')) agency = 'DHS / CISA';
  else if (t.includes('va ') || t.includes('veteran')) agency = 'Dept. of VA';
  else if (t.includes('gsa') || t.includes('opm') || t.includes('workforce')) agency = 'GSA / OPM';
  else if (t.includes('pentagon') || t.includes('dod') || t.includes('hegseth') || t.includes('defense')) agency = 'Pentagon / DoD';

  let track = 'NAICS 541519';
  let status = 'INTEL BRIEF';
  if (t.includes('cyber') || t.includes('vulnerabilit') || t.includes('zero trust') || sourceCode === 'CISA') {
    track = 'NAICS 541512';
    status = 'CYBER ALERT';
  } else if (t.includes('ai') || t.includes('software') || t.includes('cloud') || t.includes('data')) {
    track = 'NAICS 541519';
    status = 'AI / CLOUD';
  } else if (t.includes('contract') || t.includes('award') || t.includes('rfp') || t.includes('procurement') || t.includes('budget')) {
    track = 'NAICS 334111';
    status = 'PROCUREMENT';
  } else if (t.includes('space') || t.includes('autonom') || t.includes('drone') || t.includes('weapon')) {
    track = 'NAICS 334220';
    status = 'TACTICAL';
  }

  // Score for "Key News of the Day" (pinned for the day like Google News Top Stories)
  let score = 0;
  const highValueTerms = ['army', 'dod', 'pentagon', 'cisa', 'cyber', 'ai', 'software', 'cloud', 'contract', 'billion', 'million', 'space', 'autonom', 'moderniz', 'zero trust', 'cmmc'];
  highValueTerms.forEach((term) => {
    if (t.includes(term)) score += 2;
  });
  if (sourceCode === 'CISA' || sourceCode === 'FNN' || sourceCode === 'DSCOOP') score += 1;

  return { agency, track, status, score };
};

const ProcurementNews = () => {
  const [countdown, setCountdown] = useState(60);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newsItems, setNewsItems] = useState<LiveNewsItem[]>(FALLBACK_LIVE_ITEMS);
  const [hoveredCard, setHoveredCard] = useState<{ item: LiveNewsItem; index: number; rect: DOMRect } | null>(null);

  const fetchLiveRSSFeeds = React.useCallback(async () => {
    const todayKey = `fix_daily_key_news_${new Date().toISOString().slice(0, 10)}`;
    let pinnedTodayIds: string[] = [];
    try {
      const saved = localStorage.getItem(todayKey);
      if (saved) pinnedTodayIds = JSON.parse(saved);
    } catch {
      // ignore storage errors
    }

    try {
      const results = await Promise.allSettled(
        LIVE_RSS_FEEDS.map(async (feed) => {
          const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
          const data = await res.json();
          if (data.status !== 'ok' || !Array.isArray(data.items)) return [];
          return data.items.slice(0, 5).map((entry: any, idx: number) => {
            const cleanTitle = stripHtmlText(entry.title || 'Federal Procurement & Defense Briefing');
            const cleanSummary = stripHtmlText(entry.description || entry.content || '') || 'Live federal acquisition, defense technology, and cybersecurity intelligence dispatch.';
            const meta = inferProcurementMetadata(cleanTitle, feed.code);
            const pubTimestamp = Date.parse((entry.pubDate || '').replace(' ', 'T')) || Date.now() - idx * 600000;
            const id = entry.guid || entry.link || `${feed.code}-${idx}`;
            return {
              id,
              source: feed.source,
              sourceCode: feed.code,
              accentColor: feed.accent,
              title: cleanTitle,
              summary: cleanSummary.slice(0, 140),
              time: formatRelativeTime(entry.pubDate || ''),
              pubTimestamp,
              agency: meta.agency,
              track: meta.track,
              status: meta.status,
              url: entry.link || feed.url,
              _score: meta.score,
            };
          });
        })
      );

      const merged = results
        .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
        .flatMap((r) => r.value);

      if (merged.length > 0) {
        // Sort newest first
        merged.sort((a, b) => b.pubTimestamp - a.pubTimestamp);

        // Determine Key Stories of the Day (persisted for today like Google News Top Stories)
        if (pinnedTodayIds.length === 0) {
          const topByScore = [...merged]
            .sort((a, b) => b._score - a._score || b.pubTimestamp - a.pubTimestamp)
            .slice(0, 5)
            .map((item) => item.id);
          pinnedTodayIds = topByScore;
          try {
            localStorage.setItem(todayKey, JSON.stringify(pinnedTodayIds));
          } catch {
            // ignore storage errors
          }
        }

        const tagged: LiveNewsItem[] = merged.map((item) => ({
          ...item,
          isKeyStory: pinnedTodayIds.includes(item.id),
        }));

        // Interleave Key Stories at the front & evenly across the stream so key daily news stays prominent all day
        const keyStories = tagged.filter((t) => t.isKeyStory);
        const regularStories = tagged.filter((t) => !t.isKeyStory);
        const finalStream: LiveNewsItem[] = [];
        let kIdx = 0;
        let rIdx = 0;
        while (kIdx < keyStories.length || rIdx < regularStories.length) {
          if (kIdx < keyStories.length) finalStream.push(keyStories[kIdx++]);
          if (rIdx < regularStories.length) finalStream.push(regularStories[rIdx++]);
          if (rIdx < regularStories.length) finalStream.push(regularStories[rIdx++]);
        }

        setNewsItems(finalStream.slice(0, 18));
      }
    } catch {
      // Keep fallback live items if offline
    }
  }, []);

  React.useEffect(() => {
    fetchLiveRSSFeeds();
  }, [fetchLiveRSSFeeds]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRefreshing(true);
          fetchLiveRSSFeeds();
          setTimeout(() => setIsRefreshing(false), 1500);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [fetchLiveRSSFeeds]);

  return (
    <section id="procurement-news" className="w-full bg-transparent border-b border-glassBorder pt-12 pb-20 mt-24 mb-24 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-vanguardGold/5 blur-[120px] pointer-events-none" />
      
      {/* Refresh Timer (Only visible when hovering over a card) */}
      <AnimatePresence>
        {hoveredCard && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed top-6 left-6 z-[100] flex items-center space-x-3 pointer-events-none"
          >
            <span className="font-cursive text-lg text-blue-400 opacity-90 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]">Refresh</span>
            <div className="relative flex items-center justify-center">
              <motion.div 
                animate={isRefreshing ? { 
                  scale: [1, 1.5, 1], 
                  borderColor: ["rgba(197,179,88,0.3)", "rgba(197,179,88,1)", "rgba(197,179,88,0.3)"],
                  boxShadow: ["0 0 15px rgba(197,179,88,0.2)", "0 0 30px rgba(197,179,88,0.8)", "0 0 15px rgba(197,179,88,0.2)"]
                } : {}}
                transition={{ duration: 1 }}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-vanguardGold/50 bg-black/60 shadow-[0_0_15px_rgba(197,179,88,0.4)] backdrop-blur-md"
              >
                <span className="text-[11px] font-mono text-transparent bg-clip-text bg-gradient-to-b from-vanguardGold to-yellow-200 font-bold tracking-tighter drop-shadow-sm">
                  {countdown}
                </span>
              </motion.div>
              {isRefreshing && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border-2 border-vanguardGold pointer-events-none"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hovered Card Portal/Overlay (Compact NBA-RSS Broadcast Style) */}
      <AnimatePresence>
        {hoveredCard && (
          <motion.div
            key={hoveredCard.index}
            initial={{ opacity: 0, scale: 1, y: 0 }}
            animate={{ opacity: 1, scale: 1.06, y: -8 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.1 } }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: 'fixed',
              top: hoveredCard.rect.top,
              left: hoveredCard.rect.left,
              width: hoveredCard.rect.width,
              height: hoveredCard.rect.height,
              zIndex: 1000,
            }}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => window.open(hoveredCard.item.url, '_blank', 'noopener,noreferrer')}
            className={`flex flex-col bg-[#081020] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm overflow-hidden cursor-pointer -skew-x-6 ${
              hoveredCard.item.isKeyStory
                ? 'border-2 border-vanguardGold shadow-[0_25px_55px_rgba(0,0,0,0.95),0_0_35px_rgba(197,179,88,0.4)]'
                : 'border border-vanguardGold/60 shadow-[0_25px_55px_rgba(0,0,0,0.95),0_0_25px_rgba(255,255,255,0.12)]'
            }`}
          >
            {/* Top accent bar */}
            <div
              className="h-1 w-full shrink-0"
              style={{
                background: hoveredCard.item.isKeyStory
                  ? 'linear-gradient(90deg, #C5B358, #FDE047, #C5B358)'
                  : hoveredCard.item.accentColor,
              }}
            />
            <div className="flex flex-col h-full w-full skew-x-6 px-5 py-4 justify-between">
              {/* Top NBA-RSS Scoreboard Strip */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="px-2 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase tracking-wider text-missionNavy shrink-0"
                    style={{ backgroundColor: hoveredCard.item.accentColor }}
                  >
                    {hoveredCard.item.sourceCode}
                  </span>
                  <span className="text-[10px] font-mono text-slate-300 truncate">
                    {hoveredCard.item.source}
                  </span>
                </div>
                {hoveredCard.item.isKeyStory ? (
                  <span className="px-2 py-0.5 rounded bg-vanguardGold text-missionNavy font-mono text-[9px] font-extrabold uppercase tracking-wider shrink-0 shadow-[0_0_12px_rgba(197,179,88,0.6)]">
                    ★ KEY TODAY
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-vanguardGold shrink-0">
                    {hoveredCard.item.time}
                  </span>
                )}
              </div>

              {/* Centered Headline & Summary */}
              <div className="flex flex-col items-center justify-center text-center flex-grow px-1">
                <h4 className="text-[14.5px] font-sans font-bold text-vanguardGold leading-[1.32] tracking-[-0.01em] line-clamp-3 text-balance drop-shadow-sm">
                  {hoveredCard.item.title}
                </h4>
              </div>

              {/* Bottom 3-Column Box Score Strip */}
              <div className="grid grid-cols-3 items-center gap-1 pt-2.5 border-t border-white/15 text-[10px] font-mono">
                <div className="text-left truncate">
                  <span className="block text-[8px] uppercase text-slate-400 tracking-wider">AGENCY</span>
                  <span className="text-white font-semibold truncate">{hoveredCard.item.agency}</span>
                </div>
                <div className="text-center truncate">
                  <span className="block text-[8px] uppercase text-slate-400 tracking-wider">TRACK</span>
                  <span className="text-vanguardGold font-bold truncate">{hoveredCard.item.track}</span>
                </div>
                <div className="text-right truncate">
                  <span className="block text-[8px] uppercase text-slate-400 tracking-wider">ACTION</span>
                  <span className="text-emerald-400 font-bold">READ ↗</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Refresh Scanning Effect */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div 
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '200%', opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-vanguardGold/40 to-transparent z-50 skew-x-12 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Live News Border Header */}
      <div className="w-full relative z-20 px-10 flex items-end">
        <div className="flex items-end w-full">
          <div className="flex items-center gap-4 bg-gradient-to-br from-tacticalSlate/90 to-missionNavy/90 border-l border-t border-r border-vanguardGold/40 px-7 py-2.5 rounded-tl-xl rounded-tr-sm backdrop-blur-md relative z-10 translate-y-[1px] shadow-[0_-5px_15px_rgba(0,0,0,0.3)] -skew-x-6">
            <div className="skew-x-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-vanguardGold font-serif italic font-bold tracking-[0.28em] text-sm md:text-base uppercase drop-shadow-[0_0_15px_rgba(197,179,88,0.8)]">
                Live News
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-slate-300 border-l border-white/15 pl-3">
                ★ Key Briefings Pinned Today
              </span>
            </div>
          </div>
          <div className="flex-grow h-[1px] bg-gradient-to-r from-vanguardGold/60 via-white/10 to-transparent translate-y-[1px]"></div>
        </div>
      </div>

      <motion.div 
        animate={isRefreshing ? { opacity: [1, 0.5, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] } : {}}
        transition={{ duration: 1.5 }}
        className="flex overflow-hidden relative w-full z-10"
      >
        <div 
          className="flex animate-scroll-left min-w-max px-10 pb-8 pt-4 gap-5"
          style={{ animationDuration: '95s' }}
        >
          {[...newsItems, ...newsItems].map((item, i) => (
            <motion.div 
              key={`news-item-${i}`} 
              initial={isRefreshing ? { opacity: 0, scale: 0.95 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: (i % 10) * 0.04 }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredCard({ item, index: i, rect });
              }}
              style={{ opacity: hoveredCard?.index === i ? 0 : 1 }}
              className={`flex flex-col rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm overflow-hidden transition-all duration-500 ease-in-out group w-[285px] md:w-[315px] h-[195px] shrink-0 backdrop-blur-md -skew-x-6 relative ${
                item.isKeyStory
                  ? 'bg-gradient-to-br from-[#13203B]/95 via-missionNavy/95 to-[#1E1B10]/90 border border-vanguardGold/75 shadow-[0_10px_28px_rgba(197,179,88,0.18)]'
                  : 'bg-gradient-to-br from-tacticalSlate/90 via-tacticalSlate/65 to-missionNavy/95 border-l border-t border-white/15 border-r border-b border-black/80 shadow-[10px_0_18px_-5px_rgba(0,0,0,0.65)]'
              }`}
            >
              {/* Top NBA-Scoreboard Color Bar */}
              <div
                className="h-1 w-full shrink-0"
                style={{
                  background: item.isKeyStory
                    ? 'linear-gradient(90deg, #C5B358, #FDE047, #C5B358)'
                    : item.accentColor,
                }}
              />

              <div className="flex flex-col h-full w-full skew-x-6 px-5 py-4 justify-between relative z-20">
                {/* Row 1: Feed Ticker Tag & Pinned/Time Status */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase tracking-wider text-missionNavy shrink-0"
                      style={{ backgroundColor: item.accentColor }}
                    >
                      {item.sourceCode}
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 truncate">
                      {item.source}
                    </span>
                  </div>
                  {item.isKeyStory ? (
                    <span className="px-2 py-0.5 rounded bg-vanguardGold/20 border border-vanguardGold text-vanguardGold font-mono text-[9px] font-extrabold uppercase tracking-wider shrink-0">
                      ★ KEY TODAY
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-vanguardGold/90 shrink-0">
                      {item.time}
                    </span>
                  )}
                </div>

                {/* Row 2: Centered, Balanced Story Headline */}
                <div className="flex flex-col items-center justify-center text-center flex-grow px-1">
                  <h4
                    className={`text-[14px] md:text-[14.5px] font-sans font-semibold leading-[1.34] tracking-[-0.01em] line-clamp-3 text-balance transition-colors drop-shadow-sm ${
                      item.isKeyStory
                        ? 'text-vanguardGold font-bold'
                        : 'text-slate-50 group-hover:text-vanguardGold'
                    }`}
                  >
                    {item.title}
                  </h4>
                </div>

                {/* Row 3: NBA-Ticker Style 3-Column Box Score Strip */}
                <div className="grid grid-cols-3 items-center gap-1 pt-2.5 border-t border-glassBorder/40 text-[10px] font-mono">
                  <div className="text-left truncate">
                    <span className="block text-[8px] uppercase text-slate-400 tracking-wider">AGENCY</span>
                    <span className="text-slate-100 font-semibold truncate">{item.agency}</span>
                  </div>
                  <div className="text-center truncate">
                    <span className="block text-[8px] uppercase text-slate-400 tracking-wider">TRACK</span>
                    <span className="text-vanguardGold font-bold truncate">{item.track}</span>
                  </div>
                  <div className="text-right truncate">
                    <span className="block text-[8px] uppercase text-slate-400 tracking-wider">STATUS</span>
                    <span className={item.isKeyStory ? 'text-vanguardGold font-bold' : 'text-slate-200 font-medium'}>
                      {item.isKeyStory ? 'PINNED' : item.status}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

const FixLogo = ({ className = "w-full h-full drop-shadow-2xl max-w-md" }: { className?: string }) => (
  <svg viewBox="0 0 400 400" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#C5B358" />
      </linearGradient>
      <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#0B1426" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.5"/>
      </filter>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Outer Tech Rings (Animated) */}
    <circle cx="200" cy="200" r="180" fill="none" stroke="url(#goldGrad)" strokeWidth="2" strokeDasharray="4 8 16 8" opacity="0.6">
      <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="30s" repeatCount="indefinite" />
    </circle>
    <circle cx="200" cy="200" r="165" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="100 20" opacity="0.4">
      <animateTransform attributeName="transform" type="rotate" from="360 200 200" to="0 200 200" dur="20s" repeatCount="indefinite" />
    </circle>

    {/* Main Cyber Shield */}
    <path d="M 200 30 L 340 70 L 340 200 C 340 300 200 360 200 360 C 200 360 60 300 60 200 L 60 70 Z" fill="url(#navyGrad)" stroke="url(#goldGrad)" strokeWidth="4" filter="url(#shadow)" />
    
    {/* Shield Inner Bevel & Grid */}
    <path d="M 200 45 L 325 80 L 325 195 C 325 285 200 340 200 340 C 200 340 75 285 75 195 L 75 80 Z" fill="#0F172A" stroke="#334155" strokeWidth="2" />
    <g stroke="#1E293B" strokeWidth="2" opacity="0.8">
      <line x1="200" y1="45" x2="200" y2="340" />
      <line x1="75" y1="195" x2="325" y2="195" />
      <path d="M 120 120 L 150 150 L 150 240" fill="none" />
      <path d="M 280 120 L 250 150 L 250 240" fill="none" />
    </g>

    {/* Scanning Line Animation */}
    <line x1="60" y1="70" x2="340" y2="70" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.2" filter="url(#glow)">
      <animate attributeName="y1" values="70;360;70" dur="6s" repeatCount="indefinite" />
      <animate attributeName="y2" values="70;360;70" dur="6s" repeatCount="indefinite" />
    </line>

    {/* Robotic F.I.X Lettering */}
    <g transform="translate(0, -15)">
      {/* Solid Base */}
      <g fill="url(#goldGrad)" filter="url(#shadow)">
        <path d="M 93 210 L 93 120 L 148 120 L 158 135 L 118 135 L 118 155 L 143 155 L 153 170 L 118 170 L 118 210 Z" />
        <polygon points="163,200 173,200 178,210 168,210" />
        <polygon points="188,120 213,120 213,210 188,210" />
        <polygon points="223,200 233,200 238,210 228,210" />
        <path d="M 248 120 L 268 120 L 278 150 L 288 120 L 308 120 L 288 165 L 308 210 L 288 210 L 278 180 L 268 210 L 248 210 L 268 165 Z" />
      </g>
      
      {/* Animated Glowing Traces */}
      <g fill="none" stroke="#FFFFFF" strokeWidth="2" filter="url(#glow)" opacity="0.9">
        <path d="M 93 210 L 93 120 L 148 120 L 158 135 L 118 135 L 118 155 L 143 155 L 153 170 L 118 170 L 118 210 Z" strokeDasharray="500" strokeDashoffset="500">
          <animate attributeName="stroke-dashoffset" values="500;0;500" dur="6s" repeatCount="indefinite" />
        </path>
        <polygon points="188,120 213,120 213,210 188,210" strokeDasharray="300" strokeDashoffset="300">
          <animate attributeName="stroke-dashoffset" values="300;0;300" dur="6s" begin="0.5s" repeatCount="indefinite" />
        </polygon>
        <path d="M 248 120 L 268 120 L 278 150 L 288 120 L 308 120 L 288 165 L 308 210 L 288 210 L 278 180 L 268 210 L 248 210 L 268 165 Z" strokeDasharray="500" strokeDashoffset="500">
          <animate attributeName="stroke-dashoffset" values="500;0;500" dur="6s" begin="1s" repeatCount="indefinite" />
        </path>
      </g>
    </g>

    {/* Subtitle Banner */}
    <g transform="translate(0, 250)">
      <rect x="60" y="0" width="280" height="40" rx="4" fill="#0B1426" stroke="url(#goldGrad)" strokeWidth="2" filter="url(#shadow)" />
      <text x="200" y="24" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="11" fill="url(#goldGrad)" textAnchor="middle" letterSpacing="1.5">FEDERAL INTEGRATION &amp; EXCHANGE</text>
    </g>
  </svg>
);

const USFlag = ({ variant = 'standard', className = "h-8 w-auto rounded shadow-sm border border-glassBorder/50" }: { variant?: 'standard' | 'tactical'; className?: string }) => {
  const isTactical = variant === 'tactical';
  
  // Colors specifically designed to match and complement the dark metallic aesthetic of the app
  const stripeColor1 = isTactical ? '#020617' : '#b22234'; // Pitch black vs deep patriotic red
  const strokeColor = isTactical ? '#1e293b' : '#ffffff';  // Tactical dark gray/slate vs crisp white
  const cantonColor = isTactical ? '#0f172a' : '#3c3b6e';  // Slate-900 vs navy blue
  const starColor = isTactical ? '#475569' : '#ffffff';    // Cool slate gray vs clean white
  
  const E = 247;
  const F = 210;
  const starRadius = 55; // Slightly reduced to ensure pixel-perfect rendering spacing
  
  const stars: React.ReactNode[] = [];
  for (let r = 0; r < 9; r++) {
    const isEven = r % 2 === 0;
    const count = isEven ? 6 : 5;
    const y = (r + 1) * F;
    
    for (let k = 0; k < count; k++) {
      const x = isEven ? (2 * k + 1) * E : (2 * k + 2) * E;
      stars.push(
        <polygon
          key={`star-${r}-${k}`}
          fill={starColor}
          points={`
            ${x},${y - starRadius}
            ${x + starRadius * 0.224},${y - starRadius * 0.309}
            ${x + starRadius * 0.951},${y - starRadius * 0.309}
            ${x + starRadius * 0.363},${y + starRadius * 0.118}
            ${x + starRadius * 0.588},${y + starRadius * 0.809}
            ${x},${y + starRadius * 0.382}
            ${x - starRadius * 0.588},${y + starRadius * 0.809}
            ${x - starRadius * 0.363},${y + starRadius * 0.118}
            ${x - starRadius * 0.951},${y - starRadius * 0.309}
            ${x - starRadius * 0.224},${y - starRadius * 0.309}
          `}
        />
      );
    }
  }

  return (
    <svg viewBox="0 0 7410 3900" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Background (7 colored stripes) */}
      <rect width="7410" height="3900" fill={stripeColor1} />
      {/* 6 alternating stripes, styled with exact stroke coordinates */}
      <path 
        d="M0,450H7410M0,1050H7410M0,1650H7410M0,2250H7410M0,2850H7410M0,3450H7410" 
        stroke={strokeColor} 
        strokeWidth="300" 
      />
      {/* Blue / Dark Canton */}
      <rect width="2964" height="2100" fill={cantonColor} />
      {/* 50 pristine Vector Stars */}
      <g>{stars}</g>
    </svg>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isDockOpen, setIsDockOpen] = useState(false);
  const [isCapabilityModalOpen, setIsCapabilityModalOpen] = useState(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [quoteForm, setQuoteForm] = useState({
    agency: '',
    email: '',
    naics: '',
    requirements: ''
  });

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Quote Request from ${quoteForm.agency}`);
    const body = encodeURIComponent(
      `Agency / Organization: ${quoteForm.agency}\n` +
      `Contact Email: ${quoteForm.email}\n` +
      `Target NAICS / Vehicle: ${quoteForm.naics}\n\n` +
      `Requirements:\n${quoteForm.requirements}`
    );
    window.location.href = `mailto:malik.khabir@miltongroupsecurity.org?subject=${subject}&body=${body}`;
  };

  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      if (scrolled) {
        setIsDockOpen(false); // Auto-close radial menu on scroll
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // AI/Bot Schema for Procurement Crawlers
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    "name": "F.I.X Solutions LLC",
    "description": "SDVOSB Value-Added Reseller for Federal Government",
    "identifier": [
      { "@type": "PropertyValue", "propertyID": "CAGE", "value": "12345" },
      { "@type": "PropertyValue", "propertyID": "UEI", "value": "ABC123XYZ789" }
    ],
    "knowsAbout": ["NAICS 541519", "NAICS 334111", "NIST 800-171", "CMMC"]
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-missionNavy text-white overflow-x-hidden selection:bg-vanguardGold selection:text-missionNavy relative">
      {/* Fixed Cityscape Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2000&auto=format&fit=crop')] bg-cover opacity-50 mix-blend-luminosity" 
          initial={{ backgroundPositionX: "50%", backgroundPositionY: "0%" }}
          animate={{
            backgroundPositionX: currentPage === 'home' ? "80%" : currentPage === 'expertise' ? "50%" : "10%",
            backgroundPositionY: currentPage === 'home' ? "70%" : currentPage === 'expertise' ? "0%" : "100%"
          }}
          transition={{
            backgroundPositionY: { 
              duration: currentPage === 'home' ? 1.75 : currentPage === 'expertise' ? 1.75 : 0.75,
              delay: currentPage === 'home' ? 0 : currentPage === 'expertise' ? 0.75 : 1.75,
              ease: "easeInOut"
            },
            backgroundPositionX: {
              duration: currentPage === 'home' ? 0.75 : currentPage === 'expertise' ? 0.75 : 1.75,
              delay: currentPage === 'home' ? 1.75 : currentPage === 'expertise' ? 0 : 0,
              ease: "easeInOut"
            }
          }}
        />
        <div className="absolute inset-0 bg-missionNavy/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-missionNavy/50 to-missionNavy" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {/* JSON-LD Script for AI Procurement Bots */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

        {/* HEADER */}
        <header className={`fixed top-0 w-full z-40 bg-transparent transition-opacity duration-500 pointer-events-none ${isScrolled ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute top-0 w-full flex justify-center pointer-events-none">
             <div className="bg-missionNavy/90 backdrop-blur-md border-b border-x border-glassBorder px-6 py-1.5 rounded-b-xl shadow-[0_4px_20px_rgba(0,0,0,0.65)] flex items-center justify-center">
                <span className="font-mono text-[10px] sm:text-xs text-vanguardGold tracking-[0.4em] uppercase font-bold drop-shadow-sm">
                  SDVOSB
                </span>
             </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between mt-4">
            <div className={`flex items-center space-x-3 cursor-pointer ${isScrolled ? 'pointer-events-none' : 'pointer-events-auto'}`} onClick={() => setCurrentPage('home')}>
              <div className="flex items-center">
                <Plane className="text-slate-300/80 mix-blend-plus-lighter -rotate-45 w-12 h-12 mr-2" />
                <FixLogo className="w-14 h-14" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl tracking-tight drop-shadow-lg leading-none">F.I.X SOLUTIONS</span>
                <span className="text-[10px] font-mono text-vanguardGold tracking-widest uppercase mt-1 font-semibold">Federal Integration & eXchange</span>
              </div>
            </div>
          </div>
        </header>

        {/* RADIAL TACTICAL DOCK — Fixed Top-Right & Auto-Hides on Scroll */}
        <div className={`fixed top-6 right-6 xl:right-[calc(50vw-40rem+1.5rem)] z-50 transition-all duration-500 ease-in-out ${isScrolled ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'}`}>
          <div className="relative flex items-center justify-end">
            <button 
              onClick={() => setIsDockOpen(!isDockOpen)}
              className="bg-vanguardGold text-missionNavy px-6 py-3 shadow-[0_0_25px_rgba(197,179,88,0.5)] hover:scale-105 hover:shadow-[0_0_35px_rgba(197,179,88,0.75)] transition-all z-50 relative font-serif font-bold tracking-widest text-lg cursor-pointer"
              style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
            >
              {isDockOpen ? 'CLOSE' : 'MENU'}
            </button>

            <AnimatePresence>
              {isDockOpen && (
                <div className="absolute right-0 top-0 w-[320px] h-[300px] pointer-events-none">
                  {/* Tactical Radial Radar Arc & Spoke Overlay */}
                  <motion.svg
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.35 }}
                    viewBox="0 0 320 300"
                    className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                  >
                    <circle cx="275" cy="26" r="195" fill="rgba(11,20,38,0.72)" stroke="#C5B358" strokeWidth="1" strokeDasharray="6 6" opacity="0.55" />
                    <circle cx="275" cy="26" r="245" fill="none" stroke="#C5B358" strokeWidth="1" strokeDasharray="3 9" opacity="0.35" />
                    {/* Radial Spokes from MENU Hub (275, 26) to each Node */}
                    <line x1="275" y1="26" x2="125" y2="36" stroke="#C5B358" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
                    <line x1="275" y1="26" x2="140" y2="92" stroke="#C5B358" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
                    <line x1="275" y1="26" x2="170" y2="148" stroke="#C5B358" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
                    <line x1="275" y1="26" x2="210" y2="204" stroke="#C5B358" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
                    <line x1="275" y1="26" x2="260" y2="258" stroke="#C5B358" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
                  </motion.svg>

                  <div className="relative w-full h-full pointer-events-auto">
                    <RadialDockItem
                      index={0}
                      label="Home"
                      icon={Home}
                      x={-135}
                      y={8}
                      onClick={() => { setCurrentPage('home'); setIsDockOpen(false); }}
                      active={currentPage === 'home'}
                    />
                    <RadialDockItem
                      index={1}
                      label="Expertise"
                      icon={Cpu}
                      x={-122}
                      y={64}
                      onClick={() => { setCurrentPage('expertise'); setIsDockOpen(false); }}
                      active={currentPage === 'expertise'}
                    />
                    <RadialDockItem
                      index={2}
                      label="About"
                      icon={Info}
                      x={-96}
                      y={120}
                      onClick={() => { setCurrentPage('about'); setIsDockOpen(false); }}
                      active={currentPage === 'about'}
                    />
                    <RadialDockItem
                      index={3}
                      label="Quote"
                      icon={FileText}
                      x={-58}
                      y={176}
                      onClick={() => { setCurrentPage('quote'); setIsDockOpen(false); }}
                      active={currentPage === 'quote'}
                    />
                    <RadialDockItem
                      index={4}
                      label="Portal"
                      icon={Lock}
                      x={-8}
                      y={232}
                      onClick={() => { setIsPortalModalOpen(true); setIsDockOpen(false); }}
                      active={isPortalModalOpen}
                    />
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <main className="flex-grow pt-24 pb-24 flex flex-col">
          <AnimatePresence mode="wait">
            {currentPage === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col w-full flex-grow"
              >
                {/* SECTION 1: HERO */}
        <section className="relative min-h-[85vh] flex items-start justify-center overflow-hidden pt-40">
          {/* Gradient overlay to blend hero text with the global background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-missionNavy/20 to-missionNavy z-10" />

          <div className="relative z-20 max-w-7xl mx-auto px-6 w-full pt-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center max-w-4xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-6 tracking-tight text-center">
                <span className="relative inline-block">
                  <span className="text-white drop-shadow-lg">Engineering Procurement</span>
                  <motion.span 
                    className="absolute left-0 top-0 w-full h-full text-transparent bg-clip-text drop-shadow-lg"
                    style={{ 
                      backgroundImage: 'linear-gradient(to right, transparent 47.5%, #C5B358 48.5%, #3B82F6 50%, #C5B358 51.5%, transparent 52.5%)',
                      backgroundSize: '300% 100%',
                      backgroundRepeat: 'no-repeat'
                    }}
                    animate={{ 
                      backgroundPosition: ["0% 0%", "100% 0%", "100% 0%", "0% 0%"]
                    }}
                    transition={{ 
                      duration: 12, 
                      repeat: Infinity, 
                      times: [0, 0.5, 0.99, 1], 
                      ease: ["linear", "linear", "linear"]
                    }}
                    aria-hidden="true"
                  >
                    Engineering Procurement
                  </motion.span>
                </span> <br />
                <span className="font-serif italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-vanguardGold to-yellow-200 pr-2">
                  of the future.
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-200 font-medium mb-10 max-w-2xl leading-relaxed text-center drop-shadow-sm">
                We deliver secure supply chain logistics, engineering integration, and lifecycle management for federal and state agencies.
              </p>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto justify-center">
                <button 
                  onClick={() => setIsCapabilityModalOpen(true)}
                  className="flex items-center justify-center bg-vanguardGold text-missionNavy px-8 py-4 rounded-sm font-bold hover:bg-yellow-500 transition-all w-full sm:w-auto shadow-lg"
                >
                  <FileText size={18} className="mr-2" /> Capability Statement
                </button>
                <button onClick={() => setCurrentPage('quote')} className="flex items-center justify-center bg-glassBg border border-glassBorder text-white px-8 py-4 rounded-sm font-semibold hover:bg-tacticalSlate transition-all w-full sm:w-auto shadow-lg">
                  Request Quote <ChevronRight size={18} className="ml-2" />
                </button>
                <button 
                  onClick={() => setIsPortalModalOpen(true)}
                  className="flex items-center justify-center bg-missionNavy/90 border border-vanguardGold/60 text-vanguardGold px-8 py-4 rounded-sm font-bold hover:bg-vanguardGold hover:text-missionNavy transition-all w-full sm:w-auto shadow-lg"
                >
                  <Lock size={17} className="mr-2" /> Partner Portal
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2: PARTNERSHIP RIBBON */}
        <section className="w-full bg-tacticalSlate/30 border-t border-glassBorder py-8 overflow-hidden relative mt-32">
          <div className="max-w-7xl mx-auto px-6 mb-8 flex justify-center items-center space-x-4 md:space-x-8">
            <p className="text-3xl md:text-5xl font-cursive text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-sm -rotate-2">
              We can fix
            </p>
            <span className="text-gray-500 font-light text-xl md:text-2xl">&amp;</span>
            <p className="text-3xl md:text-5xl font-cursive text-transparent bg-clip-text bg-gradient-to-r from-vanguardGold to-yellow-200 drop-shadow-sm rotate-2">
              We can Source
            </p>
          </div>
          
          {/* Scrolling container */}
          <div className="flex overflow-hidden relative w-full">
            <div className="flex whitespace-nowrap animate-scroll-left space-x-16 items-center px-6 min-w-max">
              {['CISCO', 'STRATEGIC SOURCING', 'PALO ALTO NETWORKS', 'SUPPLY CHAIN LOGISTICS', 'SPLUNK', 'LIFECYCLE MANAGEMENT', 'MICROSOFT', 'VENDOR MANAGEMENT', 'AWS', 'PROGRAM MANAGEMENT', 'FORTINET', 'CONTRACT ADMINISTRATION', 'VMWARE', 'RISK MITIGATION', 'DELL TECHNOLOGIES', 'COMPLIANCE AUDITING'].map((brand, i) => (
                <span key={i} className="text-2xl md:text-3xl font-bold text-gray-500 opacity-40 tracking-tighter">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2.5: PROCUREMENT NEWS */}
        <ProcurementNews />
              </motion.div>
            )}

            {currentPage === 'expertise' && (
              <motion.div 
                key="expertise"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col w-full flex-grow"
              >
                {/* SECTION 3: VALUE-ADD MATRIX */}
                <section id="expertise" className="py-24 max-w-7xl mx-auto px-6 w-full">
          <div className="mb-20 text-center flex flex-col items-center">
            <motion.h2 
              initial={{ y: 20 }}
              animate={{ y: -10 }}
              transition={{ delay: 0, duration: 3, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-sans font-light tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 uppercase drop-shadow-lg"
            >
              Expertise
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0.7 }}
              animate={{ boxShadow: ["0px 0px 0px rgba(197,179,88,0)", "0px 15px 40px rgba(197,179,88,1)", "0px 5px 20px rgba(197,179,88,0.5)"] }}
              transition={{ delay: 0, duration: 3, repeat: Infinity, repeatType: "reverse" }}
              className="w-24 h-1 bg-gradient-to-r from-transparent via-vanguardGold to-transparent mt-6 opacity-70"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {[
              { 
                icon: <Cpu size={32} />, 
                title: 'Design & Engineering', 
                desc: 'Pre-sales configuration and architectural mapping ensuring mission-fit technology before acquisition.',
                drilldowns: [
                  { title: "ISO/IEC 27701 & NIST Privacy Framework", desc: "Privacy-by-design embedded in all technical blueprints." },
                  { title: "Zero Trust Alignment", desc: "Strict adherence to modern identity and access management." },
                  { title: "Cloud-Native Architecture", desc: "Scalable and resilient infrastructure design for federal workloads." },
                  { title: "DevSecOps Integration", desc: "Automated security testing embedded within the development lifecycle." }
                ]
              },
              { 
                icon: <ShieldCheck size={32} />, 
                title: 'Secure Supply Chain', 
                desc: 'Strict adherence to NIST 800-171 and CMMC compliance frameworks for hardware logistics.',
                drilldowns: [
                  { title: "DFARS 252.204-7012 Compliance", desc: "Advanced persistent threat protection in transit." },
                  { title: "NIST 800-171 Controls", desc: "Comprehensive safeguarding of Controlled Unclassified Information (CUI)." },
                  { title: "Hardware Provenance Tracking", desc: "End-to-end visibility and chain of custody for all procured assets." },
                  { title: "Anti-Counterfeit Protocols", desc: "Rigorous inspection and verification to prevent malicious hardware insertion." }
                ]
              },
              { 
                icon: <Server size={32} />, 
                title: 'Lifecycle Management', 
                desc: 'Post-award integration, asset tagging, warranty management, and secure end-of-life disposal.',
                drilldowns: [
                  { title: "U.S. Privacy Act & HIPAA/HITECH Standards", desc: "Legal adherence to federal data privacy regulations." },
                  { title: "Secure Data Destruction", desc: "DoD-compliant wiping and physical destruction protocols." },
                  { title: "Asset Tagging & Tracking", desc: "Automated inventory management and real-time asset visibility." },
                  { title: "Warranty & Maintenance Logistics", desc: "Streamlined support and hardware replacement workflows." }
                ]
              },
              { 
                icon: <Database size={32} />, 
                title: 'Sourcing & Hardware', 
                desc: 'Information regarding the acquisition of hardware and software through authorized channels.',
                drilldowns: [
                  { title: "Trade Agreements Act (TAA)", desc: "Hardware sourcing is subject to TAA compliance requirements." },
                  { title: "Supply Chain Risk Management", desc: "Procurement adheres to established counterfeit prevention guidelines." },
                  { title: "OEM Authorized Reseller Network", desc: "Direct partnerships with leading technology manufacturers." },
                  { title: "Rapid Acquisition Framework", desc: "Agile procurement processes for time-sensitive mission requirements." }
                ]
              },
              { 
                icon: <FileText size={32} />, 
                title: 'Audit & Online Services', 
                desc: 'Information regarding system auditing and the provisioning of online cloud services.',
                drilldowns: [
                  { title: "FISMA Framework", desc: "Audits are conducted in alignment with the Federal Information Security Modernization Act." },
                  { title: "FedRAMP Standards", desc: "Online services utilize FedRAMP-authorized cloud environments." },
                  { title: "Continuous Diagnostics & Mitigation", desc: "Real-time monitoring and automated risk scoring." },
                  { title: "Vulnerability Assessment", desc: "Comprehensive penetration testing and security posture evaluation." }
                ]
              },
              { 
                icon: <Network size={32} />, 
                title: 'System Integrations', 
                desc: 'Information regarding the integration of enterprise IT systems within federal networks.',
                drilldowns: [
                  { title: "ServiceNow", desc: "IT service management (ITSM) and operations management integration." },
                  { title: "Splunk", desc: "Security information and event management (SIEM) deployment." },
                  { title: "Cisco ISE", desc: "Network access control and identity management integration." },
                  { title: "Palo Alto Networks", desc: "Next-generation firewall and zero-trust network access implementation." }
                ]
              }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center relative">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="bg-gradient-to-br from-slate-200/10 via-white/5 to-transparent backdrop-blur-md border border-white/10 p-10 rounded-3xl hover:from-slate-200/15 hover:via-white/10 hover:border-white/20 transition-all duration-500 group relative overflow-hidden flex flex-col items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.2)] w-full z-10"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <h3 className="text-2xl font-bold mb-4 relative z-10 text-white tracking-wide drop-shadow-md">{item.title}</h3>
                  <p className="text-gray-300 text-base leading-relaxed relative z-10 font-medium drop-shadow-sm">{item.desc}</p>
                </motion.div>

                {/* SVG Connecting Lines & Drilldowns */}
                <div className="relative w-full flex flex-col items-center mt-4">
                  {item.drilldowns.map((drill, idx) => (
                    <motion.div 
                      key={idx} 
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-50px" }}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { 
                          opacity: 1, 
                          y: 0,
                          transition: { duration: 0.4, delay: index * 0.2 + idx * 0.2 }
                        }
                      }}
                      className="flex flex-col items-center w-full"
                    >
                      {/* Connecting line for this specific box */}
                      <svg className="w-4 h-8 pointer-events-none">
                        <motion.line 
                          x1="50%" y1="0" x2="50%" y2="100%" 
                          stroke="#C5B358" strokeWidth="2" strokeDasharray="4 4"
                          variants={{
                            hidden: { pathLength: 0, opacity: 0 },
                            visible: { 
                              pathLength: 1, 
                              opacity: 0.4, 
                              transition: { duration: 0.4, delay: index * 0.2 + idx * 0.2 } 
                            }
                          }}
                        />
                      </svg>
                      <div className="bg-gradient-to-br from-slate-200/5 to-transparent backdrop-blur-sm border border-white/10 p-5 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.2)] text-center relative w-full">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-vanguardGold shadow-[0_0_10px_rgba(197,179,88,1)]" />
                        <h4 className="text-vanguardGold font-bold text-sm mb-2">{drill.title}</h4>
                        <p className="text-gray-300 text-xs leading-relaxed">{drill.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
              </motion.div>
            )}

            {currentPage === 'about' && (
              <motion.div 
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col w-full flex-grow"
              >
                {/* SECTION 4: VETERAN IMPACT STORY */}
                <section id="about" className="py-24 max-w-7xl mx-auto px-6 w-full relative">
          {/* Background Truck for About Page */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none mix-blend-overlay z-0">
            <Truck size={600} strokeWidth={0.5} className="text-slate-300" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden group flex items-center justify-center p-8 bg-transparent"
            >
              <FixLogo />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Built on a Foundation of Service.</h2>
              <p className="text-slate-200 mb-6 leading-relaxed text-lg">
                As a Minority and Service-Disabled Veteran-Owned Small Business.. F.I.X (Federal Integration & eXchange) Solutions LLC operates with precision, integrity, and urgency. We understand that in the public sector, technology failure is not an option.
              </p>
              <p className="text-slate-200 mb-10 leading-relaxed text-lg">
                We implement OEM technologies and adhere to federal compliance standards, ensuring preparation, security, and readiness for operational challenges.
              </p>
              
              <div className="grid grid-cols-2 gap-8 border-t border-glassBorder pt-8">
                <div className="flex flex-col">
                  <span className="text-4xl md:text-5xl font-bold text-white mb-2">100%</span>
                  <span className="text-xs font-mono text-vanguardGold tracking-widest">MISSION FOCUS</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-4xl md:text-5xl font-bold text-white mb-2">Zero</span>
                  <span className="text-xs font-mono text-vanguardGold tracking-widest">COMPLIANCE RISKS</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Map Container Moved to About Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-24"
          >
            <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border-2 border-blue-900/40 shadow-[0_0_50px_rgba(30,58,138,0.2)] relative z-10 bg-tacticalSlate/20 opacity-65 hover:opacity-100 transition-opacity duration-700 ease-in-out ring-1 ring-white/10">
              <div className="absolute top-6 left-16 z-[1000] pointer-events-none">
                <span className="font-cursive text-3xl text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)] opacity-90">DMV</span>
              </div>
              <MapContainer 
                center={[38.8951, -77.0364]} 
                zoom={9} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%', zIndex: 1, background: '#0B1426' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[38.8951, -77.0364]} icon={tacticalIcon}>
                  <Popup className="tactical-popup">
                    <div className="bg-missionNavy text-white p-3 rounded-lg border border-vanguardGold/30 shadow-xl min-w-[200px]">
                      <h4 className="font-bold text-vanguardGold mb-1 text-sm tracking-wider uppercase">F.I.X HQ</h4>
                      <p className="text-xs text-gray-200">Washington D.C. Metro Area</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Animated Shipping Trucks */}
                <AnimatedTruckMarker start={[38.8951, -77.0364]} end={[39.2904, -76.6122]} duration={20000} delay={0} />
                <AnimatedTruckMarker start={[38.8951, -77.0364]} end={[38.9531, -77.4565]} duration={16000} delay={5000} />
                <AnimatedTruckMarker start={[38.8951, -77.0364]} end={[38.9784, -76.4922]} duration={24000} delay={2000} />
                <AnimatedTruckMarker start={[38.8951, -77.0364]} end={[38.3004, -77.4663]} duration={28000} delay={8000} />

              </MapContainer>
              
              {/* Overlay gradient to blend map edges into theme */}
              <div className="absolute inset-0 pointer-events-none border-2 border-blue-900/30 rounded-2xl shadow-[inset_0_0_80px_rgba(11,20,38,1)] z-[2]" />
            </div>
          </motion.div>
        </section>
              </motion.div>
            )}

            {currentPage === 'quote' && (
              <motion.div 
                key="quote"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col w-full flex-grow"
              >
                {/* SECTION 5: SECURE QUOTE REQUEST */}
                <section id="quote" className="py-24 bg-tacticalSlate/30 w-full border-t border-glassBorder relative overflow-hidden flex-grow">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-vanguardGold/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Request a Secure Quote</h2>
              <p className="text-slate-200">Submit your requirements for a rapid, compliant response.</p>
            </div>

            <form className="bg-glassBg backdrop-blur-md border border-glassBorder p-8 rounded-xl shadow-2xl" onSubmit={handleQuoteSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-mono text-slate-200 mb-2 uppercase">Agency / Organization</label>
                  <input 
                    type="text" 
                    required
                    value={quoteForm.agency}
                    onChange={(e) => setQuoteForm({...quoteForm, agency: e.target.value})}
                    className="w-full bg-missionNavy/50 border border-glassBorder rounded-md px-4 py-3 text-white focus:outline-none focus:border-vanguardGold transition-colors" 
                    placeholder="e.g. Dept of Defense" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-200 mb-2 uppercase">Contact Email</label>
                  <input 
                    type="email" 
                    required
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm({...quoteForm, email: e.target.value})}
                    className="w-full bg-missionNavy/50 border border-glassBorder rounded-md px-4 py-3 text-white focus:outline-none focus:border-vanguardGold transition-colors" 
                    placeholder="official@agency.gov" 
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-xs font-mono text-slate-200 mb-2 uppercase">Target NAICS / Vehicle (Optional)</label>
                <input 
                  type="text" 
                  value={quoteForm.naics}
                  onChange={(e) => setQuoteForm({...quoteForm, naics: e.target.value})}
                  className="w-full bg-missionNavy/50 border border-glassBorder rounded-md px-4 py-3 text-white focus:outline-none focus:border-vanguardGold transition-colors" 
                  placeholder="e.g. 541519 or SEWP VI" 
                />
              </div>

              <div className="mb-8">
                <label className="block text-xs font-mono text-slate-200 mb-2 uppercase">Requirements</label>
                <textarea 
                  rows={4} 
                  required
                  value={quoteForm.requirements}
                  onChange={(e) => setQuoteForm({...quoteForm, requirements: e.target.value})}
                  className="w-full bg-missionNavy/50 border border-glassBorder rounded-md px-4 py-3 text-white focus:outline-none focus:border-vanguardGold transition-colors resize-none" 
                  placeholder="Describe your technical requirements..." 
                />
              </div>

              <button type="submit" className="w-full bg-vanguardGold text-missionNavy font-bold py-4 rounded-md hover:bg-yellow-500 transition-colors flex items-center justify-center">
                Submit Request <ChevronRight size={20} className="ml-2" />
              </button>
              <p className="text-center text-xs text-slate-300 mt-4 font-mono">Transmissions are secured and monitored.</p>
            </form>
          </div>
        </section>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* FOOTER */}
      <footer className="bg-missionNavy border-t border-glassBorder py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <FixLogo className="w-12 h-12" />
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight leading-none">F.I.X SOLUTIONS LLC</span>
                <span className="text-[10px] font-mono text-vanguardGold tracking-widest uppercase mt-1">Federal Integration & eXchange</span>
              </div>
            </div>
            <p className="text-slate-200 text-sm max-w-sm">
              Engineering the future of government procurement. A certified Service-Disabled Veteran-Owned Small Business delivering fulfillment.
            </p>
          </div>
          
          <div className="col-span-1 flex flex-col items-center justify-center py-6 md:py-0 border-y md:border-none border-glassBorder/20">
            <div className="relative group bg-glassBg/40 backdrop-blur-md border border-glassBorder/30 p-4 rounded-lg flex items-center space-x-6 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-vanguardGold/0 via-vanguardGold/5 to-vanguardGold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-lg pointer-events-none" />
              <USFlag variant="standard" className="h-8 md:h-10 w-auto rounded-[2px] shadow-lg border border-white/10 transition-transform duration-300 group-hover:scale-105" />
              <div className="h-4 w-[1px] bg-glassBorder/50" />
              <USFlag variant="tactical" className="h-8 md:h-10 w-auto rounded-[2px] shadow-lg border border-white/5 opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105" />
            </div>
          </div>
          
          <div className="col-span-1 flex flex-col items-center md:items-end text-center md:text-right">
            <div>
              <h4 className="text-white font-semibold mb-4 text-left md:text-right">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-200 text-left md:text-right">
                <li><button onClick={() => setCurrentPage('expertise')} className="hover:text-vanguardGold transition-colors text-left md:text-end w-full">Expertise</button></li>
                <li><button onClick={() => setCurrentPage('about')} className="hover:text-vanguardGold transition-colors text-left md:text-end w-full">About Us</button></li>
                <li><button onClick={() => setIsPortalModalOpen(true)} className="text-vanguardGold font-semibold hover:underline transition-colors text-left md:text-end w-full">Partner Portal Login</button></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-glassBorder text-center md:text-left text-xs text-slate-300 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} F.I.X Solutions LLC. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>
      </footer>
      
      <CapabilityStatementModal 
        isOpen={isCapabilityModalOpen} 
        onClose={() => setIsCapabilityModalOpen(false)} 
      />
      <ClientPortalModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
      />
      </div>
    </div>
  );
}
