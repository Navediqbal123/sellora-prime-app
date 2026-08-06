import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Save } from 'lucide-react';
import { Card, EditShell, INK, MUTED, PURPLE, PurpleButton, Radio } from './_ui';
import { useMeta } from './useMeta';
import { supabase } from '@/lib/supabase';

type Addr = { id: string; label: string; name?: string; lines: string[] };

const ShippingAddressPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, meta, save, saving } = useMeta();
  const [addresses, setAddresses] = useState<Addr[]>([]);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id);
      const rows = (data || []) as any[];
      if (rows.length) {
        setAddresses(
          rows.map((r) => ({
            id: r.id,
            label: r.label || 'Address',
            name: r.full_name,
            lines: [r.address_line, `${r.city || ''}${r.state ? ', ' + r.state : ''} ${r.pincode || ''}`].filter(Boolean),
          })),
        );
      }
    })();
  }, [user?.id]);

  useEffect(() => setSelected(meta.default_address_id || ''), [meta]);

  return (
    <EditShell title="Default Shipping Address" subtitle="Used for your orders by default" centerTitle>
      {addresses.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-[13.5px]" style={{ color: MUTED }}>
            No saved addresses yet.
          </p>
        </Card>
      )}

      {addresses.map((a) => (
        <button
          key={a.id}
          onClick={() => setSelected(a.id)}
          className="w-full text-left rounded-[24px] p-4 flex items-start gap-3 transition-all active:scale-[0.99]"
          style={{
            backgroundColor: '#FFFFFF',
            border: `1.5px solid ${selected === a.id ? PURPLE : '#EFEFF3'}`,
            boxShadow: '0 1px 2px rgba(15,15,25,0.04), 0 8px 24px -12px rgba(15,15,25,0.08)',
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold" style={{ color: PURPLE }}>
              {a.label}
            </p>
            {a.name && (
              <p className="text-[14.5px] font-semibold mt-1" style={{ color: INK }}>
                {a.name}
              </p>
            )}
            {a.lines.map((l, i) => (
              <p key={i} className="text-[12.5px] mt-0.5" style={{ color: MUTED }}>
                {l}
              </p>
            ))}
          </div>
          <Radio selected={selected === a.id} />
        </button>
      ))}

      <button
        onClick={() => navigate('/profile/addresses')}
        className="w-full h-[52px] rounded-[18px] flex items-center justify-center gap-2 text-[14.5px] font-semibold transition-all active:scale-[0.98]"
        style={{ backgroundColor: '#F8F5FF', border: '1px dashed #C9AEFF', color: PURPLE }}
      >
        <Plus size={17} strokeWidth={2.3} />
        Add New Address
      </button>

      <PurpleButton disabled={saving || !selected} onClick={() => save({ default_address_id: selected })}>
        {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} strokeWidth={2.25} />}
        Save Changes
      </PurpleButton>
    </EditShell>
  );
};

export default ShippingAddressPage;
