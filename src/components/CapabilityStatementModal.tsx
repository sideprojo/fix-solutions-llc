import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, CheckCircle2, Shield, Target, Briefcase, Building2, Phone, Lock } from 'lucide-react';

interface CapabilityStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CapabilityStatementModal: React.FC<CapabilityStatementModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsAuthenticated(false);
        setPassword('');
        setError('');
        setIsRequestingAccess(false);
        setRequestSubmitted(false);
      }, 300);
    }
  }, [isOpen]);

  // Function to handle downloading the capability statement as a text file (or PDF if we had one)
  const handleDownload = () => {
    if (!isAuthenticated) return;
    const textContent = `F.I.X. | Federal Infrastructure eXchange
Capability Statement

COMPANY OVERVIEW
Federal Infrastructure eXchange (F.I.X.) is a Minority-Owned, Service-Disabled Veteran-Owned Small Business (SDVOSB) providing comprehensive procurement, IT hardware, and logistics solutions to federal and defense agencies. We operate as a Value-Added Reseller (VAR) to fulfill critical infrastructure requirements, secure commercial off-the-shelf (COTS) products, and ensure rapid supply chain execution. Our operational focus is delivering mission-essential equipment on time and strictly within budget parameters.

CORE COMPETENCIES
- IT Systems & Hardware Procurement: Sourcing computing equipment, servers, networking gear, and peripherals.
- Commercial Off-The-Shelf (COTS) Solutions: Delivering ready-to-use software and hardware platforms for immediate agency deployment.
- General Base Operations Supply: Fulfilling broad physical infrastructure requests, including facilities equipment, durable goods, and daily operational supplies.
- Tactical & Field Equipment: Securing specialized gear for defense and security operations.
- Logistics & Order Fulfillment: Managing vendor relations, quality control, and direct-to-agency delivery pipelines.

KEY DIFFERENTIATORS
- Socioeconomic Compliance: Verified SDVOSB and Minority-Owned status, allowing agencies to directly meet their mandated contracting quotas.
- Sole Source Eligibility: Positioned to accept direct, non-competitive contract awards to accelerate agency purchasing timelines.
- Veteran Leadership: Built on military principles of precision, risk mitigation, and strict compliance with federal acquisition regulations.
- Agile Fulfillment: Lean operational structure allows for rapid turnaround on micro-purchases, simplified acquisitions, and urgent supply shortages.

PAST PERFORMANCE
[Insert Agency or Commercial Client Name]
Provided [Insert specific equipment or IT hardware]. Ensured delivery [Insert timeframe, e.g., 14 days ahead of schedule].
Value: $[Insert Value] | Date: [Insert Year]

[Insert Agency or Commercial Client Name]
Sourced and delivered [Insert quantity and type of supplies].
Value: $[Insert Value] | Date: [Insert Year]

[Insert Military/Professional Background Detail]
Managed logistics and supply distribution for [Insert specific unit or operation], overseeing $[Insert Value] in physical assets and tech inventory.

COMPANY DATA
Business Name: [Insert Legal LLC Name, e.g., F.I.X. Federal Group LLC]
DBA: Federal Infrastructure eXchange (F.I.X.)
Socioeconomic Status: SDVOSB, Minority-Owned Small Business
UEI: [Insert 12-character Unique Entity ID from SAM.gov]
CAGE Code: [Insert 5-character CAGE Code]

PRIMARY NAICS CODES
541519: Other Computer Related Services (Value-Added Reseller)
423430: Computer and Peripheral Equipment and Software Merchant Wholesalers
423990: Other Miscellaneous Durable Goods Wholesalers
334111: Electronic Computer Manufacturing (Non-Manufacturer Rule)
561210: Facilities Support Services

CONTACT INFORMATION
Point of Contact: [Your First and Last Name], [Your Title, e.g., Managing Member]
Phone: [Insert Professional Phone Number]
Email: [Insert Professional Email, e.g., yourname@fixfederal.com]
Website: [Insert Website URL]
Address: [Insert Business Address]`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FIX_Capability_Statement.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="fixed inset-4 md:inset-auto md:top-[5vh] md:left-1/2 md:-translate-x-1/2 md:w-[90vw] md:max-w-5xl md:h-[90vh] bg-missionNavy border border-glassBorder rounded-2xl shadow-2xl z-[101] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-glassBorder bg-tacticalSlate/30">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-vanguardGold/10 rounded-xl flex items-center justify-center border border-vanguardGold/30">
                  <FileText className="text-vanguardGold" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Capability Statement</h2>
                  <p className="text-sm font-mono text-vanguardGold uppercase tracking-widest">F.I.X. | Federal Infrastructure eXchange</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {isAuthenticated && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 bg-vanguardGold/10 hover:bg-vanguardGold/20 text-vanguardGold border border-vanguardGold/30 px-4 py-2 rounded-lg transition-colors font-mono text-sm uppercase tracking-wider"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content Scroll Area */}
            <div className={`flex-1 ${!isAuthenticated ? 'overflow-hidden relative' : 'overflow-y-auto custom-scrollbar'} p-6 md:p-10`}>
              {!isAuthenticated && !isRequestingAccess && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-missionNavy/20 backdrop-blur-[2px]">
                  <div className="bg-[#0B1426]/95 p-8 rounded-2xl border border-vanguardGold/30 shadow-2xl max-w-md w-full mx-4">
                    <div className="flex items-center justify-center mb-6">
                      <Lock className="text-vanguardGold w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-white text-center mb-2">Protected Document</h3>
                    <p className="text-gray-400 text-center mb-6 text-sm">Please enter the password to view the full capability statement.</p>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (password === 'c54c9f8b7e3627b3') {
                        setIsAuthenticated(true);
                        setError('');
                      } else {
                        setError('Incorrect password');
                      }
                    }}>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        className="w-full bg-missionNavy border border-glassBorder rounded-lg px-4 py-3 text-white focus:outline-none focus:border-vanguardGold mb-4"
                      />
                      {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
                      <button
                        type="submit"
                        className="w-full bg-vanguardGold text-missionNavy font-bold py-3 rounded-lg hover:bg-yellow-500 transition-colors mb-4"
                      >
                        Unlock Document
                      </button>
                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-glassBorder"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase tracking-wider">or</span>
                        <div className="flex-grow border-t border-glassBorder"></div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsRequestingAccess(true)}
                        className="w-full mt-2 bg-transparent border border-vanguardGold/50 text-vanguardGold font-bold py-3 rounded-lg hover:bg-vanguardGold/10 transition-colors"
                      >
                        Request Access
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {isRequestingAccess && (
                <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/60 p-4 md:p-8 overflow-y-auto">
                  <div className="bg-[#0B1426] p-6 md:p-8 rounded-2xl border border-vanguardGold/30 shadow-2xl max-w-2xl w-full my-auto relative">
                    <button 
                      onClick={() => setIsRequestingAccess(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={24} />
                    </button>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">Request Access</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      To protect our proprietary business information, please provide the following details. We will review your request and provide access if there is a mutual business fit.
                    </p>
                    
                    {requestSubmitted ? (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
                        <CheckCircle2 className="text-green-400 w-12 h-12 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-white mb-2">Request Submitted Successfully</h4>
                        <p className="text-gray-300 text-sm">
                          Thank you for your interest. Our team will review your information and contact you shortly with access credentials if approved.
                        </p>
                        <button 
                          onClick={() => {
                            setIsRequestingAccess(false);
                            setRequestSubmitted(false);
                          }}
                          className="mt-6 bg-vanguardGold text-missionNavy font-bold py-2 px-6 rounded-lg hover:bg-yellow-500 transition-colors"
                        >
                          Return to Prompt
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        setRequestSubmitted(true);
                      }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Full Name *</label>
                            <input required type="text" className="w-full bg-missionNavy/50 border border-glassBorder rounded-lg px-3 py-2 text-white focus:outline-none focus:border-vanguardGold" />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Company / Agency *</label>
                            <input required type="text" className="w-full bg-missionNavy/50 border border-glassBorder rounded-lg px-3 py-2 text-white focus:outline-none focus:border-vanguardGold" />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Official Email *</label>
                            <input required type="email" className="w-full bg-missionNavy/50 border border-glassBorder rounded-lg px-3 py-2 text-white focus:outline-none focus:border-vanguardGold" />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Phone Number</label>
                            <input type="tel" className="w-full bg-missionNavy/50 border border-glassBorder rounded-lg px-3 py-2 text-white focus:outline-none focus:border-vanguardGold" />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Inquiry Type *</label>
                            <select required className="w-full bg-missionNavy/50 border border-glassBorder rounded-lg px-3 py-2 text-white focus:outline-none focus:border-vanguardGold appearance-none">
                              <option value="">Select Type...</option>
                              <option value="Government Agency">Government Agency</option>
                              <option value="Prime Contractor / Teaming">Prime Contractor / Teaming</option>
                              <option value="Resell Customer">Resell Customer</option>
                              <option value="Service Customer">Service Customer</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Contract Type / Vehicle</label>
                            <input type="text" placeholder="e.g., SEWP, GSA, Open Market" className="w-full bg-missionNavy/50 border border-glassBorder rounded-lg px-3 py-2 text-white focus:outline-none focus:border-vanguardGold" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Estimated Duration / Timeline</label>
                            <input type="text" placeholder="e.g., Q3 2026, 12-month base" className="w-full bg-missionNavy/50 border border-glassBorder rounded-lg px-3 py-2 text-white focus:outline-none focus:border-vanguardGold" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Brief Description of Requirements *</label>
                            <textarea required rows={3} className="w-full bg-missionNavy/50 border border-glassBorder rounded-lg px-3 py-2 text-white focus:outline-none focus:border-vanguardGold resize-none"></textarea>
                          </div>
                        </div>
                        <div className="pt-4 flex justify-end space-x-3">
                          <button 
                            type="button"
                            onClick={() => setIsRequestingAccess(false)}
                            className="px-6 py-2 rounded-lg border border-glassBorder text-gray-300 hover:bg-white/5 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-vanguardGold text-missionNavy font-bold hover:bg-yellow-500 transition-colors"
                          >
                            Submit Request
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              <div className={`max-w-4xl mx-auto space-y-12 ${!isAuthenticated ? 'blur-sm select-none pointer-events-none opacity-50 max-h-[450px] overflow-hidden' : ''}`}>
                
                {/* Company Overview */}
                <section>
                  <div className="flex items-center space-x-3 mb-4">
                    <Building2 className="text-vanguardGold" size={24} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">Company Overview</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-lg bg-tacticalSlate/20 p-6 rounded-xl border border-glassBorder/50">
                    <strong className="text-white">Federal Infrastructure eXchange (F.I.X.)</strong> is a Minority-Owned, Service-Disabled Veteran-Owned Small Business (SDVOSB) providing comprehensive procurement, IT hardware, and logistics solutions to federal and defense agencies. We operate as a Value-Added Reseller (VAR) to fulfill critical infrastructure requirements, secure commercial off-the-shelf (COTS) products, and ensure rapid supply chain execution. Our operational focus is delivering mission-essential equipment on time and strictly within budget parameters.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Core Competencies */}
                  <section>
                    <div className="flex items-center space-x-3 mb-6">
                      <Target className="text-vanguardGold" size={24} />
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider">Core Competencies</h3>
                    </div>
                    <ul className="space-y-4">
                      {[
                        { title: "IT Systems & Hardware Procurement", desc: "Sourcing computing equipment, servers, networking gear, and peripherals." },
                        { title: "Commercial Off-The-Shelf (COTS) Solutions", desc: "Delivering ready-to-use software and hardware platforms for immediate agency deployment." },
                        { title: "General Base Operations Supply", desc: "Fulfilling broad physical infrastructure requests, including facilities equipment, durable goods, and daily operational supplies." },
                        { title: "Tactical & Field Equipment", desc: "Securing specialized gear for defense and security operations." },
                        { title: "Logistics & Order Fulfillment", desc: "Managing vendor relations, quality control, and direct-to-agency delivery pipelines." }
                      ].map((item, i) => (
                        <li key={i} className="flex items-start space-x-3 bg-tacticalSlate/10 p-4 rounded-lg border border-glassBorder/30">
                          <CheckCircle2 className="text-vanguardGold shrink-0 mt-0.5" size={18} />
                          <div>
                            <span className="font-semibold text-white block mb-1">{item.title}</span>
                            <span className="text-gray-400 text-sm leading-relaxed">{item.desc}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Key Differentiators */}
                  <section>
                    <div className="flex items-center space-x-3 mb-6">
                      <Shield className="text-vanguardGold" size={24} />
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider">Key Differentiators</h3>
                    </div>
                    <ul className="space-y-4">
                      {[
                        { title: "Socioeconomic Compliance", desc: "Verified SDVOSB and Minority-Owned status, allowing agencies to directly meet their mandated contracting quotas." },
                        { title: "Sole Source Eligibility", desc: "Positioned to accept direct, non-competitive contract awards to accelerate agency purchasing timelines." },
                        { title: "Veteran Leadership", desc: "Built on military principles of precision, risk mitigation, and strict compliance with federal acquisition regulations." },
                        { title: "Agile Fulfillment", desc: "Lean operational structure allows for rapid turnaround on micro-purchases, simplified acquisitions, and urgent supply shortages." }
                      ].map((item, i) => (
                        <li key={i} className="flex items-start space-x-3 bg-tacticalSlate/10 p-4 rounded-lg border border-glassBorder/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-vanguardGold shrink-0 mt-2" />
                          <div>
                            <span className="font-semibold text-white block mb-1">{item.title}</span>
                            <span className="text-gray-400 text-sm leading-relaxed">{item.desc}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                {/* Past Performance */}
                <section>
                  <div className="flex items-center space-x-3 mb-6">
                    <Briefcase className="text-vanguardGold" size={24} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">Past Performance</h3>
                  </div>
                  <p className="text-sm text-gray-500 font-mono mb-4 italic">(Note: Until you have federal contracts, list relevant commercial experience or specific military logistics/procurement experience here).</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-tacticalSlate/20 p-5 rounded-xl border border-glassBorder/50">
                      <h4 className="font-bold text-white mb-2">[Insert Agency or Commercial Client Name]</h4>
                      <p className="text-gray-400 text-sm mb-4">Provided [Insert specific equipment or IT hardware]. Ensured delivery [Insert timeframe, e.g., 14 days ahead of schedule].</p>
                      <div className="text-xs font-mono text-vanguardGold border-t border-glassBorder pt-3">
                        Value: $[Insert Value] | Date: [Insert Year]
                      </div>
                    </div>
                    <div className="bg-tacticalSlate/20 p-5 rounded-xl border border-glassBorder/50">
                      <h4 className="font-bold text-white mb-2">[Insert Agency or Commercial Client Name]</h4>
                      <p className="text-gray-400 text-sm mb-4">Sourced and delivered [Insert quantity and type of supplies].</p>
                      <div className="text-xs font-mono text-vanguardGold border-t border-glassBorder pt-3 mt-auto">
                        Value: $[Insert Value] | Date: [Insert Year]
                      </div>
                    </div>
                    <div className="bg-tacticalSlate/20 p-5 rounded-xl border border-glassBorder/50">
                      <h4 className="font-bold text-white mb-2">[Insert Military/Professional Background Detail]</h4>
                      <p className="text-gray-400 text-sm mb-4">Managed logistics and supply distribution for [Insert specific unit or operation], overseeing $[Insert Value] in physical assets and tech inventory.</p>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-glassBorder">
                  {/* Company Data & NAICS */}
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Company Data</h3>
                      <div className="bg-tacticalSlate/20 p-5 rounded-xl border border-glassBorder/50 space-y-3 text-sm">
                        <div className="flex justify-between border-b border-glassBorder/30 pb-2">
                          <span className="text-gray-400">Business Name</span>
                          <span className="text-white font-medium text-right">[Insert Legal LLC Name]</span>
                        </div>
                        <div className="flex justify-between border-b border-glassBorder/30 pb-2">
                          <span className="text-gray-400">DBA</span>
                          <span className="text-white font-medium text-right">Federal Infrastructure eXchange (F.I.X.)</span>
                        </div>
                        <div className="flex justify-between border-b border-glassBorder/30 pb-2">
                          <span className="text-gray-400">Socioeconomic Status</span>
                          <span className="text-white font-medium text-right">SDVOSB, Minority-Owned</span>
                        </div>
                        <div className="flex justify-between border-b border-glassBorder/30 pb-2">
                          <span className="text-gray-400">UEI</span>
                          <span className="text-vanguardGold font-mono text-right">[Insert 12-char UEI]</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">CAGE Code</span>
                          <span className="text-vanguardGold font-mono text-right">[Insert 5-char CAGE]</span>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Primary NAICS Codes</h3>
                      <div className="bg-tacticalSlate/20 p-5 rounded-xl border border-glassBorder/50 space-y-3">
                        {[
                          { code: "541519", desc: "Other Computer Related Services (Value-Added Reseller)" },
                          { code: "423430", desc: "Computer and Peripheral Equipment and Software Merchant Wholesalers" },
                          { code: "423990", desc: "Other Miscellaneous Durable Goods Wholesalers" },
                          { code: "334111", desc: "Electronic Computer Manufacturing (Non-Manufacturer Rule)" },
                          { code: "561210", desc: "Facilities Support Services" }
                        ].map((item, i) => (
                          <div key={i} className="flex space-x-4 text-sm">
                            <span className="font-mono text-vanguardGold font-bold shrink-0">{item.code}</span>
                            <span className="text-gray-300">{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Contact Information */}
                  <section>
                    <div className="flex items-center space-x-3 mb-4">
                      <Phone className="text-vanguardGold" size={24} />
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider">Contact Information</h3>
                    </div>
                    <div className="bg-tacticalSlate/20 p-6 rounded-xl border border-glassBorder/50 space-y-6">
                      <div>
                        <p className="text-xs font-mono text-gray-500 uppercase mb-1">Point of Contact</p>
                        <p className="text-white font-bold text-lg">[Your First and Last Name]</p>
                        <p className="text-vanguardGold text-sm">[Your Title, e.g., Managing Member]</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-mono text-gray-500 uppercase mb-1">Phone</p>
                          <p className="text-gray-300">[Insert Professional Phone Number]</p>
                        </div>
                        <div>
                          <p className="text-xs font-mono text-gray-500 uppercase mb-1">Email</p>
                          <p className="text-gray-300">[Insert Professional Email]</p>
                        </div>
                        <div>
                          <p className="text-xs font-mono text-gray-500 uppercase mb-1">Website</p>
                          <p className="text-gray-300">[Insert Website URL]</p>
                        </div>
                        <div>
                          <p className="text-xs font-mono text-gray-500 uppercase mb-1">Address</p>
                          <p className="text-gray-300">[Insert Business Address]</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
