import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2, ShoppingBag, Sparkles, User, Mail, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'signup';

const AuthPage = ({ mode = 'login' }: { mode?: AuthMode }) => {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(mode === 'login');
  }, [mode]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      triggerShake();
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (!isLogin && !fullName.trim()) {
      triggerShake();
      toast({
        title: "Error",
        description: "Please enter your full name",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      triggerShake();
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          triggerShake();
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          setSuccess(true);
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in"
          });
          setTimeout(() => navigate('/'), 500);
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          triggerShake();
          if (error.message.includes('already registered')) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please login instead.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Signup Failed",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          setSuccess(true);
          toast({
            title: "Account Created! 🎉",
            description: "Welcome to Sellora!"
          });
          setTimeout(() => navigate('/'), 500);
        }
      }
    } catch (error) {
      triggerShake();
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary glow */}
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px] animate-pulse-glow" />
        {/* Accent glow */}
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-float" />
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-primary/50 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-40 right-32 w-3 h-3 bg-accent/50 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-primary/40 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-20 right-1/4 w-4 h-4 bg-accent/30 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className={`w-full max-w-md transition-all duration-500 ${success ? 'scale-95 opacity-0' : 'animate-scale-in'}`}>
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6 relative group">
            <ShoppingBag className="w-10 h-10 text-primary transition-transform group-hover:scale-110" />
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-accent animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Sellora</h1>
          <p className="text-muted-foreground">Your Premium Marketplace</p>
        </div>

        {/* Auth Card - Glassmorphism */}
        <div className={`relative p-8 rounded-2xl animate-fade-in-up stagger-1 
                        bg-gradient-to-br from-card/80 to-card/40 
                        backdrop-blur-xl border border-white/10
                        shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                        ${shake ? 'animate-shake' : ''}`}>
          {/* Card glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center relative">
            {isLogin ? 'Welcome Back' : 'Create Account'}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            {/* Full Name Input - Only for Signup */}
            {!isLogin && (
              <div className="input-floating animate-fade-in-up">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-12 bg-secondary/50 border-white/10 hover:border-white/20 focus:border-primary"
                  autoComplete="name"
                />
                <label htmlFor="fullName" className="left-12">Full Name</label>
              </div>
            )}

            {/* Email Input */}
            <div className="input-floating">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-12 bg-secondary/50 border-white/10 hover:border-white/20 focus:border-primary"
                autoComplete="email"
              />
              <label htmlFor="email" className="left-12">Email Address</label>
            </div>

            {/* Password Input */}
            <div className="input-floating relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-12 bg-secondary/50 border-white/10 hover:border-white/20 focus:border-primary"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <label htmlFor="password" className="left-12">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-14 text-lg font-semibold relative overflow-hidden group
                         bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary
                         shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_30px_rgba(139,92,246,0.5)]
                         transition-all duration-300 ${success ? 'bg-accent' : ''}`}
            >
              {/* Button glow animation */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                              translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="relative flex items-center justify-center gap-2">
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <Sparkles className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              )}
            </Button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-8 text-center relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-card px-4 text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
          </div>
          
          <button
            onClick={() => {
              const nextMode = isLogin ? 'signup' : 'login';
              navigate(nextMode === 'login' ? '/login' : '/signup');
              setIsLogin(nextMode === 'login');
            }}
            className="w-full mt-4 py-3 px-4 rounded-xl border border-white/10 
                       text-foreground font-medium
                       bg-secondary/30 hover:bg-secondary/50
                       transition-all duration-300 hover:border-primary/50
                       group"
          >
            <span className="group-hover:text-primary transition-colors">
              {isLogin ? 'Create New Account' : 'Sign In Instead'}
            </span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground/60 text-sm mt-8 animate-fade-in stagger-2">
          By continuing, you agree to Sellora's Terms of Service
        </p>
      </div>
    </div>
  );
};

export default AuthPage;