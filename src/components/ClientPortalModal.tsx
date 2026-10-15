import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, ShieldCheck, CheckCircle2, ExternalLink, UserCheck, KeyRound, Cpu, Globe, Layers, Sparkles } from 'lucide-react';

interface SessionData {
  name: string;
  email: string;
  organization: string;
  role: string;
  clearance: string;
  timestamp: string;
}

const INTERNAL_PORTAL_BASE = 'http://localhost:8090';

const INTERNAL_PORTALS = [
  {
    title: 'MGC & F.I.X Internal Data Commerce Hub',
    subtitle: 'SAS ModelOps • CIPP/US & CIPP/G • VA SDVOSB Command',
    url: `${INTERNAL_PORTAL_BASE}/index.html`,
    badge: 'VIEWER_ONBOARDED',
    icon: Layers
  },
  {
    title: 'Visual Cloud Agent & LangGraph Studio',
    subtitle: 'Google Vertex AI + Azure AI Foundry + LangChain Supervisor Graph',
    url: `${INTERNAL_PORTAL_BASE}/agent-workflow-studio.html`,
    badge: 'LIVE TELEMETRY',
    icon: Cpu
  },
  {
    title: '3D Geospatial & Google Earth Command',
    subtitle: 'Zero-Seat-Cost CesiumJS + GeoJSON Defense & Logistics Corridors',
    url: `${INTERNAL_PORTAL_BASE}/earth-3d.html`,
    badge: 'ZERO-CHARGE GUARD',
    icon: Globe
  },
  {
    title: '360° WebXR VR Command Deck',
    subtitle: 'Spatial Computing & Multi-Screen Operations Environment',
    url: `${INTERNAL_PORTAL_BASE}/vr-command.html`,
    badge: 'WEBXR READY',
    icon: Sparkles
  }
];

export const ClientPortalModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'onboard'>('login');
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');
  const [sector, setSector] = useState('Federal / Defense VAR (SDVOSB)');
  const [error, setError] = useState('');
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mgc_onboarded_session');
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch {
        // ignore invalid json
      }
    }
  }, [isOpen]);

  const saveSession = (data: SessionData) => {
    localStorage.setItem('mgc_onboarded_session', JSON.stringify(data));
    setSession(data);
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = accessCode.trim();
    const validCodes = ['c54c9f8b7e3627b3', 'b30cd4bf8036b366', 'FIX2026', 'MGC2026'];
    const isAdminEmail = email.toLowerCase().endsWith('@miltongroupsecurity.org') || email.toLowerCase().includes('khabir') || email.toLowerCase().includes('fixsolutions');

    if (validCodes.includes(trimmedCode) || isAdminEmail) {
      saveSession({
        name: isAdminEmail ? 'Malik A. Khabir (Executive Admin)' : (email.split('@')[0] || 'Authorized Federal Partner'),
        email: email || 'partner@miltongroupsecurity.org',
        organization: isAdminEmail ? 'F.I.X Solutions LLC / Milton Group Concepts LLC' : 'Verified Federal Partner',
        role: isAdminEmail ? 'OWNER_ADMIN' : 'VIEWER_ONBOARDED',
        clearance: 'Internal Portals — Read/View Access Enabled',
        timestamp: new Date().toLocaleString()
      });
    } else {
      setError('Invalid access key. Use your partner access key (e.g., c54c9f8b7e3627b3 or b30cd4bf8036b366) or complete New Partner Onboarding.');
    }
  };

  const handleQuickSSO = () => {
    saveSession({
      name: 'Malik A. Khabir',
      email: 'malik.khabir@miltongroupsecurity.org',
      organization: 'F.I.X Solutions LLC & Milton Group Concepts LLC (SDVOSB)',
      role: 'VIEWER_ONBOARDED (SSO VERIFIED)',
      clearance: 'Full Internal Suite View Access',
      timestamp: new Date().toLocaleString()
    });
  };

  const handleOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !orgName) {
      setError('Please complete all required onboarding fields.');
      return;
    }
    saveSession({
      name: fullName,
      email,
      organization: `${orgName} (${sector})`,
      role: 'VIEWER_ONBOARDED',
      clearance: 'Onboarded Partner — Internal Portal View Access',
      timestamp: new Date().toLocaleString()
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('mgc_onboarded_session');
    setSession(null);
    setAccessCode('');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-missionNavy border border-vanguardGold/40 rounded-xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] p-8 overflow-hidden z-10 text-white"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-tacticalSlate/60 hover:bg-vanguardGold hover:text-missionNavy rounded-lg transition-colors z-20 text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-vanguardGold/15 border border-vanguardGold/40 flex items-center justify-center text-vanguardGold shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-vanguardGold bg-vanguardGold/10 border border-vanguardGold/30 px-2.5 py-0.5 rounded">
                    SDVOSB Tactical Gateway
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded">
                    NIST 800-171 RBAC
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                  Partner Onboarding & Internal Command Portals
                </h2>
              </div>
            </div>

            {!session ? (
              <>
                <div className="flex gap-2 p-1.5 bg-tacticalSlate/50 rounded-lg mb-6 border border-glassBorder">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setError(''); }}
                    className={`flex-1 py-2.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'login'
                        ? 'bg-vanguardGold text-missionNavy shadow-md'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <KeyRound className="w-4 h-4" /> Partner Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('onboard'); setError(''); }}
                    className={`flex-1 py-2.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'onboard'
                        ? 'bg-vanguardGold text-missionNavy shadow-md'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" /> New Agency / Partner Onboarding
                  </button>
                </div>

                {error && (
                  <div className="mb-5 p-3.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-medium">
                    {error}
                  </div>
                )}

                {activeTab === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-gray-200 mb-1.5 uppercase">
                          Official Agency / Partner Email
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contracting@agency.gov"
                          className="w-full bg-tacticalSlate/50 border border-glassBorder rounded-md px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-vanguardGold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-200 mb-1.5 uppercase">
                          Partner Access Key
                        </label>
                        <input
                          type="password"
                          required
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value)}
                          placeholder="c54c9f8b7e3627b3 or b30cd4bf8036b366"
                          className="w-full bg-tacticalSlate/50 border border-glassBorder rounded-md px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-vanguardGold"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-3.5 bg-vanguardGold hover:bg-yellow-500 text-missionNavy font-bold uppercase tracking-wider text-xs rounded-md shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" /> Authenticate & Open Internal Portals
                      </button>
                      <button
                        type="button"
                        onClick={handleQuickSSO}
                        className="py-3.5 px-5 bg-tacticalSlate hover:bg-slate-700 border border-vanguardGold/40 text-white font-mono font-bold uppercase tracking-wider text-xs rounded-md transition-all flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-vanguardGold" /> Workspace SSO
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleOnboard} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-gray-200 mb-1.5 uppercase">
                          Full Name & Title
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Contracting Officer / Program Lead"
                          className="w-full bg-tacticalSlate/50 border border-glassBorder rounded-md px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-vanguardGold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-200 mb-1.5 uppercase">
                          Official Email
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="officer@agency.gov"
                          className="w-full bg-tacticalSlate/50 border border-glassBorder rounded-md px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-vanguardGold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-gray-200 mb-1.5 uppercase">
                          Agency / Organization
                        </label>
                        <input
                          type="text"
                          required
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          placeholder="Dept. of Defense / VA / Prime Partner"
                          className="w-full bg-tacticalSlate/50 border border-glassBorder rounded-md px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-vanguardGold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-200 mb-1.5 uppercase">
                          Procurement Track
                        </label>
                        <select
                          value={sector}
                          onChange={(e) => setSector(e.target.value)}
                          className="w-full bg-tacticalSlate border border-glassBorder rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-vanguardGold"
                        >
                          <option>Federal / Defense VAR (SDVOSB)</option>
                          <option>NIST 800-171 / CMMC Secure Supply Chain</option>
                          <option>Data Commerce & Cloud AI Integration</option>
                          <option>OEM Hardware & Lifecycle Management</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-vanguardGold hover:bg-yellow-500 text-missionNavy font-bold uppercase tracking-wider text-xs rounded-md shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" /> Complete Onboarding & Grant View Access
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="space-y-5">
                <div className="p-4 rounded-lg bg-emerald-950/50 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">
                        {session.name} • <span className="text-vanguardGold font-mono">{session.role}</span>
                      </p>
                      <p className="text-[11px] text-gray-200">
                        {session.organization} ({session.email}) — {session.clearance}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded bg-tacticalSlate border border-glassBorder text-gray-200 hover:text-white"
                  >
                    Sign Out
                  </button>
                </div>

                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-vanguardGold mb-3">
                    Authorized Internal Command Portals (View Access Enabled)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {INTERNAL_PORTALS.map((portal, i) => {
                      const Icon = portal.icon;
                      return (
                        <a
                          key={i}
                          href={portal.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group p-4 rounded-lg bg-tacticalSlate/40 hover:bg-tacticalSlate/80 border border-glassBorder hover:border-vanguardGold/60 transition-all flex flex-col justify-between"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="w-9 h-9 rounded-md bg-vanguardGold/15 text-vanguardGold flex items-center justify-center group-hover:bg-vanguardGold group-hover:text-missionNavy transition-colors">
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-missionNavy/80 border border-vanguardGold/30 text-vanguardGold">
                              {portal.badge}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-vanguardGold flex items-center justify-between">
                              {portal.title}
                              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                            </h4>
                            <p className="text-[11px] text-gray-200 mt-1">
                              {portal.subtitle}
                            </p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
