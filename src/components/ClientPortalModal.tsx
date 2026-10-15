import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, ShieldCheck, CheckCircle2, ArrowUpRight, UserPlus } from 'lucide-react';
import { dispatchWorkspaceLead } from '../lib/workspaceWebhook';

const HOSTED_INTERNAL_PORTAL = 'https://mgc-external-site-254657731107.us-west1.run.app/onboarding-portal.html';
const LOCAL_INTERNAL_PORTAL = 'http://localhost:8090/onboarding-portal.html';

const getInternalPortalUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return LOCAL_INTERNAL_PORTAL;
  }
  return HOSTED_INTERNAL_PORTAL;
};

export const ClientPortalModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'request'>('login');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');
  const [sector, setSector] = useState('Federal / Defense VAR (SDVOSB)');
  const [error, setError] = useState('');
  const [isAuthenticatingSSO, setIsAuthenticatingSSO] = useState(false);
  const [requestReceipt, setRequestReceipt] = useState<{
    receiptId: string;
    fullName: string;
    email: string;
    organization: string;
    sector: string;
    timestamp: string;
  } | null>(null);

  const handleWorkspaceSSO = () => {
    setError('');
    setIsAuthenticatingSSO(true);
    localStorage.removeItem('mgc_onboarded_session');
    const targetUrl = `${getInternalPortalUrl()}?sso=workspace&source=fix.miltongroupsecurity.org`;
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 400);
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !orgName.trim()) {
      setError('Please complete all required fields.');
      return;
    }
    setError('');
    const leadRes = await dispatchWorkspaceLead({
      sourceSite: 'F.I.X Solutions LLC',
      formType: 'Client/Partner Onboarding',
      fullName: fullName.trim(),
      email: email.trim(),
      organization: orgName.trim(),
      sectorOrService: sector,
      message: 'Partner Portal Request Access submitted (Pending Security Review & Workspace SSO Provisioning)'
    });

    setRequestReceipt({
      receiptId: leadRes.receiptId,
      fullName: fullName.trim(),
      email: email.trim(),
      organization: orgName.trim(),
      sector,
      timestamp: new Date().toLocaleString()
    });
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
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-missionNavy border border-vanguardGold/40 rounded-xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] p-8 overflow-hidden z-10 text-white"
          >
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-vanguardGold to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-tacticalSlate/60 hover:bg-vanguardGold hover:text-missionNavy rounded-lg transition-colors z-20 text-gray-200"
              aria-label="Close partner portal modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-vanguardGold/15 border border-vanguardGold/40 flex items-center justify-center text-vanguardGold shadow-lg shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-vanguardGold">
                  F.I.X Solutions LLC
                </p>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                  Partner Portal
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-tacticalSlate/60 rounded-lg mb-6 border border-glassBorder">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); }}
                className={`py-2.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-vanguardGold text-missionNavy shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" /> Partner Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('request'); setError(''); }}
                className={`py-2.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'request'
                    ? 'bg-vanguardGold text-missionNavy shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Request Access
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-medium">
                {error}
              </div>
            )}

            {activeTab === 'login' ? (
              <div className="space-y-5">
                <div className="p-5 rounded-lg bg-tacticalSlate/40 border border-glassBorder space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-vanguardGold shrink-0" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-vanguardGold font-bold">
                      Federated Workspace SSO
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Authenticate with your verified organization credentials to enter the Internal Command Portal.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isAuthenticatingSSO}
                  onClick={handleWorkspaceSSO}
                  className="w-full py-4 px-6 bg-vanguardGold hover:bg-yellow-500 text-missionNavy font-mono font-bold uppercase tracking-wider text-xs rounded-md shadow-[0_0_25px_rgba(197,179,88,0.3)] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAuthenticatingSSO ? 'Redirecting to Internal Portal...' : 'Continue with Workspace SSO'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ) : requestReceipt ? (
              <div className="space-y-4">
                <div className="p-5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Request Logged for Review
                      </h3>
                      <p className="text-[11px] font-mono text-vanguardGold">
                        {requestReceipt.receiptId} • {requestReceipt.timestamp}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Thank you, <strong>{requestReceipt.fullName}</strong> ({requestReceipt.organization}). Once verified by security operations, your Workspace SSO identity (<strong>{requestReceipt.email}</strong>) will be provisioned.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRequestReceipt(null);
                    setFullName('');
                    setEmail('');
                    setOrgName('');
                    setActiveTab('login');
                  }}
                  className="w-full py-3 bg-tacticalSlate hover:bg-slate-700 border border-glassBorder text-xs font-mono uppercase tracking-wider text-white rounded-md transition-colors cursor-pointer"
                >
                  Back to Partner Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestAccess} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-mono text-gray-300 mb-1.5 uppercase tracking-wider">
                      Full Name &amp; Title
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contracting Officer"
                      className="w-full bg-tacticalSlate/50 border border-glassBorder rounded-md px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-vanguardGold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-gray-300 mb-1.5 uppercase tracking-wider">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@agency.gov"
                      className="w-full bg-tacticalSlate/50 border border-glassBorder rounded-md px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-vanguardGold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-mono text-gray-300 mb-1.5 uppercase tracking-wider">
                      Agency / Organization
                    </label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Dept. of Defense / VA"
                      className="w-full bg-tacticalSlate/50 border border-glassBorder rounded-md px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-vanguardGold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-gray-300 mb-1.5 uppercase tracking-wider">
                      Procurement Track
                    </label>
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full bg-tacticalSlate border border-glassBorder rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-vanguardGold"
                    >
                      <option>Federal / Defense VAR (SDVOSB)</option>
                      <option>NIST 800-171 / CMMC Supply Chain</option>
                      <option>Data Commerce &amp; Cloud AI</option>
                      <option>OEM Hardware &amp; Lifecycle</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 mt-1 bg-vanguardGold hover:bg-yellow-500 text-missionNavy font-mono font-bold uppercase tracking-wider text-xs rounded-md shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Request Access
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

