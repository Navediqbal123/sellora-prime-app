import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, MapPin, Pencil, Trash2, Loader2 } from 'lucide-react';
import { SubPageShell, EmptyCard } from './_shared';

interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address_line: string;
  city: string;
  pincode: string;
}

const empty = { name: '', phone: '', address_line: '', city: '', pincode: '' };

const AddressesPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setItems((data as Address[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (a: Address) => {
    setEditing(a);
    setForm({ name: a.name, phone: a.phone, address_line: a.address_line, city: a.city, pincode: a.pincode });
    setOpen(true);
  };

  const save = async () => {
    if (!user?.id) return;
    if (!form.name || !form.phone || !form.address_line || !form.city || !form.pincode) {
      toast({ title: 'All fields required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from('addresses').update(form).eq('id', editing.id);
        if (error) throw error;
        toast({ title: 'Address updated' });
      } else {
        const { error } = await supabase.from('addresses').insert({ ...form, user_id: user.id });
        if (error) throw error;
        toast({ title: 'Address added' });
      }
      setOpen(false);
      load();
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Address deleted' }); load(); }
  };

  return (
    <SubPageShell
      title="My Addresses"
      right={
        <Button size="sm" className="btn-glow" onClick={openNew}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      }
    >
      {loading ? (
        <EmptyCard text="Loading..." />
      ) : items.length === 0 ? (
        <EmptyCard text="You haven't added any addresses yet." />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="card-premium p-4 flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground truncate">{a.name}</p>
                  <span className="text-xs text-muted-foreground">{a.phone}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{a.address_line}</p>
                <p className="text-sm text-muted-foreground">{a.city} - {a.pincode}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => openEdit(a)} className="w-8 h-8 rounded-md hover:bg-secondary flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => remove(a.id)} className="w-8 h-8 rounded-md hover:bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Address' : 'Add Address'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { k: 'name', label: 'Full Name' },
              { k: 'phone', label: 'Phone' },
              { k: 'address_line', label: 'Address Line' },
              { k: 'city', label: 'City' },
              { k: 'pincode', label: 'Pincode' },
            ].map((f) => (
              <div key={f.k}>
                <Label className="text-xs text-muted-foreground">{f.label}</Label>
                <Input
                  value={(form as any)[f.k]}
                  onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                  className="mt-1 h-10"
                />
              </div>
            ))}
            <Button className="btn-glow w-full mt-2" onClick={save} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editing ? 'Update' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SubPageShell>
  );
};

export default AddressesPage;