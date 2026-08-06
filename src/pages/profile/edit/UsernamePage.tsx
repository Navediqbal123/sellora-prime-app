import React, { useEffect, useState } from 'react';
import { AtSign, CheckCircle2, Loader2, Save } from 'lucide-react';
import { Card, EditShell, INK, MUTED, PURPLE, PurpleButton } from './_ui';
import { useMeta } from './useMeta';

const RULES = ['3–30 characters', 'Letters, numbers and underscores only', 'Must be unique'];

const UsernamePage: React.FC = () => {
  const { meta, save, saving } = useMeta();
  const [username, setUsername] = useState('');

  useEffect(() => setUsername(meta.username || ''), [meta]);

  const clean = username.replace(/^@/, '');
  const valid = /^[a-zA-Z0-9_]{3,30}$/.test(clean);

  return (
    <EditShell title="Username / Handle" subtitle="Your public profile link" centerTitle>
      <div className="flex flex-col items-center pt-1 pb-1">
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#F8F5FF', border: '1px solid #E5D8FF' }}
        >
          <AtSign size={32} strokeWidth={1.7} style={{ color: PURPLE }} />
        </div>
        <h2 className="text-[17px] font-bold mt-4" style={{ color: INK }}>
          Create your unique handle
        </h2>
        <p className="text-[12.5px] mt-1" style={{ color: MUTED }}>
          This will be your public profile link.
        </p>
      </div>

      <Card className="px-4 py-3.5">
        <label className="text-[11.5px] font-medium" style={{ color: MUTED }}>
          Username
        </label>
        <div className="flex items-center gap-2 mt-1">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@username"
            className="flex-1 bg-transparent outline-none text-[15.5px] font-semibold"
            style={{ color: INK }}
          />
          {valid && <CheckCircle2 size={19} strokeWidth={2.2} style={{ color: '#10B981' }} />}
        </div>
      </Card>

      <div
        className="px-4 py-3 rounded-[18px] text-[12.5px] font-medium truncate"
        style={{ backgroundColor: '#F8F5FF', border: '1px solid #E5D8FF', color: PURPLE }}
      >
        yourstore.com/{clean || 'username'}
      </div>

      <Card className="p-4">
        <p className="text-[13.5px] font-semibold mb-2" style={{ color: INK }}>
          Rules for username
        </p>
        <ul className="space-y-1.5">
          {RULES.map((r) => (
            <li key={r} className="flex items-center gap-2 text-[12.5px]" style={{ color: MUTED }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PURPLE }} />
              {r}
            </li>
          ))}
        </ul>
      </Card>

      <PurpleButton disabled={saving || !valid} onClick={() => save({ username: clean })}>
        {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} strokeWidth={2.25} />}
        Save Changes
      </PurpleButton>
    </EditShell>
  );
};

export default UsernamePage;
