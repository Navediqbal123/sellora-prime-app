import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Card, EditShell, INK, MUTED, PurpleButton, VerifiedPill } from './_ui';
import { useMeta } from './useMeta';

const PhoneUpdatedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as any)?.phone || '';
  const { save, saving } = useMeta();

  const done = async () => {
    await save({ phone, phone_verified: true }, 'Phone number updated.');
    navigate('/profile/edit/contact', { replace: true });
  };

  return (
    <EditShell title="Phone Number" centerTitle>
      <div className="flex flex-col items-center pt-6">
        <div
          className="w-[96px] h-[96px] rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}
        >
          <CheckCircle2 size={46} strokeWidth={1.8} style={{ color: '#10B981' }} />
        </div>
        <h2 className="text-[20px] font-bold mt-5" style={{ color: INK }}>
          Phone Number Updated
        </h2>
        <p className="text-[13.5px] text-center mt-1.5 max-w-[300px]" style={{ color: MUTED }}>
          Your phone number has been successfully updated and verified.
        </p>
      </div>

      <Card className="px-4 py-4 mt-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11.5px]" style={{ color: MUTED }}>
              New Number
            </p>
            <p className="text-[15.5px] font-semibold mt-0.5" style={{ color: INK }}>
              {phone}
            </p>
          </div>
          <VerifiedPill />
        </div>
      </Card>

      <PurpleButton onClick={done} disabled={saving}>
        Done
      </PurpleButton>
    </EditShell>
  );
};

export default PhoneUpdatedPage;
