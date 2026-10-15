export interface WorkspaceLeadPayload {
  sourceSite: 'Milton Group Concepts LLC' | 'F.I.X Solutions LLC';
  formType: 'Request Consultation' | 'Request Quote' | 'Client/Partner Onboarding';
  fullName: string;
  email: string;
  organization: string;
  sectorOrService: string;
  message?: string;
}

export interface WorkspaceLeadResult {
  receiptId: string;
  timestamp: string;
  webhookSent: boolean;
  mailtoUrl: string;
}

function sanitizeField(val: string): string {
  return String(val || '')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED-SSN]')
    .replace(/sk-[a-zA-Z0-9-]+/g, '[REDACTED-KEY]')
    .trim();
}

async function computeReceiptHash(seed: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(seed));
      const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      return 'FIX-LEAD-' + hex.slice(0, 10).toUpperCase();
    }
  } catch {
    // fallback
  }
  return 'FIX-LEAD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function dispatchWorkspaceLead(payload: WorkspaceLeadPayload): Promise<WorkspaceLeadResult> {
  const timestamp = new Date().toISOString();
  const cleanPayload = {
    sourceSite: payload.sourceSite,
    formType: payload.formType,
    fullName: sanitizeField(payload.fullName),
    email: sanitizeField(payload.email),
    organization: sanitizeField(payload.organization),
    sector: sanitizeField(payload.sectorOrService),
    message: sanitizeField(payload.message || '')
  };

  const receiptId = await computeReceiptHash(`${cleanPayload.email}:${cleanPayload.organization}:${timestamp}`);
  const fullRecord = { ...cleanPayload, receiptId, timestamp };

  try {
    const existing = JSON.parse(localStorage.getItem('mgc_workspace_leads') || '[]');
    existing.unshift(fullRecord);
    localStorage.setItem('mgc_workspace_leads', JSON.stringify(existing.slice(0, 100)));
  } catch {
    // ignore storage errors
  }

  let webhookSent = false;
  const webhookUrl =
    (typeof window !== 'undefined' && localStorage.getItem('mgc_workspace_webhook_url')) ||
    (import.meta as any).env?.VITE_WORKSPACE_WEBHOOK_URL ||
    '';

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullRecord)
      });
      webhookSent = true;
    } catch {
      webhookSent = false;
    }
  }

  const subject = encodeURIComponent(`[${cleanPayload.sourceSite}] ${cleanPayload.formType} — ${cleanPayload.organization} (${receiptId})`);
  const body = encodeURIComponent(
    [
      `Verified Submission Receipt: ${receiptId}`,
      `Timestamp: ${timestamp}`,
      `Source: ${cleanPayload.sourceSite} (${cleanPayload.formType})`,
      `Name: ${cleanPayload.fullName}`,
      `Official Email: ${cleanPayload.email}`,
      `Organization / Agency: ${cleanPayload.organization}`,
      `Mission Track / Service: ${cleanPayload.sector}`,
      `Details: ${cleanPayload.message || 'N/A'}`
    ].join('\n')
  );

  return {
    receiptId,
    timestamp,
    webhookSent,
    mailtoUrl: `mailto:contact@miltongroupsecurity.org?subject=${subject}&body=${body}`
  };
}
