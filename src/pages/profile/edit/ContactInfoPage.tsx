import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Phone, Save } from 'lucide-react';
import { Card, EditShell, FieldCard, INK, MUTED, PURPLE, PurpleButton, VerifiedPill } from './_ui';
import { useMeta } from './useMeta';

const ContactInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, meta } = useMeta();
  const phone = meta.phone || (user as any)?.phone || 'Not added';

  return (
    <EditShell title="Contact Information" subtitle="Your contact details" centerTitle>
      <FieldCard label="Email Address" verified>
        <p className="text-[15px] font-semibold truncate">{user?.email}</p>
      </FieldCard>

      <Card className="p-4" style={{ backgroundColor: '#F8F5FF', border: '1px solid #E5D8FF' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFFFFF' }}>
            <Phone size={18} strokeWidth={2} style={{ color: PURPLE }} />
          </div>
          <div>
            <p className="text-[14.5px] font-semibold" style={{ color: INK }}>
              Change Phone Number
            </p>
            <p className="text-[12.5px] mt-0.5" style={{ color: MUTED }}>
              Changing your phone number requires OTP verification.
            </p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid #F1F1F4' }}>
          <div>
            <p className="text-[11.5px]" style={{ color: MUTED }}>
              Current Number
            </p>
            <p className="text-[15px] font-semibold mt-0.5" style={{ color: INK }}>
              {phone}
            </p>
          </div>
          {meta.phone_verified && <VerifiedPill />}
        </div>
        <button
          onClick={() => navigate('/profile/edit/phone')}
          className="w-full flex items-center justify-between px-4 py-4 text-left transition-colors active:bg-black/[0.03]"
        >
          <span className="text-[14px] font-semibold" style={{ color: INK }}>
            Tap to change your phone number
          </span>
          <ChevronRight size={17} style={{ color: '#9CA3AF' }} />
        </button>
      </Card>

      <div className="pt-1">
        <PurpleButton onClick={() => navigate('/profile/edit')}>
          <Save size={17} strokeWidth={2.25} />
          Save Changes
        </PurpleButton>
      </div>
    </EditShell>
  );
};

export default ContactInfoPage;
