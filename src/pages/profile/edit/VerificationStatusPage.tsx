import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, ChevronRight, Fingerprint, Mail, Phone, Store } from 'lucide-react';
import { Card, EditShell, INK, MUTED, VerifiedPill } from './_ui';
import { supabase } from '@/lib/supabase';
import { useProfileRow } from './useProfileRow';

const VerificationStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useProfileRow();
  const [sellerVerified, setSellerVerified] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase.from('sellers').select('status').eq('user_id', user.id).maybeSingle();
      setSellerVerified((data as any)?.status === 'approved');
    })();
  }, [user?.id]);

  const kyc = (profile?.kyc_status || 'pending').toLowerCase();

  const rows = [
    { icon: Mail, title: 'Email Verification', done: !!(user as any)?.email_confirmed_at, pending: 'Pending' },
    { icon: Phone, title: 'Phone Verification', done: !!profile?.phone_verified, pending: 'Pending', to: '/profile/edit/phone' },
    {
      icon: Fingerprint,
      title: 'Identity Verification (KYC)',
      done: kyc === 'verified',
      pending: kyc === 'submitted' ? 'Under review' : kyc === 'rejected' ? 'Rejected' : 'Pending',
      to: '/profile/edit/kyc',
    },
    { icon: Store, title: 'Seller Verification', done: sellerVerified, pending: 'Pending' },
  ];

  return (
    <EditShell title="Verification Status" subtitle="Get verified to build trust" centerTitle>
      <div className="flex flex-col items-center pt-1 pb-1">
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}
        >
          <BadgeCheck size={32} strokeWidth={1.7} style={{ color: '#10B981' }} />
        </div>
        <p className="text-[14px] font-semibold mt-3" style={{ color: INK }}>
          Your Verification
        </p>
      </div>

      <Card className="overflow-hidden">
        {rows.map((r, i) => (
          <button
            key={r.title}
            onClick={() => r.to && navigate(r.to)}
            className="w-full flex items-center gap-3.5 px-4 py-4 text-left active:bg-black/[0.03]"
            style={{ borderBottom: i !== rows.length - 1 ? '1px solid #F1F1F4' : 'none' }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5F5F7' }}>
              <r.icon size={20} strokeWidth={1.9} style={{ color: INK }} />
            </div>
            <p className="flex-1 text-[14.5px] font-semibold" style={{ color: INK }}>
              {r.title}
            </p>
            {r.done ? (
              <VerifiedPill />
            ) : (
              <span
                className="px-2.5 h-7 inline-flex items-center rounded-full text-[11.5px] font-semibold"
                style={
                  r.pending === 'Under review'
                    ? { backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }
                    : r.pending === 'Rejected'
                    ? { backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }
                    : { backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }
                }
              >
                {r.pending}
              </span>
            )}
          </button>
        ))}
      </Card>

      <Card>
        <button
          onClick={() => navigate('/profile/edit/kyc')}
          className="w-full flex items-center justify-between px-4 py-4 text-left active:bg-black/[0.03]"
        >
          <div>
            <p className="text-[14.5px] font-semibold" style={{ color: INK }}>
              KYC Details
            </p>
            <p className="text-[12.5px] mt-0.5" style={{ color: MUTED }}>
              {profile?.kyc_document_url ? 'View or replace your document' : 'Upload your identity document'}
            </p>
          </div>
          <ChevronRight size={17} style={{ color: '#9CA3AF' }} />
        </button>
      </Card>
    </EditShell>
  );
};

export default VerificationStatusPage;
