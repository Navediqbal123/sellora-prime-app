import React from 'react';
import { Store, Phone, MapPin, Calendar, Shield, ShieldOff } from 'lucide-react';
import { SellerProfile, SellerStatus } from '@/lib/supabase';

interface SellerCardProps {
  seller: SellerProfile;
  onClick: () => void;
  delay?: number;
}

const getStatusBadge = (status: SellerStatus) => {
  switch (status) {
    case 'pending':
      return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-500">Pending</span>;
    case 'approved':
      return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-500 flex items-center gap-1">
        <Shield className="w-3 h-3" /> Active
      </span>;
    case 'rejected':
      return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-500">Rejected</span>;
    case 'blocked':
      return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-500 flex items-center gap-1">
        <ShieldOff className="w-3 h-3" /> Blocked
      </span>;
    default:
      return null;
  }
};

const SellerCard: React.FC<SellerCardProps> = ({ seller, onClick, delay = 0 }) => {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden p-5 rounded-2xl cursor-pointer
                 bg-gradient-to-br from-card to-card/50 border border-border/50
                 transform transition-all duration-500 ease-out
                 hover:scale-[1.02] hover:-translate-y-1 hover:border-primary/30
                 hover:shadow-glow animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {seller.shop_name}
              </h3>
              {getStatusBadge(seller.status)}
            </div>
            <p className="text-muted-foreground text-sm">{seller.owner_name}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center
                         transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <Store className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 group-hover:text-foreground transition-colors">
            <Phone className="w-4 h-4" />
            <span>{seller.phone_number}</span>
          </div>
          <div className="flex items-center gap-2 group-hover:text-foreground transition-colors">
            <MapPin className="w-4 h-4" />
            <span>{seller.city}, {seller.state}</span>
          </div>
          <div className="flex items-center gap-2 group-hover:text-foreground transition-colors">
            <Calendar className="w-4 h-4" />
            <span>{new Date(seller.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary 
                      transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
};

export default SellerCard;
