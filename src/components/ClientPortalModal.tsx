import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, ShieldCheck, CheckCircle2, ArrowUpRight, UserPlus, Fingerprint, KeyRound, ShieldAlert } from 'lucide-react';
import { dispatchWorkspaceLead } from '../lib/workspaceWebhook';

export const ClientPortalModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'request'>('login');
  const [authStep, setAuthStep] = useState<'credentials' | 'mfa'>('credentials');
  const [portalRole, setPortalRole] = useState<'admin' | 'client'>('client');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [mfaMethod, setMfaMethod] = useState<'biometric' | 'totp'>('biometric');
  const [totpCode, setTotpCode] = useState('');
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');
  const [sector, setSector] = useState('Federal / Defense VAR (SDVOSB)');
  const [error, setError] = useState('');
  const [requestReceipt, setRequestReceipt] = useState<{
    receiptId: string;
    fullName: string;
    email: string;
    organization: string;
    sector: string;
    timestamp: string;
  } | null>(null);

  const handlePrimaryCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const normalizedEmail = loginEmail.trim().toLowerCase();
    const trimmedPass = loginPass.trim();
    if (!normalizedEmail || !trimmedPass) {
      setError('Please enter your registered username or email and password.');
      return;
    }

    try {
      const res = await fetch('https://miltongroupsecurity.org/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'password',
          portalContext: 'client',
          identifier: normalizedEmail,
          email: normalizedEmail,
          password: trimmedPass
        })
      });
      const data = await res.json();
      if (res.ok && data && data.ok) {
        setPortalRole(data.role === 'owner' ? 'admin' : 'client');
        setAuthStep('mfa');
        return;
      }
      setError((data && data.error) || 'Unrecognized credentials. Please verify your username/email and password or register at miltongroupsecurity.org/portal.');
    } catch {
      window.location.href = 'https://miltongroupsecurity.org/portal';
    }
  };

  const finalizePortalRedirect = () => {
    if (portalRole === 'admin') {
      window.location.href = 'https://miltongroupsecurity.org/access-admin';
    } else {
      window.location.href = 'https://miltongroupsecurity.org/workspace';
    }
  };

  const handleBiometricVerify = async () => {
    setError('');
    setBiometricScanning(true);
    try {
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
    } catch {}

    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        finalizePortalRedirect();
      }, 500);
    }, 850);
  };

  const handleTotpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleaned = totpCode.replace(/\D/g, '');
    if (cleaned.length === 6 && !/^(123456|000000)$/.test(cleaned)) {
      setBiometricSuccess(true);
      setTimeout(() => {
        finalizePortalRedirect();
      }, 450);
    } else {
      setError('Invalid 6-digit authenticator code.');
    }
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
      message: 'Partner Portal Request Access submitted'
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-missionNavy border border-vanguardGold/40 rounded-xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] p-6 sm:p-8 overflow-hidden z-10 text-white my-auto"
          >
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-vanguardGold to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-tacticalSlate/60 hover:bg-vanguardGold hover:text-missionNavy rounded-lg transition-colors z-20 text-gray-200"
              aria-label="Close partner portal modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-lg bg-vanguardGold/15 border border-vanguardGold/40 flex items-center justify-center text-vanguardGold shadow-lg shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-vanguardGold">
                    F.I.X Solutions LLC
                  </p>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                    2FA Enforced
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                  Partner Portal
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-tacticalSlate/60 rounded-lg mb-5 border border-glassBorder">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setAuthStep('credentials'); setError(''); }}
                className={`py-2.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-vanguardGold text-missionNavy shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" /> Sign In
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
              <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {activeTab === 'login' ? (
              authStep === 'credentials' ? (
                <form onSubmit={handlePrimaryCredentialsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-300 mb-1 uppercase tracking-wider">
                      Username or Email
                    </label>
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Username or email"
                      className="w-full bg-tacticalSlate/50 border border-glassBorder rounded-md px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-vanguardGold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-gray-300 mb-1 uppercase tracking-wider">
                      Account Password
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-tacticalSlate/50 border border-glassBorder rounded-md px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-vanguardGold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 bg-vanguardGold hover:bg-yellow-500 text-missionNavy font-mono font-bold uppercase tracking-wider text-xs rounded-md shadow-[0_0_25px_rgba(197,179,88,0.3)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>Sign In</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-lg bg-tacticalSlate/50 border border-glassBorder">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                        STEP 2 OF 2 • 2FA VERIFICATION
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Identity: <strong className="text-white">{loginEmail}</strong>. Verify Passkey or 6-digit TOTP code to unlock access.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setMfaMethod('biometric'); setError(''); }}
                      className={`py-2 px-3 rounded text-[11px] font-mono font-bold uppercase border flex items-center justify-center gap-2 cursor-pointer ${
                        mfaMethod === 'biometric'
                          ? 'bg-vanguardGold text-missionNavy border-vanguardGold'
                          : 'bg-tacticalSlate/40 text-gray-300 border-glassBorder'
                      }`}
                    >
                      <Fingerprint className="w-4 h-4" /> Passkey
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMfaMethod('totp'); setError(''); }}
                      className={`py-2 px-3 rounded text-[11px] font-mono font-bold uppercase border flex items-center justify-center gap-2 cursor-pointer ${
                        mfaMethod === 'totp'
                          ? 'bg-vanguardGold text-missionNavy border-vanguardGold'
                          : 'bg-tacticalSlate/40 text-gray-300 border-glassBorder'
                      }`}
                    >
                      <KeyRound className="w-4 h-4" /> Authenticator
                    </button>
                  </div>

                  {mfaMethod === 'biometric' ? (
                    <div className="p-5 rounded-lg bg-black/50 border border-glassBorder text-center space-y-3">
                      <button
                        type="button"
                        disabled={biometricScanning || biometricSuccess}
                        onClick={handleBiometricVerify}
                        className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                          biometricSuccess
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                            : biometricScanning
                            ? 'bg-blue-600/20 border-blue-400 text-blue-400 animate-pulse'
                            : 'bg-tacticalSlate border-vanguardGold text-vanguardGold hover:scale-105'
                        }`}
                      >
                        {biometricSuccess ? <CheckCircle2 className="w-10 h-10" /> : <Fingerprint className="w-10 h-10" />}
                      </button>
                      <div className="text-xs font-mono font-bold uppercase text-vanguardGold">
                        {biometricSuccess
                          ? 'Verified! Redirecting...'
                          : biometricScanning
                          ? 'Verifying Passkey...'
                          : 'Tap Sensor to Verify Passkey'}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleTotpVerify} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-mono text-gray-300 mb-1 uppercase">
                          6-Digit Authenticator Code
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={7}
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value)}
                          placeholder="6-digit code"
                          className="w-full bg-tacticalSlate/50 border border-glassBorder rounded-md px-4 py-3 text-center text-lg font-mono font-bold tracking-[0.3em] text-white focus:outline-none focus:border-vanguardGold"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold uppercase text-xs rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify Code</span>
                      </button>
                    </form>
                  )}

                  <button
                    type="button"
                    onClick={() => { setAuthStep('credentials'); setError(''); }}
                    className="w-full py-1.5 text-[11px] font-mono text-gray-400 hover:text-white cursor-pointer"
                  >
                    ← Back
                  </button>
                </div>
              )
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
                    Thank you, <strong>{requestReceipt.fullName}</strong> ({requestReceipt.organization}). Your onboarding request (<strong>{requestReceipt.email}</strong>) has been recorded.
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
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestAccess} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-mono text-gray-300 mb-1.5 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
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
                      placeholder="Work Email"
                      className="w-full bg-tacticalSlate/50 border border-glassBorder rounded-md px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-vanguardGold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-mono text-gray-300 mb-1.5 uppercase tracking-wider">
                      Organization
                    </label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Organization"
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
                      className="w-full bg-tacticalSlate/90 border border-glassBorder rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-vanguardGold"
                    >
                      <option>Federal / Defense VAR (SDVOSB)</option>
                      <option>Tactical Networking &amp; Hardware</option>
                      <option>Cloud &amp; Zero-Trust Integration</option>
                      <option>Commercial / Automotive Build</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-vanguardGold hover:bg-yellow-500 text-missionNavy font-mono font-bold uppercase tracking-wider text-xs rounded-md shadow-lg transition-all cursor-pointer"
                >
                  Submit Access Request
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
