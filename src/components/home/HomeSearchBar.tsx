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
    <div className={`relative min-w-0 transition-all duration-300 ${focused ? 'scale-[1.01]' : ''}`}>
      <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary via-primary/60 to-primary blur-lg transition-opacity duration-500 ${focused ? 'opacity-40' : 'opacity-0'}`} />
      <div className="relative flex items-center w-full bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl pl-4 pr-1.5 h-12 shadow-lg min-w-0">
        <Search className={`w-5 h-5 mr-2.5 transition-colors ${focused ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={2.25} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search products, brands & shops"
          className="flex-1 min-w-0 w-full bg-transparent border-0 outline-none text-[15px] tracking-tight font-medium text-foreground placeholder:text-muted-foreground/55 placeholder:font-normal placeholder:tracking-normal"
        />
        <button
          onClick={toggleMic}
          aria-label="Voice search"
          className={`relative shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden
            ${listening
              ? 'bg-gradient-to-br from-destructive via-destructive/80 to-destructive/60 text-white shadow-[0_6px_18px_-2px_hsl(var(--destructive)/0.7)] animate-pulse'
              : 'bg-gradient-to-br from-primary via-[hsl(270,75%,55%)] to-[hsl(290,80%,55%)] text-white shadow-[0_6px_18px_-3px_hsl(var(--primary)/0.7)] hover:scale-105 hover:shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.85)]'}`}
        >
          <span className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/25 pointer-events-none" />
          <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-white/30 blur-md pointer-events-none" />
          {listening
            ? <MicOff className="w-[18px] h-[18px] relative z-10 drop-shadow" strokeWidth={2.4} />
            : <Mic className="w-[18px] h-[18px] relative z-10 drop-shadow" strokeWidth={2.4} />}
          <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30 pointer-events-none" />
        </button>
      </div>
    </div>
  );
};

export default HomeSearchBar;