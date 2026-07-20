import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Loader2,
  ShieldCheck,
  Store,
  MapPin,
  Globe,
  Phone,
  Mail,
  User,
  Building2,
  Camera,
  UploadCloud,
  Lock,
  Clock,
  FileCheck,
  Copy,
  MessageCircle,
  ShoppingBag,
  Truck,
  Wallet,
  BadgeCheck,
  PackageCheck,
  Zap,
  Headphones,
  RotateCcw,
  Tag,
  Star,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PURPLE = '#7C3AED';

type FormState = {
  // Step 1
  store_name: string;
  store_category: string;
  sub_category: string;
  brand_name: string;
  tagline: string;
  description: string;
  founded_year: string;
  theme_color: string;
  store_slug: string;
  language: string;
  currency: string;
  warranty: boolean;
  fast_shipping: boolean;
  cod: boolean;
  highlights: Record<string, boolean>;
  logo_name: string;
  banner_name: string;

  // Step 2
  country: string;
  state: string;
  city: string;
  address: string;
  pincode: string;

  // Step 3
  full_name: string;
  role: string;
  email: string;
  phone_number: string;
  whatsapp: string;
  support_email: string;
  support_phone: string;
  business_hours: string;
  preferred_comm: string;
  b_country: string;
  b_state: string;
  b_city: string;
  b_zip: string;

  // Step 4
  id_type: string;
  id_number: string;
  id_front_name: string;
  id_back_name: string;
  selfie_name: string;
  business_type: string;
  business_reg: string;
  business_logo_name: string;
  business_website: string;
  business_email: string;
  year_established: string;
};

const steps = [
  { n: 1, label: 'Store Info' },
  { n: 2, label: 'Location' },
  { n: 3, label: 'Contact Info' },
  { n: 4, label: 'Verification' },
];

const themeColors = ['#7C3AED', '#2563EB', '#059669', '#EA580C', '#DB2777', '#0EA5E9'];

const highlightList = [
  { key: 'original', label: 'Original Products', Icon: BadgeCheck },
  { key: 'secure', label: 'Secure Packaging', Icon: PackageCheck },
  { key: 'fast', label: 'Fast Delivery', Icon: Truck },
  { key: 'support', label: 'Customer Support', Icon: Headphones },
  { key: 'returns', label: 'Easy Returns', Icon: RotateCcw },
  { key: 'price', label: 'Best Price', Icon: Tag },
];

const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Grocery', 'Sports', 'Books', 'Other'];
const businessTypes = ['Individual', 'Proprietorship', 'Partnership', 'Private Limited', 'LLP', 'Other'];
const idTypes = ['Passport', 'Driving License', 'Aadhaar', 'PAN Card', 'National ID'];
const currencies = ['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'AED (د.إ)'];
const languages = ['English', 'Hindi', 'Urdu', 'Arabic', 'Spanish'];
const years = Array.from({ length: 75 }, (_, i) => `${new Date().getFullYear() - i}`);

const BecomeSellerPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [f, setF] = useState<FormState>({
    store_name: '',
    store_category: '',
    sub_category: '',
    brand_name: '',
    tagline: '',
    description: '',
    founded_year: '',
    theme_color: PURPLE,
    store_slug: '',
    language: 'English',
    currency: 'INR (₹)',
    warranty: true,
    fast_shipping: true,
    cod: true,
    highlights: { original: true, secure: true, fast: true, support: true, returns: true, price: true },
    logo_name: '',
    banner_name: '',

    country: 'India',
    state: '',
    city: '',
    address: '',
    pincode: '',

    full_name: '',
    role: 'Store Owner',
    email: user?.email || '',
    phone_number: '',
    whatsapp: '',
    support_email: '',
    support_phone: '',
    business_hours: 'Mon – Sat, 9:00 AM – 7:00 PM',
    preferred_comm: 'Email',
    b_country: 'India',
    b_state: '',
    b_city: '',
    b_zip: '',

    id_type: '',
    id_number: '',
    id_front_name: '',
    id_back_name: '',
    selfie_name: '',
    business_type: '',
    business_reg: '',
    business_logo_name: '',
    business_website: '',
    business_email: '',
    year_established: '',
  });

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  const slug = useMemo(() => {
    const base = (f.store_slug || f.store_name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return base || 'your-store';
  }, [f.store_slug, f.store_name]);

  // Validation per step
  const stepValid = (s: number) => {
    if (s === 1)
      return !!(f.store_name.trim() && f.store_category && f.sub_category.trim() && f.tagline.trim() && f.description.trim());
    if (s === 2) return !!(f.country && f.state.trim() && f.city.trim());
    if (s === 3) return !!(f.full_name.trim() && f.email.trim() && /^\d{7,15}$/.test(f.phone_number));
    if (s === 4) return !!(f.id_type && f.id_number.trim() && f.business_type);
    return true;
  };

  const next = () => {
    if (!stepValid(step)) {
      toast({ title: 'Missing fields', description: 'Please complete all required fields.', variant: 'destructive' });
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const back = () => {
    if (step === 1) return navigate(-1);
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    if (!stepValid(4)) {
      toast({ title: 'Missing fields', description: 'Please complete required verification fields.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { data: existing } = await supabase
        .from('sellers')
        .select('id, status')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existing) {
        toast({
          title: 'Application Exists',
          description:
            existing.status === 'pending' ? 'You already have a pending application.' : 'You already have a seller account.',
          variant: 'destructive',
        });
        navigate('/seller/review');
        return;
      }

      const { error } = await supabase.from('sellers').insert({
        user_id: user?.id,
        shop_name: f.store_name,
        owner_name: f.full_name || f.store_name,
        phone: f.phone_number,
        address: f.address || `${f.city}, ${f.state}`,
        city: f.city,
        state: f.state,
        pincode: f.pincode || f.b_zip,
        status: 'pending',
      });
      if (error) throw error;

      setSuccess(true);
      toast({ title: 'Application Submitted 🎉', description: 'Your seller application is pending admin approval.' });
      setTimeout(() => navigate('/seller/review'), 2200);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to submit', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center animate-scale-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
            <CheckCircle className="w-14 h-14" style={{ color: PURPLE }} />
          </div>
          <h1 className="text-3xl font-bold text-[#111] mb-2">Application Submitted!</h1>
          <p className="text-gray-500">Redirecting to your application status…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#111]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={back}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: PURPLE }}>
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Sellora</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200">
            <ShieldCheck className="w-4 h-4" style={{ color: PURPLE }} />
            <div className="text-[10px] leading-tight text-right">
              <div className="font-semibold">100% Secure</div>
              <div className="text-gray-500">Data is safe</div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto px-4 pb-4 pt-1">
          <div className="flex items-center">
            {steps.map((s, i) => {
              const done = step > s.n;
              const active = step === s.n;
              return (
                <React.Fragment key={s.n}>
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                      style={{
                        background: done ? PURPLE : active ? PURPLE : '#F3F4F6',
                        color: done || active ? '#fff' : '#9CA3AF',
                        boxShadow: active ? '0 0 0 4px rgba(124,58,237,0.15)' : 'none',
                      }}
                    >
                      {done ? <Check className="w-4 h-4" /> : s.n}
                    </div>
                    <span
                      className="text-[10px] font-medium whitespace-nowrap"
                      style={{ color: active ? PURPLE : done ? '#111' : '#9CA3AF' }}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 h-[2px] mx-1 -mt-4 rounded-full overflow-hidden bg-gray-200">
                      <div
                        className="h-full transition-all duration-500"
                        style={{ width: step > s.n ? '100%' : '0%', background: PURPLE }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <div key={step} className="animate-fade-in">
          {step === 1 && <Step1 f={f} update={update} slug={slug} />}
          {step === 2 && <Step2 f={f} update={update} />}
          {step === 3 && <Step3 f={f} update={update} />}
          {step === 4 && <Step4 f={f} update={update} />}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={back}
            disabled={step === 1}
            className="h-12 px-5 rounded-xl border border-gray-200 font-semibold text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {step < 4 ? (
            <button
              onClick={next}
              disabled={!stepValid(step)}
              className="flex-1 h-12 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-50"
              style={{ background: PURPLE, boxShadow: '0 8px 24px -8px rgba(124,58,237,0.6)' }}
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting || !stepValid(4)}
              className="flex-1 h-12 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-50"
              style={{ background: PURPLE, boxShadow: '0 8px 24px -8px rgba(124,58,237,0.6)' }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          )}
        </div>
        <p className="text-center text-[10px] text-gray-400 pb-2 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" /> Your information is encrypted and protected
        </p>
      </div>
    </div>
  );
};

// ---------- Shared UI ----------

const Field: React.FC<{ label: string; required?: boolean; hint?: string; children: React.ReactNode }> = ({
  label,
  required,
  hint,
  children,
}) => (
  <div>
    <label className="text-[13px] font-semibold text-[#111] mb-1.5 block">
      {label} {required && <span className="text-red-500">*</span>}
      {hint && <span className="ml-1 font-normal text-gray-400">({hint})</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  'w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-[15px] text-[#111] placeholder-gray-400 outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/15 transition';

const Card: React.FC<{ title?: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  title,
  icon,
  children,
  className,
}) => (
  <div
    className={`bg-white rounded-2xl border border-gray-100 p-5 mb-4 ${className || ''}`}
    style={{ boxShadow: '0 2px 12px -6px rgba(17,17,17,0.08)' }}
  >
    {title && (
      <div className="flex items-center gap-2.5 mb-4">
        {icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
            {icon}
          </div>
        )}
        <h3 className="text-[15px] font-bold text-[#111]">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

const Hero: React.FC<{ title: string; subtitle: string; illustration: React.ReactNode }> = ({ title, subtitle, illustration }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 flex items-center gap-4" style={{ boxShadow: '0 2px 12px -6px rgba(17,17,17,0.08)' }}>
    <div className="flex-1 min-w-0">
      <h2 className="text-xl font-bold text-[#111] leading-tight">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
    <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(124,58,237,0.08)' }}>
      {illustration}
    </div>
  </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; Icon: any }> = ({
  checked,
  onChange,
  label,
  Icon,
}) => (
  <div className="flex flex-col items-center gap-2 flex-1">
    <Icon className="w-5 h-5 text-gray-500" />
    <span className="text-[11px] font-medium text-center text-gray-700">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-10 h-6 rounded-full relative transition"
      style={{ background: checked ? PURPLE : '#E5E7EB' }}
      aria-pressed={checked}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
        style={{ left: checked ? '18px' : '2px' }}
      />
    </button>
  </div>
);

const UploadTile: React.FC<{
  label: string;
  name: string;
  onChange: (name: string) => void;
  hint?: string;
  small?: boolean;
}> = ({ label, name, onChange, hint, small }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className={`w-full ${small ? 'h-28' : 'h-32'} rounded-2xl border-2 border-dashed border-[#7C3AED]/40 bg-[#7C3AED]/5 flex flex-col items-center justify-center gap-1.5 hover:bg-[#7C3AED]/10 transition active:scale-[0.98]`}
    >
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0]?.name || '')}
      />
      {name ? (
        <>
          <CheckCircle className="w-6 h-6" style={{ color: PURPLE }} />
          <span className="text-xs font-medium text-[#111] truncate max-w-[85%]">{name}</span>
          <span className="text-[10px] text-gray-500">Tap to change</span>
        </>
      ) : (
        <>
          <UploadCloud className="w-6 h-6" style={{ color: PURPLE }} />
          <span className="text-xs font-semibold text-[#111]">{label}</span>
          {hint && <span className="text-[10px] text-gray-500">{hint}</span>}
        </>
      )}
    </button>
  );
};

// ---------- Step 1 ----------
const Step1: React.FC<{ f: FormState; update: any; slug: string }> = ({ f, update, slug }) => (
  <>
    <Hero
      title="Store Info"
      subtitle="Create your store identity and build trust with buyers."
      illustration={<Store className="w-10 h-10" style={{ color: PURPLE }} />}
    />

    <Card title="Store Identity" icon={<Store className="w-5 h-5" style={{ color: PURPLE }} />}>
      <div className="space-y-4">
        <Field label="Store Name" required>
          <input
            className={inputCls}
            placeholder="e.g. Naved Electronics"
            value={f.store_name}
            onChange={(e) => update('store_name', e.target.value.slice(0, 50))}
          />
          <div className="text-[11px] text-gray-400 text-right mt-1">{f.store_name.length} / 50</div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Store Logo" required>
            <UploadTile label="Upload Logo" hint="JPG, PNG · 2MB" name={f.logo_name} onChange={(n) => update('logo_name', n)} small />
          </Field>
          <Field label="Store Banner" hint="Optional">
            <UploadTile label="Upload Banner" hint="JPG, PNG · 5MB" name={f.banner_name} onChange={(n) => update('banner_name', n)} small />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Field label="Store Category" required>
            <select className={inputCls} value={f.store_category} onChange={(e) => update('store_category', e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sub Category" required>
            <input
              className={inputCls}
              placeholder="e.g. Mobile & Accessories"
              value={f.sub_category}
              onChange={(e) => update('sub_category', e.target.value)}
            />
          </Field>
          <Field label="Brand Name" hint="Optional">
            <input className={inputCls} placeholder="Brand name" value={f.brand_name} onChange={(e) => update('brand_name', e.target.value)} />
          </Field>
        </div>
      </div>
    </Card>

    <Card title="About Store" icon={<FileCheck className="w-5 h-5" style={{ color: PURPLE }} />}>
      <div className="space-y-4">
        <Field label="Short Tagline" required>
          <input
            className={inputCls}
            placeholder="Best Electronics at Lowest Prices"
            value={f.tagline}
            onChange={(e) => update('tagline', e.target.value.slice(0, 60))}
          />
          <div className="text-[11px] text-gray-400 text-right mt-1">{f.tagline.length} / 60</div>
        </Field>
        <Field label="Store Description" required>
          <textarea
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[15px] text-[#111] placeholder-gray-400 outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/15 transition resize-none"
            placeholder="Tell buyers what makes your business special..."
            value={f.description}
            onChange={(e) => update('description', e.target.value.slice(0, 300))}
          />
          <div className="text-[11px] text-gray-400 text-right mt-1">{f.description.length} / 300</div>
        </Field>
        <Field label="Founded Year" hint="Optional">
          <select className={inputCls} value={f.founded_year} onChange={(e) => update('founded_year', e.target.value)}>
            <option value="">Select year</option>
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </Field>
      </div>
    </Card>

    <Card title="Store Appearance" icon={<Tag className="w-5 h-5" style={{ color: PURPLE }} />}>
      <label className="text-[13px] font-semibold text-[#111] mb-2 block">Theme Color</label>
      <div className="flex gap-2.5 mb-4">
        {themeColors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => update('theme_color', c)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition"
            style={{
              background: c,
              boxShadow: f.theme_color === c ? `0 0 0 3px #fff, 0 0 0 5px ${c}` : 'none',
            }}
          >
            {f.theme_color === c && <Check className="w-4 h-4 text-white" />}
          </button>
        ))}
      </div>
    </Card>

    <Card title="Store Visibility" icon={<Globe className="w-5 h-5" style={{ color: PURPLE }} />}>
      <div className="space-y-4">
        <Field label="Public Store URL">
          <div className="flex items-center gap-2 px-4 h-12 rounded-xl border border-gray-200 bg-gray-50">
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-[13px] text-gray-600 truncate flex-1">sellora.com/store/{slug}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(`sellora.com/store/${slug}`);
                toast({ title: 'Copied' });
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </Field>
        <Field label="Custom Store Slug" hint="Optional">
          <input
            className={inputCls}
            placeholder="my-store-name"
            value={f.store_slug}
            onChange={(e) => update('store_slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Language">
            <select className={inputCls} value={f.language} onChange={(e) => update('language', e.target.value)}>
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Currency">
            <select className={inputCls} value={f.currency} onChange={(e) => update('currency', e.target.value)}>
              {currencies.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>
    </Card>

    <Card title="Buyer Trust & Policies" icon={<ShieldCheck className="w-5 h-5" style={{ color: PURPLE }} />}>
      <div className="flex items-start justify-around gap-3">
        <Toggle checked={f.warranty} onChange={(v) => update('warranty', v)} label="Warranty" Icon={BadgeCheck} />
        <Toggle checked={f.fast_shipping} onChange={(v) => update('fast_shipping', v)} label="Fast Shipping" Icon={Truck} />
        <Toggle checked={f.cod} onChange={(v) => update('cod', v)} label="Cash on Delivery" Icon={Wallet} />
      </div>
    </Card>

    <Card title="Store Highlights" icon={<Star className="w-5 h-5" style={{ color: PURPLE }} />}>
      <div className="grid grid-cols-3 gap-2.5">
        {highlightList.map(({ key, label, Icon }) => {
          const on = !!f.highlights[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => update('highlights', { ...f.highlights, [key]: !on })}
              className="rounded-xl border p-2.5 flex flex-col items-center gap-1.5 transition"
              style={{
                borderColor: on ? PURPLE : '#E5E7EB',
                background: on ? 'rgba(124,58,237,0.08)' : '#fff',
              }}
            >
              <Icon className="w-4 h-4" style={{ color: on ? PURPLE : '#6B7280' }} />
              <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: on ? PURPLE : '#111' }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </Card>

    <Card title="Live Preview" icon={<Star className="w-5 h-5" style={{ color: PURPLE }} />}>
      <div className="rounded-xl border border-gray-100 p-4" style={{ background: 'linear-gradient(180deg,#fafafa,#fff)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
            style={{ background: f.theme_color }}
          >
            {(f.store_name || 'S').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="font-bold text-[#111] truncate">{f.store_name || 'Your Store Name'}</p>
              <BadgeCheck className="w-4 h-4" style={{ color: PURPLE }} />
            </div>
            <p className="text-xs text-gray-500 truncate">{f.tagline || 'Your tagline here'}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1"><Truck className="w-3 h-3" /> Fast Shipping</span>
          <span className="inline-flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Easy Returns</span>
          <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure</span>
        </div>
      </div>
    </Card>
  </>
);

// ---------- Step 2 ----------
const Step2: React.FC<{ f: FormState; update: any }> = ({ f, update }) => (
  <>
    <Hero
      title="Business Location"
      subtitle="Tell us where your business is based. This helps us serve you better."
      illustration={<MapPin className="w-10 h-10" style={{ color: PURPLE }} />}
    />

    <div
      className="rounded-2xl p-4 mb-4 flex items-start gap-3"
      style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(124,58,237,0.15)' }}>
        <Globe className="w-5 h-5" style={{ color: PURPLE }} />
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: PURPLE }}>Why we need your location?</p>
        <p className="text-xs text-gray-600 mt-0.5">
          It helps us show relevant features, set accurate shipping options and connect you with nearby buyers.
        </p>
      </div>
    </div>

    <Card title="Select Your Business Location" icon={<Globe className="w-5 h-5" style={{ color: PURPLE }} />}>
      <div className="space-y-4">
        <Field label="Country" required>
          <select className={inputCls} value={f.country} onChange={(e) => update('country', e.target.value)}>
            {['India', 'United States', 'United Kingdom', 'UAE', 'Canada', 'Australia'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="State / Province" required>
          <input className={inputCls} placeholder="e.g. Uttar Pradesh" value={f.state} onChange={(e) => update('state', e.target.value)} />
        </Field>
        <Field label="City / District" required>
          <input className={inputCls} placeholder="e.g. Lucknow" value={f.city} onChange={(e) => update('city', e.target.value)} />
        </Field>

        {f.city && f.state && (
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <MapPin className="w-5 h-5" style={{ color: PURPLE }} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold" style={{ color: PURPLE }}>Your Location Preview</p>
              <p className="text-sm font-medium text-[#111] truncate">
                {f.city}, {f.state}, {f.country}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>

    <Card title="Pinpoint on Map" icon={<MapPin className="w-5 h-5" style={{ color: PURPLE }} />}>
      <p className="text-xs text-gray-500 mb-3">Adjust the pin to mark the exact location of your business.</p>
      <div
        className="relative rounded-xl overflow-hidden h-44 mb-3 flex items-center justify-center"
        style={{
          background:
            'repeating-linear-gradient(45deg,#f3f4f6 0,#f3f4f6 12px,#ffffff 12px,#ffffff 24px)',
          border: '1px solid #E5E7EB',
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.35), transparent 60%)' }}
        />
        <div className="relative flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center animate-pulse" style={{ background: PURPLE }}>
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div className="w-2 h-2 rounded-full bg-black/30 mt-1" />
        </div>
      </div>
      <Field label="Address">
        <input
          className={inputCls}
          placeholder="Street, area, landmark"
          value={f.address}
          onChange={(e) => update('address', e.target.value)}
        />
      </Field>
      <div className="mt-3">
        <Field label="ZIP / Pincode">
          <input
            className={inputCls}
            placeholder="6-digit"
            value={f.pincode}
            onChange={(e) => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
        </Field>
      </div>
    </Card>

    <div
      className="rounded-2xl p-4 flex items-start gap-3"
      style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
    >
      <ShieldCheck className="w-5 h-5 mt-0.5" style={{ color: '#059669' }} />
      <div>
        <p className="text-sm font-semibold" style={{ color: '#059669' }}>We never share your location publicly.</p>
        <p className="text-xs text-gray-600 mt-0.5">Your information is encrypted and secure.</p>
      </div>
    </div>
  </>
);

// ---------- Step 3 ----------
const Step3: React.FC<{ f: FormState; update: any }> = ({ f, update }) => (
  <>
    <Hero
      title="Contact Information"
      subtitle="Add your contact details so buyers and our team can reach you easily."
      illustration={<Mail className="w-10 h-10" style={{ color: PURPLE }} />}
    />

    <Card title="Primary Contact" icon={<User className="w-5 h-5" style={{ color: PURPLE }} />}>
      <p className="text-xs text-gray-500 -mt-3 mb-4">Person we can reach regarding your store.</p>
      <div className="space-y-4">
        <Field label="Full Name" required>
          <input className={inputCls} placeholder="Your full name" value={f.full_name} onChange={(e) => update('full_name', e.target.value)} />
        </Field>
        <Field label="Designation / Role">
          <select className={inputCls} value={f.role} onChange={(e) => update('role', e.target.value)}>
            {['Store Owner', 'Co-Founder', 'Manager', 'Employee', 'Other'].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="Email Address" required>
          <input
            type="email"
            className={inputCls}
            placeholder="you@example.com"
            value={f.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>
        <Field label="Phone Number" required>
          <input
            className={inputCls}
            placeholder="10-digit"
            value={f.phone_number}
            onChange={(e) => update('phone_number', e.target.value.replace(/\D/g, '').slice(0, 15))}
          />
        </Field>
        <Field label="WhatsApp Number" hint="Optional">
          <input
            className={inputCls}
            placeholder="WhatsApp"
            value={f.whatsapp}
            onChange={(e) => update('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 15))}
          />
        </Field>
      </div>
    </Card>

    <Card title="Business Contact" icon={<Building2 className="w-5 h-5" style={{ color: PURPLE }} />}>
      <p className="text-xs text-gray-500 -mt-3 mb-4">Visible to buyers.</p>
      <div className="space-y-4">
        <Field label="Store Support Email">
          <input className={inputCls} placeholder="support@yourstore.com" value={f.support_email} onChange={(e) => update('support_email', e.target.value)} />
        </Field>
        <Field label="Support Phone Number">
          <input
            className={inputCls}
            placeholder="Support phone"
            value={f.support_phone}
            onChange={(e) => update('support_phone', e.target.value.replace(/\D/g, '').slice(0, 15))}
          />
        </Field>
        <Field label="Business Hours">
          <input className={inputCls} value={f.business_hours} onChange={(e) => update('business_hours', e.target.value)} />
        </Field>
        <Field label="Preferred Communication">
          <select className={inputCls} value={f.preferred_comm} onChange={(e) => update('preferred_comm', e.target.value)}>
            {['Email', 'Phone', 'WhatsApp', 'SMS'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>
    </Card>

    <Card title="Business Address" icon={<MapPin className="w-5 h-5" style={{ color: PURPLE }} />}>
      <div className="space-y-4">
        <Field label="Country">
          <select className={inputCls} value={f.b_country} onChange={(e) => update('b_country', e.target.value)}>
            {['India', 'United States', 'United Kingdom', 'UAE', 'Canada', 'Australia'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="State / Province">
          <input className={inputCls} placeholder="State" value={f.b_state} onChange={(e) => update('b_state', e.target.value)} />
        </Field>
        <Field label="City">
          <input className={inputCls} placeholder="City" value={f.b_city} onChange={(e) => update('b_city', e.target.value)} />
        </Field>
        <Field label="ZIP / Postal Code">
          <input
            className={inputCls}
            placeholder="ZIP"
            value={f.b_zip}
            onChange={(e) => update('b_zip', e.target.value.replace(/\D/g, '').slice(0, 8))}
          />
        </Field>
      </div>
    </Card>

    <div
      className="rounded-2xl p-4 flex items-start gap-3"
      style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
    >
      <ShieldCheck className="w-5 h-5 mt-0.5" style={{ color: '#059669' }} />
      <div>
        <p className="text-sm font-semibold" style={{ color: '#059669' }}>Your information is safe with us</p>
        <p className="text-xs text-gray-600 mt-0.5">We never share your contact details with anyone.</p>
      </div>
    </div>
  </>
);

// ---------- Step 4 ----------
const Step4: React.FC<{ f: FormState; update: any }> = ({ f, update }) => (
  <>
    <Hero
      title="Identity & Business Verification"
      subtitle="Verify your identity to start selling securely."
      illustration={<ShieldCheck className="w-10 h-10" style={{ color: PURPLE }} />}
    />

    <Card title="Identity Information" icon={<User className="w-5 h-5" style={{ color: PURPLE }} />}>
      <p className="text-xs text-gray-500 -mt-3 mb-4">Personal identity verification.</p>
      <div className="space-y-4">
        <Field label="Government ID Type" required>
          <select className={inputCls} value={f.id_type} onChange={(e) => update('id_type', e.target.value)}>
            <option value="">Select ID type</option>
            {idTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="ID Number" required>
          <input className={inputCls} placeholder="ID number" value={f.id_number} onChange={(e) => update('id_number', e.target.value)} />
        </Field>
        <div>
          <label className="text-[13px] font-semibold text-[#111] mb-2 block">Upload Government ID</label>
          <div className="grid grid-cols-2 gap-3">
            <UploadTile label="Front Side" name={f.id_front_name} onChange={(n) => update('id_front_name', n)} small />
            <UploadTile label="Back Side" name={f.id_back_name} onChange={(n) => update('id_back_name', n)} small />
          </div>
        </div>
        <div>
          <label className="text-[13px] font-semibold text-[#111] mb-2 block">Selfie Verification</label>
          <UploadTile label="Take a clear selfie holding your ID" hint="Face and ID clearly visible" name={f.selfie_name} onChange={(n) => update('selfie_name', n)} />
        </div>
      </div>
    </Card>

    <Card title="Business Information" icon={<Building2 className="w-5 h-5" style={{ color: PURPLE }} />}>
      <div className="space-y-4">
        <Field label="Business Type" required>
          <select className={inputCls} value={f.business_type} onChange={(e) => update('business_type', e.target.value)}>
            <option value="">Select type</option>
            {businessTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Business Registration Number" hint="Optional">
          <input className={inputCls} placeholder="Registration number" value={f.business_reg} onChange={(e) => update('business_reg', e.target.value)} />
        </Field>
        <Field label="Business Logo" hint="Optional">
          <UploadTile label="Tap to Upload" hint="JPG, PNG · 2MB" name={f.business_logo_name} onChange={(n) => update('business_logo_name', n)} small />
        </Field>
      </div>
    </Card>

    <Card title="Additional Information" icon={<Globe className="w-5 h-5" style={{ color: PURPLE }} />}>
      <div className="space-y-4">
        <Field label="Business Website" hint="Optional">
          <input className={inputCls} placeholder="www.yourbusiness.com" value={f.business_website} onChange={(e) => update('business_website', e.target.value)} />
        </Field>
        <Field label="Business Email">
          <input className={inputCls} placeholder="info@yourbusiness.com" value={f.business_email} onChange={(e) => update('business_email', e.target.value)} />
        </Field>
        <Field label="Year of Establishment">
          <select className={inputCls} value={f.year_established} onChange={(e) => update('year_established', e.target.value)}>
            <option value="">Select year</option>
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </Field>
      </div>
    </Card>

    <div className="grid grid-cols-3 gap-2.5">
      {[
        { Icon: Lock, title: 'Documents Encrypted' },
        { Icon: Clock, title: 'Review in 24–48 hrs' },
        { Icon: ShieldCheck, title: 'Used only for verification' },
      ].map(({ Icon, title }) => (
        <div
          key={title}
          className="rounded-xl p-3 flex flex-col items-center gap-1.5 text-center"
          style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}
        >
          <Icon className="w-4 h-4" style={{ color: PURPLE }} />
          <span className="text-[10px] font-semibold text-[#111] leading-tight">{title}</span>
        </div>
      ))}
    </div>
  </>
);

export default BecomeSellerPage;