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
      <div className="relative flex items-center bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl pl-3 pr-1.5 h-10 shadow-lg">
        <Search className={`w-4 h-4 mr-2 transition-colors ${focused ? 'text-primary' : 'text-muted-foreground'}`} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search products, brands & shops"
          className="flex-1 bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted-foreground/70"
        />
        <button
          onClick={toggleMic}
          aria-label="Voice search"
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
            ${listening
              ? 'bg-destructive/20 text-destructive animate-pulse'
              : 'bg-primary/15 text-primary hover:bg-primary/25 hover:scale-105'}`}
        >
          {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

export default HomeSearchBar;