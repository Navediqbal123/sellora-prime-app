import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ArrowRight,
  Loader2, 
  Store, 
  CheckCircle, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Map, 
  Hash,
  Briefcase,
  Sparkles,
  Globe,
  Instagram,
  MessageCircle,
  Calendar,
  Check
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BecomeSellerPage = () => {
  const { user, refreshRole } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    shop_name: '',
    owner_name: '',
    phone_number: '',
    alternate_phone: '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    business_type: '',
    years_in_business: '',
    whatsapp_number: '',
    instagram_url: '',
    website_url: ''
  });

  const businessTypes = [
    'Individual',
    'Partnership',
    'Private Limited',
    'Proprietorship',
    'LLP',
    'Other'
  ];

  const yearsOptions = [
    'Less than 1 year',
    '1-3 years',
    '3-5 years',
    '5-10 years',
    'More than 10 years'
  ];

  const steps = [
    { number: 1, title: 'Business Details', icon: Building2 },
    { number: 2, title: 'Owner Details', icon: User },
    { number: 3, title: 'Address', icon: MapPin },
    { number: 4, title: 'Online Presence', icon: Globe },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.shop_name.trim() || !formData.business_type) {
        toast({
          title: "Required Fields",
          description: "Please fill in shop name and business type",
          variant: "destructive"
        });
        return false;
      }
    } else if (step === 2) {
      if (!formData.owner_name.trim() || !formData.phone_number.trim()) {
        toast({
          title: "Required Fields",
          description: "Please fill in owner name and phone number",
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
    } else if (step === 3) {
      if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
        toast({
          title: "Required Fields",
          description: "Please fill in all address details",
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
    }
    // Step 4 is optional
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('sellers')
        .insert({
          user_id: user?.id,
          shop_name: formData.shop_name,
          owner_name: formData.owner_name,
          phone_number: formData.phone_number,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          business_type: formData.business_type
        });

      if (error) throw error;

      // Persist role separately
      if (user?.id) {
        await supabase
          .from('user_roles')
          .upsert({ user_id: user.id, role: 'shopkeeper' }, { onConflict: 'user_id' });
      }

      setIsSuccess(true);
      
      toast({
        title: "Congratulations! 🎉",
        description: "You are now a seller on Sellora!"
      });

      await refreshRole();

      setTimeout(() => {
        navigate('/seller');
      }, 2500);

    } catch (error: any) {
      console.error('Error becoming seller:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register as seller",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / 4) * 100;

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        {/* Success animation background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[150px] animate-pulse" />
        </div>
        
        <div className="text-center animate-scale-in relative z-10">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 mb-8 relative">
            <CheckCircle className="w-14 h-14 text-accent" />
            <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Welcome to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sellora</span>!
          </h1>
          <p className="text-xl text-muted-foreground mb-2">You're now a verified seller</p>
          <p className="text-muted-foreground/60">Redirecting to your dashboard...</p>
          
          {/* Loading dots */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border/50">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="sticky top-1 z-40 pt-4 pb-2">
        <div className="container mx-auto px-4">
          <div className="glass rounded-2xl border border-border/50 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => currentStep > 1 ? prevStep() : navigate(-1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 group"
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span>{currentStep > 1 ? 'Back' : 'Cancel'}</span>
              </button>
              
              {/* Step indicator */}
              <div className="hidden md:flex items-center gap-3">
                {steps.map((step, index) => (
                  <React.Fragment key={step.number}>
                    <div 
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer
                        ${currentStep === step.number 
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                          : currentStep > step.number
                            ? 'bg-accent/20 text-accent'
                            : 'bg-secondary/50 text-muted-foreground'
                        }`}
                      onClick={() => {
                        if (step.number < currentStep || validateStep(currentStep)) {
                          setCurrentStep(step.number);
                        }
                      }}
                    >
                      {currentStep > step.number ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 rounded-full transition-all duration-300
                        ${currentStep > step.number ? 'bg-accent' : 'bg-border'}`} 
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of 4
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile step indicator */}
      <div className="flex md:hidden justify-center gap-3 py-6">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`w-3 h-3 rounded-full transition-all duration-300
              ${currentStep === step.number 
                ? 'bg-primary scale-125 ring-4 ring-primary/20' 
                : currentStep > step.number 
                  ? 'bg-accent' 
                  : 'bg-muted'
              }`}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6 relative group">
            <Store className="w-10 h-10 text-primary transition-transform group-hover:scale-110" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Start Selling on <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sellora</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {currentStep === 1 && "Tell us about your business"}
            {currentStep === 2 && "Your contact information"}
            {currentStep === 3 && "Where is your business located?"}
            {currentStep === 4 && "Connect your online presence (optional)"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="relative p-8 rounded-3xl animate-fade-in
                          bg-gradient-to-br from-card/90 to-card/50 
                          backdrop-blur-xl border border-white/10
                          shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            
            {/* Step 1: Business Details */}
            <div className={`space-y-6 transition-all duration-500 ${currentStep === 1 ? 'block' : 'hidden'}`}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Business Details</h3>
                  <p className="text-sm text-muted-foreground">Basic information about your business</p>
                </div>
              </div>

              {/* Shop Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Shop Name *</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="shop_name"
                    value={formData.shop_name}
                    onChange={handleInputChange}
                    placeholder="Enter your shop name"
                    className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Business Type *</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Business Type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Years in Business */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Years in Business</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    name="years_in_business"
                    value={formData.years_in_business}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Experience</option>
                    {yearsOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Owner Details */}
            <div className={`space-y-6 transition-all duration-500 ${currentStep === 2 ? 'block' : 'hidden'}`}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Owner Details</h3>
                  <p className="text-sm text-muted-foreground">Contact information for business owner</p>
                </div>
              </div>

              {/* Owner Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    placeholder="Enter owner's full name"
                    className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Alternate Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Alternate Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="alternate_phone"
                    value={formData.alternate_phone}
                    onChange={handleInputChange}
                    placeholder="Optional alternate number"
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border/50 rounded-xl text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email from your account</p>
              </div>
            </div>

            {/* Step 3: Address */}
            <div className={`space-y-6 transition-all duration-500 ${currentStep === 3 ? 'block' : 'hidden'}`}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Business Address</h3>
                  <p className="text-sm text-muted-foreground">Where is your business located?</p>
                </div>
              </div>

              {/* Full Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address, building, landmark"
                    className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* City */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">City *</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* State */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">State *</label>
                  <div className="relative">
                    <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Country */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      readOnly
                      className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border/50 rounded-xl text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Pincode *</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="6-digit pincode"
                      maxLength={6}
                      className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Online Presence */}
            <div className={`space-y-6 transition-all duration-500 ${currentStep === 4 ? 'block' : 'hidden'}`}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Online Presence</h3>
                  <p className="text-sm text-muted-foreground">Connect your social profiles (optional)</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 mb-6">
                <p className="text-sm text-accent">
                  💡 Adding your social links helps customers trust and connect with your business!
                </p>
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">WhatsApp Number</label>
                <div className="relative">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={handleInputChange}
                    placeholder="WhatsApp number for customer queries"
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Instagram Profile</label>
                <div className="relative">
                  <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="url"
                    name="instagram_url"
                    value={formData.instagram_url}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/yourshop"
                    className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                    className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/50">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground px-8 shadow-lg shadow-primary/30"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating your store...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Complete Registration
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BecomeSellerPage;