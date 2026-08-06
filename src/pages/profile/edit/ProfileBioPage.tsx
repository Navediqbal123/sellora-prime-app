import React, { useEffect, useState } from 'react';
import { Loader2, PenLine, Save } from 'lucide-react';
import { Card, EditShell, INK, MUTED, PURPLE, PurpleButton } from './_ui';
import { useMeta } from './useMeta';

const TIPS = ['Keep it short and meaningful', 'You can use emojis', 'Tell people about your work'];

const ProfileBioPage: React.FC = () => {
  const { meta, save, saving } = useMeta();
  const [bio, setBio] = useState('');

  useEffect(() => setBio(meta.bio || ''), [meta]);

  return (
    <EditShell title="Profile Bio" subtitle="Write something about yourself" centerTitle>
      <div className="flex flex-col items-center pt-1">
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#F8F5FF', border: '1px solid #E5D8FF' }}
        >
          <PenLine size={30} strokeWidth={1.7} style={{ color: PURPLE }} />
        </div>
        <p className="text-[12.5px] mt-3" style={{ color: MUTED }}>
          This will appear on your public profile.
        </p>
      </div>

      <Card className="px-4 py-3.5">
        <label className="text-[11.5px] font-medium" style={{ color: MUTED }}>
          Bio
        </label>
        <textarea
          rows={5}
          maxLength={120}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Digital entrepreneur | Building innovative solutions"
          className="w-full bg-transparent outline-none resize-none text-[15px] font-medium mt-1.5"
          style={{ color: INK }}
        />
        <p className="text-right text-[11.5px]" style={{ color: MUTED }}>
          {bio.length}/120
        </p>
      </Card>

      <Card className="p-4">
        <p className="text-[13.5px] font-semibold mb-2" style={{ color: INK }}>
          Tips
        </p>
        <ul className="space-y-1.5">
          {TIPS.map((t) => (
            <li key={t} className="flex items-center gap-2 text-[12.5px]" style={{ color: MUTED }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PURPLE }} />
              {t}
            </li>
          ))}
        </ul>
      </Card>

      <PurpleButton disabled={saving} onClick={() => save({ bio })}>
        {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} strokeWidth={2.25} />}
        Save Changes
      </PurpleButton>
    </EditShell>
  );
};

export default ProfileBioPage;
