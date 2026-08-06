import React, { useEffect, useState } from 'react';
import { Banknote, CreditCard, Loader2, Save, Smartphone, Wallet } from 'lucide-react';
import { Card, EditShell, INK, MUTED, PurpleButton, Radio } from './_ui';
import { useMeta } from './useMeta';

const METHODS = [
  { id: 'upi', icon: Smartphone, title: 'UPI', subtitle: 'Pay using any UPI app' },
  { id: 'card', icon: CreditCard, title: 'Debit / Credit Card', subtitle: 'Visa, Mastercard, RuPay' },
  { id: 'wallet', icon: Wallet, title: 'Wallet Balance', subtitle: 'Use your wallet balance' },
  { id: 'cod', icon: Banknote, title: 'Cash on Delivery', subtitle: 'Pay when you receive' },
];

const PaymentPreferencesPage: React.FC = () => {
  const { meta, save, saving } = useMeta();
  const [selected, setSelected] = useState('upi');

  useEffect(() => setSelected(meta.payment_method || 'upi'), [meta]);

  return (
    <EditShell title="Payment Preferences" subtitle="Default payment method" centerTitle>
      <Card className="overflow-hidden">
        {METHODS.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            className="w-full flex items-center gap-3.5 px-4 py-4 text-left active:bg-black/[0.03]"
            style={{ borderBottom: i !== METHODS.length - 1 ? '1px solid #F1F1F4' : 'none' }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5F5F7' }}>
              <m.icon size={20} strokeWidth={1.9} style={{ color: INK }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14.5px] font-semibold" style={{ color: INK }}>
                {m.title}
              </p>
              <p className="text-[12.5px] mt-0.5" style={{ color: MUTED }}>
                {m.subtitle}
              </p>
            </div>
            <Radio selected={selected === m.id} />
          </button>
        ))}
      </Card>

      <PurpleButton disabled={saving} onClick={() => save({ payment_method: selected })}>
        {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} strokeWidth={2.25} />}
        Save Changes
      </PurpleButton>
    </EditShell>
  );
};

export default PaymentPreferencesPage;
