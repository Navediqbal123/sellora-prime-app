import React from 'react';
import { Truck, ShieldCheck, RefreshCw } from 'lucide-react';

const items = [
  { icon: Truck, title: 'Free Delivery', sub: 'On all orders' },
  { icon: ShieldCheck, title: 'Best Price', sub: 'Guarantee' },
  { icon: RefreshCw, title: 'Easy Returns', sub: '14 days' },
];

const BenefitStrip: React.FC = () => (
  <div
    className="flex items-center rounded-[18px] px-2 py-2.5"
    style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 2px rgba(15,15,25,0.03)',
    }}
  >
    {items.map((it, i) => {
      const Icon = it.icon;
      return (
        <React.Fragment key={it.title}>
          {i > 0 && <span className="w-px self-stretch" style={{ backgroundColor: '#EEEEF2' }} />}
          <div className="flex-1 flex items-center gap-2 px-2 min-w-0">
            <Icon size={17} strokeWidth={1.8} style={{ color: '#7C3AED' }} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-[11.5px] font-semibold leading-tight truncate" style={{ color: '#111111' }}>{it.title}</p>
              <p className="text-[10.5px] leading-tight truncate" style={{ color: '#6B7280' }}>{it.sub}</p>
            </div>
          </div>
        </React.Fragment>
      );
    })}
  </div>
);

export default BenefitStrip;
