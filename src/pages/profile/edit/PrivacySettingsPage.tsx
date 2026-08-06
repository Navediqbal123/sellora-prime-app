import React, { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Card, EditShell, INK, MUTED, PurpleButton, Radio, Toggle } from './_ui';
import { useMeta } from './useMeta';

const PrivacySettingsPage: React.FC = () => {
  const { meta, save, saving } = useMeta();
  const [visibility, setVisibility] = useState('public');
  const [activity, setActivity] = useState(true);
  const [showOrders, setShowOrders] = useState(false);

  useEffect(() => {
    setVisibility(meta.profile_visibility || 'public');
    setActivity(meta.show_activity !== false);
    setShowOrders(!!meta.show_orders);
  }, [meta]);

  const options = [
    { id: 'public', title: 'Public', subtitle: 'Anyone can see your profile' },
    { id: 'private', title: 'Private', subtitle: 'Only you can see your profile' },
  ];

  return (
    <EditShell title="Privacy Settings" subtitle="Manage your profile privacy" centerTitle>
      <div>
        <p className="text-[14.5px] font-bold px-1" style={{ color: INK }}>
          Profile Visibility
        </p>
        <p className="text-[12.5px] px-1 mb-2.5" style={{ color: MUTED }}>
          Choose who can see your profile
        </p>
        <Card className="overflow-hidden">
          {options.map((o, i) => (
            <button
              key={o.id}
              onClick={() => setVisibility(o.id)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-black/[0.03]"
              style={{ borderBottom: i === 0 ? '1px solid #F1F1F4' : 'none' }}
            >
              <div className="flex-1">
                <p className="text-[14.5px] font-semibold" style={{ color: INK }}>
                  {o.title}
                </p>
                <p className="text-[12.5px] mt-0.5" style={{ color: MUTED }}>
                  {o.subtitle}
                </p>
              </div>
              <Radio selected={visibility === o.id} />
            </button>
          ))}
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid #F1F1F4' }}>
          <div className="flex-1">
            <p className="text-[14.5px] font-semibold" style={{ color: INK }}>
              Show Activity Status
            </p>
            <p className="text-[12.5px] mt-0.5" style={{ color: MUTED }}>
              Let others see when you're active
            </p>
          </div>
          <Toggle on={activity} onChange={setActivity} />
        </div>
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex-1">
            <p className="text-[14.5px] font-semibold" style={{ color: INK }}>
              Show Orders on Profile
            </p>
            <p className="text-[12.5px] mt-0.5" style={{ color: MUTED }}>
              Allow others to see your orders
            </p>
          </div>
          <Toggle on={showOrders} onChange={setShowOrders} />
        </div>
      </Card>

      <PurpleButton
        disabled={saving}
        onClick={() => save({ profile_visibility: visibility, show_activity: activity, show_orders: showOrders })}
      >
        {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} strokeWidth={2.25} />}
        Save Changes
      </PurpleButton>
    </EditShell>
  );
};

export default PrivacySettingsPage;
