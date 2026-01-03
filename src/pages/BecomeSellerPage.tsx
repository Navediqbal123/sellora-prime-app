import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
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
  Sparkles
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
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    business_type: ''
  });

  const businessTypes = [
    'Individual',
    'Partnership',
    'Private Limited',
    'Proprietorship',
    'Other'
  ];

  const steps = [
    { number: 1, title: 'Business Info', icon: Building2 },
    { number: 2, title: 'Contact Details', icon: Phone },
    { number: 3, title: 'Location', icon: MapPin },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.shop_name.trim() || !formData.owner_name.trim() || !formData.business_type) {
        toast({
          title: "Required Fields",
          description: "Please fill in all business information",
          variant: "destructive"
        });
        return false;
      }
    } else if (step === 2) {
      if (!formData.phone_number.trim() || !formData.email.trim()) {
        toast({
          title: "Required Fields",
          description: "Please fill in contact details",
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
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('sellers')
        .insert({
          user_id: user?.id,
          ...formData
        });

      if (error) throw error;

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

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        {/* Success animation background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[150px] animate-pulse-glow" />
        </div>
        
        <div className="text-center animate-scale-in relative z-10">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 mb-8 relative">
            <CheckCircle className="w-14 h-14 text-accent" />
            <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Welcome to <span className="text-gradient">Sellora</span>!
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
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </button>
            
            {/* Step indicator in header */}
            <div className="hidden md:flex items-center gap-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300
                    ${currentStep >= step.number ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
                    <step.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 rounded-full transition-all duration-300
                      ${currentStep > step.number ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6 relative group">
            <Store className="w-10 h-10 text-primary transition-transform group-hover:scale-110" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Start Selling on <span className="text-gradient">Sellora</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Complete your business profile to start listing products
          </p>
        </div>

        {/* Mobile step indicator */}
        <div className="flex md:hidden justify-center gap-2 mb-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`w-3 h-3 rounded-full transition-all duration-300
                ${currentStep >= step.number ? 'bg-primary scale-110' : 'bg-muted'}`}
            />
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="relative p-8 rounded-2xl animate-fade-in-up stagger-1
                          bg-gradient-to-br from-card/80 to-card/40 
                          backdrop-blur-xl border border-white/10
                          shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            
            {/* Step 1: Business Info */}
            <div className={`space-y-6 transition-all duration-500 ${currentStep === 1 ? 'block animate-fade-in-up' : 'hidden'}`}>
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-primary" />
                Business Information
              </h3>

              {/* Shop Name */}
              <div className="input-floating">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                  <Building className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="shop_name"
                  name="shop_name"
                  value={formData.shop_name}
                  onChange={handleInputChange}
                  placeholder="Shop Name"
                  className="w-full pl-12 bg-secondary/50 border-white/10"
                />
                <label htmlFor="shop_name" className="left-12">Shop Name</label>
              </div>

              {/* Owner Name */}
              <div className="input-floating">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="owner_name"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                  placeholder="Owner Name"
                  className="w-full pl-12 bg-secondary/50 border-white/10"
                />
                <label htmlFor="owner_name" className="left-12">Owner Name</label>
              </div>

              {/* Business Type */}
              <div className="input-floating">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                  <Briefcase className="w-5 h-5" />
                </div>
                <select
                  id="business_type"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleInputChange}
                  className="w-full pl-12 bg-secondary/50 border border-white/10 rounded-lg px-4 pt-6 pb-2 text-foreground 
                             focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
                             transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="">Select Business Type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <label htmlFor="business_type" className="left-12 text-xs text-primary -translate-y-3">
                  Business Type
                </label>
              </div>
            </div>

            {/* Step 2: Contact Details */}
            <div className={`space-y-6 transition-all duration-500 ${currentStep === 2 ? 'block animate-fade-in-up' : 'hidden'}`}>
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <Phone className="w-6 h-6 text-primary" />
                Contact Details
              </h3>

              {/* Phone Number */}
              <div className="input-floating">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  maxLength={10}
                  className="w-full pl-12 bg-secondary/50 border-white/10"
                />
                <label htmlFor="phone_number" className="left-12">Phone Number</label>
              </div>

              {/* Email */}
              <div className="input-floating">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full pl-12 bg-secondary/50 border-white/10"
                />
                <label htmlFor="email" className="left-12">Email Address</label>
              </div>
            </div>

            {/* Step 3: Location */}
            <div className={`space-y-6 transition-all duration-500 ${currentStep === 3 ? 'block animate-fade-in-up' : 'hidden'}`}>
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary" />
                Location Details
              </h3>

              {/* Address */}
              <div className="input-floating">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="w-full pl-12 bg-secondary/50 border-white/10"
                />
                <label htmlFor="address" className="left-12">Full Address</label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* City */}
                <div className="input-floating">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                    <Building className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full pl-12 bg-secondary/50 border-white/10"
                  />
                  <label htmlFor="city" className="left-12">City</label>
                </div>

                {/* State */}
                <div className="input-floating">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                    <Map className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full pl-12 bg-secondary/50 border-white/10"
                  />
                  <label htmlFor="state" className="left-12">State</label>
                </div>
              </div>

              {/* Pincode */}
              <div className="input-floating">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                  <Hash className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="Pincode"
                  maxLength={6}
                  className="w-full pl-12 bg-secondary/50 border-white/10"
                />
                <label htmlFor="pincode" className="left-12">Pincode</label>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 h-14 text-lg border-white/10 hover:bg-secondary/50"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Previous
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary
                             shadow-[0_4px_20px_rgba(139,92,246,0.4)]"
                >
                  Continue
                  <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent
                             shadow-[0_4px_20px_rgba(16,185,129,0.4)]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Store className="w-5 h-5 mr-2" />
                      Become a Seller
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