import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export const PURPLE = '#7C3AED';
export const INK = '#111111';
export const MUTED = '#6B7280';
export const CARD_SHADOW =
  '0 1px 2px rgba(15,15,25,0.04), 0 8px 24px -12px rgba(15,15,25,0.08)';

export const Card: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
  children,
  className = '',
  style,
}) => (
  <div
    className={`rounded-[24px] ${className}`}
    style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFEFF3', boxShadow: CARD_SHADOW, ...style }}
  >
    {children}
  </div>
);

export const EditShell: React.FC<{
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  centerTitle?: boolean;
}> = ({ title, subtitle, right, children, centerTitle }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: '#FFFFFF', color: INK }}>
      <div className="max-w-2xl mx-auto px-5 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEE', boxShadow: CARD_SHADOW }}
          >
            <ChevronLeft size={19} strokeWidth={2.25} style={{ color: INK }} />
          </button>
          <div className={`flex-1 min-w-0 ${centerTitle ? 'text-center pr-10' : ''}`}>
            <h1 className="text-[22px] font-bold tracking-tight truncate" style={{ color: INK }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-[13px] mt-0.5 truncate" style={{ color: MUTED }}>
                {subtitle}
              </p>
            )}
          </div>
          {right}
        </div>
        <div className="animate-fade-in-up space-y-4">{children}</div>
      </div>
    </div>
  );
};

export const MenuCard: React.FC<{
  icon: any;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  danger?: boolean;
  right?: React.ReactNode;
}> = ({ icon: Icon, title, subtitle, onClick, danger, right }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 px-4 py-4 text-left transition-colors active:bg-black/[0.03]"
  >
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: danger ? '#FEF2F2' : '#F5F5F7' }}
    >
      <Icon size={20} strokeWidth={1.9} style={{ color: danger ? '#DC2626' : INK }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[15px] font-semibold truncate" style={{ color: danger ? '#DC2626' : INK }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-[12.5px] mt-0.5 truncate" style={{ color: MUTED }}>
          {subtitle}
        </p>
      )}
    </div>
    {right ?? <ChevronRight size={17} style={{ color: '#9CA3AF' }} />}
  </button>
);

export const FieldCard: React.FC<{
  label: string;
  children: React.ReactNode;
  verified?: boolean;
  hint?: string;
  counter?: string;
}> = ({ label, children, verified, hint, counter }) => (
  <Card className="px-4 py-3.5">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <label className="text-[11.5px] font-medium" style={{ color: MUTED }}>
          {label}
        </label>
        <div className="mt-1">{children}</div>
      </div>
      {verified && <VerifiedPill />}
    </div>
    {(hint || counter) && (
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[11.5px]" style={{ color: MUTED }}>
          {hint}
        </span>
        <span className="text-[11.5px]" style={{ color: MUTED }}>
          {counter}
        </span>
      </div>
    )}
  </Card>
);

export const inputClass =
  'w-full bg-transparent outline-none text-[15px] font-semibold placeholder:font-normal';
export const inputStyle: React.CSSProperties = { color: INK };

export const VerifiedPill: React.FC<{ label?: string }> = ({ label = 'Verified' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 h-7 rounded-full text-[11.5px] font-semibold flex-shrink-0"
    style={{ backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}
  >
    <CheckCircle2 size={13} strokeWidth={2.25} />
    {label}
  </span>
);

export const PurpleButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, disabled, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full h-[54px] rounded-[18px] text-[15.5px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 ${className}`}
    style={{
      background: `linear-gradient(135deg, ${PURPLE}, #9F5BFF)`,
      boxShadow: '0 12px 28px -12px rgba(124,58,237,0.65)',
    }}
  >
    {children}
  </button>
);

export const Toggle: React.FC<{ on: boolean; onChange: (v: boolean) => void }> = ({ on, onChange }) => (
  <button
    onClick={() => onChange(!on)}
    role="switch"
    aria-checked={on}
    className="w-[50px] h-[30px] rounded-full flex-shrink-0 transition-colors relative"
    style={{ backgroundColor: on ? '#10B981' : '#E5E7EB' }}
  >
    <span
      className="absolute top-[3px] w-6 h-6 rounded-full bg-white transition-all"
      style={{ left: on ? 23 : 3, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
    />
  </button>
);

export const Radio: React.FC<{ selected: boolean }> = ({ selected }) => (
  <span
    className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0"
    style={{ border: `2px solid ${selected ? PURPLE : '#D1D5DB'}` }}
  >
    {selected && <span className="w-[11px] h-[11px] rounded-full" style={{ backgroundColor: PURPLE }} />}
  </span>
);

export const NumericKeypad: React.FC<{ onKey: (k: string) => void; onBackspace: () => void }> = ({
  onKey,
  onBackspace,
}) => {
  const keys: Array<[string, string]> = [
    ['1', ''],
    ['2', 'ABC'],
    ['3', 'DEF'],
    ['4', 'GHI'],
    ['5', 'JKL'],
    ['6', 'MNO'],
    ['7', 'PQRS'],
    ['8', 'TUV'],
    ['9', 'WXYZ'],
    ['.', ''],
    ['0', ''],
    ['⌫', ''],
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {keys.map(([k, sub]) => (
        <button
          key={k}
          onClick={() => (k === '⌫' ? onBackspace() : onKey(k))}
          className="h-14 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-[0.96]"
          style={{ backgroundColor: '#F5F5F7', border: '1px solid #EFEFF3' }}
        >
          <span className="text-[19px] font-semibold leading-none" style={{ color: INK }}>
            {k}
          </span>
          {sub && (
            <span className="text-[8.5px] tracking-[0.12em] mt-0.5" style={{ color: MUTED }}>
              {sub}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
