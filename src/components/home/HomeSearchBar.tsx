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
    <div className={`relative transition-all duration-300 ${focused ? 'scale-[1.01]' : ''}`}>
      <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary via-primary/60 to-primary blur-lg transition-opacity duration-500 ${focused ? 'opacity-40' : 'opacity-0'}`} />
      <div className="relative flex items-center bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl pl-3 pr-1 h-10 shadow-lg">
        <Search className={`w-[18px] h-[18px] mr-2 transition-colors ${focused ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={2.25} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search products, brands & shops"
          className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground/70"
        />
        <button
          onClick={toggleMic}
          aria-label="Voice search"
          className={`relative shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
            ${listening
              ? 'bg-gradient-to-br from-destructive to-destructive/70 text-white shadow-[0_4px_14px_-2px_hsl(var(--destructive)/0.6)] animate-pulse'
              : 'bg-gradient-to-br from-primary to-[hsl(280,80%,55%)] text-white shadow-[0_4px_14px_-2px_hsl(var(--primary)/0.55)] hover:scale-105 hover:shadow-[0_6px_20px_-4px_hsl(var(--primary)/0.75)]'}`}
        >
          {listening
            ? <MicOff className="w-4 h-4" strokeWidth={2.25} />
            : <Mic className="w-4 h-4" strokeWidth={2.25} />}
          {!listening && (
            <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/25 pointer-events-none" />
          )}
        </button>
      </div>
    </div>
  );
};

export default HomeSearchBar;