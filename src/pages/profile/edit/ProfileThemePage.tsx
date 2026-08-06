import React, { useEffect, useState } from 'react';
import { Check, Loader2, Palette, Save } from 'lucide-react';
import { Card, EditShell, INK, MUTED, PURPLE, PurpleButton } from './_ui';
import { useMeta } from './useMeta';

const COLORS = [
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Orange', hex: '#F59E0B' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Gray', hex: '#6B7280' },
];

const ProfileThemePage: React.FC = () => {
  const { meta, save, saving } = useMeta();
  const [accent, setAccent] = useState(PURPLE);

  useEffect(() => setAccent(meta.accent_color || PURPLE), [meta]);

  return (
    <EditShell title="Profile Theme" subtitle="Choose your profile accent color" centerTitle>
      <div className="flex flex-col items-center pt-1">
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#F8F5FF', border: '1px solid #E5D8FF' }}
        >
          <Palette size={30} strokeWidth={1.7} style={{ color: PURPLE }} />
        </div>
        <p className="text-[13.5px] font-semibold mt-3" style={{ color: INK }}>
          Choose your profile accent color
        </p>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          {COLORS.map((c) => (
            <button
              key={c.hex}
              aria-label={c.name}
              onClick={() => setAccent(c.hex)}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-90"
              style={{
                backgroundColor: c.hex,
                outline: accent === c.hex ? `2.5px solid ${c.hex}` : 'none',
                outlineOffset: 3,
              }}
            >
              {accent === c.hex && <Check size={18} strokeWidth={3} className="text-white" />}
            </button>
          ))}
        </div>
      </Card>

      <div>
        <p className="text-[11.5px] mb-2" style={{ color: MUTED }}>
          Preview
        </p>
        <Card className="overflow-hidden">
          <div className="h-24" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }} />
          <div className="p-4">
            <div className="w-14 h-14 rounded-full -mt-11 mb-3" style={{ backgroundColor: '#F3F4F6', border: '3px solid #FFFFFF' }} />
            <div className="h-3 w-32 rounded-full" style={{ backgroundColor: '#EFEFF3' }} />
            <div className="h-2.5 w-48 rounded-full mt-2" style={{ backgroundColor: '#F5F5F7' }} />
            <div className="h-2.5 w-40 rounded-full mt-2" style={{ backgroundColor: '#F5F5F7' }} />
          </div>
        </Card>
      </div>

      <PurpleButton disabled={saving} onClick={() => save({ accent_color: accent }, 'Profile theme updated.')}>
        {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} strokeWidth={2.25} />}
        Save
      </PurpleButton>
    </EditShell>
  );
};

export default ProfileThemePage;
