import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Shield, 
  Sparkles, 
  ChevronRight,
  Store
} from 'lucide-react';


const ProfilePage = () => {
  const { user, role } = useAuth();

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
            Admin
          </span>
        );
      case 'shopkeeper':
        return (
          <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
            Seller
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
            User
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="card-premium p-8 text-center animate-fade-in-up">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{user?.email}</h1>
          {getRoleBadge()}
        </div>

        {/* Account Info */}
        <div className="card-premium p-6 mt-6 animate-fade-in-up stagger-1">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {role === 'user' && (
          <div className="card-premium p-6 mt-6 animate-fade-in-up stagger-2">
            <h2 className="text-lg font-semibold mb-4">Become a Seller</h2>
            <p className="text-muted-foreground mb-4">
              Start your business journey on Sellora and reach thousands of customers.
            </p>
            <Link to="/become-seller">
              <Button className="btn-glow w-full group">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Selling on Sellora
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        )}

        {role === 'shopkeeper' && (
          <div className="card-premium p-6 mt-6 animate-fade-in-up stagger-2">
            <h2 className="text-lg font-semibold mb-4">Seller Dashboard</h2>
            <p className="text-muted-foreground mb-4">
              Manage your products and track your sales performance.
            </p>
            <Link to="/seller">
              <Button className="btn-glow w-full group">
                <Store className="w-5 h-5 mr-2" />
                Go to Seller Dashboard
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
