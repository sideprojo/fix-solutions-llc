import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, ShieldCheck, CheckCircle2, ExternalLink, UserCheck } from 'lucide-react';
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
    // Clear any legacy local session bypass keys
    localStorage.removeItem('mgc_onboarded_session');
    const targetUrl = `${getInternalPortalUrl()}?sso=workspace&source=fix.miltongroupsecurity.org`;
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 450);
  };

  const handleAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !orgName.trim()) {
      setError('Please complete all required fields to submit an access request.');
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
      message: 'Partner Portal Access Request submitted (Pending Security Review & Workspace SSO Provisioning)'
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-missionNavy border border-vanguardGold/40 rounded-xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] p-8 overflow-hidden z-10 text-white"
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
                    ZERO-TRUST SSO
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                  Partner Portal &amp; Access Request
                </h2>
              </div>
            </div>

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
                <Lock className="w-4 h-4" /> Partner Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('request'); setError(''); }}
                className={`flex-1 py-2.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'request'
                    ? 'bg-vanguardGold text-missionNavy shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" /> Access Request
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-medium">
                {error}
              </div>
            )}

            {activeTab === 'login' ? (
              <div className="space-y-5">
                <div className="p-5 rounded-lg bg-tacticalSlate/40 border border-glassBorder space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-vanguardGold font-bold">
                      Identity Provider Enforcement
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                      NIST 800-171 / CMMC L2
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Static access keys are disabled for security compliance. Partner authentication is strictly enforced via federated <strong>Workspace SSO</strong> and redirects directly to the authenticated Internal Command Portal.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isAuthenticatingSSO}
                  onClick={handleWorkspaceSSO}
                  className="w-full py-4 px-6 bg-vanguardGold hover:bg-yellow-500 text-missionNavy font-mono font-bold uppercase tracking-wider text-xs rounded-md shadow-[0_0_25px_rgba(197,179,88,0.35)] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>{isAuthenticatingSSO ? 'Authenticating & Redirecting to Internal Portal...' : 'Workspace SSO — Authenticate & Redirect'}</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <p className="text-[11px] font-mono text-center text-slate-300">
                  Need partner credentials provisioned? Select the{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('request')}
                    className="text-vanguardGold underline hover:text-yellow-300 font-bold"
                  >
                    Access Request
                  </button>{' '}
                  tab.
                </p>
              </div>
            ) : requestReceipt ? (
              <div className="space-y-4">
                <div className="p-5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Access Request Logged — Pending Security Verification
                      </h3>
                      <p className="text-[11px] font-mono text-vanguardGold">
                        Receipt ID: {requestReceipt.receiptId} • {requestReceipt.timestamp}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Thank you, <strong>{requestReceipt.fullName}</strong> ({requestReceipt.organization}). Your request has been transmitted to F.I.X Solutions LLC &amp; Milton Group Concepts LLC security operations. View access is never auto-granted; once verified, your Workspace SSO identity (<strong>{requestReceipt.email}</strong>) will be provisioned.
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
                  className="w-full py-3 bg-tacticalSlate hover:bg-slate-700 border border-glassBorder text-xs font-mono uppercase tracking-wider text-white rounded-md transition-colors"
                >
                  Return to Partner Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleAccessRequest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-200 mb-1.5 uppercase">
                      Full Name &amp; Title
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
                      Official Work Email
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
                      <option>Data Commerce &amp; Cloud AI Integration</option>
                      <option>OEM Hardware &amp; Lifecycle Management</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-vanguardGold hover:bg-yellow-500 text-missionNavy font-bold uppercase tracking-wider text-xs rounded-md shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" /> Request Access
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
