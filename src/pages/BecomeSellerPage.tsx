import React, { useState, useRef } from 'react';
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
  Globe,
  Briefcase,
  Sparkles,
  Check,
  FileText
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FormData {
  shop_name: string;
  owner_name: string;
  business_type: string;
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
  
  const [formData, setFormData] = useState<FormData>({
    shop_name: '',
    owner_name: '',
    business_type: '',
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
    { number: 1, title: 'Business Info', icon: Building2 },
    { number: 2, title: 'Contact Info', icon: Phone },
    { number: 3, title: 'Location', icon: MapPin },
    { number: 4, title: 'Review', icon: FileText },
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
          description: "Please fill in all business details",
          variant: "destructive"
        });
        return false;
      }
    } else if (step === 2) {
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
    } else if (step === 3) {
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
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setSlideDirection('left');
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setSlideDirection('right');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if user already has a pending/approved application
      const { data: existingSeller } = await supabase
        .from('sellers')
        .select('id, status')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existingSeller) {
        toast({
          title: "Application Exists",
          description: existingSeller.status === 'pending' 
            ? "You already have a pending application" 
            : "You already have a seller account",
          variant: "destructive"
        });
        navigate('/seller/review');
        return;
      }

      // Insert with status = 'pending'
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
          business_type: formData.business_type,
          status: 'pending'
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

  const progress = (currentStep / 4) * 100;

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[150px] animate-pulse" />
        </div>
        
        <div className="text-center animate-scale-in relative z-10">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-500/10 mb-8 relative">
            <CheckCircle className="w-14 h-14 text-yellow-500" />
            <div className="absolute inset-0 rounded-full bg-yellow-500/20 animate-ping" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Application Submitted!
          </h1>
          <p className="text-xl text-muted-foreground mb-2">Your seller application is pending review</p>
          <p className="text-muted-foreground/60">Redirecting to your application status...</p>
          
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    const animationClass = slideDirection === 'left' ? 'animate-step-slide-left' : 'animate-step-slide-right';
    
    switch (currentStep) {
      case 1:
        return (
          <div key="step1" className={`space-y-6 ${animationClass}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Business Info</h3>
                <p className="text-sm text-muted-foreground">Tell us about your business</p>
              </div>
            </div>

            {/* Shop Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Shop Name *</label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  name="shop_name"
                  value={formData.shop_name}
                  onChange={handleInputChange}
                  placeholder="Enter your shop name"
                  className="w-full h-[52px] pl-12 pr-4 bg-secondary/50 border border-border/50 rounded-[14px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-160"
                />
              </div>
            </div>

            {/* Owner Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Owner Name *</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                  placeholder="Enter owner's full name"
                  className="w-full h-[52px] pl-12 pr-4 bg-secondary/50 border border-border/50 rounded-[14px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-160"
                />
              </div>
            </div>

            {/* Business Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Business Type *</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleInputChange}
                  className="w-full h-[52px] pl-12 pr-4 bg-secondary/50 border border-border/50 rounded-[14px] text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-160 appearance-none cursor-pointer"
                >
                  <option value="">Select Business Type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div key="step2" className={`space-y-6 ${animationClass}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Contact Info</h3>
                <p className="text-sm text-muted-foreground">How can customers reach you?</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone Number *</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit phone number"
                  className="w-full h-[52px] pl-12 pr-4 bg-secondary/50 border border-border/50 rounded-[14px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-160"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address *</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full h-[52px] pl-12 pr-4 bg-secondary/50 border border-border/50 rounded-[14px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-160"
                  readOnly={!!user?.email}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Address *</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  className="w-full h-[52px] pl-12 pr-4 bg-secondary/50 border border-border/50 rounded-[14px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-160"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div key="step3" className={`space-y-6 ${animationClass}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Location</h3>
                <p className="text-sm text-muted-foreground">Where is your business located?</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* City */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full h-[52px] px-4 bg-secondary/50 border border-border/50 rounded-[14px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-160"
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="w-full h-[52px] px-4 bg-secondary/50 border border-border/50 rounded-[14px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-160"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Country */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Country *</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    className="w-full h-[52px] pl-12 pr-4 bg-secondary/50 border border-border/50 rounded-[14px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-160"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="6-digit"
                  className="w-full h-[52px] px-4 bg-secondary/50 border border-border/50 rounded-[14px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-160"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div key="step4" className={`space-y-6 ${animationClass}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Review & Submit</h3>
                <p className="text-sm text-muted-foreground">Confirm your details</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Business Info */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Business Info</h4>
                <div className="space-y-2">
                  <p className="text-foreground"><span className="text-muted-foreground">Shop:</span> {formData.shop_name}</p>
                  <p className="text-foreground"><span className="text-muted-foreground">Owner:</span> {formData.owner_name}</p>
                  <p className="text-foreground"><span className="text-muted-foreground">Type:</span> {formData.business_type}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Contact Info</h4>
                <div className="space-y-2">
                  <p className="text-foreground"><span className="text-muted-foreground">Phone:</span> {formData.phone_number}</p>
                  <p className="text-foreground"><span className="text-muted-foreground">Email:</span> {formData.email}</p>
                  <p className="text-foreground"><span className="text-muted-foreground">Address:</span> {formData.address}</p>
                </div>
              </div>

              {/* Location */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Location</h4>
                <p className="text-foreground">{formData.city}, {formData.state}, {formData.country} - {formData.pincode}</p>
              </div>

              {/* Confirmation */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground">
                  By clicking submit, you agree to Sellora's Seller Terms of Service and confirm that all information provided is accurate.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-260 group"
              >
                <ArrowLeft className="w-5 h-5 transition-transform duration-180 group-hover:-translate-x-1" />
                <span>{currentStep > 1 ? 'Back' : 'Cancel'}</span>
              </button>
              
              {/* Step indicator - Desktop */}
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
                        if (step.number < currentStep) {
                          setSlideDirection('right');
                          setCurrentStep(step.number);
                        } else if (step.number > currentStep && validateStep(currentStep)) {
                          setSlideDirection('left');
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
            <Store className="w-10 h-10 text-primary transition-transform duration-150 group-hover:scale-110" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Start Selling on <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sellora</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {currentStep === 1 && "Tell us about your business"}
            {currentStep === 2 && "Your contact information"}
            {currentStep === 3 && "Where is your business located?"}
            {currentStep === 4 && "Review and confirm your details"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="relative p-8 rounded-3xl glass-card">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10 pt-6 border-t border-border/30">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 h-auto rounded-xl transition-all duration-150 hover:scale-105 
                  ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 h-auto rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:shadow-button transition-all duration-150 hover:scale-105 btn-ripple animate-glow-idle"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 h-auto rounded-xl bg-gradient-to-r from-accent to-accent/80 hover:shadow-[0_4px_20px_rgba(16,185,129,0.4)] transition-all duration-150 hover:scale-105 btn-ripple"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit & Start Selling
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