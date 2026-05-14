import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, CreditCard, Smartphone, Trash2, Loader2 } from 'lucide-react';
import { SubPageShell, EmptyCard } from './_shared';

interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'upi' | 'card';
  upi_id?: string;
  card_number?: string;
  card_holder?: string;
  card_expiry?: string;
}

const PaymentMethodsPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setItems((data as PaymentMethod[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const save = async () => {
    if (!user?.id) return;
    if (type === 'upi' && !upiId) return toast({ title: 'Enter UPI ID', variant: 'destructive' });
    if (type === 'card' && (!cardNumber || !cardHolder || !cardExpiry))
      return toast({ title: 'Fill all card fields', variant: 'destructive' });
    setSaving(true);
    const payload =
      type === 'upi'
        ? { user_id: user.id, type, upi_id: upiId }
        : { user_id: user.id, type, card_number: cardNumber.slice(-4).padStart(cardNumber.length, '*'), card_holder: cardHolder, card_expiry: cardExpiry };
    const { error } = await supabase.from('payment_methods').insert(payload);
    setSaving(false);
    if (error) return toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    toast({ title: 'Payment method added' });
    setOpen(false);
    setUpiId(''); setCardNumber(''); setCardHolder(''); setCardExpiry('');
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this payment method?')) return;
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    if (error) toast({ title: 'Remove failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Removed' }); load(); }
  };

  return (
    <SubPageShell
      title="Payment Methods"
      right={
        <Button size="sm" className="btn-glow" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      }
    >
      {loading ? (
        <EmptyCard text="Loading..." />
      ) : items.length === 0 ? (
        <EmptyCard text="No payment methods added yet." />
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="card-premium p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                {p.type === 'upi' ? (
                  <Smartphone className="w-5 h-5 text-primary" />
                ) : (
                  <CreditCard className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {p.type === 'upi' ? (
                  <>
                    <p className="font-semibold text-foreground">UPI</p>
                    <p className="text-sm text-muted-foreground truncate">{p.upi_id}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-foreground">{p.card_holder}</p>
                    <p className="text-sm text-muted-foreground">{p.card_number} • {p.card_expiry}</p>
                  </>
                )}
              </div>
              <button onClick={() => remove(p.id)} className="w-8 h-8 rounded-md hover:bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Payment Method</DialogTitle></DialogHeader>
          <div className="flex gap-2 mb-2">
            {(['upi', 'card'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 h-10 rounded-md text-sm font-medium transition-colors ${
                  type === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          {type === 'upi' ? (
            <div>
              <Label className="text-xs text-muted-foreground">UPI ID</Label>
              <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@upi" className="mt-1 h-10" />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Card Number</Label>
                <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="•••• •••• •••• ••••" className="mt-1 h-10" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Card Holder</Label>
                <Input value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} className="mt-1 h-10" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Expiry (MM/YY)</Label>
                <Input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="12/27" className="mt-1 h-10" />
              </div>
            </div>
          )}
          <Button className="btn-glow w-full mt-3" onClick={save} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save
          </Button>
        </DialogContent>
      </Dialog>
    </SubPageShell>
  );
};

export default PaymentMethodsPage;