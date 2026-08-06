import React, { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { EditShell, FieldCard, PurpleButton, inputClass, inputStyle, MUTED } from './_ui';
import { useMeta } from './useMeta';

const PersonalInfoPage: React.FC = () => {
  const { user, meta, save, saving } = useMeta();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  useEffect(() => {
    setFullName(meta.full_name || '');
    setUsername(meta.username || '');
    setBio(meta.bio || '');
    setDob(meta.dob || '');
    setGender(meta.gender || '');
  }, [meta]);

  return (
    <EditShell title="Personal Information" subtitle="Your basic information" centerTitle>
      <FieldCard label="Full Name">
        <input className={inputClass} style={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
      </FieldCard>
      <FieldCard label="Email Address" verified>
        <p className="text-[15px] font-semibold truncate">{user?.email}</p>
      </FieldCard>
      <FieldCard label="Username / Handle" hint={username ? `yourstore.com/${username.replace(/^@/, '')}` : 'yourstore.com/username'}>
        <input className={inputClass} style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" />
      </FieldCard>
      <FieldCard label="Profile Bio" counter={`${bio.length}/120`}>
        <textarea
          rows={3}
          maxLength={120}
          className={`${inputClass} resize-none`}
          style={inputStyle}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write something about yourself"
        />
      </FieldCard>
      <FieldCard label="Date of Birth">
        <input type="date" className={inputClass} style={inputStyle} value={dob} onChange={(e) => setDob(e.target.value)} />
      </FieldCard>
      <FieldCard label="Gender">
        <select className={`${inputClass} appearance-none`} style={inputStyle} value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
      </FieldCard>
      <div className="pt-1">
        <PurpleButton
          disabled={saving}
          onClick={() => save({ full_name: fullName, username: username.replace(/^@/, ''), bio, dob, gender })}
        >
          {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} strokeWidth={2.25} />}
          Save Changes
        </PurpleButton>
      </div>
    </EditShell>
  );
};

export default PersonalInfoPage;
