import React, { useState, useRef } from 'react';
import { Search, Mic, MicOff } from 'lucide-react';

interface HomeSearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

const HomeSearchBar: React.FC<HomeSearchBarProps> = ({ value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('Voice search not supported in this browser');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      onChange(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  return (
    <div className="relative min-w-0">
      <div
        className="relative flex items-center w-full h-12 rounded-[24px] pl-4 pr-3 min-w-0 transition-colors duration-300"
        style={{
          backgroundColor: '#FFFFFF',
          border: `1px solid ${focused ? '#D8C9F7' : '#E5E7EB'}`,
          boxShadow: '0 1px 2px rgba(15,15,25,0.04), 0 8px 20px -14px rgba(15,15,25,0.12)',
        }}
      >
        <Search size={19} strokeWidth={1.9} className="mr-2.5 shrink-0" style={{ color: focused ? '#7C3AED' : '#6B7280' }} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search products, brands & shops"
          className="flex-1 min-w-0 w-full bg-transparent border-0 outline-none text-[15px] tracking-tight"
          style={{ color: '#111111' }}
        />
        <button
          onClick={toggleMic}
          aria-label="Voice search"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
        >
          {listening
            ? <MicOff size={19} strokeWidth={1.9} style={{ color: '#DC2626' }} className="animate-pulse" />
            : <Mic size={19} strokeWidth={1.9} style={{ color: '#6B7280' }} />}
        </button>
      </div>
    </div>
  );
};

export default HomeSearchBar;