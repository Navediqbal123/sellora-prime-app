import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle,
  Check,
  Users,
  LayoutGrid,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  Moon,
  Sun,
  UploadCloud,
  ShoppingBag,
  Lock,
  Zap,
  Headphones,
  Store,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FormData {
  shop_name: string;
  owner_name: string;
  business_type: string;
  legal_business_name: string;
  gst_tax_id: string;
  year_established: string;
  business_description: string;
  phone_number: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

const BecomeSellerPage = () => {
  const { user, refreshRole } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [darkMode, setDarkMode] = useState(true);
  const [docFile, setDocFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    shop_name: '',
    owner_name: '',
    business_type: '',
    legal_business_name: '',
    gst_tax_id: '',
    year_established: '',
    business_description: '',
    phone_number: '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: ''
  });

  const businessTypes = [
    'Individual',
    'Partnership',
    'Private Limited',
    'Proprietorship',
    'LLP',
    'Other'
  ];

  const steps = [
    { number: 1, title: 'Business Info' },
    { number: 2, title: 'Location' },
    { number: 3, title: 'Contact Info' },
  ];

  const years = Array.from({ length: 75 }, (_, i) => `${new Date().getFullYear() - i}`);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.shop_name.trim() || !formData.business_type) {
        toast({
          title: "Required Fields",
          description: "Please fill in all business details",
          variant: "destructive"
        });
        return false;
      }
    } else if (step === 2) {
      if (!formData.city.trim() || !formData.state.trim() || !formData.country.trim() || !formData.pincode.trim()) {
        toast({
          title: "Required Fields",
          description: "Please fill in all location details",
          variant: "destructive"
        });
        return false;
      }
      if (!/^\d{6}$/.test(formData.pincode)) {
        toast({
          title: "Invalid Pincode",
          description: "Please enter a valid 6-digit pincode",
          variant: "destructive"
        });
        return false;
      }
    } else if (step === 3) {
      if (!formData.phone_number.trim() || !formData.email.trim() || !formData.address.trim()) {
        toast({
          title: "Required Fields",
          description: "Please fill in all contact details",
          variant: "destructive"
        });
        return false;
      }
      if (!/^\d{10}$/.test(formData.phone_number)) {
        toast({
          title: "Invalid Phone",
          description: "Please enter a valid 10-digit phone number",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setSlideDirection('left');
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setSlideDirection('right');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);

    try {
      const { data: existingSeller } = await supabase
        .from('sellers')
        .select('id, status')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existingSeller) {
        toast({
          title: "Application Exists",
          description:
            existingSeller.status === 'pending'
              ? "You already have a pending application"
              : "You already have a seller account",
          variant: "destructive",
        });
        navigate('/seller/review');
        return;
      }

      const { error } = await supabase.from('sellers').insert({
        user_id: user?.id,
        shop_name: formData.shop_name,
        owner_name: formData.owner_name || formData.legal_business_name || formData.shop_name,
        phone: formData.phone_number,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        status: 'pending',
      });

      if (error) throw error;

      setIsSuccess(true);

      toast({
        title: "Application Submitted! 🎉",
        description: "Your seller application is now pending admin approval."
      });

      setTimeout(() => {
        navigate('/seller/review');
      }, 2500);

    } catch (error: any) {
      console.error('Error becoming seller:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0613' }}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] animate-pulse" style={{ background: 'rgba(124,58,237,0.18)' }} />
        </div>

        <div className="text-center animate-scale-in relative z-10">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-8 relative" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(124,58,237,0.1))' }}>
            <CheckCircle className="w-14 h-14" style={{ color: '#a78bfa' }} />
            <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(124,58,237,0.25)' }} />
          </div>
          <h1 className="text-4xl font-bold mb-3 text-white">Application Submitted!</h1>
          <p className="text-xl text-white/70 mb-2">Your seller application is pending review</p>
          <p className="text-white/40">Redirecting to your application status...</p>

          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#7C3AED', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- THEME TOKENS ----------
  const isDark = darkMode;
  const bg = isDark ? '#0a0613' : '#f5f3ff';
  const panel = isDark ? '#100823' : '#ffffff';
  const card = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.15)';
  const textPri = isDark ? '#ffffff' : '#0a0613';
  const textMut = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(10,6,19,0.55)';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#fafaff';
  const PURPLE = '#7C3AED';
  const PURPLE_GLOW = '0 0 0 4px rgba(124,58,237,0.18), 0 8px 28px -8px rgba(124,58,237,0.55)';

  const inputClass =
    'w-full h-[52px] px-4 rounded-[14px] outline-none transition-all duration-200 text-[15px]';
  const inputStyle: React.CSSProperties = {
    background: inputBg,
    border: `1px solid ${border}`,
    color: textPri,
  };
  const focusOn = (e: React.FocusEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = PURPLE;
    (e.currentTarget as HTMLElement).style.boxShadow = PURPLE_GLOW;
  };
  const focusOff = (e: React.FocusEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = border;
    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
  };

  const features = [
    { icon: Users, label: 'Reach Millions', sub: 'Tap into our buyer network' },
    { icon: LayoutGrid, label: 'Easy Management', sub: 'Powerful seller dashboard' },
    { icon: ShieldCheck, label: 'Secure & Trusted', sub: 'Bank-grade protection' },
    { icon: TrendingUp, label: 'Higher Earnings', sub: 'Lowest commission rates' },
  ];

  const animationClass = slideDirection === 'left' ? 'animate-step-slide-left' : 'animate-step-slide-right';

  // ---------- STEP CONTENT ----------
  const Step1 = (
    <div key="step1" className={`space-y-5 ${animationClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: textPri }}>Business Information</h2>
          <p className="text-sm mt-1" style={{ color: textMut }}>Please provide your business details</p>
        </div>
        <span
          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(124,58,237,0.15)', color: '#c4b5fd', border: `1px solid ${PURPLE}40` }}
        >
          Step 1 of 3
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textMut }}>Business Name *</label>
          <input name="shop_name" value={formData.shop_name} onChange={handleInputChange} onFocus={focusOn} onBlur={focusOff}
            placeholder="e.g. Naved Electronics" className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textMut }}>Business Type *</label>
          <select name="business_type" value={formData.business_type} onChange={handleInputChange} onFocus={focusOn} onBlur={focusOff}
            className={`${inputClass} appearance-none cursor-pointer`} style={inputStyle}>
            <option value="">Select type</option>
            {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textMut }}>Legal Business Name</label>
          <input name="legal_business_name" value={formData.legal_business_name} onChange={handleInputChange} onFocus={focusOn} onBlur={focusOff}
            placeholder="As per registration" className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textMut }}>
            GST / Tax ID <span style={{ color: textMut }}>(optional)</span>
          </label>
          <input name="gst_tax_id" value={formData.gst_tax_id} onChange={handleInputChange} onFocus={focusOn} onBlur={focusOff}
            placeholder="22AAAAA0000A1Z5" className={inputClass} style={inputStyle} />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-medium mb-2 block" style={{ color: textMut }}>Year of Establishment</label>
          <select name="year_established" value={formData.year_established} onChange={handleInputChange} onFocus={focusOn} onBlur={focusOff}
            className={`${inputClass} appearance-none cursor-pointer`} style={inputStyle}>
            <option value="">Select year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium mb-2 flex justify-between" style={{ color: textMut }}>
          <span>Business Description</span>
          <span>{formData.business_description.length}/300</span>
        </label>
        <textarea name="business_description" value={formData.business_description}
          onChange={(e) => setFormData(p => ({ ...p, business_description: e.target.value.slice(0, 300) }))}
          onFocus={focusOn} onBlur={focusOff}
          placeholder="Tell buyers what makes your business special..."
          rows={4}
          className="w-full px-4 py-3 rounded-[14px] outline-none transition-all duration-200 text-[15px] resize-none"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="text-xs font-medium mb-2 block" style={{ color: textMut }}>Upload Business Document</label>
        <input ref={fileInputRef} type="file" className="hidden"
          onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
        <button type="button" onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-[14px] py-8 px-4 flex flex-col items-center gap-2 transition-all duration-200 hover:bg-[rgba(124,58,237,0.06)]"
          style={{ border: `1.5px dashed ${PURPLE}55`, background: 'rgba(124,58,237,0.04)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.18)' }}>
            <UploadCloud className="w-6 h-6" style={{ color: '#c4b5fd' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: textPri }}>
            {docFile ? docFile.name : 'Click or drag file to upload'}
          </p>
          <p className="text-xs" style={{ color: textMut }}>PDF, JPG, PNG • Max 5MB</p>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4">
        {[
          { icon: Lock, label: '100% Secure' },
          { icon: Zap, label: 'Quick Approval' },
          { icon: Headphones, label: '24/7 Support' },
        ].map(b => (
          <div key={b.label} className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl"
            style={{ background: 'rgba(124,58,237,0.06)', border: `1px solid ${border}` }}>
            <b.icon className="w-4 h-4" style={{ color: '#c4b5fd' }} />
            <span className="text-[11px] font-medium text-center" style={{ color: textPri }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const Step2 = (
    <div key="step2" className={`space-y-5 ${animationClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: textPri }}>Location</h2>
          <p className="text-sm mt-1" style={{ color: textMut }}>Where is your business based?</p>
        </div>
        <span className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(124,58,237,0.15)', color: '#c4b5fd', border: `1px solid ${PURPLE}40` }}>
          Step 2 of 3
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textMut }}>City *</label>
          <input name="city" value={formData.city} onChange={handleInputChange} onFocus={focusOn} onBlur={focusOff}
            placeholder="City" className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textMut }}>State *</label>
          <input name="state" value={formData.state} onChange={handleInputChange} onFocus={focusOn} onBlur={focusOff}
            placeholder="State" className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textMut }}>Country *</label>
          <input name="country" value={formData.country} onChange={handleInputChange} onFocus={focusOn} onBlur={focusOff}
            placeholder="Country" className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: textMut }}>Pincode *</label>
          <input name="pincode" value={formData.pincode} onChange={handleInputChange} onFocus={focusOn} onBlur={focusOff}
            placeholder="6-digit" className={inputClass} style={inputStyle} />
        </div>
      </div>
    </div>
  );

  const Step3 = (
    <div key="step3" className={`space-y-5 ${animationClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: textPri }}>Contact Info</h2>
          <p className="text-sm mt-1" style={{ color: textMut }}>How can buyers reach you?</p>
        </div>
        <span className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(124,58,237,0.15)', color: '#c4b5fd', border: `1px solid ${PURPLE}40` }}>
          Step 3 of 3
        </span>
      </div>

      <div>
        <label className="text-xs font-medium mb-2 block" style={{ color: textMut }}>Phone Number *</label>
        <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} onFocus={focusOn} onBlur={focusOff}
          placeholder="10-digit phone" className={inputClass} style={inputStyle} />
      </div>
      <div>
        <label className="text-xs font-medium mb-2 block" style={{ color: textMut }}>Email *</label>
        <input type="email" name="email" value={formData.email} onChange={handleInputChange} onFocus={focusOn} onBlur={focusOff}
          readOnly={!!user?.email}
          placeholder="you@email.com" className={inputClass} style={{ ...inputStyle, opacity: user?.email ? 0.7 : 1 }} />
      </div>
      <div>
        <label className="text-xs font-medium mb-2 block" style={{ color: textMut }}>Address *</label>
        <textarea name="address" value={formData.address} onChange={handleInputChange} onFocus={focusOn} onBlur={focusOff}
          rows={3} placeholder="Street, building, area..."
          className="w-full px-4 py-3 rounded-[14px] outline-none transition-all duration-200 text-[15px] resize-none"
          style={inputStyle} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full" style={{ background: bg, color: textPri }}>
      <div className="lg:grid lg:grid-cols-[420px_1fr] min-h-screen">
        {/* ============ LEFT SIDEBAR ============ */}
        <aside
          className="relative overflow-hidden p-8 lg:p-10 flex flex-col"
          style={{
            background: 'linear-gradient(180deg, #1a0b3d 0%, #0a0613 100%)',
            borderRight: `1px solid ${border}`,
          }}
        >
          {/* glow */}
          <div className="pointer-events-none absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{ background: 'rgba(124,58,237,0.35)' }} />
          <div className="pointer-events-none absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{ background: 'rgba(124,58,237,0.2)' }} />

          {/* Logo */}
          <button onClick={() => navigate('/')} className="relative z-10 flex items-center gap-2 mb-10 w-fit">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${PURPLE}, #a855f7)`, boxShadow: '0 8px 24px -8px rgba(124,58,237,0.7)' }}>
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Sellora</span>
          </button>

          <div className="relative z-10">
            <h1 className="text-3xl lg:text-[34px] font-bold leading-tight text-white">
              Join Sellora,<br />
              Grow your business{' '}
              <span className="italic font-bold" style={{
                background: 'linear-gradient(90deg,#a78bfa,#7C3AED)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>limitlessly</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              List your products, manage orders and reach millions of buyers — all from one premium seller console.
            </p>
          </div>

          {/* 3D bag illustration */}
          <div className="relative z-10 flex justify-center my-8">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: 'rgba(124,58,237,0.5)' }} />
              <div className="relative w-36 h-36 rounded-[32px] flex items-center justify-center transform rotate-[-6deg]"
                style={{
                  background: 'linear-gradient(145deg, #a855f7 0%, #7C3AED 50%, #5b21b6 100%)',
                  boxShadow: '0 30px 60px -20px rgba(124,58,237,0.6), inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -8px 20px rgba(0,0,0,0.3)',
                }}>
                <ShoppingBag className="w-16 h-16 text-white drop-shadow-lg" strokeWidth={1.75} />
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 rounded-t-full border-2"
                  style={{ borderColor: '#c4b5fd', borderBottom: 'none' }} />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="relative z-10 space-y-3">
            {features.map(f => (
              <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(124,58,237,0.2)' }}>
                  <f.icon className="w-4.5 h-4.5" style={{ color: '#c4b5fd' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{f.label}</p>
                  <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Support card */}
          <div className="relative z-10 mt-6 p-4 rounded-2xl flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(124,58,237,0.05))',
              border: `1px solid ${PURPLE}33`,
            }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: PURPLE }}>
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Need help?</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Contact our seller support</p>
            </div>
            <ArrowRight className="w-4 h-4" style={{ color: '#c4b5fd' }} />
          </div>
        </aside>

        {/* ============ RIGHT FORM PANEL ============ */}
        <main className="relative px-5 py-6 lg:px-12 lg:py-10" style={{ background: panel }}>
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: textMut }}>
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button onClick={() => setDarkMode(d => !d)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{ background: inputBg, border: `1px solid ${border}`, color: textPri }}
              aria-label="Toggle theme">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: textPri }}>Seller Registration</h1>
              <p className="mt-2 text-sm" style={{ color: textMut }}>
                Complete the steps below to create your seller account <span className="inline-block">✨</span>
              </p>
            </div>

            {/* Stepper */}
            <div className="mb-8">
              <div className="flex items-center justify-between relative px-2">
                {/* connecting line */}
                <div className="absolute top-5 left-[14%] right-[14%] h-[2px]" style={{ background: border }} />
                <div className="absolute top-5 left-[14%] h-[2px] transition-all duration-500"
                  style={{
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '36%' : '72%',
                    background: `linear-gradient(90deg, ${PURPLE}, #a855f7)`,
                  }} />

                {steps.map((s) => {
                  const done = currentStep > s.number;
                  const active = currentStep === s.number;
                  return (
                    <div key={s.number} className="relative z-10 flex flex-col items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300"
                        style={
                          active
                            ? { background: PURPLE, color: '#fff', boxShadow: PURPLE_GLOW }
                            : done
                              ? { background: PURPLE, color: '#fff' }
                              : { background: inputBg, color: textMut, border: `1px solid ${border}` }
                        }
                      >
                        {done ? <Check className="w-4 h-4" /> : s.number}
                      </div>
                      <span className="text-[11px] font-medium" style={{ color: active ? textPri : textMut }}>
                        {s.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step card */}
              <div
                className="rounded-2xl p-6 lg:p-8 overflow-hidden"
                style={{
                  background: card,
                  border: `1px solid ${border}`,
                  boxShadow: isDark ? '0 20px 60px -20px rgba(0,0,0,0.6)' : '0 20px 60px -30px rgba(124,58,237,0.25)',
                }}
              >
                {currentStep === 1 && Step1}
                {currentStep === 2 && Step2}
                {currentStep === 3 && Step3}
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-5 h-12 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: inputBg, border: `1px solid ${border}`, color: textPri }}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex items-center gap-2">
                  {steps.map(s => (
                    <div key={s.number} className="rounded-full transition-all duration-300"
                      style={{
                        width: currentStep === s.number ? 24 : 8,
                        height: 8,
                        background: currentStep >= s.number ? PURPLE : border,
                      }} />
                  ))}
                </div>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 h-12 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all hover:scale-[1.02]"
                    style={{
                      background: `linear-gradient(135deg, ${PURPLE}, #a855f7)`,
                      boxShadow: '0 10px 30px -10px rgba(124,58,237,0.7)',
                    }}
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 h-12 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-70"
                    style={{
                      background: `linear-gradient(135deg, ${PURPLE}, #a855f7)`,
                      boxShadow: '0 10px 30px -10px rgba(124,58,237,0.7)',
                    }}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit <CheckCircle className="w-4 h-4" /></>}
                  </button>
                )}
              </div>

              {/* Footer */}
              <p className="mt-8 text-center text-xs" style={{ color: textMut }}>
                By continuing, you agree to Sellora's{' '}
                <a className="underline underline-offset-2" style={{ color: '#c4b5fd' }} href="#">Terms of Service</a>{' '}
                and{' '}
                <a className="underline underline-offset-2" style={{ color: '#c4b5fd' }} href="#">Privacy Policy</a>.
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BecomeSellerPage;