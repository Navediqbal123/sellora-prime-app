import React, { useRef, useState } from 'react';
import { CloudUpload, FileCheck2, Fingerprint, Loader2, ExternalLink } from 'lucide-react';
import { Card, EditShell, INK, MUTED, PURPLE, PurpleButton } from './_ui';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useProfileRow } from './useProfileRow';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const STATUS_STYLE: Record<string, { bg: string; fg: string; border: string; label: string }> = {
  verified: { bg: '#ECFDF5', fg: '#047857', border: '#A7F3D0', label: 'Verified' },
  submitted: { bg: '#EFF6FF', fg: '#1D4ED8', border: '#BFDBFE', label: 'Under review' },
  rejected: { bg: '#FEF2F2', fg: '#B91C1C', border: '#FECACA', label: 'Rejected' },
  pending: { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A', label: 'Not submitted' },
};

const KycVerificationPage: React.FC = () => {
  const { user, profile, refresh } = useProfileRow();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const status = (profile?.kyc_status || 'pending').toLowerCase();
  const badge = STATUS_STYLE[status] || STATUS_STYLE.pending;

  const pick = (f: File | null) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      toast({ title: 'Unsupported file', description: 'Upload a JPG, PNG, WEBP or PDF.', variant: 'destructive' });
      return;
    }
    if (f.size > MAX_BYTES) {
      toast({ title: 'File too large', description: 'Maximum size is 5 MB.', variant: 'destructive' });
      return;
    }
    setFile(f);
  };

  const submit = async () => {
    if (!user?.id || !file) return;
    setBusy(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const path = `${user.id}/kyc-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('kyc-documents')
        .upload(path, file, { contentType: file.type, upsert: true });
      if (upErr) throw upErr;

      const { data: signed } = await supabase.storage.from('kyc-documents').createSignedUrl(path, 60 * 60 * 24 * 365);
      const url = signed?.signedUrl || supabase.storage.from('kyc-documents').getPublicUrl(path).data.publicUrl;

      const { error } = await supabase
        .from('profiles')
        .update({ kyc_document_url: url, kyc_status: 'submitted' })
        .eq('id', user.id);
      if (error) throw error;

      setFile(null);
      await refresh();
      toast({ title: 'Document submitted', description: 'Your KYC is now under review.' });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e?.message || 'Try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <EditShell title="Identity Verification" subtitle="Upload a government ID to get verified" centerTitle>
      <div className="flex flex-col items-center pt-1">
        <div
          className="w-[86px] h-[86px] rounded-[28px] flex items-center justify-center"
          style={{ backgroundColor: '#F8F5FF', border: '1px solid #E5D8FF' }}
        >
          <Fingerprint size={38} strokeWidth={1.6} style={{ color: PURPLE }} />
        </div>
        <span
          className="mt-4 px-3 h-8 inline-flex items-center rounded-full text-[12px] font-semibold"
          style={{ backgroundColor: badge.bg, color: badge.fg, border: `1px solid ${badge.border}` }}
        >
          KYC: {badge.label}
        </span>
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-[24px] py-8 px-5 flex flex-col items-center gap-2 transition-all active:scale-[0.99]"
        style={{ backgroundColor: '#FFFFFF', border: `1.5px dashed ${file ? PURPLE : '#D9D9E0'}` }}
      >
        {file ? (
          <FileCheck2 size={26} strokeWidth={1.8} style={{ color: PURPLE }} />
        ) : (
          <CloudUpload size={26} strokeWidth={1.8} style={{ color: MUTED }} />
        )}
        <p className="text-[14.5px] font-semibold" style={{ color: INK }}>
          {file ? file.name : 'Upload document'}
        </p>
        <p className="text-[12.5px]" style={{ color: MUTED }}>
          Aadhaar, Passport, Driving Licence · JPG, PNG or PDF · max 5 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] || null)}
        />
      </button>

      {profile?.kyc_document_url && (
        <Card>
          <a
            href={profile.kyc_document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-4"
          >
            <div>
              <p className="text-[14.5px] font-semibold" style={{ color: INK }}>
                Submitted document
              </p>
              <p className="text-[12.5px] mt-0.5" style={{ color: MUTED }}>
                View the document you uploaded
              </p>
            </div>
            <ExternalLink size={17} style={{ color: '#9CA3AF' }} />
          </a>
        </Card>
      )}

      <PurpleButton onClick={submit} disabled={!file || busy}>
        {busy ? <Loader2 size={17} className="animate-spin" /> : <CloudUpload size={17} strokeWidth={2.2} />}
        Submit for Verification
      </PurpleButton>
    </EditShell>
  );
};

export default KycVerificationPage;
