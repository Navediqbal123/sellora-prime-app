import React, { useEffect, useState } from 'react';
import { BadgeCheck, ChevronRight, Fingerprint, Mail, Phone, Store } from 'lucide-react';
import { Card, EditShell, INK, MUTED, VerifiedPill } from './_ui';
import { useMeta } from './useMeta';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const VerificationStatusPage: React.FC = () => {
  const { user, meta } = useMeta();
  const [sellerVerified, setSellerVerified] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase.from('sellers').select('status').eq('user_id', user.id).maybeSingle();
      setSellerVerified((data as any)?.status === 'approved');
    })();
  }, [user?.id]);

  const rows = [
    { icon: Mail, title: 'Email Verification', done: !!(user as any)?.email_confirmed_at },
    { icon: Phone, title: 'Phone Verification', done: !!meta.phone_verified },
    { icon: Fingerprint, title: 'Identity Verification (KYC)', done: !!meta.kyc_verified },
    { icon: Store, title: 'Seller Verification', done: sellerVerified },
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
          <div
            key={r.title}
            className="flex items-center gap-3.5 px-4 py-4"
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
                style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}
              >
                Pending
              </span>
            )}
          </div>
        ))}
      </Card>

      <Card>
        <button
          onClick={() => toast({ title: 'KYC Details', description: 'Your KYC information will appear here.' })}
          className="w-full flex items-center justify-between px-4 py-4 text-left active:bg-black/[0.03]"
        >
          <div>
            <p className="text-[14.5px] font-semibold" style={{ color: INK }}>
              KYC Details
            </p>
            <p className="text-[12.5px] mt-0.5" style={{ color: MUTED }}>
              View your KYC information
            </p>
          </div>
          <ChevronRight size={17} style={{ color: '#9CA3AF' }} />
        </button>
      </Card>
    </EditShell>
  );
};

export default VerificationStatusPage;
