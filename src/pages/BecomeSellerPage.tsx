import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Store, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BecomeSellerPage = () => {
  const { user, refreshRole } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = [
      'shop_name', 'owner_name', 'phone_number', 'email',
      'address', 'city', 'state', 'pincode', 'business_type'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        toast({
          title: "Validation Error",
          description: `Please fill in ${field.replace('_', ' ')}`,
          variant: "destructive"
        });
        return false;
      }
    }

    // Phone validation
    if (!/^\d{10}$/.test(formData.phone_number)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return false;
    }

    // Pincode validation
    if (!/^\d{6}$/.test(formData.pincode)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

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

      // Refresh role
      await refreshRole();

      // Redirect to seller dashboard after animation
      setTimeout(() => {
        navigate('/seller');
      }, 2000);

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-sellora-success/20 mb-6">
            <CheckCircle className="w-12 h-12 text-sellora-success animate-bounce-subtle" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Sellora!</h1>
          <p className="text-muted-foreground">Redirecting to your seller dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Store className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Start Selling on <span className="text-gradient">Sellora</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Fill in your business details to become a seller and start listing your products
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="card-premium p-8 animate-fade-in-up stagger-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shop Name */}
              <div className="input-floating md:col-span-2">
                <input
                  type="text"
                  id="shop_name"
                  name="shop_name"
                  value={formData.shop_name}
                  onChange={handleInputChange}
                  placeholder="Shop Name"
                />
                <label htmlFor="shop_name">Shop Name</label>
              </div>

              {/* Owner Name */}
              <div className="input-floating">
                <input
                  type="text"
                  id="owner_name"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                  placeholder="Owner Name"
                />
                <label htmlFor="owner_name">Owner Name</label>
              </div>

              {/* Phone Number */}
              <div className="input-floating">
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  maxLength={10}
                />
                <label htmlFor="phone_number">Phone Number</label>
              </div>

              {/* Email */}
              <div className="input-floating md:col-span-2">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
                <label htmlFor="email">Email Address</label>
              </div>

              {/* Address */}
              <div className="input-floating md:col-span-2">
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                />
                <label htmlFor="address">Full Address</label>
              </div>

              {/* City */}
              <div className="input-floating">
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                />
                <label htmlFor="city">City</label>
              </div>

              {/* State */}
              <div className="input-floating">
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                />
                <label htmlFor="state">State</label>
              </div>

              {/* Pincode */}
              <div className="input-floating">
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="Pincode"
                  maxLength={6}
                />
                <label htmlFor="pincode">Pincode</label>
              </div>

              {/* Business Type */}
              <div className="input-floating">
                <select
                  id="business_type"
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleInputChange}
                  className="w-full bg-input border border-border rounded-lg px-4 pt-6 pb-2 text-foreground 
                             focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
                             transition-all duration-300"
                >
                  <option value="">Select Type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <label htmlFor="business_type" className="text-xs text-primary -translate-y-3 scale-90">
                  Business Type
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-glow h-14 text-lg font-semibold mt-8"
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default BecomeSellerPage;
